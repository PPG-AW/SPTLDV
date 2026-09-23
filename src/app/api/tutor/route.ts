import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { teacherCalls, tutorSessions } from "@/db/schema";
import { getSessionIdentity } from "@/lib/auth";
import {
  busyTutorIds,
  computeTutorIds,
  expireStaleRequests,
  getTutorList,
} from "@/lib/tutor";

const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function POST(req: NextRequest) {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") return err("Unauthorized", 401);
  const me = identity.student;

  let body: { action?: string; subbab?: number; sessionId?: number };
  try {
    body = await req.json();
  } catch {
    return err("Body tidak valid");
  }
  const action = body.action ?? "";

  // ── Siswa macet memanggil tutor sebaya ───────────────────────────────────
  if (action === "request") {
    if (me.consecutiveErrors < 2 && me.status !== "MACET") {
      return err("Tombol ini baru aktif setelah 2 kali kesalahan beruntun.", 403);
    }
    await expireStaleRequests(me.classId);
    const [openReq] = await db
      .select({ id: tutorSessions.id })
      .from(tutorSessions)
      .where(
        and(
          eq(tutorSessions.requesterId, me.id),
          or(eq(tutorSessions.status, "REQUESTED"), eq(tutorSessions.status, "ACTIVE")),
          gt(tutorSessions.createdAt, new Date(Date.now() - 30 * 60 * 1000))
        )
      )
      .limit(1);
    if (openReq) return err("Kamu sudah punya permintaan bantuan yang berjalan.", 409);

    const tutorIds = (await computeTutorIds(me.classId)).filter((id) => id !== me.id);
    const busy = await busyTutorIds(me.classId);
    const available = tutorIds.filter((id) => !busy.has(id));
    if (available.length === 0) {
      return NextResponse.json({ ok: false, reason: "ALL_BUSY" });
    }
    const subbab = Math.min(Math.max(Number(body.subbab) || me.currentSubbab, 1), 10);
    const [sess] = await db
      .insert(tutorSessions)
      .values({ classId: me.classId, requesterId: me.id, subbab, status: "REQUESTED" })
      .returning();
    return NextResponse.json({ ok: true, sessionId: sess.id });
  }

  // ── Batalkan permintaan sendiri ──────────────────────────────────────────
  if (action === "cancel") {
    await db
      .update(tutorSessions)
      .set({ status: "CANCELLED" })
      .where(
        and(
          eq(tutorSessions.requesterId, me.id),
          eq(tutorSessions.status, "REQUESTED")
        )
      );
    return NextResponse.json({ ok: true });
  }

  // ── Tutor menerima panggilan (yang tercepat menang) ──────────────────────
  if (action === "accept") {
    const sessionId = Number(body.sessionId);
    if (!sessionId) return err("sessionId wajib ada.");
    const tutorIds = await computeTutorIds(me.classId);
    if (!tutorIds.includes(me.id)) return err("Kamu bukan tutor aktif saat ini.", 403);
    const busy = await busyTutorIds(me.classId);
    if (busy.has(me.id)) return err("Kamu sedang mengajar. Selesaikan dulu sesimu.", 409);
    const updated = await db
      .update(tutorSessions)
      .set({ tutorId: me.id, status: "ACTIVE", startedAt: new Date() })
      .where(and(eq(tutorSessions.id, sessionId), eq(tutorSessions.status, "REQUESTED")))
      .returning({ id: tutorSessions.id });
    if (updated.length === 0) return err("Permintaan sudah diambil tutor lain.", 409);
    return NextResponse.json({ ok: true });
  }

  // ── Tutor menyelesaikan sesi mengajar ────────────────────────────────────
  if (action === "complete") {
    const sessionId = Number(body.sessionId);
    if (!sessionId) return err("sessionId wajib ada.");
    const updated = await db
      .update(tutorSessions)
      .set({ status: "COMPLETED", completedAt: new Date() })
      .where(
        and(
          eq(tutorSessions.id, sessionId),
          eq(tutorSessions.tutorId, me.id),
          eq(tutorSessions.status, "ACTIVE")
        )
      )
      .returning({ id: tutorSessions.id });
    if (updated.length === 0) return err("Sesi tidak ditemukan.", 404);
    return NextResponse.json({ ok: true });
  }

  // ── Tutor sebaya memanggil guru ──────────────────────────────────────────
  if (action === "call-teacher") {
    const tutorIds = await computeTutorIds(me.classId);
    if (!tutorIds.includes(me.id)) return err("Fitur ini khusus Tutor Sebaya.", 403);
    const [open] = await db
      .select({ id: teacherCalls.id })
      .from(teacherCalls)
      .where(and(eq(teacherCalls.tutorId, me.id), eq(teacherCalls.status, "OPEN")))
      .orderBy(desc(teacherCalls.id))
      .limit(1);
    if (open) return NextResponse.json({ ok: true, already: true });
    await db.insert(teacherCalls).values({
      classId: me.classId,
      tutorId: me.id,
      message: "Meminta konfirmasi/klarifikasi materi",
    });
    return NextResponse.json({ ok: true });
  }

  return err("Aksi tidak dikenal.", 404);
}

// Daftar tutor untuk kelas saya
export async function GET() {
  const identity = await getSessionIdentity();
  if (!identity || identity.type !== "student") return err("Unauthorized", 401);
  const tutors = await getTutorList(identity.student.classId);
  return NextResponse.json({ tutors });
}
