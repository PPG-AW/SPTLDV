import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { siswa, guru, kelas, anggota_kelas, progres, attempts, tutor_requests, panggilan_guru, hentikan, sumatif } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { KODE_CHARS } from '@/config/aturan';

const APP_SECRET = process.env.APP_SECRET || 'default-secret-change-in-production-32chars!';
const COOKIE_NAME = 'linierku_session';
const SESSION_HOURS = 12;

// ===========================
// Password hashing
// ===========================
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===========================
// Simple session (base64 encoded JSON in cookie)
// In production, use iron-session or JWT with APP_SECRET
// ===========================
export async function setSession(userId: number, role: 'siswa' | 'guru') {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + SESSION_HOURS * 3600 * 1000 })).toString('base64');
  cookieStore.set(COOKIE_NAME, payload, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_HOURS * 3600,
    path: '/',
  });
}

export async function getSession(): Promise<{ userId: number; role: 'siswa' | 'guru' } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64').toString());
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ===========================
// Kode kelas generator
// ===========================
export function generateKode(): string {
  let kode = '';
  for (let i = 0; i < 6; i++) {
    kode += KODE_CHARS[Math.floor(Math.random() * KODE_CHARS.length)];
  }
  return kode;
}

// ===========================
// Username generator for siswa
// ===========================
export function normalizeNama(nama: string): string {
  return nama.toLowerCase().trim().replace(/\s+/g, '.');
}

export async function generateUsername(nama: string, kelasId: number): Promise<string> {
  const base = normalizeNama(nama);
  // Check if exists
  const existing = await db.select().from(siswa).where(eq(siswa.username, base));
  if (existing.length === 0) return base;

  // Check if same kelas
  const sameKelas = await db
    .select({ id: siswa.id })
    .from(siswa)
    .innerJoin(anggota_kelas, eq(siswa.id, anggota_kelas.siswa_id))
    .where(and(eq(siswa.username, base), eq(anggota_kelas.kelas_id, kelasId)));

  if (sameKelas.length === 0) return base;

  // Add suffix
  let suffix = 2;
  while (true) {
    const uname = `${base}${suffix}`;
    const check = await db.select().from(siswa).where(eq(siswa.username, uname));
    if (check.length === 0) return uname;
    suffix++;
  }
}

// ===========================
// Get current student data
// ===========================
export async function getCurrentSiswa() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') return null;
  const result = await db.select().from(siswa).where(eq(siswa.id, session.userId));
  return result[0] || null;
}

export async function getCurrentGuru() {
  const session = await getSession();
  if (!session || session.role !== 'guru') return null;
  const result = await db.select().from(guru).where(eq(guru.id, session.userId));
  return result[0] || null;
}

// ===========================
// Get student's kelas and level
// ===========================
export async function getSiswaKelas(siswaId: number) {
  const result = await db
    .select({ kelas_id: anggota_kelas.kelas_id, nama_kelas: kelas.nama, kode_kelas: kelas.kode })
    .from(anggota_kelas)
    .innerJoin(kelas, eq(anggota_kelas.kelas_id, kelas.id))
    .where(eq(anggota_kelas.siswa_id, siswaId));
  return result[0] || null;
}

export async function getSiswaLevel(siswaId: number): Promise<number> {
  const result = await db
    .select({ subbab_no: progres.subbab_no })
    .from(progres)
    .where(and(eq(progres.siswa_id, siswaId), sql`${progres.benar} >= 3`))
    .orderBy(progres.subbab_no);

  if (result.length === 0) return 0;
  return Math.max(...result.map(r => r.subbab_no)) + 1;
  // Actually: level = highest passed subbab + 1, capped at 11 (which means all done)
}

// Better: level = highest subbab that is "terbuka" 
export async function getSiswaLevelAccurate(siswaId: number): Promise<number> {
  // Subbab 1 always open. Level = highest terbuka subbab
  const result = await db
    .select({ subbab_no: progres.subbab_no })
    .from(progres)
    .where(and(eq(progres.siswa_id, siswaId), sql`${progres.terbuka_at} IS NOT NULL`))
    .orderBy(progres.subbab_no);

  if (result.length === 0) return 1; // subbab 1 is always open
  return Math.max(...result.map(r => r.subbab_no));
}

// ===========================
// Ensure progres rows exist for a student
// ===========================
export async function ensureProgres(siswaId: number) {
  // Ensure all 10 subbab rows exist
  for (let no = 1; no <= 10; no++) {
    const existing = await db
      .select()
      .from(progres)
      .where(and(eq(progres.siswa_id, siswaId), eq(progres.subbab_no, no)));
    if (existing.length === 0) {
      await db.insert(progres).values({
        siswa_id: siswaId,
        subbab_no: no,
        terbuka_at: no === 1 ? new Date() : null, // only subbab 1 open initially
        lulus_at: null,
        benar: 0,
      });
    }
  }
}

// ===========================
// Check if student is stuck
// ===========================
export async function checkStuck(siswaId: number): Promise<{ stuck: boolean; reason: string } | null> {
  const { STUCK_SALAH, STUCK_MENIT } = await import('@/config/aturan');

  // Check wrong attempts per subbab
  const recentAttempts = await db
    .select({ subbab_no: attempts.subbab_no, benar: attempts.benar })
    .from(attempts)
    .where(and(eq(attempts.siswa_id, siswaId), eq(attempts.jenis, 'formatif')))
    .orderBy(attempts.created_at);

  // Count consecutive wrong per subbab
  const wrongCount: Record<number, number> = {};
  for (const a of recentAttempts) {
    if (a.subbab_no && !a.benar) {
      wrongCount[a.subbab_no] = (wrongCount[a.subbab_no] || 0) + 1;
    }
  }

  for (const [subbab, count] of Object.entries(wrongCount)) {
    if (count >= STUCK_SALAH) {
      return { stuck: true, reason: `Salah ${count}× di Subbab ${subbab}` };
    }
  }

  return null;
}

// ===========================
// Rate limiting (simple in-memory)
// ===========================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowSec: number = 60): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
