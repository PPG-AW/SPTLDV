import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guru } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, setSession, checkRateLimit } from '@/lib/server-helpers';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function POST(req: NextRequest) {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`guru-login:${ip}`, 10, 60)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan.' }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const result = await db.select().from(guru).where(eq(guru.username, username));
    if (result.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const g = result[0];
    const valid = await verifyPassword(password, g.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    await setSession(g.id, 'guru');
    return NextResponse.json({ success: true, nama: g.nama_lengkap });
  } catch (error) {
    console.error('Guru login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
