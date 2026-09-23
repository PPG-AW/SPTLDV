import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  activityLogs,
  classes,
  students,
  summativeAssessments,
  teacherCalls,
} from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";
import { busyTutorIds, computeTutorIds, expireStaleRequests } from "@/lib/tutor";
import { TOTAL_SUBBAB } from "@/lib/curriculum";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function GET(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  const classId = Number(req.nextUrl.searchParams.get("classId"));
  if (!classId) return err("classId wajib ada.");
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.teacherId, identity.teacher.id)))
    .limit(1);
  if (!cls) return err("Rombel tidak ditemukan.", 404);

  await expireStaleRequests(classId);
  const roster = await db
    .select()
    .from(students)
    .where(eq(students.classId, classId))
    .orderBy(students.name);

  const tutorIds = new Set(await computeTutorIds(classId));
  const busy = await busyTutorIds(classId);

  const sumRows = await db
    .select()
    .from(summativeAssessments)
    .where(inArray(summativeAssessments.studentId, roster.length ? roster.map((s) => s.id) : [-1]));
  const sumByStudent = new Map(sumRows.map((r) => [r.studentId, r]));

  // Sebaran & miskonsepsi dari activity logs (500 terakhir kelas)
  const logs = roster.length
    ? await db
        .select()
        .from(activityLogs)
        .where(inArray(activityLogs.studentId, roster.map((s) => s.id)))
        .orderBy(desc(activityLogs.id))
        .limit(500)
    : [];

  const misconception = Array.from({ length: TOTAL_SUBBAB }, (_, i) => {
    const sub = i + 1;
    const errs = logs.filter((l) => l.subbab === sub && !l.isCorrect);
    const detailCount = new Map<string, number>();
    for (const l of errs) {
      const key = (l.errorDetail ?? "Jawaban belum tepat").slice(0, 90);
      detailCount.set(key, (detailCount.get(key) ?? 0) + 1);
    }
    const common = [...detailCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([detail, count]) => ({ detail, count }));
    return {
      subbab: sub,
      errorCount: errs.length,
      uniqueStudents: new Set(errs.map((l) => l.studentId)).size,
      attempts: logs.filter((l) => l.subbab === sub).length,
      common,
    };
  });

  const studentRows = roster.map((s) => {
    const sum = sumByStudent.get(s.id);
    const mine = logs.filter((l) => l.studentId === s.id);
    const wrong = mine.filter((l) => !l.isCorrect).length;
    // ── statistik pemakaian petunjuk ──
    const withHint = mine.filter((l) => l.hintLevel > 0);
    const hintTotal = mine.reduce((acc, l) => acc + l.hintLevel, 0);
    const hintH3 = mine.filter((l) => l.hintLevel >= 3).length;
    const hintBySubbab = Array.from({ length: TOTAL_SUBBAB }, (_, i) => {
      const sub = i + 1;
      const rows = mine.filter((l) => l.subbab === sub && l.hintLevel > 0);
      return rows.length
        ? { subbab: sub, count: rows.length, total: rows.reduce((a, l) => a + l.hintLevel, 0) }
        : null;
    }).filter(Boolean) as { subbab: number; count: number; total: number }[];
    return {
      id: s.id,
      name: s.name,
      currentSubbab: s.currentSubbab,
      completed: s.completedSubbabs ?? [],
      streak: s.streakCorrect,
      errors: s.consecutiveErrors,
      status: s.status,
      isTutor: tutorIds.has(s.id),
      tutorBusy: busy.has(s.id),
      lastActiveAt: s.lastActiveAt,
      totalAttempts: mine.length,
      totalWrong: wrong,
      accuracy: mine.length ? Math.round(((mine.length - wrong) / mine.length) * 100) : null,
      hintQuestions: withHint.length,
      hintTotal,
      hintH3,
      hintRate: mine.length ? Math.round((withHint.length / mine.length) * 100) : null,
      hintBySubbab,
      summativeScore: sum?.totalScore ?? null,
      summativeDetails: sum?.scoreDetails ?? null,
    };
  });

  // panggilan guru dari tutor
  const calls = await db
    .select()
    .from(teacherCalls)
    .where(and(eq(teacherCalls.classId, classId), eq(teacherCalls.status, "OPEN")))
    .orderBy(desc(teacherCalls.id))
    .limit(20);
  const callRows = calls.map((c) => ({
    id: c.id,
    tutorName: roster.find((s) => s.id === c.tutorId)?.name ?? "Tutor",
    message: c.message,
    ageSec: Math.max(0, Math.round((Date.now() - c.createdAt.getTime()) / 1000)),
  }));

  const tutors = studentRows
    .filter((s) => s.isTutor)
    .map((s) => ({ id: s.id, name: s.name, status: s.tutorBusy ? "SIBUK" : "TERSEDIA" }));

  const distribution = Array.from({ length: TOTAL_SUBBAB }, (_, i) => ({
    subbab: i + 1,
    active: roster.filter((s) => s.currentSubbab === i + 1 && !(s.completedSubbabs ?? []).includes(i + 1)).length,
    completed: roster.filter((s) => (s.completedSubbabs ?? []).includes(i + 1)).length,
  }));

  return NextResponse.json({
    class: {
      id: cls.id,
      classCode: cls.classCode,
      className: cls.className,
      isLocked: cls.isLocked,
    },
    students: studentRows,
    misconception,
    tutors,
    calls: callRows,
    distribution,
    summative: studentRows
      .filter((s) => s.summativeScore !== null)
      .map((s) => ({
        studentId: s.id,
        name: s.name,
        totalScore: s.summativeScore,
        details: s.summativeDetails,
      })),
  });
}
