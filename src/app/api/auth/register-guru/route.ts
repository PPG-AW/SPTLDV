import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guru } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, setSession, generateKode } from '@/lib/server-helpers';
import { ensureTables } from '@/db';

export async function POST(req: NextRequest) {
  try {
    const { nama_lengkap, password } = await req.json();

    if (!nama_lengkap || !password) {
      return NextResponse.json({ error: 'Nama dan password wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Generate username from nama
    const normalizedNama = nama_lengkap.toLowerCase().trim().replace(/\s+/g, '.');
    let username = normalizedNama;
    
    const existing = await db.select().from(guru).where(eq(guru.username, username));
    if (existing.length > 0) {
      let suffix = 2;
      while (true) {
        username = `${normalizedNama}${suffix}`;
        const check = await db.select().from(guru).where(eq(guru.username, username));
        if (check.length === 0) break;
        suffix++;
      }
    }

    const hash = await hashPassword(password);
    const result = await db.insert(guru).values({
      nama_lengkap,
      username,
      password_hash: hash,
    }).returning({ id: guru.id, username: guru.username });

    await setSession(result[0].id, 'guru');

    return NextResponse.json({
      success: true,
      nama: nama_lengkap,
      username: result[0].username,
    });
  } catch (error) {
    console.error('Guru register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
