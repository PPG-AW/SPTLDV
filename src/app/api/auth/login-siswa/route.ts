import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siswa, kelas, anggota_kelas } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyPassword, setSession, checkRateLimit, ensureProgres } from '@/lib/server-helpers';
import { ensureTables } from '@/db';

let tablesEnsured = false;

export async function POST(req: NextRequest) {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 60)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
  }

  try {
    const { nama, kode_kelas, password, verify } = await req.json();

    if (!nama || !kode_kelas) {
      return NextResponse.json({ error: 'Nama dan kode kelas wajib diisi' }, { status: 400 });
    }

    // Find kelas
    const kelasResult = await db.select().from(kelas).where(eq(kelas.kode, kode_kelas.toUpperCase()));
    if (kelasResult.length === 0) {
      return NextResponse.json({ error: 'Kode kelas tidak ditemukan, tanyakan ke gurumu ya' }, { status: 404 });
    }
    const k = kelasResult[0];

    // Find siswa in this kelas
    const anggotaResult = await db
      .select({ siswa_id: anggota_kelas.siswa_id })
      .from(anggota_kelas)
      .where(and(eq(anggota_kelas.kelas_id, k.id)));

    const siswaIds = anggotaResult.map(a => a.siswa_id);
    if (siswaIds.length === 0) {
      // New student
      return NextResponse.json({
        isNew: true,
        displayName: nama,
        kelasNama: k.nama,
      });
    }

    // Check if this nama already exists in kelas
    const existingSiswa = await db
      .select({ id: siswa.id, nama_lengkap: siswa.nama_lengkap, password_hash: siswa.password_hash })
      .from(siswa)
      .innerJoin(anggota_kelas, eq(siswa.id, anggota_kelas.siswa_id))
      .where(and(eq(anggota_kelas.kelas_id, k.id), eq(siswa.nama_lengkap, nama)));

    if (existingSiswa.length === 0) {
      // New student in this kelas
      return NextResponse.json({
        isNew: true,
        displayName: nama,
        kelasNama: k.nama,
      });
    }

    const s = existingSiswa[0];

    if (verify && password) {
      // Verify password
      const valid = await verifyPassword(password, s.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Password belum tepat, coba ingat-ingat lagi ya' }, { status: 401 });
      }
      await setSession(s.id, 'siswa');
      await ensureProgres(s.id);
      return NextResponse.json({ success: true, displayName: s.nama_lengkap, kelasNama: k.nama });
    }

    // Just checking existence
    return NextResponse.json({
      isNew: false,
      displayName: s.nama_lengkap,
      kelasNama: k.nama,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
