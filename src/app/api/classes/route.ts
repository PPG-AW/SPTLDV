import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function GET() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  const rows = await db
    .select()
    .from(classes)
    .where(eq(classes.teacherId, identity.teacher.id))
    .orderBy(classes.id);
  const counts = await db
    .select({ classId: students.classId, n: sql<number>`count(*)::int` })
    .from(students)
    .groupBy(students.classId);
  const countMap = new Map(counts.map((c) => [c.classId, c.n]));
  return NextResponse.json({
    classes: rows.map((c) => ({ ...c, studentCount: countMap.get(c.id) ?? 0 })),
  });
}

export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  let body: { className?: string; classCode?: string };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid");
  }
  const className = (body.className ?? "").trim();
  const classCode = (body.classCode ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (className.length < 3) return err("Nama rombel minimal 3 karakter.");
  if (classCode.length < 4) return err("Kode kelas minimal 4 karakter (contoh: MTK-XA-2024).");
  const [exists] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.classCode, classCode))
    .limit(1);
  if (exists) return err("Kode kelas sudah dipakai. Gunakan kode unik lain.", 409);
  const [cls] = await db
    .insert(classes)
    .values({ teacherId: identity.teacher.id, className, classCode })
    .returning();
  return NextResponse.json({ ok: true, class: cls });
}
