import { NextResponse } from 'next/server';
import { getSession, generateKode } from '@/lib/server-helpers';
import { db } from '@/db';
import { kelas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function GET() {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session || session.role !== 'guru') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kelasList = await db.select().from(kelas).where(eq(kelas.guru_id, session.userId));
  return NextResponse.json(kelasList);
}

export async function POST(req: Request) {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session || session.role !== 'guru') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { nama } = await req.json();
    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: 'Nama kelas wajib diisi' }, { status: 400 });
    }

    // Generate unique kode
    let kode = generateKode();
    let existing = await db.select().from(kelas).where(eq(kelas.kode, kode));
    while (existing.length > 0) {
      kode = generateKode();
      existing = await db.select().from(kelas).where(eq(kelas.kode, kode));
    }

    const result = await db.insert(kelas).values({
      guru_id: session.userId,
      nama: nama.trim(),
      kode,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Create kelas error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
