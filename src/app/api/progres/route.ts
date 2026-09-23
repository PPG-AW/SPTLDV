import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { progres } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function GET() {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const progresData = await db.select().from(progres).where(eq(progres.siswa_id, session.userId));

  const map: Record<number, { terbuka: boolean; benar: number; lulus: boolean }> = {};
  for (const p of progresData) {
    map[p.subbab_no] = {
      terbuka: !!p.terbuka_at,
      benar: p.benar,
      lulus: p.benar >= 3,
    };
  }

  return NextResponse.json(map);
}
