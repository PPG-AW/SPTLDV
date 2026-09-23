import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siswa, kelas, anggota_kelas } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, setSession, ensureProgres } from '@/lib/server-helpers';
import { ensureTables } from '@/db';

export async function POST(req: NextRequest) {
  try {
    const { nama, kode_kelas, password } = await req.json();

    if (!nama || !kode_kelas || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password minimal 4 karakter' }, { status: 400 });
    }

    // Find kelas
    const kelasResult = await db.select().from(kelas).where(eq(kelas.kode, kode_kelas.toUpperCase()));
    if (kelasResult.length === 0) {
      return NextResponse.json({ error: 'Kode kelas tidak ditemukan' }, { status: 404 });
    }
    const k = kelasResult[0];

    // Check if name already exists in this kelas
    const existingSiswa = await db
      .select({ id: siswa.id })
      .from(siswa)
      .innerJoin(anggota_kelas, eq(siswa.id, anggota_kelas.siswa_id))
      .where(and(eq(anggota_kelas.kelas_id, k.id), eq(siswa.nama_lengkap, nama)));

    let siswaId: number;

    if (existingSiswa.length > 0) {
      // Already exists, just update password
      siswaId = existingSiswa[0].id;
      const hash = await hashPassword(password);
      await db.update(siswa).set({ password_hash: hash }).where(eq(siswa.id, siswaId));
    } else {
      // Create new student
      const normalizedNama = nama.toLowerCase().trim().replace(/\s+/g, '.');
      let username = normalizedNama;
      
      // Check username uniqueness
      const existingUsername = await db.select().from(siswa).where(eq(siswa.username, username));
      if (existingUsername.length > 0) {
        let suffix = 2;
        while (true) {
          username = `${normalizedNama}${suffix}`;
          const check = await db.select().from(siswa).where(eq(siswa.username, username));
          if (check.length === 0) break;
          suffix++;
        }
      }

      const hash = await hashPassword(password);
      const result = await db.insert(siswa).values({
        nama_lengkap: nama,
        username,
        password_hash: hash,
      }).returning({ id: siswa.id });

      siswaId = result[0].id;

      // Add to kelas
      await db.insert(anggota_kelas).values({
        kelas_id: k.id,
        siswa_id: siswaId,
      });
    }

    // Ensure progres exists
    await ensureProgres(siswaId);

    // Set session
    await setSession(siswaId, 'siswa');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
