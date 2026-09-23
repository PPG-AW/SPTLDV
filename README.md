# SPtLDV.belajar — Platform Pembelajaran TAI (Fase E / Kelas X)

Platform belajar **Sistem Pertidaksamaan Linear Dua Variabel** (Program Linear) dengan model **Team-Assisted Individualization (TAI)** & Tutor Sebaya — mobile-first, cukup dibuka lewat browser HP siswa.

**Fitur utama**

- 🎯 **Mastery Learning**: 10 sub-bab berurutan; 3 benar beruntun = naik sub-bab; salah = streak reset; 2× salah = tombol *Minta Bantuan Tutor Sebaya* + petunjuk; 3× salah = status **MACET** (berkedip merah di dashboard guru).
- 🧩 **30 template soal** (3 per sub-bab), semuanya di-*generate* acak dengan jawaban bilangan bulat, dilengkapi **petunjuk bertingkat H1 → H3**.
- 🖐️ **Canvas interaktif**: ketuk titik potong & titik pojok di bidang Kartesius (snap-to-grid ±0,5 satuan, getar haptik), garis penuh/putus-putus, arsiran daerah & DHP irisan, simulasi untuk sub-bab 3, 4, 6, 7.
- 🧑‍🤝‍🧑 **Tutor Sebaya fluid**: 25% siswa teratas otomatis jadi tutor (bisa tergeser); status TERSEDIA/SIBUK; tombol *Panggil Guru* khusus tutor.
- 🔒 **Teacher Focus Lock**: satu tombol untuk mengunci layar seluruh HP siswa saat diskusi pleno.
- 📊 **Dashboard Guru**: telemetri kelas live, peta sebaran sub-bab, analitik miskonsepsi, *case picker* untuk dibedah di kelas, nilai sumatif per langkah.
- 📝 **Asesmen Sumatif** 2 soal fixed dengan penilaian per langkah (15/20/20/20/25).

---

## 1. Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend/Backend | Next.js 16 (App Router) + Tailwind CSS 4, API Routes |
| Database | PostgreSQL — lokal (dev) / **Neon** (produksi) |
| ORM | Drizzle ORM + `pg` (node-postgres) |
| Auth | Custom session cookie (HttpOnly, hashed scrypt) — tanpa library eksternal |
| Grafik | HTML5 Canvas (engine koordinat buatan sendiri) |

---

## 2. Deploy ke Vercel + Neon (yang menyebabkan error 500 Anda)

> **Gejala**: `/api/auth/login-student` & `login-teacher` mengembalikan **500**.
> **Penyebab**: kode jalan, koneksi `DATABASE_URL` benar — tetapi **tabel-tabel belum pernah dibuat di Neon**. Migrasi schema tidak berjalan otomatis saat deploy.

Ikuti langkah ini berurutan:

