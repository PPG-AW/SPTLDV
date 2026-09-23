import { redirect } from 'next/navigation';
import { getCurrentGuru, getSession } from '@/lib/server-helpers';
import GuruDashboardClient from './GuruDashboardClient';

export default async function GuruDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'guru') {
    redirect('/guru');
  }

  const guruData = await getCurrentGuru();
  if (!guruData) redirect('/guru');

  return <GuruDashboardClient guruId={guruData.id} guruNama={guruData.nama_lengkap} />;
}
