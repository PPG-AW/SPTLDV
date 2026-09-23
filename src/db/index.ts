import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy database initialization to avoid build-time errors
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(connectionString);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

// For raw SQL queries
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

// Auto-create tables and seed subbab content
export async function ensureTables() {
  try {
    const sql = getSql();
    // Create all tables
    await sql`
      CREATE TABLE IF NOT EXISTS guru (
        id SERIAL PRIMARY KEY,
        nama_lengkap TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kelas (
        id SERIAL PRIMARY KEY,
        guru_id INTEGER NOT NULL REFERENCES guru(id),
        nama TEXT NOT NULL,
        kode TEXT NOT NULL UNIQUE,
        kuota_elit INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS siswa (
        id SERIAL PRIMARY KEY,
        nama_lengkap TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        harus_ganti_password BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS anggota_kelas (
        kelas_id INTEGER NOT NULL REFERENCES kelas(id),
        siswa_id INTEGER NOT NULL REFERENCES siswa(id),
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (kelas_id, siswa_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subbab (
        no INTEGER PRIMARY KEY,
        judul TEXT NOT NULL,
        video_url TEXT,
        materi TEXT NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS progres (
        siswa_id INTEGER NOT NULL REFERENCES siswa(id),
        subbab_no INTEGER NOT NULL REFERENCES subbab(no),
        terbuka_at TIMESTAMP,
        lulus_at TIMESTAMP,
        benar INTEGER DEFAULT 0 NOT NULL,
        PRIMARY KEY (siswa_id, subbab_no)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS attempts (
        id SERIAL PRIMARY KEY,
        siswa_id INTEGER NOT NULL REFERENCES siswa(id),
        jenis TEXT NOT NULL,
        subbab_no INTEGER,
        seed TEXT NOT NULL,
        payload JSONB NOT NULL,
        jawaban JSONB,
        benar BOOLEAN,
        hint_terpakai INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sumatif (
        id SERIAL PRIMARY KEY,
        siswa_id INTEGER NOT NULL REFERENCES siswa(id),
        seed TEXT NOT NULL,
        payload JSONB NOT NULL,
        jawaban JSONB,
        skor_soal1 NUMERIC,
        skor_soal2 NUMERIC,
        nilai_akhir NUMERIC,
        status TEXT DEFAULT 'belum' NOT NULL,
        mulai_at TIMESTAMP,
        selesai_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tutor_requests (
        id SERIAL PRIMARY KEY,
        kelas_id INTEGER NOT NULL REFERENCES kelas(id),
        requester_id INTEGER NOT NULL REFERENCES siswa(id),
        subbab_no INTEGER,
        tutor_id INTEGER REFERENCES siswa(id),
        status TEXT DEFAULT 'menunggu' NOT NULL,
        dibuat_at TIMESTAMP DEFAULT NOW() NOT NULL,
        diterima_at TIMESTAMP,
        selesai_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS panggilan_guru (
        id SERIAL PRIMARY KEY,
        kelas_id INTEGER NOT NULL REFERENCES kelas(id),
        siswa_id INTEGER NOT NULL REFERENCES siswa(id),
        status TEXT DEFAULT 'menunggu' NOT NULL,
        dibuat_at TIMESTAMP DEFAULT NOW() NOT NULL,
        selesai_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS hentikan (
        id SERIAL PRIMARY KEY,
        kelas_id INTEGER NOT NULL REFERENCES kelas(id),
        siswa_id INTEGER,
        aktif BOOLEAN DEFAULT TRUE NOT NULL,
        dibuat_at TIMESTAMP DEFAULT NOW() NOT NULL,
        dinonaktifkan_at TIMESTAMP
      )
    `;

    // Seed 10 subbab content
    const { SUBBAB_CONTENT } = await import('@/lib/subbab');
    for (const sb of SUBBAB_CONTENT) {
      await sql`
        INSERT INTO subbab (no, judul, video_url, materi)
        VALUES (${sb.no}, ${sb.judul}, ${sb.video_url}, ${sb.materi})
        ON CONFLICT (no) DO UPDATE SET
          judul = EXCLUDED.judul,
          materi = EXCLUDED.materi
      `;
    }

    console.log('✅ Database tables created and seeded successfully');
  } catch (error) {
    console.error('❌ Error ensuring tables:', error);
    throw error;
  }
}
