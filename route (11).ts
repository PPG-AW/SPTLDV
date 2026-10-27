import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { summativeAssessments } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";
import { scoreSumative, type SumativeAnswer1, type SumativeAnswer2 } from "@/lib/summative";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function GET() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") return err("Unauthorized", 401);
  const [row] = await db
    .select()
    .from(summativeAssessments)
    .where(eq(summativeAssessments.studentId, identity.student.id))
    .limit(1);
  return NextResponse.json({
    unlocked: (identity.student.completedSubbabs ?? []).length >= 10,
    submitted: !!row,
    totalScore: row?.totalScore ?? null,
    scoreDetails: row?.scoreDetails ?? null,
    submittedAt: row?.submittedAt ?? null,
  });
}

export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") return err("Unauthorized", 401);
  const student = identity.student;
  if ((student.completedSubbabs ?? []).length < 10) {
    return err("Selesaikan dulu seluruh 10 sub-bab untuk membuka Asesmen Sumatif.", 403);
  }
  let body: { soal1?: SumativeAnswer1; soal2?: SumativeAnswer2 };
  try {
    body = await req.json();
  } catch {
    return err("Jawaban tidak valid.");
  }
  if (!body.soal1 || !body.soal2) return err("Jawaban kedua soal wajib ada.");
  const { parts, total } = scoreSumative(body.soal1, body.soal2);

  const [existing] = await db
    .select({ id: summativeAssessments.id })
    .from(summativeAssessments)
    .where(eq(summativeAssessments.studentId, student.id))
    .limit(1);
  if (existing) {
    await db
      .update(summativeAssessments)
      .set({
        soal1: body.soal1 as unknown as Record<string, unknown>,
        soal2: body.soal2 as unknown as Record<string, unknown>,
        scoreDetails: parts,
        totalScore: total,
        submittedAt: new Date(),
      })
      .where(eq(summativeAssessments.id, existing.id));
  } else {
    await db.insert(summativeAssessments).values({
      studentId: student.id,
      soal1: body.soal1 as unknown as Record<string, unknown>,
      soal2: body.soal2 as unknown as Record<string, unknown>,
      scoreDetails: parts,
      totalScore: total,
    });
  }
  return NextResponse.json({ ok: true, totalScore: total, scoreDetails: parts });
}
