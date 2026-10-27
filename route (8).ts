import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, students } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";
import { TOTAL_SUBBAB } from "@/lib/curriculum";

export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = identity.student;

  let body: {
    subbab?: number; templateId?: string; isCorrect?: boolean;
    hintLevel?: number; durationSeconds?: number; errorDetail?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const subbab = Math.min(Math.max(Number(body.subbab) || 1, 1), TOTAL_SUBBAB);
  const templateId = String(body.templateId ?? "?").slice(0, 16);
  const isCorrect = !!body.isCorrect;
  const hintLevel = Math.min(Math.max(Number(body.hintLevel) || 0, 0), 3);
  const durationSeconds = Math.min(Math.max(Number(body.durationSeconds) || 0, 0), 3600);
  const errorDetail = body.errorDetail ? String(body.errorDetail).slice(0, 200) : null;

  await db.insert(activityLogs).values({
    studentId: student.id,
    subbab,
    templateId,
    isCorrect,
    hintLevel,
    durationSeconds,
    errorDetail: isCorrect ? null : errorDetail,
  });

  // Soal ulangan (review sub-bab lama) hanya dicatat, tak mengubah progres.
  if (subbab !== student.currentSubbab) {
    return NextResponse.json({
      review: true,
      student: {
        streak: student.streakCorrect,
        errors: student.consecutiveErrors,
        completed: student.completedSubbabs ?? [],
        currentSubbab: student.currentSubbab,
        status: student.status,
      },
      justCompleted: false,
      allDone: (student.completedSubbabs ?? []).length >= TOTAL_SUBBAB,
    });
  }

  let streak = student.streakCorrect;
  let errors = student.consecutiveErrors;
  let status = student.status;
  let completed = [...(student.completedSubbabs ?? [])];
  let currentSubbab = student.currentSubbab;
  let justCompleted = false;

  if (isCorrect) {
    streak += 1;
    errors = 0;
    status = "AKTIF";
    if (streak >= 3) {
      if (!completed.includes(subbab)) completed.push(subbab);
      streak = 0;
      justCompleted = true;
      currentSubbab = Math.min(subbab + 1, TOTAL_SUBBAB);
    }
  } else {
    streak = 0;
    errors += 1;
    if (errors >= 3) status = "MACET";
  }

  await db
    .update(students)
    .set({
      streakCorrect: streak,
      consecutiveErrors: errors,
      status,
      completedSubbabs: completed,
      currentSubbab,
      lastActiveAt: new Date(),
    })
    .where(eq(students.id, student.id));

  const allDone = completed.length >= TOTAL_SUBBAB;
  return NextResponse.json({
    review: false,
    student: { streak, errors, completed, currentSubbab, status },
    justCompleted,
    allDone,
  });
}
