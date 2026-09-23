import { redirect } from 'next/navigation';
import { getCurrentSiswa, getSiswaKelas, getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { progres, subbab } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { BINTANG_LULUS } from '@/config/aturan';
import BelajarSubbabClient from './BelajarSubbabClient';

export default async function BelajarSubbabPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const subbabNo = parseInt(no);

  if (isNaN(subbabNo) || subbabNo < 1 || subbabNo > 10) {
    redirect('/belajar');
  }

  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/');
  }

  const siswaData = await getCurrentSiswa();
  if (!siswaData) redirect('/');

  const kelasInfo = await getSiswaKelas(siswaData.id);
  if (!kelasInfo) redirect('/');

  // Check if this subbab is accessible
  const progresData = await db
    .select()
    .from(progres)
    .where(and(eq(progres.siswa_id, siswaData.id), eq(progres.subbab_no, subbabNo)));

  const subbabData = await db.select().from(subbab).where(eq(subbab.no, subbabNo));

  if (subbabData.length === 0) redirect('/belajar');
  const sb = subbabData[0];

  const isAccessible = subbabNo === 1 || (progresData.length > 0 && progresData[0].terbuka_at);
  if (!isAccessible) redirect('/belajar');

  return (
    <BelajarSubbabClient
      subbabNo={subbabNo}
      judul={sb.judul}
      materi={sb.materi}
      videoUrl={sb.video_url}
      siswaId={siswaData.id}
      siswaNama={siswaData.nama_lengkap}
      kelasId={kelasInfo.kelas_id}
    />
  );
}
