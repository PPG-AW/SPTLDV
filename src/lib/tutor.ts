// ─── Logika Tutor Sebaya (fluid, 25% teratas) & state gabungan siswa ────────
// File ini hanya dipakai di sisi server (route handlers).

import { and, desc, eq, gt, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import {
  classes,
  students,
  summativeAssessments,
  teacherCalls,
  tutorSessions,
  type Student,
} from "@/db/schema";

const REQUEST_TTL_MS = 90_000;

export function rankScore(s: Student): number {
  return (s.completedSubbabs?.length ?? 0) * 1000 + s.currentSubbab * 10 + s.streakCorrect;
}

/** Id siswa yang berhak menyandang status Tutor Sebaya saat ini (maks 25%, min 1). */
export async function computeTutorIds(classId: number): Promise<number[]> {
  const list = await db.select().from(students).where(eq(students.classId, classId));
  const quota = Math.max(1, Math.ceil(list.length * 0.25));
  const eligible = list
    .filter((s) => (s.completedSubbabs?.length ?? 0) >= 1)
    .sort((a, b) => {
      const d = rankScore(b) - rankScore(a);
      if (d !== 0) return d;
      return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
    });
  return eligible.slice(0, Math.min(quota, eligible.length)).map((s) => s.id);
}

/** Tutor yang sedang SIBUK mengajar (memiliki sesi ACTIVE). */
export async function busyTutorIds(classId: number): Promise<Set<number>> {
  const rows = await db
    .select({ tutorId: tutorSessions.tutorId })
    .from(tutorSessions)
    .where(and(eq(tutorSessions.classId, classId), eq(tutorSessions.status, "ACTIVE")));
  return new Set(rows.map((r) => r.tutorId).filter((x): x is number => x !== null));
}

/** Tandai permintaan bantuan yang kedaluwarsa (>90 detik belum diterima). */
export async function expireStaleRequests(classId: number) {
  await db
    .update(tutorSessions)
    .set({ status: "EXPIRED" })
    .where(
      and(
        eq(tutorSessions.classId, classId),
        eq(tutorSessions.status, "REQUESTED"),
        lt(tutorSessions.createdAt, new Date(Date.now() - REQUEST_TTL_MS))
      )
    );
}

export interface TutorInfo {
  id: number;
  name: string;
  status: "TERSEDIA" | "SIBUK";
  teachingName: string | null;
  teachingSubbab: number | null;
}

export async function getTutorList(classId: number): Promise<TutorInfo[]> {
  const ids = await computeTutorIds(classId);
  if (ids.length === 0) return [];
  const busy = await busyTutorIds(classId);
  const rows = await db.select().from(students).where(eq(students.classId, classId));
  const byId = new Map(rows.map((s) => [s.id, s]));
  const active = await db
    .select()
    .from(tutorSessions)
    .where(and(eq(tutorSessions.classId, classId), eq(tutorSessions.status, "ACTIVE")));
  const activeByTutor = new Map(active.map((a) => [a.tutorId, a]));
  return ids.map((id) => {
    const s = byId.get(id);
    const sess = activeByTutor.get(id);
    const tutee = sess ? byId.get(sess.requesterId) : undefined;
    return {
      id,
      name: s?.name ?? "—",
      status: busy.has(id) ? ("SIBUK" as const) : ("TERSEDIA" as const),
      teachingName: sess ? tutee?.name ?? null : null,
      teachingSubbab: sess ? sess.subbab : null,
    };
  });
}

/** Ringkasan state lengkap mahasiswa untuk polling HP siswa. */
export async function getStudentFullState(student: Student) {
  await expireStaleRequests(student.classId);
  const [cls] = await db.select().from(classes).where(eq(classes.id, student.classId)).limit(1);
  const classSize = (
    await db.select().from(students).where(eq(students.classId, student.classId))
  ).length;
  const tutorIds = await computeTutorIds(student.classId);
  const busy = await busyTutorIds(student.classId);
  const isTutor = tutorIds.includes(student.id);
  const tutorBusy = busy.has(student.id);

  // sesi mengajar aktif (sebagai tutor)
  const teachingRows = await db
    .select()
    .from(tutorSessions)
    .where(
      and(
        eq(tutorSessions.classId, student.classId),
        eq(tutorSessions.tutorId, student.id),
        eq(tutorSessions.status, "ACTIVE")
      )
    )
    .orderBy(desc(tutorSessions.id))
    .limit(1);
  let teaching: { sessionId: number; tuteeName: string; subbab: number } | null = null;
  if (teachingRows[0]) {
    const [tutee] = await db
      .select({ name: students.name })
      .from(students)
      .where(eq(students.id, teachingRows[0].requesterId))
      .limit(1);
    teaching = { sessionId: teachingRows[0].id, tuteeName: tutee?.name ?? "Temanmu", subbab: teachingRows[0].subbab };
  }

  // permintaan masuk (hanya relevan jika tutor tersedia)
  let incomingRequests: { id: number; requesterName: string; subbab: number; ageSec: number }[] = [];
  if (isTutor && !tutorBusy) {
    const reqs = await db
      .select()
      .from(tutorSessions)
      .where(
        and(
          eq(tutorSessions.classId, student.classId),
          eq(tutorSessions.status, "REQUESTED"),
          isNull(tutorSessions.tutorId)
        )
      )
      .orderBy(desc(tutorSessions.id))
      .limit(3);
    for (const r of reqs) {
      const [rq] = await db
        .select({ name: students.name })
        .from(students)
        .where(eq(students.id, r.requesterId))
        .limit(1);
      incomingRequests.push({
        id: r.id,
        requesterName: rq?.name ?? "Temanmu",
        subbab: r.subbab,
        ageSec: Math.max(0, Math.round((Date.now() - r.createdAt.getTime()) / 1000)),
      });
    }
  }

  // permintaan saya (sebagai peminta)
  const mine = await db
    .select()
    .from(tutorSessions)
    .where(
      and(
        eq(tutorSessions.requesterId, student.id),
        or(eq(tutorSessions.status, "REQUESTED"), eq(tutorSessions.status, "ACTIVE")),
        gt(tutorSessions.createdAt, new Date(Date.now() - 30 * 60 * 1000))
      )
    )
    .orderBy(desc(tutorSessions.id))
    .limit(1);
  let myRequest: { id: number; status: string; tutorName: string | null } | null = null;
  if (mine[0]) {
    let tutorName: string | null = null;
    if (mine[0].tutorId) {
      const [t] = await db
        .select({ name: students.name })
        .from(students)
        .where(eq(students.id, mine[0].tutorId))
        .limit(1);
      tutorName = t?.name ?? null;
    }
    myRequest = { id: mine[0].id, status: mine[0].status, tutorName };
  }

  // calling teacher record (tutor)
  const [myCall] = await db
    .select()
    .from(teacherCalls)
    .where(and(eq(teacherCalls.tutorId, student.id), eq(teacherCalls.status, "OPEN")))
    .orderBy(desc(teacherCalls.id))
    .limit(1);

  // sumatif
  const [sumRow] = await db
    .select()
    .from(summativeAssessments)
    .where(eq(summativeAssessments.studentId, student.id))
    .limit(1);

  const completed = student.completedSubbabs ?? [];
  return {
    student: {
      id: student.id,
      name: student.name,
      currentSubbab: student.currentSubbab,
      completed,
      streak: student.streakCorrect,
      errors: student.consecutiveErrors,
      status: student.status,
      lastActiveAt: student.lastActiveAt,
    },
    class: {
      id: cls?.id ?? student.classId,
      name: cls?.className ?? "",
      code: cls?.classCode ?? "",
      locked: cls?.isLocked ?? false,
      size: classSize,
      tutorQuota: Math.max(1, Math.ceil(classSize * 0.25)),
    },
    isTutor,
    tutorBusy,
    teaching,
    incomingRequests,
    myRequest,
    myTeacherCallOpen: !!myCall,
    summative: {
      unlocked: completed.length >= 10,
      submitted: !!sumRow,
      totalScore: sumRow?.totalScore ?? null,
      scoreDetails: sumRow?.scoreDetails ?? null,
    },
  };
}

export async function touchStudent(studentId: number) {
  await db
    .update(students)
    .set({ lastActiveAt: new Date() })
    .where(eq(students.id, studentId));
}
