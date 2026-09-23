import { redirect } from 'next/navigation';
import { getCurrentSiswa, getSiswaKelas, getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { progres } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { BINTANG_LULUS } from '@/config/aturan';
import SumatifClient from './SumatifClient';

export default async function SumatifPage() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/');
  }

  const siswaData = await getCurrentSiswa();
  if (!siswaData) redirect('/');

  const kelasInfo = await getSiswaKelas(siswaData.id);
  if (!kelasInfo) redirect('/');

  // Check if all 10 subbab are passed
  const passedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(progres)
    .where(and(eq(progres.siswa_id, siswaData.id), sql`${progres.benar} >= ${BINTANG_LULUS}`));

  const allPassed = passedCount[0]?.count >= 10;
  if (!allPassed) {
    redirect('/belajar');
  }

  return (
    <SumatifClient
      siswaId={siswaData.id}
      siswaNama={siswaData.nama_lengkap}
      kelasId={kelasInfo.kelas_id}
    />
  );
}
