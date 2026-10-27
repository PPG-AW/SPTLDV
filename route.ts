import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students, teachers } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

const bad = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

function serverError(e: unknown) {
  console.error("[auth] server error:", e);
  const msg = e instanceof Error ? e.message : String(e);
  const missingTable = /relation .* does not exist|does not exist/i.test(msg);
  return NextResponse.json(
    {
      error: "Terjadi kesalahan server (500).",
      detail: msg,
      hint: missingTable
        ? "Tabel database belum dibuat di server. POST ke /api/setup {\"seed\": true} atau jalankan db/schema.sql — lihat README.md."
        : "Periksa DATABASE_URL di environment variables dan log runtime.",
    },
    { status: 500 }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  try {
    return await handlePost(req, context);
  } catch (e) {
    return serverError(e);
  }
}

async function handlePost(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  if (action === "logout") {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  let body: { name?: string; password?: string; classCode?: string };
  try {
    body = await req.json();
  } catch {
    return bad("Body tidak valid.");
  }
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";
  if (name.length < 2) return bad("Nama minimal 2 karakter.");
  if (action.startsWith("register") && password.length < 4)
    return bad("Kata sandi minimal 4 karakter.");

  // ── Guru ────────────────────────────────────────────────────────────────
  if (action === "register-teacher") {
    const [exists] = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(sql`lower(${teachers.name}) = lower(${name})`)
      .limit(1);
    if (exists) return bad("Nama guru sudah terdaftar. Silakan masuk.", 409);
    const [teacher] = await db
      .insert(teachers)
      .values({ name, passwordHash: hashPassword(password) })
      .returning();
    await createSession({ teacherId: teacher.id });
    return NextResponse.json({ ok: true, role: "teacher" });
  }

  if (action === "login-teacher") {
    const rows = await db
      .select()
      .from(teachers)
      .where(sql`lower(${teachers.name}) = lower(${name})`)
      .limit(5);
    const teacher = rows.find((t) => verifyPassword(password, t.passwordHash));
    if (!teacher) return bad("Nama atau kata sandi salah.", 401);
    await createSession({ teacherId: teacher.id });
    return NextResponse.json({ ok: true, role: "teacher" });
  }

  // ── Siswa (masuk/daftar tanpa kode kelas; kode kelas diminta setelahnya) ──
  if (action === "register-student") {
    const dupes = await db
      .select({ id: students.id })
      .from(students)
      .where(sql`lower(${students.name}) = lower(${name})`)
      .limit(1);
    if (dupes.length > 0) return bad("Nama ini sudah dipakai. Silakan masuk dengan nama tersebut.", 409);
    const [student] = await db
      .insert(students)
      .values({ name, passwordHash: hashPassword(password) })
      .returning();
    await createSession({ studentId: student.id });
    return NextResponse.json({ ok: true, role: "student" });
  }

  if (action === "login-student") {
    const rows = await db
      .select()
      .from(students)
      .where(sql`lower(${students.name}) = lower(${name})`)
      .limit(5);
    const student = rows.find((s) => verifyPassword(password, s.passwordHash));
    if (!student) return bad("Nama atau kata sandi salah.", 401);
    await createSession({ studentId: student.id });
    return NextResponse.json({ ok: true, role: "student" });
  }

  return bad("Aksi tidak dikenal.", 404);
}
