import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { tutor_requests, panggilan_guru, hentikan, siswa, anggota_kelas } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function GET() {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications: any[] = [];
  let status = 'belajar';

  if (session.role === 'siswa') {
    // Check if student is locked
    const locks = await db
      .select()
      .from(hentikan)
      .where(and(
        eq(hentikan.aktif, true),
        sql`(siswa_id = ${session.userId} OR siswa_id IS NULL)`
      ));

    if (locks.length > 0) {
      status = 'dihentikan';
    }

    // Check tutor request status
    const myRequests = await db
      .select({
        id: tutor_requests.id,
        status: tutor_requests.status,
        tutor_id: tutor_requests.tutor_id,
        subbab_no: tutor_requests.subbab_no,
      })
      .from(tutor_requests)
      .where(eq(tutor_requests.requester_id, session.userId));

    for (const req of myRequests) {
      if (req.status === 'menunggu') {
        notifications.push({
          type: 'tutor_menunggu',
          message: 'Permintaan tutor sedang diproses...',
        });
      } else if (req.status === 'mengajar' && req.tutor_id) {
        const tutor = await db.select({ nama: siswa.nama_lengkap }).from(siswa).where(eq(siswa.id, req.tutor_id));
        notifications.push({
          type: 'tutor_datang',
          message: `Tutor Kamu: ${tutor[0]?.nama || 'Siswa'} — ia akan menghampirimu.`,
        });
      }
    }

    // Check if student is teaching (locked from learning)
    const teaching = await db
      .select()
      .from(tutor_requests)
      .where(and(eq(tutor_requests.tutor_id, session.userId), eq(tutor_requests.status, 'mengajar')));

    if (teaching.length > 0) {
      status = 'mengajar';
    }
  }

  return NextResponse.json({ notifications, status });
}
