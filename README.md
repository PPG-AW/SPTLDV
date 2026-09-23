# LINIERKu — Media Pembelajaran Interaktif SPtLDV

Media pembelajaran interaktif **Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV)** untuk SMA, dengan pembelajaran berjenjang per subbab, generator soal adaptif, tutor sebaya, dan dasbor guru real-time.

## ✨ Fitur Utama

- **Pembelajaran Berjenjang 10 Subbab + Sumatif** — per subbab siswa membaca materi, menonton video, mencoba simulasi, lalu mengerjakan asesmen formatif
- **Generator Soal Adaptif** — konstruksi mundur + rejection sampling, selalu bersolusi bilangan bulat, hint 2 tingkat + pembahasan langkah-demi-langkah
- **Tutor Sebaya** — tombol "Panggil Tutor Sebaya" → sistem memilih tutor berlevel lebih tinggi (rotasi adil)
- **Tombol Tutor Guru** — aktif mulai Level 4, kuota default 10% siswa tercepat per kelas
- **Hentikan Siswa** — guru mengunci layar satu siswa atau seluruh kelas
- **Dasbor Guru Real-time** — progres siswa, analitik kesalahan, deteksi stuck, leaderboard
- **Sumatif Otomatis** — 2 soal berkelanjutan, dinilai otomatis penuh
- **Leaderboard per Kelas** — 10 teratas + kartu "Posisimu"
- **Mobile-First** — responsif di HP, tablet, laptop/PC

## 🛠️ Tumpukan Teknologi

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — mobile-first design
- **PostgreSQL** di Neon via **Drizzle ORM**
- **Autentikasi custom** — bcrypt + cookie sessions
- **Lucide React** — ikon modern
- **KaTeX** — render matematika (coming soon)

## 📦 Instalasi & Menjalankan Lokal

```bash
# Clone repository
git clone <repo-url>
cd linierku

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dan isi:
# DATABASE_URL=postgresql://...
# APP_SECRET=random-string-min-32-chars

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🚀 Deploy 3 Langkah (Vercel + Neon)

### 1. Buat Database Neon
- Kunjungi [neon.tech](https://neon.tech)
- Buat project baru
- Salin **pooled connection string** (yang memakai `-pooler`)

### 2. Push Kode ke GitHub
```bash
git init
git add .
git commit -m "linierku"
git push -u origin main
```

### 3. Import ke Vercel
- Kunjungi [vercel.com](https://vercel.com)
- Import repository GitHub
- Isi **Environment Variables**:
  - `DATABASE_URL` = connection string dari Neon
  - `APP_SECRET` = random string ≥32 karakter
- Klik **Deploy**

✅ **Tabel + konten 10 subbab dibuat otomatis** saat aplikasi pertama dibuka — tidak perlu langkah migrasi!

## 🔐 Variabel Lingkungan

```env
DATABASE_URL=          # Connection string Neon (pooler)
APP_SECRET=            # Random string ≥32 karakter (tanda tangan sesi)
```

⚠️ **Keamanan**: Connection string Neon yang pernah dibagikan/ditempel di mana pun wajib di-regenerate password-nya di Neon Console. Jangan pernah menulis credential di kode/commit.

## 📖 Struktur Halaman

| Rute | Deskripsi |
|------|-----------|
| `/` | Halaman masuk siswa (nama + kode kelas) |
| `/guru` | Masuk/daftar guru |
| `/belajar` | Dashboard siswa: sidebar 10 subbab + progres |
| `/belajar/[no]` | Workspace subbab ke-n (materi, video, contoh, simulasi, asesmen) |
| `/sumatif` | Asesmen sumatif (terkunci sampai 10 subbab lulus) |
| `/peringkat` | Leaderboard kelas |
| `/guru/dashboard` | Dashboard guru lengkap |

## 📚 Struktur Proyek

```
src/
├── app/                    # Pages & API routes
│   ├── page.tsx           # Home (login siswa)
│   ├── guru/              # Guru pages
│   ├── belajar/           # Student dashboard & subbab
│   ├── sumatif/           # Sumatif assessment
│   ├── peringkat/         # Leaderboard
│   └── api/               # API endpoints
├── components/            # React components
├── lib/                   # Utilities
│   ├── math.ts           # Math utilities
│   ├── generator.ts      # Question generator
│   ├── subbab.ts         # 10 subbab content
│   └── server-helpers.ts # Auth & helpers
├── config/               # Configuration
│   ├── aturan.ts         # App constants
│   └── videos.ts         # Video placeholders
└── db/                   # Database
    ├── schema.ts         # Drizzle schema
    └── index.ts          # DB connection + ensureTables
```

## 🎯 10 Subbab Materi

1. Pengenalan Pertidaksamaan Linear Dua Variabel (PtLDV)
2. Menentukan Titik Potong PtLDV pada Sumbu
3. Menggambar Garis PtLDV pada Bidang Sumbu x–y
4. Uji Titik untuk Menentukan Daerah Penyelesaian
5. Pengenalan Sistem PtLDV (SPtLDV)
6. Menggambar SPtLDV dan Menentukan Daerah Penyelesaiannya
7. Menentukan Titik Pojok Daerah Penyelesaian
8. Titik Pojok Perpotongan Dua Pertidaksamaan: Metode Campuran
9. Fungsi Tujuan dan Nilai Optimum (Maksimum/Minimum)
10. Memodelkan Soal Cerita menjadi Kalimat Matematika

## 🔧 Kontribusi

Proyek ini dirancang untuk penggunaan edukatif. Silakan fork dan modifikasi sesuai kebutuhan.

## 📝 Lisensi

MIT License — Bebas digunakan untuk tujuan pendidikan.

## 👨‍💻 Tim Pengembang

Dibangun dengan ❤️ untuk pendidikan matematika Indonesia.

---

**Catatan Penting**: Aplikasi ini menggunakan auto-create tables. Tabel database + konten 10 subbab dibuat otomatis saat endpoint pertama dipanggil oleh `ensureTables()` — tanpa migrasi manual.
