// ─── Kurikulum SPtLDV Fase E (Kelas X) — 10 Sub-Bab ─────────────────────────

export type SimulationKind = "line" | "region" | "system" | "corner";

export interface MateriBlock {
  title: string;
  body: string;
  math?: string[];
  tip?: string;
}

export interface SubbabContent {
  id: number;
  title: string;
  levelRef: string;
  focus: string;
  materi: MateriBlock[];
  videoQuery: string;
  contoh: { soal: string; math?: string[]; langkah: string[]; jawaban: string };
  simulation: SimulationKind | null;
}

export const SUBBABS: SubbabContent[] = [
  {
    id: 1,
    title: "Pengenalan PtLDV",
    levelRef: "Level 1–2",
    focus: "Bentuk umum, unsur-unsur, verbal ke matematika",
    materi: [
      {
        title: "Apa itu Pertidaksamaan Linear Dua Variabel?",
        body: "Pertidaksamaan linear dua variabel (PtLDV) adalah kalimat terbuka yang memuat dua variabel, masing-masing ber pangkat satu, dan dihubungkan oleh tanda ketidaksamaan (<, >, ≤, atau ≥).",
        math: ["Bentuk umum:  ax + by ≤ c", "dengan a, b, c bilangan real, a dan b tidak keduanya nol"],
      },
      {
        title: "Mengenal unsur-unsurnya",
        body: "Pada ax + by ≤ c, a disebut koefisien x, b koefisien y, c konstanta, sedangkan x dan y adalah variabel. Tanda ≤ disebut relasi ketidaksamaan.",
        math: ["3x + 2y ≤ 12  →  a = 3, b = 2, c = 12", "x − 4y > 8  →  a = 1, b = −4, c = 8"],
        tip: "Koefisien selalu menempel pada variabelnya, termasuk tanda negatifnya.",
      },
      {
        title: "Bukan PtLDV jika…",
        body: "Suatu bentuk BUKAN PtLDV bila variabelnya berpangkat lebih dari satu (x²), ada perkalian antarvariabel (xy), memuat akar variabel, atau hanya memiliki satu variabel.",
      },
      {
        title: "Dari kata-kata ke matematika",
        body: "Soal cerita dimodelkan dengan memisalkan objek sebagai variabel, lalu menerjemahkan frasa kunci: “tidak lebih dari” → ≤, “paling sedikit/minimal” → ≥, “kurang dari” → <, “melebihi” → >.",
        math: ["“Total belanja tidak lebih dari Rp50.000” →  x + y ≤ 50000"],
      },
    ],
    videoQuery: "pengenalan pertidaksamaan linear dua variabel kelas 10",
    contoh: {
      soal: "Harga sebuah buku tulis x rupiah dan sebuah pensil y rupiah. Dina membeli 3 buku dan 2 pensil, total belanjanya tidak lebih dari Rp20.000. Tuliskan model matematikanya.",
      langkah: [
        "Pemisalan sudah diberikan: buku = x, pensil = y.",
        "Belanja buku: 3x, belanja pensil: 2y, sehingga total = 3x + 2y.",
        "Frasa “tidak lebih dari” berarti ≤.",
      ],
      jawaban: "3x + 2y ≤ 20000",
    },
    simulation: null,
  },
  {
    id: 2,
    title: "Titik Potong pada PtLDV",
    levelRef: "Level 3",
    focus: "Titik potong sumbu X dan sumbu Y",
    materi: [
      {
        title: "Mengapa titik potong penting?",
        body: "Untuk menggambar garis pembatas ax + by = c, cara tercepat adalah mencari dua titik potong garis dengan sumbu koordinat, lalu menghubungkannya.",
      },
      {
        title: "Titik potong sumbu X",
        body: "Garis memotong sumbu X saat y = 0. Substitusikan y = 0 ke persamaan, lalu selesaikan ax = c.",
        math: ["2x + 3y = 12  →  y = 0  →  2x = 12  →  x = 6", "Titik potong X: (6, 0)"],
      },
      {
        title: "Titik potong sumbu Y",
        body: "Garis memotong sumbu Y saat x = 0. Substitusikan x = 0, lalu selesaikan by = c.",
        math: ["2x + 3y = 12  →  x = 0  →  3y = 12  →  y = 4", "Titik potong Y: (0, 4)"],
        tip: "Jangan tertukar! Titik (p, 0) selalu di sumbu X, titik (0, q) di sumbu Y.",
      },
      {
        title: "Jika garis melalui (0, 0)",
        body: "Bila c = 0 garis melewati titik asal, sehingga titik potong kedua sumbu sama. Pilih satu nilai x lain (misal x = 2) untuk mendapat titik kedua.",
      },
    ],
    videoQuery: "titik potong sumbu garis linear ax+by=c",
    contoh: {
      soal: "Tentukan titik potong garis 4x + 5y = 20 dengan kedua sumbu koordinat.",
      langkah: [
        "Sumbu X (y = 0): 4x = 20 → x = 5 → (5, 0).",
        "Sumbu Y (x = 0): 5y = 20 → y = 4 → (0, 4).",
      ],
      jawaban: "Titik potong X: (5, 0), titik potong Y: (0, 4)",
    },
    simulation: null,
  },
  {
    id: 3,
    title: "Menggambar Garis PtLDV",
    levelRef: "Level 4–5",
    focus: "Plot 2 titik → garis, jenis garis penuh/putus",
    materi: [
      {
        title: "Langkah menggambar garis pembatas",
        body: "1) Ubah pertidaksamaan menjadi persamaan (tanda =). 2) Cari titik potong kedua sumbu. 3) Plot kedua titik pada bidang Kartesius. 4) Hubungkan dengan gaya garis yang sesuai.",
      },
      {
        title: "Garis penuh vs garis putus-putus",
        body: "Jika relasinya ≤ atau ≥ (memuat “sama dengan”), titik-titik pada garis ikut menjadi penyelesaian → garis digambar PENUH. Jika relasinya < atau >, titik pada garis tidak termasuk → garis digambar PUTUS-PUTUS.",
        math: ["2x + 3y ≤ 12  →  garis penuh", "2x + 3y < 12  →  garis putus-putus"],
        tip: "Ingat: ada “sama dengan” = garis penuh (garisnya ikut bermain).",
      },
      {
        title: "Membaca grafik garis",
        body: "Dari grafik garis kamu bisa membaca balik persamaannya: perhatikan dua titik potongnya, lalu susun persamaan garis yang melaluinya.",
        math: ["Melalui (4, 0) dan (0, 2)  →  x + 2y = 4"],
      },
    ],
    videoQuery: "menggambar garis pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Gambarlah garis pembatas dari 3x + 4y ≥ 12 dan tentukan jenis garisnya.",
      langkah: [
        "Persamaan pembatas: 3x + 4y = 12.",
        "Titik potong X (y = 0): 3x = 12 → x = 4 → (4, 0).",
        "Titik potong Y (x = 0): 4y = 12 → y = 3 → (0, 3).",
        "Relasi ≥ memuat “sama dengan” → garis penuh.",
      ],
      jawaban: "Garis penuh melalui (4, 0) dan (0, 3)",
    },
    simulation: "line",
  },
  {
    id: 4,
    title: "Uji Titik & Daerah Penyelesaian",
    levelRef: "Level 6",
    focus: "Uji titik (0,0), menentukan arsiran",
    materi: [
      {
        title: "Garis membagi bidang jadi dua",
        body: "Garis pembatas membelah bidang Kartesius menjadi dua daerah. Hanya satu daerah yang merupakan himpunan penyelesaian. Cara mencarinya: uji satu titik contoh!",
      },
      {
        title: "Uji titik (0, 0)",
        body: "Jika garis tidak melalui (0, 0), substitusikan x = 0 dan y = 0 ke pertidaksamaan. Jika hasilnya BENAR, daerah yang memuat (0, 0) adalah penyelesaiannya. Jika SALAH, daerah seberangnya.",
        math: ["2x + 3y ≤ 12  →  0 + 0 ≤ 12 (BENAR)", "→ daerah penyelesaian memuat titik (0, 0)"],
      },
      {
        title: "Konvensi arsiran",
        body: "Pada platform ini, daerah penyelesaian adalah daerah yang DIARSIR. Sebagian buku mengarsir daerah yang bukan penyelesaian — selalu perhatikan petunjuk soal.",
        tip: "Arsir daerah penyelesaiannya, kecuali soal meminta sebaliknya.",
      },
      {
        title: "Alur lengkap satu PtLDV",
        body: "Titik potong → gambar garis (penuh/putus) → uji titik (0, 0) → arsir daerah yang memenuhi. Empat langkah ini adalah fondasi untuk sistem (dua garis atau lebih).",
      },
    ],
    videoQuery: "uji titik daerah penyelesaian pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Tentukan daerah penyelesaian dari 2x + 3y ≤ 12.",
      langkah: [
        "Garis pembatas: 2x + 3y = 12, melalui (6, 0) dan (0, 4), garis penuh.",
        "Uji (0, 0): 0 + 0 = 0 ≤ 12 → BENAR.",
        "Daerah penyelesaian = sisi garis yang memuat (0, 0), yaitu di bawah/kiri garis.",
      ],
      jawaban: "Arsiran di bawah garis (memuat titik asal), garis penuh",
    },
    simulation: "region",
  },
  {
    id: 5,
    title: "Pengenalan SPtLDV",
    levelRef: "Level 7 (intro)",
    focus: "Konsep sistem, irisan",
    materi: [
      {
        title: "Dari satu menjadi banyak",
        body: "Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV) adalah dua PtLDV atau lebih yang berlaku BERSAMAAN. Semua kendala harus dipenuhi sekaligus.",
        math: ["x + y ≤ 10", "2x + y ≤ 14", "x ≥ 0,   y ≥ 0"],
      },
      {
        title: "Kendala non-negatif",
        body: "Dalam soal kontekstual, banyaknya benda tidak mungkin negatif. Maka hampir selalu ditambahkan kendala x ≥ 0 dan y ≥ 0, yang membatasi DHP pada Kuadran I.",
        tip: "Kendala x ≥ 0 dan y ≥ 0 sering tidak disebutkan eksplisit di soal cerita — kamu yang harus menambahkannya.",
      },
      {
        title: "Penyelesaian sistem = irisan",
        body: "Daerah Himpunan Penyelesaian (DHP) sistem adalah IRISAN semua daerah penyelesaian masing-masing pertidaksamaan. Sebuah titik menjadi penyelesaian hanya jika memenuhi SEMUA kendala.",
      },
      {
        title: "Cek keanggotaan titik",
        body: "Untuk memeriksa apakah sebuah titik penyelesaian sistem, substitusikan ke setiap pertidaksamaan satu per satu. Satu saja gagal → titik itu bukan penyelesaian.",
        math: ["(2, 3) pada  x + y ≤ 10 ✓,  2x + y ≤ 14 ✓  → penyelesaian"],
      },
    ],
    videoQuery: "pengenalan sistem pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Periksalah apakah titik (1, 4) merupakan penyelesaian sistem x + y ≤ 6, 3x + y ≥ 6, x ≥ 0, y ≥ 0.",
      langkah: [
        "x + y ≤ 6 → 1 + 4 = 5 ≤ 6 (BENAR).",
        "3x + y ≥ 6 → 3 + 4 = 7 ≥ 6 (BENAR).",
        "x = 1 ≥ 0 ✓, y = 4 ≥ 0 ✓.",
      ],
      jawaban: "(1, 4) memenuhi semua kendala → penyelesaian sistem",
    },
    simulation: null,
  },
  {
    id: 6,
    title: "Menggambar SPtLDV & DHP",
    levelRef: "Level 7–8",
    focus: "Multi garis, Kuadran I, DHP",
    materi: [
      {
        title: "Menggambar banyak garis sekaligus",
        body: "Gambar garis pembatas tiap pertidaksamaan pada SATU bidang Kartesius: cari titik potong masing-masing, perhatikan jenis garisnya, lalu tandai sisi penyelesaian tiap garis.",
      },
      {
        title: "Kunci DHP: irisan semua arsiran",
        body: "DHP adalah daerah yang terkena SEMUA tanda sisi. Cara praktis: tandai sisi benar tiap garis dengan panah kecil, lalu temukan daerah yang mendapat semua panah.",
        tip: "Gunakan skala sumbu yang cukup lebar agar semua titik potong muat di gambar.",
      },
      {
        title: "DHP di Kuadran I",
        body: "Karena x ≥ 0 dan y ≥ 0, DHP soal program linear hampir selalu terkurung di Kuadran I: dibatasi sumbu X, sumbu Y, dan garis-garis kendala.",
      },
      {
        title: "DHP terbatas vs tak terbatas",
        body: "DHP terbatas (tertutup) jika seluruhnya terkurung segi banyak; tak terbatas jika memanjang tanpa ujung. Untuk nilai optimum, DHP terbatas paling mudah dianalisis.",
      },
    ],
    videoQuery: "menggambar DHP sistem pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Gambarlah DHP dari sistem x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      langkah: [
        "Garis 1: x + y = 6 melalui (6, 0) dan (0, 6); uji (0,0): benar → arsir sisi bawah.",
        "Garis 2: x + 2y = 8 melalui (8, 0) dan (0, 4); uji (0,0): benar → arsir sisi bawah.",
        "x ≥ 0 membatasi kanan sumbu Y; y ≥ 0 membatasi atas sumbu X.",
        "DHP = irisan keempat daerah di Kuadran I.",
      ],
      jawaban: "DHP segi empat di Kuadran I dengan titik pojok (0,0), (6,0), (4,2), (0,4)",
    },
    simulation: "system",
  },
  {
    id: 7,
    title: "Titik Pojok dari DHP",
    levelRef: "Level 9.1",
    focus: "Mengidentifikasi titik sudut DHP",
    materi: [
      {
        title: "Apa itu titik pojok?",
        body: "Titik pojok (titik ekstrem/titik sudut) adalah titik-titik sudut poligon DHP, yaitu perpotongan dua garis pembatas yang masih berada di dalam daerah penyelesaian.",
      },
      {
        title: "Cara membaca titik pojok dari grafik",
        body: "Telusuri batas DHP satu putaran. Setiap sudutnya adalah titik pojok: bisa titik potong garis dengan sumbu, maupun titik potong antargaris.",
        math: ["DHP segi empat → 4 titik pojok", "DHP segitiga → 3 titik pojok"],
      },
      {
        title: "Mengapa titik pojok krusial?",
        body: "Teorema program linear: nilai optimum fungsi tujuan pada DHP terbatas SELALU dicapai di salah satu titik pojok. Maka daftar titik pojok adalah langkah wajib sebelum optimasi.",
        tip: "Titik potong dua garis kendala belum tentu titik pojok — cek dulu apakah titik itu memenuhi semua kendala.",
      },
    ],
    videoQuery: "menentukan titik pojok DHP program linear",
    contoh: {
      soal: "Tentukan semua titik pojok DHP dari x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      langkah: [
        "Kandidat dari sumbu: (0, 0), (6, 0), (0, 4) — semua memenuhi kendala lain.",
        "Perpotongan garis: x + y = 6 dan x + 2y = 8 → kurangkan: y = 2, x = 4 → (4, 2).",
        "Cek (4, 2): memenuhi semua kendala → titik pojok.",
      ],
      jawaban: "(0, 0), (6, 0), (4, 2), (0, 4)",
    },
    simulation: "corner",
  },
  {
    id: 8,
    title: "Titik Pojok Metode Campuran",
    levelRef: "Level 9.1 lanjut",
    focus: "Eliminasi & substitusi dua garis",
    materi: [
      {
        title: "Perpotongan garis tanpa grafik",
        body: "Titik pojok yang bukan di sumbu harus dihitung: selesaikan sistem dua persamaan garis pembatas dengan eliminasi atau substitusi.",
      },
      {
        title: "Eliminasi",
        body: "Samakan koefisien salah satu variabel (kalikan persamaan bila perlu), lalu jumlahkan atau kurangkan kedua persamaan hingga satu variabel hilang.",
        math: ["x + y = 6", "x + 2y = 8", "Kurangkan: −y = −2 → y = 2 → x = 4"],
      },
      {
        title: "Substitusi",
        body: "Nyatakan satu variabel dari persamaan termudah (misal y = 6 − x), lalu masukkan ke persamaan lainnya.",
        tip: "Pilih persamaan dengan koefisien 1 untuk menghindari pecahan.",
      },
      {
        title: "Selalu cek kelayakan",
        body: "Setelah dapat titik potong, substitusikan ke SEMUA kendala. Titik yang melanggar satu kendala saja bukan titik pojok DHP.",
      },
    ],
    videoQuery: "metode eliminasi substitusi titik potong dua garis",
    contoh: {
      soal: "Tentukan titik potong garis 2x + y = 10 dan x + 3y = 15.",
      langkah: [
        "Dari persamaan kedua: x = 15 − 3y.",
        "Substitusi: 2(15 − 3y) + y = 10 → 30 − 6y + y = 10 → 5y = 20 → y = 4.",
        "x = 15 − 12 = 3.",
      ],
      jawaban: "Titik potong: (3, 4)",
    },
    simulation: null,
  },
  {
    id: 9,
    title: "Fungsi Tujuan & Nilai Optimum",
    levelRef: "Level 9.2",
    focus: "Nilai maksimum & minimum",
    materi: [
      {
        title: "Fungsi tujuan",
        body: "Fungsi tujuan adalah bentuk yang hendak dioptimalkan (dimaksimumkan atau diminimumkan), ditulis f(x, y) = ax + by. Menghitung nilai fungsi berarti mensubstitusikan koordinat titik.",
        math: ["f(x, y) = 5x + 3y, di titik (4, 2):", "f = 5·4 + 3·2 = 26"],
      },
      {
        title: "Metode uji titik pojok",
        body: "Langkah optimasi: 1) tentukan semua titik pojok DHP, 2) hitung nilai fungsi tujuan di tiap titik pojok, 3) bandingkan — terbesar = maksimum, terkecil = minimum.",
        tip: "Buat tabel evaluasi agar tidak ada titik pojok yang terlewat.",
      },
      {
        title: "Mengapa cukup di titik pojok?",
        body: "Karena fungsi linear berubah dengan laju tetap, nilai optimumnya pada DHP terbatas pasti tercapai di sudut, bukan di tengah daerah. Inilah inti teorema program linear.",
      },
    ],
    videoQuery: "nilai optimum fungsi tujuan uji titik pojok",
    contoh: {
      soal: "Dengan DHP berpojok (0,0), (6,0), (4,2), (0,4), tentukan maksimum dan minimum f(x, y) = 5x + 3y.",
      langkah: [
        "f(0, 0) = 0",
        "f(6, 0) = 30",
        "f(4, 2) = 20 + 6 = 26",
        "f(0, 4) = 12",
      ],
      jawaban: "Maksimum 30 di (6, 0); minimum 0 di (0, 0)",
    },
    simulation: null,
  },
  {
    id: 10,
    title: "Pemodelan Soal Cerita",
    levelRef: "Integrasi",
    focus: "Variabel, kendala, fungsi tujuan",
    materi: [
      {
        title: "Memisalkan variabel",
        body: "Langkah pertama soal cerita: tentukan dua objek yang diatur banyaknya, lalu misalkan sebagai x dan y. Tulis pemisalan secara eksplisit lengkap dengan satuannya.",
        math: ["x = banyak kursi yang dibuat (buah)", "y = banyak meja yang dibuat (buah)"],
      },
      {
        title: "Menyusun kendala",
        body: "Setiap batasan sumber daya (bahan, waktu, uang, tempat) menjadi satu pertidaksamaan. Satuan ruas kiri dan kanan harus sejenis. Jangan lupakan kendala non-negatif x ≥ 0, y ≥ 0.",
        tip: "Buat tabel: baris = sumber daya, kolom = kebutuhan tiap objek. Pola tabel langsung menjadi kendala.",
      },
      {
        title: "Fungsi tujuan dari konteks",
        body: "Kata “keuntungan”, “pendapatan”, atau “hasil penjualan” menandai fungsi tujuan yang dimaksimumkan; “biaya” atau “pengeluaran” biasanya diminimumkan.",
        math: ["Untung 40rb & 30rb per unit → f(x, y) = 40x + 30y (ribu rupiah)"],
      },
      {
        title: "Siklus penuh pemodelan",
        body: "Variabel → kendala → DHP → titik pojok → nilai optimum → tafsirkan kembali ke konteks. Jawaban akhir harus kembali berbentuk kalimat yang menjawab pertanyaan soal cerita.",
      },
    ],
    videoQuery: "model matematika program linear soal cerita kelas 10",
    contoh: {
      soal: "Sebuah pabrik membuat kursi (x) dan meja (y). Sebuah kursi butuh 2 jam kerja, meja 4 jam, total waktu tersedia 32 jam. Ruang pamer hanya muat 10 furnitur. Untung per kursi Rp40.000 dan per meja Rp60.000. Susun model matematikanya.",
      langkah: [
        "Kendala waktu: 2x + 4y ≤ 32.",
        "Kendala kapasitas: x + y ≤ 10.",
        "Kendala non-negatif: x ≥ 0, y ≥ 0.",
        "Fungsi tujuan (maksimum): f(x, y) = 40x + 60y ribu rupiah.",
      ],
      jawaban: "Maksimumkan f = 40x + 60y dengan kendala 2x + 4y ≤ 32, x + y ≤ 10, x ≥ 0, y ≥ 0",
    },
    simulation: null,
  },
];

export function getSubbab(id: number): SubbabContent {
  return SUBBABS[Math.min(Math.max(id, 1), SUBBABS.length) - 1];
}

export const TOTAL_SUBBAB = SUBBABS.length;
