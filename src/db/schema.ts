import { pgTable, serial, text, boolean, integer, numeric, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// Tabel guru (akun guru dengan password penuh)
export const guru = pgTable('guru', {
  id: serial('id').primaryKey(),
  nama_lengkap: text('nama_lengkap').notNull(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Tabel kelas (rombel yang dibuat guru)
export const kelas = pgTable('kelas', {
  id: serial('id').primaryKey(),
  guru_id: integer('guru_id').references(() => guru.id).notNull(),
  nama: text('nama').notNull(),
  kode: text('kode').notNull().unique(),
  kuota_elit: integer('kuota_elit'), // NULL = pakai default 10%
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Tabel siswa
export const siswa = pgTable('siswa', {
  id: serial('id').primaryKey(),
  nama_lengkap: text('nama_lengkap').notNull(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  harus_ganti_password: boolean('harus_ganti_password').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Tabel anggota_kelas (relasi siswa ↔ rombel)
export const anggota_kelas = pgTable('anggota_kelas', {
  kelas_id: integer('kelas_id').references(() => kelas.id).notNull(),
  siswa_id: integer('siswa_id').references(() => siswa.id).notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.kelas_id, table.siswa_id] }),
}));

// Tabel subbab (konten materi, di-seed otomatis)
export const subbab = pgTable('subbab', {
  no: integer('no').primaryKey(),
  judul: text('judul').notNull(),
  video_url: text('video_url'),
  materi: text('materi').notNull(),
});

// Tabel progres siswa per subbab
export const progres = pgTable('progres', {
  siswa_id: integer('siswa_id').references(() => siswa.id).notNull(),
  subbab_no: integer('subbab_no').references(() => subbab.no).notNull(),
  terbuka_at: timestamp('terbuka_at'),
  lulus_at: timestamp('lulus_at'),
  benar: integer('benar').default(0).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.siswa_id, table.subbab_no] }),
}));

// Tabel attempts (jejak semua soal formatif & sumatif)
export const attempts = pgTable('attempts', {
  id: serial('id').primaryKey(),
  siswa_id: integer('siswa_id').references(() => siswa.id).notNull(),
  jenis: text('jenis').notNull(), // 'formatif' | 'sumatif'
  subbab_no: integer('subbab_no'),
  seed: text('seed').notNull(),
  payload: jsonb('payload').notNull(), // soal + kunci + pembahasan + hint
  jawaban: jsonb('jawaban'),
  benar: boolean('benar'),
  hint_terpakai: integer('hint_terpakai').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Tabel sumatif (asesmen akhir)
export const sumatif = pgTable('sumatif', {
  id: serial('id').primaryKey(),
  siswa_id: integer('siswa_id').references(() => siswa.id).notNull(),
  seed: text('seed').notNull(),
  payload: jsonb('payload').notNull(),
  jawaban: jsonb('jawaban'),
  skor_soal1: numeric('skor_soal1'),
  skor_soal2: numeric('skor_soal2'),
  nilai_akhir: numeric('nilai_akhir'),
  status: text('status').default('belum').notNull(), // belum | proses | selesai | dinilai
  mulai_at: timestamp('mulai_at'),
  selesai_at: timestamp('selesai_at'),
});

// Tabel tutor_requests (permintaan tutor sebaya)
export const tutor_requests = pgTable('tutor_requests', {
  id: serial('id').primaryKey(),
  kelas_id: integer('kelas_id').references(() => kelas.id).notNull(),
  requester_id: integer('requester_id').references(() => siswa.id).notNull(),
  subbab_no: integer('subbab_no'),
  tutor_id: integer('tutor_id').references(() => siswa.id),
  status: text('status').default('menunggu').notNull(), // menunggu | mengajar | selesai | gagal
  dibuat_at: timestamp('dibuat_at').defaultNow().notNull(),
  diterima_at: timestamp('diterima_at'),
  selesai_at: timestamp('selesai_at'),
});

// Tabel panggilan_guru (permintaan tutor guru)
export const panggilan_guru = pgTable('panggilan_guru', {
  id: serial('id').primaryKey(),
  kelas_id: integer('kelas_id').references(() => kelas.id).notNull(),
  siswa_id: integer('siswa_id').references(() => siswa.id).notNull(),
  status: text('status').default('menunggu').notNull(), // menunggu | selesai
  dibuat_at: timestamp('dibuat_at').defaultNow().notNull(),
  selesai_at: timestamp('selesai_at'),
});

// Tabel hentikan (focus lock dari guru)
export const hentikan = pgTable('hentikan', {
  id: serial('id').primaryKey(),
  kelas_id: integer('kelas_id').references(() => kelas.id).notNull(),
  siswa_id: integer('siswa_id'), // NULL = seluruh kelas
  aktif: boolean('aktif').default(true).notNull(),
  dibuat_at: timestamp('dibuat_at').defaultNow().notNull(),
  dinonaktifkan_at: timestamp('dinonaktifkan_at'),
});
