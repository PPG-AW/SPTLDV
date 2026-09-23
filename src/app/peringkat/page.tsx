import { redirect } from 'next/navigation';
import { getCurrentSiswa, getSiswaKelas, getSession } from '@/lib/server-helpers';
import PeringkatClient from './PeringkatClient';

export default async function PeringkatPage() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/');
  }

  const siswaData = await getCurrentSiswa();
  if (!siswaData) redirect('/');

  const kelasInfo = await getSiswaKelas(siswaData.id);
  if (!kelasInfo) redirect('/');

  return (
    <PeringkatClient
      siswaId={siswaData.id}
      siswaNama={siswaData.nama_lengkap}
      kelasId={kelasInfo.kelas_id}
      kelasNama={kelasInfo.nama_kelas}
    />
  );
}
