import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

/** Siswa memasukkan kode kelas untuk bergabung ke sebuah rombel. */
export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") return err("Unauthorized", 401);

  let body: { classCode?: string; leave?: boolean };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid.");
  }

  // keluar dari rombel (opsional)
  if (body.leave) {
    await db
      .update(students)
      .set({
        classId: null,
        currentSubbab: 1,
        completedSubbabs: [],
        streakCorrect: 0,
        consecutiveErrors: 0,
        status: "AKTIF",
      })
      .where(eq(students.id, identity.student.id));
    return NextResponse.json({ ok: true, left: true });
  }

  const code = (body.classCode ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (code.length < 4) return err("Kode kelas minimal 4 karakter. Tanyakan kepada gurumu.");

  const [cls] = await db.select().from(classes).where(eq(classes.classCode, code)).limit(1);
  if (!cls) return err("Kode kelas tidak ditemukan. Periksa kembali atau tanyakan ke gurumu.", 404);

  if (identity.student.classId === cls.id) {
    return NextResponse.json({ ok: true, already: true, className: cls.className, code: cls.classCode });
  }

  await db
    .update(students)
    .set({ classId: cls.id, lastActiveAt: new Date() })
    .where(eq(students.id, identity.student.id));

  return NextResponse.json({ ok: true, className: cls.className, code: cls.classCode });
}
