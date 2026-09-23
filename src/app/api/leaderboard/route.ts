import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { siswa, anggota_kelas, progres } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { LEADERBOARD_TOP } from '@/config/aturan';
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

  // Get student's kelas
  const kelasInfo = await db
    .select({ kelas_id: anggota_kelas.kelas_id })
    .from(anggota_kelas)
    .where(eq(anggota_kelas.siswa_id, session.userId));

  if (kelasInfo.length === 0) {
    return NextResponse.json({ top: [], myRank: 0, total: 0 });
  }

  const kelasId = kelasInfo[0].kelas_id;

  // Get all students in this kelas
  const students = await db
    .select({ siswa_id: anggota_kelas.siswa_id, nama: siswa.nama_lengkap })
    .from(anggota_kelas)
    .innerJoin(siswa, eq(anggota_kelas.siswa_id, siswa.id))
    .where(eq(anggota_kelas.kelas_id, kelasId));

  // Calculate level for each student
  const leaderboard = [];
  for (const student of students) {
    const passedSubbab = await db
      .select({ subbab_no: progres.subbab_no, lulus_at: progres.lulus_at })
      .from(progres)
      .where(and(eq(progres.siswa_id, student.siswa_id), sql`${progres.benar} >= 3`))
      .orderBy(progres.subbab_no);

    const level = passedSubbab.length > 0 ? Math.max(...passedSubbab.map(p => p.subbab_no)) + 1 : 1;
    const lastLulusAt = passedSubbab.length > 0
      ? passedSubbab[passedSubbab.length - 1].lulus_at
      : null;

    leaderboard.push({
      nama: student.nama,
      siswa_id: student.siswa_id,
      level: Math.min(level, 11),
      level_time: lastLulusAt ? new Date(lastLulusAt).toLocaleDateString('id-ID') : '-',
    });
  }

  // Sort by level desc, then by time asc
  leaderboard.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.level_time.localeCompare(b.level_time);
  });

  const top = leaderboard.slice(0, LEADERBOARD_TOP).map((entry, i) => ({
    rank: i + 1,
    nama: entry.nama,
    level: entry.level,
    level_time: entry.level_time,
  }));

  const myRank = leaderboard.findIndex(e => e.siswa_id === session.userId) + 1;

  return NextResponse.json({
    top,
    myRank,
    total: leaderboard.length,
  });
}
