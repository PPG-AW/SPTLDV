import { VIDEO_SUBBAB } from '@/config/videos';

export const SUBBAB_CONTENT = [
  {
    no: 1,
    judul: 'Pengenalan Pertidaksamaan Linear Dua Variabel (PtLDV)',
    video_url: VIDEO_SUBBAB[1],
    materi: `## Subbab 1 — Pengenalan Pertidaksamaan Linear Dua Variabel (PtLDV)

### Definisi
PtLDV adalah kalimat matematika terbuka yang memuat dua variabel berpangkat satu yang dihubungkan oleh tanda pertidaksamaan (<, >, ≤, ≥).

### Bentuk Umum
ax + by < c (tanda bisa >, ≤, ≥)

dengan:
- a, b, c = konstanta real
- a dan b tidak keduanya nol
- x, y = variabel

### Unsur-unsur PtLDV
- **Variabel**: x dan y
- **Koefisien**: a = koefisien x, b = koefisien y
- **Konstanta**: c
- **Tanda pertidaksamaan**: <, >, ≤, ≥

### Contoh
2x + 3y ≤ 12
- Koefisien x = 2
- Koefisien y = 3
- Konstanta = 12
- Tanda ≤

### Bukan PtLDV
- 3x + 5 = 7 → ini persamaan (tanda =)
- 2x ≤ 8 → ini satu variabel (tidak ada y)
- x² + y ≥ 4 → ini ada pangkat dua

✏️ **Catat ini di buku tulismu**: Bentuk umum PtLDV adalah ax + by < c (atau >, ≤, ≥) dengan a, b tidak keduanya nol.`,
  },
  {
    no: 2,
    judul: 'Menentukan Titik Potong PtLDV pada Sumbu',
    video_url: VIDEO_SUBBAB[2],
    materi: `## Subbab 2 — Menentukan Titik Potong PtLDV pada Sumbu

### Langkah
1. Ubah pertidaksamaan menjadi **garis pembatas**: ax + by = c
2. **Titik potong sumbu x**: ganti y = 0 → x = c/a → titik (c/a, 0)
3. **Titik potong sumbu y**: ganti x = 0 → y = c/b → titik (0, c/b)

### Contoh
2x + 3y ≤ 12 → garis pembatas: 2x + 3y = 12

**Sumbu x** (y = 0):
2x + 3(0) = 12
2x = 12
x = 6
Titik: (6, 0)

**Sumbu y** (x = 0):
2(0) + 3y = 12
3y = 12
y = 4
Titik: (0, 4)

### Tips
Dua titik potong ini cukup untuk menggambar garis.

✏️ **Catat ini di buku tulismu**: Titik potong sumbu x → y = 0, titik potong sumbu y → x = 0.`,
  },
  {
    no: 3,
    judul: 'Menggambar Garis PtLDV pada Bidang Sumbu x–y',
    video_url: VIDEO_SUBBAB[3],
    materi: `## Subbab 3 — Menggambar Garis PtLDV pada Bidang Sumbu x–y

### Langkah
1. Tentukan titik potong sumbu x dan sumbu y
2. Letakkan kedua titik pada bidang koordinat
3. Hubungkan menjadi garis lurus

### Jenis Garis
- **Garis tegas (—)**: untuk tanda ≤ atau ≥ (titik-titik pada garis termasuk penyelesaian)
- **Garis putus-putus (- - -)**: untuk tanda < atau > (titik pada garis tidak termasuk penyelesaian)

### Sumbu
- Sumbu x mendatar (horizontal)
- Sumbu y tegak (vertikal)
- Gunakan skala yang konsisten

✏️ **Catat ini di buku tulismu**: ≤ atau ≥ → garis tegas; < atau > → garis putus-putus.`,
  },
  {
    no: 4,
    judul: 'Uji Titik untuk Menentukan Daerah Penyelesaian',
    video_url: VIDEO_SUBBAB[4],
    materi: `## Subbab 4 — Uji Titik untuk Menentukan Daerah Penyelesaian

### Konsep
Garis membagi bidang menjadi dua daerah. Pilih titik uji untuk menentukan daerah mana yang merupakan penyelesaian.

### Langkah
1. Pilih titik uji — termudah: **(0, 0)** (jika garis tidak melaluinya)
2. Substitusikan titik uji ke pertidaksamaan
3. Jika **benar** → arsir daerah yang memuat titik uji
4. Jika **salah** → arsir daerah di seberangnya

### Contoh
2x + 3y ≤ 12, uji titik (0, 0):
2(0) + 3(0) ≤ 12
0 ≤ 12 → **BENAR**
→ Arsir daerah yang memuat (0, 0) — di bawah garis

### Daerah Penyelesaian (DP)
Daerah yang diarsir disebut daerah penyelesaian.

✏️ **Catat ini di buku tulismu**: Uji (0,0) → benar → arsir daerah (0,0); salah → arsir seberangnya.`,
  },
  {
    no: 5,
    judul: 'Pengenalan Sistem PtLDV (SPtLDV)',
    video_url: VIDEO_SUBBAB[5],
    materi: `## Subbab 5 — Pengenalan Sistem PtLDV (SPtLDV)

### Definisi
SPtLDV = dua atau lebih PtLDV yang harus dipenuhi **bersama-sama**.

### Daerah Penyelesaian Sistem
= **Irisan** dari semua daerah penyelesaian tiap pertidaksamaan (daerah yang memenuhi semuanya sekaligus).

### Syarat Alamiah
Pada masalah nyata sering ditambah:
- x ≥ 0
- y ≥ 0

Karena banyak barang tidak mungkin negatif (daerah hanya di kuadran I).

### Contoh Sistem
- x + y ≤ 6
- 2x + y ≤ 8
- x ≥ 0
- y ≥ 0

✏️ **Catat ini di buku tulismu**: DP sistem = irisan semua DP tiap pertidaksamaan.`,
  },
  {
    no: 6,
    judul: 'Menggambar SPtLDV dan Menentukan Daerah Penyelesaiannya',
    video_url: VIDEO_SUBBAB[6],
    materi: `## Subbab 6 — Menggambar SPtLDV dan Menentukan Daerah Penyelesaiannya

### Langkah
1. Gambar garis batas tiap pertidaksamaan
2. Arsir daerah penyelesaian tiap pertidaksamaan (uji titik)
3. Daerah penyelesaian = daerah yang terkena **semua arsiran** (irisan)

### Tips "Daerah Bersatu"
Arsir daerah yang **bukan** penyelesaian tiap pertidaksamaan; daerah yang tidak terarsir sama sekali itulah penyelesaiannya. Cocok untuk sistem banyak pertidaksamaan.

### Contoh (Benang Merah)
Sistem: x + y ≤ 6, 2x + y ≤ 8, x ≥ 0, y ≥ 0

**L1: x + y = 6**
- Titik potong: (6, 0) dan (0, 6)
- Uji (0,0): 0 + 0 ≤ 6 → benar → arsir bawah L1

**L2: 2x + y = 8**
- Titik potong: (4, 0) dan (0, 8)
- Uji (0,0): 0 + 0 ≤ 8 → benar → arsir bawah L2

**DP** = segiempat di kuadran I di bawah kedua garis.

✏️ **Catat ini di buku tulismu**: DP = irisan semua daerah penyelesaian (daerah yang kena semua arsiran).`,
  },
  {
    no: 7,
    judul: 'Menentukan Titik Pojok Daerah Penyelesaian',
    video_url: VIDEO_SUBBAB[7],
    materi: `## Subbab 7 — Menentukan Titik Pojok Daerah Penyelesaian

### Definisi
Titik pojok = titik-titik sudut (ubung) yang mengelilingi daerah penyelesaian.

### Sumber Titik Pojok
1. **Perpotongan garis batas dengan sumbu** → dibaca langsung dari titik potong
2. **Perpotongan antar garis batas** → cari dengan menyelesaikan sistem persamaan dua garis

### Contoh (Lanjutan Subbab 6)
Sistem: x + y ≤ 6, 2x + y ≤ 8, x ≥ 0, y ≥ 0

Titik pojok DP:
- **(0, 0)** — pojok asal
- **(4, 0)** — potong L2 dengan sumbu x
- **(2, 4)** — perpotongan L1 dan L2
- **(0, 6)** — potong L1 dengan sumbu y

✏️ **Catat ini di buku tulismu**: Titik pojok = sudut DP; bisa dari potong sumbu atau potong antar garis.`,
  },
  {
    no: 8,
    judul: 'Titik Pojok Perpotongan Dua Pertidaksamaan: Metode Campuran',
    video_url: VIDEO_SUBBAB[8],
    materi: `## Subbab 8 — Metode Campuran (Eliminasi–Substitusi)

### Langkah
1. **Eliminasi**: samakan koefisien salah satu variabel, lalu jumlahkan/kurangkan sehingga satu variabel hilang → dapat nilai satu variabel
2. **Substitusi**: masukkan nilai itu ke salah satu persamaan untuk mendapat variabel kedua

### Contoh
Cari perpotongan x + y = 6 dan 2x + y = 8:

**Eliminasi** — kurangkan persamaan (2) − (1):
(2x + y) − (x + y) = 8 − 6
x = 2

**Substitusi** ke persamaan (1):
2 + y = 6
y = 4

**Titik potong**: (2, 4)

✏️ **Catat ini di buku tulismu**: Eliminasi dulu → dapat satu variabel → substitusi untuk dapat variabel lain.`,
  },
  {
    no: 9,
    judul: 'Fungsi Tujuan dan Nilai Optimum (Maksimum/Minimum)',
    video_url: VIDEO_SUBBAB[9],
    materi: `## Subbab 9 — Fungsi Tujuan dan Nilai Optimum

### Fungsi Tujuan
f(x, y) = ax + by → bentuk yang ingin dimaksimumkan (keuntungan) atau diminimumkan (biaya).

### Metode Uji Titik Pojok
1. Tentukan semua titik pojok DP
2. Hitung f di tiap titik pojok
3. Nilai terbesar = **maksimum**, terkecil = **minimum**

### Metode Garis Selidik (Pengayaan)
Garis selidik ax + by = k digeser sejajar; nilai optimum tercapai di pojok yang disentuh garis paling jauh/dekat.

### Contoh
f(x, y) = 3x + 4y pada pojok (0,0), (4,0), (2,4), (0,6):

| Titik | f(x,y) |
|-------|--------|
| (0,0) | 0 |
| (4,0) | 12 |
| (2,4) | 22 |
| (0,6) | 24 |

**Maksimum** = 24 di (0, 6)
**Minimum** = 0 di (0, 0)

✏️ **Catat ini di buku tulismu**: Uji semua pojok → nilai terbesar = maksimum, terkecil = minimum.`,
  },
  {
    no: 10,
    judul: 'Memodelkan Soal Cerita menjadi Kalimat Matematika',
    video_url: VIDEO_SUBBAB[10],
    materi: `## Subbab 10 — Memodelkan Soal Cerita

### Langkah Pemodelan
1. **Tetapkan variabel** — mis. x = banyak barang A, y = banyak barang B
2. **Buat tabel batasan** — sumber daya × persediaan
3. **Tulis pertidaksamaan** dari tiap batasan + syarat alamiah x ≥ 0, y ≥ 0
4. **Tulis fungsi tujuan** dari yang ditanyakan (keuntungan/biaya)
5. **Selesaikan**: gambar grafik → titik pojok → uji fungsi tujuan → simpulkan

### Contoh
Sebuah usaha membuat roti A dan roti B.
- Mesin I: 1 jam per roti (maks 6 jam/hari)
- Mesin II: roti A 2 jam, roti B 1 jam (maks 8 jam/hari)
- Keuntungan: roti A Rp3.000, roti B Rp4.000 per buah

**Model**:
- x + y ≤ 6 (Mesin I)
- 2x + y ≤ 8 (Mesin II)
- x ≥ 0, y ≥ 0 (syarat alamiah)
- Fungsi tujuan: f(x,y) = 3000x + 4000y

**Hasil** (dari Subbab 9): keuntungan maksimum Rp24.000 dengan membuat 6 roti B (di titik (0, 6)).

✏️ **Catat ini di buku tulismu**: Variabel → tabel batasan → pertidaksamaan + syarat alamiah → fungsi tujuan.`,
  },
];
