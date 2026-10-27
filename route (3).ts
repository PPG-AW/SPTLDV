import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, teacherCalls } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

// Guru menandai panggilan tutor selesai ditangani
export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  let body: { callId?: number };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid");
  }
  const callId = Number(body.callId);
  if (!callId) return err("callId wajib ada.");
  const [call] = await db.select().from(teacherCalls).where(eq(teacherCalls.id, callId)).limit(1);
  if (!call) return err("Panggilan tidak ditemukan.", 404);
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, call.classId), eq(classes.teacherId, identity.teacher.id)))
    .limit(1);
  if (!cls) return err("Bukan rombel Anda.", 403);
  await db
    .update(teacherCalls)
    .set({ status: "DONE", resolvedAt: new Date() })
    .where(eq(teacherCalls.id, callId));
  return NextResponse.json({ ok: true });
}
