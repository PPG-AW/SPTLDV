import { redirect } from 'next/navigation';
import { getCurrentSiswa, getSiswaKelas, getSession } from '@/lib/server-helpers';
import { db } from '@/db';
import { progres, subbab } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { BINTANG_LULUS } from '@/config/aturan';
import BelajarClient from './BelajarClient';

export default async function BelajarPage() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/');
  }

  const siswaData = await getCurrentSiswa();
  if (!siswaData) redirect('/');

  const kelasInfo = await getSiswaKelas(siswaData.id);
  if (!kelasInfo) redirect('/');

  // Get progress
  const progresData = await db
    .select()
    .from(progres)
    .where(eq(progres.siswa_id, siswaData.id));

  // Get subbab titles
  const subbabData = await db.select().from(subbab).orderBy(subbab.no);

  // Build progress map
  const progressMap = new Map(
    progresData.map(p => [p.subbab_no, {
      terbuka: !!p.terbuka_at,
      lulus: p.benar >= BINTANG_LULUS,
      benar: p.benar,
    }])
  );

  return (
    <BelajarClient
      siswaNama={siswaData.nama_lengkap}
      kelasNama={kelasInfo.nama_kelas}
      kelasId={kelasInfo.kelas_id}
      siswaId={siswaData.id}
      subbabList={subbabData.map(s => ({
        no: s.no,
        judul: s.judul,
        terbuka: progressMap.get(s.no)?.terbuka || s.no === 1,
        lulus: progressMap.get(s.no)?.lulus || false,
        benar: progressMap.get(s.no)?.benar || 0,
      }))}
    />
  );
}
