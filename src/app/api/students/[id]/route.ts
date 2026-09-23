import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, sessions, students } from "@/db/schema";
import { getSessionIdentity, hashPassword } from "@/lib/auth";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

/** Guru mengubah kata sandi / nama siswa di rombel miliknya. */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);

  const { id } = await context.params;
  const studentId = Number(id);
  if (!studentId) return err("ID siswa tidak valid.");

  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) return err("Siswa tidak ditemukan.", 404);

  // pastikan siswa berada di rombel milik guru ini
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, student.classId), eq(classes.teacherId, identity.teacher.id)))
    .limit(1);
  if (!cls) return err("Siswa ini bukan anggota rombel Anda.", 403);

  let body: { newPassword?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid.");
  }

  const set: Partial<{ passwordHash: string; name: string }> = {};

  if (typeof body.newPassword === "string") {
    const pw = body.newPassword.trim();
    if (pw.length < 4) return err("Kata sandi baru minimal 4 karakter.");
    set.passwordHash = hashPassword(pw);
  }

  if (typeof body.name === "string" && body.name.trim() !== student.name) {
    const name = body.name.trim();
    if (name.length < 2) return err("Nama minimal 2 karakter.");
    const dupes = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.classId, student.classId));
    const all = await db.select().from(students).where(eq(students.classId, student.classId));
    if (all.some((s) => s.id !== studentId && s.name.toLowerCase() === name.toLowerCase())) {
      return err("Nama tersebut sudah dipakai siswa lain di rombel ini.", 409);
    }
    void dupes;
    set.name = name;
  }

  if (Object.keys(set).length === 0) return err("Tidak ada perubahan yang dikirim.");

  await db.update(students).set(set).where(eq(students.id, studentId));

  // jika sandi diganti, paksa siswa masuk ulang demi keamanan
  if (set.passwordHash) {
    await db.delete(sessions).where(eq(sessions.studentId, studentId));
  }

  return NextResponse.json({ ok: true, name: set.name ?? student.name });
}

/** Guru mengeluarkan siswa dari rombel. */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "teacher") return err("Unauthorized", 401);
  const { id } = await context.params;
  const studentId = Number(id);
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) return err("Siswa tidak ditemukan.", 404);
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.id, student.classId), eq(classes.teacherId, identity.teacher.id)))
    .limit(1);
  if (!cls) return err("Siswa ini bukan anggota rombel Anda.", 403);
  await db.delete(students).where(eq(students.id, studentId));
  return NextResponse.json({ ok: true });
}