### Langkah 1 — Buat database Neon
1. Buka [console.neon.tech](https://console.neon.tech) → **New Project**.
2. Salin **Connection String** (pilih yang *Pooled connection*), bentuknya:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Langkah 2 — Set environment variable di Vercel
1. Vercel → project Anda → **Settings → Environment Variables**.
2. Tambahkan (centang **Production, Preview, Development**):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon dari langkah 1 |
   | `SETUP_SECRET` *(opsional, disarankan)* | kunci rahasia bebas, mis. `KunciRahasia123` — untuk mengunci endpoint `/api/setup` |
3. Setelah mengubah env, lakukan **Redeploy** (Deployments → ⋯ → Redeploy).

### Langkah 3 — Buat tabel di Neon (PILIH SALAH SATU)

**Cara A — paling gampang, dari browser/terminal (tanpa install apa pun):**

```bash
curl -X POST https://NAMA-APP.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d "{\"seed\": true}"
```

- Jika Anda menyetel `SETUP_SECRET`, tambahkan `"key"`:
  `-d "{\"seed\": true, \"key\": \"KunciRahasia123\"}"`
- Respons sukses: `{"ok":true,"createdTables":true,"schemaReady":true,"seeded":true,...}`
- `seed: true` sekaligus mengisi **data demo** (1 guru, 1 rombel, 12 siswa). Abaikan jika ingin database kosong, lalu daftarkan guru sendiri lewat `/guru/daftar`.

**Cara B — Neon SQL Editor (copy-paste):**

1. Neon Dashboard → project Anda → **SQL Editor** → **New query**.
2. Salin **seluruh** isi file [`db/schema.sql`](./db/schema.sql) → tempel → **Run**.

**Cara C — lewat CLI (drizzle-kit):**

```bash
git clone <repo-anda> && cd <repo-anda>
npm install   # pertama kali
# buat file .env berisi:  DATABASE_URL=<connection-string-neon>
npx drizzle-kit push        # membuat semua tabel dari src/db/schema.ts
node scripts/seed.mjs       # opsional: isi data demo
```

### Langkah 4 — Verifikasi

Buka: `https://NAMA-APP.vercel.app/api/health` → harus muncul:
```json
{"ok":true,"schemaReady":true}
```
Lalu login seperti biasa. Selesai ✅

---

## 3. Menjalankan di Lokal (development)

```bash
npm install
# .env harus berisi: DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
npx drizzle-kit push        # buat tabel (sekali saja)
node scripts/seed.mjs       # opsional: data demo
npm run dev                 # http://localhost:3000
```

Build produksi: `npm run build && npm start`

---

## 4. Akun Demo (hasil seed)

| Peran | Login | Kredensial |
|---|---|---|
| Guru | `/guru` | nama `Pak Budi Santoso` · sandi `guru123` |
| Siswa | `/` | mis. `Hani Maheswari` · sandi `siswa123` · kode kelas `MTK-XA-2024` |

Data demo mencakup: 12 siswa dengan progres bervariasi, 1 siswa MACET (Hani, sub-bab 4), 1 sesi tutor aktif (Citra→Hani), 1 panggilan guru terbuka, 1 nilai sumatif (Dewi, 88), dan log kesalahan untuk analitik miskonsepsi.

---

## 5. Variabel Environment

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL/Neon. Di Vercel: Settings → Environment Variables. |
| `SETUP_SECRET` | opsional | Kunci pengaman endpoint `POST /api/setup`. Jika tidak diset, endpoint tetap membuat tabel hanya bila tabel belum ada (aman untuk deploy pertama). |

---

## 6. Struktur Proyek

```
src/
├── app/
│   ├── page.tsx                 → Landing + login siswa
│   ├── daftar/page.tsx          → Daftar siswa
│   ├── guru/…                   → Login/daftar dashboard guru
│   ├── belajar/page.tsx         → Aplikasi belajar siswa
│   └── api/
│       ├── auth/[action]        → login/register/logout (siswa & guru)
│       ├── setup                → setup tabel + seed demo (lihat §2)
│       ├── health               → health & kesiapan schema
│       ├── me/state             → polling state siswa (lock, tutor, progres)
│       ├── progress/answer      → mesin mastery (streak, MACET, naik sub-bab)
│       ├── tutor                → request/accept/complete/panggil-guru
│       ├── classes(+[id])       → CRUD rombel + kunci layar
│       ├── guru/telemetry       → telemetri, miskonsepsi, tutor, panggilan
│       ├── guru/calls           → guru menandai panggilan selesai
│       └── summative            → asesmen sumatif + penilaian per langkah
├── components/                  → StudentApp, TeacherApp, Canvas, KartuSoal, dll.
├── lib/
│   ├── curriculum.ts            → konten 10 sub-bab (materi, contoh, simulasi)
│   ├── templates.ts             → 30 generator soal + H1-H3 + diagnosa jawaban
│   ├── geometry.ts              → transformasi koordinat, DHP, titik pojok
│   ├── summative.ts             → soal sumatif fixed + rubrik skor
│   ├── tutor.ts                 → perhitungan tutor 25% fluid (server)
│   └── auth.ts                  → session & hashing scrypt
└── db/                          → schema Drizzle + koneksi
db/schema.sql                    → DDL untuk Neon SQL Editor
scripts/seed.mjs                 → seed demo via CLI
```

---

## 7. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| **500 saat login/register** | Tabel belum ada di Neon | Langkah 3 di atas (POST `/api/setup`, atau `db/schema.sql`, atau `npx drizzle-kit push`) |
| Body `{ "ok": false }` di `/api/health` | `DATABASE_URL` salah/belum diset | Cek nama variabel persis `DATABASE_URL`, **Redeploy** setelah mengubah env |
| `{"error":"Kunci salah..."}` dari `/api/setup` | `SETUP_SECRET` diset | Sertakan `"key"` di body request |
| Favicon 404 | (sudah diperbaiki — kini ada `src/app/icon.svg`) | pull commit terbaru |
| Login “tidak ditemukan” padahal sudah daftar | Database berbeda (preview vs production) | Pastikan env diset ke lingkup yang sama & tabel dibuat di database yang sama |
| Neon lambat di hit pertama | Cold start Neon free tier | Normal; coba lagi 1× |
| Layout error di HP | Cache lama | Hard-refresh / buka tab penyamaran |

---

Dibuat untuk pembelajaran Matematika Fase E sesuai Kurikulum Merdeka — SPtLDV & Program Linear.
