// ─── Kurikulum SPtLDV Fase E (Kelas X) — 10 Sub-Bab ─────────────────────────
// Catatan penulisan: gunakan sintaks MathSteps → baris ">" = kalimat penjelas,
// frac(a,b) = pecahan atas-bawah, "=" otomatis disejajarkan.

export type SimulationKind = "line" | "region" | "system" | "corner";

export interface MateriBlock {
  title: string;
  body: string;
  list?: string[];
  steps?: string;
  math?: string[];
  tip?: string;
}

export interface ContohStage {
  label: string;
  explain: string;
  steps?: string;
}

export interface SubbabContent {
  id: number;
  title: string;
  levelRef: string;
  focus: string;
  materi: MateriBlock[];
  videoQuery: string;
  contoh: { soal: string; math?: string[]; stages: ContohStage[]; jawaban: string };
  simulation: SimulationKind | null;
}

export const SUBBABS: SubbabContent[] = [
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Pengenalan PtLDV",
    levelRef: "Level 1–2",
    focus: "Bentuk umum, unsur-unsur, verbal ke matematika",
    materi: [
      {
        title: "Dari persamaan menuju pertidaksamaan",
        body:
          "Kamu sudah mengenal persamaan linear dua variabel seperti x + y = 10, yang berarti jumlah dua bilangan TEPAT sepuluh. Namun kenyataan sehari-hari jarang sekaku itu. Uang saku yang kamu bawa \"paling banyak\" Rp20.000, waktu belajar \"minimal\" 2 jam, muatan truk \"tidak melebihi\" 5 ton. Batasan seperti inilah yang dimodelkan oleh pertidaksamaan: bukan menyatakan satu nilai pasti, melainkan satu RENTANG nilai yang diperbolehkan.",
      },
      {
        title: "Definisi dan bentuk umum",
        body:
          "Pertidaksamaan Linear Dua Variabel (PtLDV) adalah kalimat terbuka yang memuat dua variabel, masing-masing berpangkat satu, dan dihubungkan oleh salah satu tanda ketidaksamaan. Ada empat bentuk umum yang mungkin:",
        list: [
          "ax + by < c  (kurang dari)",
          "ax + by > c  (lebih dari)",
          "ax + by ≤ c  (kurang dari atau sama dengan)",
          "ax + by ≥ c  (lebih dari atau sama dengan)",
        ],
        tip:
          "Syarat penting: a dan b tidak boleh keduanya nol. Jika keduanya nol, tidak ada variabel yang tersisa sehingga bentuknya bukan lagi pertidaksamaan dua variabel.",
      },
      {
        title: "Mengenali unsur-unsurnya satu per satu",
        body:
          "Setiap bagian pada bentuk ax + by ≤ c punya nama. Memahami nama ini penting karena semua langkah berikutnya (mencari titik potong, menguji titik) selalu merujuk pada bagian-bagian tersebut.",
        list: [
          "a disebut koefisien x — bilangan yang menempel pada variabel x",
          "b disebut koefisien y — bilangan yang menempel pada variabel y",
          "c disebut konstanta — suku yang tidak memuat variabel apa pun",
          "x dan y disebut variabel — nilainya belum diketahui dan boleh berubah",
          "Tanda <, >, ≤, atau ≥ disebut relasi ketidaksamaan",
        ],
        steps:
          "> Perhatikan contoh berikut dan tentukan unsur-unsurnya:\n" +
          "3x + 2y ≤ 12\n" +
          "> Koefisien x adalah 3, koefisien y adalah 2, konstanta adalah 12.\n" +
          "x − 4y > 8\n" +
          "> Koefisien x adalah 1 (karena x sama dengan 1x), koefisien y adalah −4 (tanda minus IKUT), konstanta adalah 8.",
        tip:
          "Tanda negatif selalu ikut menjadi bagian koefisien. Pada x − 4y > 8, koefisien y bukan 4 melainkan −4.",
      },
      {
        title: "Membedakan yang PtLDV dan yang bukan",
        body:
          "Sebuah bentuk disebut PtLDV hanya jika memenuhi SEMUA syarat: memuat tepat dua variabel, setiap variabel berpangkat satu, tidak ada perkalian antarvariabel, tidak ada variabel di dalam akar atau penyebut, dan dihubungkan tanda ketidaksamaan. Berikut contoh yang GAGAL memenuhi syarat beserta alasannya:",
        list: [
          "x² + y ≤ 6  → gagal, karena x berpangkat dua (tidak linear)",
          "xy + 2y ≥ 8  → gagal, karena ada perkalian antarvariabel xy",
          "2x + 3y = 12  → gagal, karena memakai tanda sama dengan (ini persamaan)",
          "5x ≤ 20  → gagal, karena hanya memuat satu variabel",
          "frac(1,x) + y < 4  → gagal, karena variabel berada di penyebut",
        ],
      },
      {
        title: "Menerjemahkan kalimat menjadi model matematika",
        body:
          "Kemampuan menerjemahkan kalimat sehari-hari menjadi pertidaksamaan adalah inti dari pemodelan. Kuncinya ada pada frasa penanda. Hafalkan padanan berikut, karena akan terus dipakai sampai sub-bab terakhir:",
        list: [
          "\"tidak lebih dari\", \"paling banyak\", \"maksimal\", \"sebanyak-banyaknya\"  →  ≤",
          "\"tidak kurang dari\", \"paling sedikit\", \"minimal\", \"sekurang-kurangnya\"  →  ≥",
          "\"kurang dari\", \"di bawah\"  →  <",
          "\"lebih dari\", \"melebihi\", \"di atas\"  →  >",
        ],
        steps:
          "> Contoh penerjemahan: \"Dina membeli 3 buku dan 2 pensil dengan total belanja tidak lebih dari Rp20.000.\"\n" +
          "> Langkah 1: misalkan x = harga sebuah buku, y = harga sebuah pensil.\n" +
          "> Langkah 2: susun bentuk total belanjanya.\n" +
          "3x + 2y\n" +
          "> Langkah 3: terjemahkan frasa \"tidak lebih dari\" menjadi tanda ≤, lalu tuliskan batasnya.\n" +
          "3x + 2y ≤ 20000",
      },
    ],
    videoQuery: "pengenalan pertidaksamaan linear dua variabel kelas 10",
    contoh: {
      soal:
        "Harga sebuah buku tulis adalah x rupiah dan sebuah pensil adalah y rupiah. Rani membeli 4 buku tulis dan 3 pensil. Ia membayar dengan uang Rp50.000 dan masih menerima kembalian. Tuliskan model matematika dari situasi tersebut.",
      stages: [
        {
          label: "Memahami situasi",
          explain:
            "Rani membayar Rp50.000 dan MASIH MENERIMA KEMBALIAN. Artinya total belanjanya tidak mungkin sama dengan Rp50.000, melainkan harus benar-benar kurang dari Rp50.000. Frasa ini akan menentukan tanda relasi yang kita pakai nanti.",
        },
        {
          label: "Menyusun bentuk total belanja",
          explain:
            "Harga sebuah buku tulis adalah x, maka harga 4 buku tulis adalah 4x. Harga sebuah pensil adalah y, maka harga 3 pensil adalah 3y. Total belanjanya adalah penjumlahan keduanya.",
          steps: "> Total belanja Rani:\nTotal = 4x + 3y",
        },
        {
          label: "Memilih tanda relasi",
          explain:
            "Karena Rani masih menerima kembalian, total belanja harus KURANG DARI Rp50.000 (bukan ≤, sebab bila tepat Rp50.000 tidak akan ada kembalian).",
          steps: "4x + 3y < 50000",
        },
        {
          label: "Menambahkan syarat wajar",
          explain:
            "Harga barang tidak mungkin negatif, sehingga secara matematis kita tambahkan syarat x ≥ 0 dan y ≥ 0. Syarat semacam ini akan selalu muncul kembali pada soal-soal program linear.",
          steps: "4x + 3y < 50000\nx ≥ 0\ny ≥ 0",
        },
      ],
      jawaban: "4x + 3y < 50000, dengan x ≥ 0 dan y ≥ 0",
    },
    simulation: null,
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: "Titik Potong pada PtLDV",
    levelRef: "Level 3",
    focus: "Titik potong sumbu X dan sumbu Y",
    materi: [
      {
        title: "Mengapa harus mencari titik potong?",
        body:
          "Untuk menggambar sebuah garis, kita cukup memerlukan DUA titik, lalu menghubungkannya dengan penggaris. Dari sekian banyak titik yang dilalui garis, dua titik yang paling mudah dihitung adalah titik potong dengan sumbu X dan titik potong dengan sumbu Y. Alasannya sederhana: pada kedua titik itu, salah satu koordinatnya bernilai nol sehingga perhitungannya menjadi jauh lebih ringan.",
      },
      {
        title: "Gagasan kuncinya: nol-kan salah satu variabel",
        body:
          "Perhatikan ciri khas kedua sumbu. Setiap titik yang terletak pada sumbu X selalu berbentuk (p, 0) — koordinat y-nya nol. Sebaliknya, setiap titik pada sumbu Y selalu berbentuk (0, q) — koordinat x-nya nol. Dari sinilah aturan pengerjaan kita berasal.",
        list: [
          "Mencari titik potong sumbu X  →  substitusikan y = 0, lalu hitung nilai x",
          "Mencari titik potong sumbu Y  →  substitusikan x = 0, lalu hitung nilai y",
        ],
      },
      {
        title: "Langkah lengkap titik potong sumbu X",
        body:
          "Ubah dahulu pertidaksamaan menjadi persamaan (ganti tandanya dengan =), karena yang kita gambar adalah garis pembatasnya. Kemudian kerjakan langkah demi langkah seperti berikut.",
        steps:
          "2x + 3y = 12\n" +
          "> Kita ubah y = 0, maka:\n" +
          "2x + 3(0) = 12\n" +
          "2x + 0 = 12\n" +
          "2x = 12\n" +
          "x = frac(12,2)\n" +
          "x = 6\n" +
          "> Jadi titik potong dengan sumbu X adalah (6, 0).",
      },
      {
        title: "Langkah lengkap titik potong sumbu Y",
        body:
          "Prosesnya serupa, hanya variabel yang di-nol-kan berbeda. Sekarang giliran x yang kita jadikan nol.",
        steps:
          "2x + 3y = 12\n" +
          "> Kita ubah x = 0, maka:\n" +
          "2(0) + 3y = 12\n" +
          "0 + 3y = 12\n" +
          "3y = 12\n" +
          "y = frac(12,3)\n" +
          "y = 4\n" +
          "> Jadi titik potong dengan sumbu Y adalah (0, 4).",
        tip:
          "Jangan tertukar dalam menuliskan koordinat. Hasil perhitungan sumbu X ditulis (6, 0) — angkanya di depan; hasil perhitungan sumbu Y ditulis (0, 4) — angkanya di belakang.",
      },
      {
        title: "Ketika koefisiennya negatif",
        body:
          "Bila ada koefisien bernilai negatif, langkahnya sama persis. Yang perlu ekstra hati-hati hanyalah operasi pembagian dengan bilangan negatif: hasil bagi dua bilangan yang berbeda tanda selalu negatif.",
        steps:
          "3x − 7y = 21\n" +
          "> Kita ubah x = 0, maka:\n" +
          "3(0) − 7y = 21\n" +
          "−7y = 21\n" +
          "y = frac(21,−7)\n" +
          "y = −3\n" +
          "> Jadi titik potong dengan sumbu Y adalah (0, −3), yaitu di bawah titik asal.",
      },
      {
        title: "Kasus khusus: garis melalui titik asal",
        body:
          "Jika konstanta c bernilai nol (misalnya 2x − y = 0), maka substitusi y = 0 menghasilkan x = 0 juga. Kedua titik potong berimpit di (0, 0), sehingga kita hanya punya satu titik. Solusinya: pilih sembarang nilai x lain, misalnya x = 2, lalu hitung y-nya untuk mendapatkan titik kedua.",
        steps:
          "2x − y = 0\n" +
          "> Ambil x = 2, maka:\n" +
          "2(2) − y = 0\n" +
          "4 − y = 0\n" +
          "y = 4\n" +
          "> Titik kedua yang dilalui garis adalah (2, 4).",
      },
    ],
    videoQuery: "titik potong sumbu x dan y garis ax+by=c",
    contoh: {
      soal: "Tentukan titik potong garis 4x + 5y = 20 dengan kedua sumbu koordinat.",
      stages: [
        {
          label: "Menentukan rencana pengerjaan",
          explain:
            "Ada dua hal yang diminta, sehingga kita kerjakan dalam dua perhitungan terpisah. Untuk sumbu X kita nol-kan y, dan untuk sumbu Y kita nol-kan x. Jangan mencampur keduanya dalam satu baris pengerjaan.",
        },
        {
          label: "Menghitung titik potong sumbu X",
          explain:
            "Substitusikan y = 0 ke dalam persamaan. Suku 5y akan hilang karena 5 dikali 0 sama dengan 0, menyisakan persamaan satu variabel yang mudah diselesaikan.",
          steps:
            "4x + 5y = 20\n" +
            "> Kita ubah y = 0, maka:\n" +
            "4x + 5(0) = 20\n" +
            "4x = 20\n" +
            "x = frac(20,4)\n" +
            "x = 5",
        },
        {
          label: "Menghitung titik potong sumbu Y",
          explain:
            "Sekarang substitusikan x = 0. Kali ini suku 4x yang hilang, sehingga tersisa persamaan dalam variabel y saja.",
          steps:
            "4x + 5y = 20\n" +
            "> Kita ubah x = 0, maka:\n" +
            "4(0) + 5y = 20\n" +
            "5y = 20\n" +
            "y = frac(20,5)\n" +
            "y = 4",
        },
        {
          label: "Menuliskan kesimpulan",
          explain:
            "Tuliskan kedua hasil dalam bentuk pasangan koordinat. Perhatikan letak angkanya: hasil dari sumbu X berpasangan dengan 0 di belakang, dan hasil dari sumbu Y berpasangan dengan 0 di depan.",
          steps:
            "> Titik potong sumbu X:\n(5, 0)\n> Titik potong sumbu Y:\n(0, 4)",
        },
      ],
      jawaban: "Titik potong sumbu X adalah (5, 0) dan titik potong sumbu Y adalah (0, 4)",
    },
    simulation: null,
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: "Menggambar Garis PtLDV",
    levelRef: "Level 4–5",
    focus: "Plot 2 titik → garis, jenis garis penuh/putus-putus",
    materi: [
      {
        title: "Empat langkah menggambar garis pembatas",
        body:
          "Menggambar garis pembatas dari sebuah pertidaksamaan selalu mengikuti urutan yang sama. Hafalkan urutan ini agar tidak ada langkah yang terlewat:",
        list: [
          "Ubah tanda pertidaksamaan menjadi tanda sama dengan (=), sehingga diperoleh persamaan garis pembatas",
          "Cari titik potong dengan sumbu X (nol-kan y) dan titik potong dengan sumbu Y (nol-kan x)",
          "Gambar kedua titik tersebut pada bidang Kartesius dengan teliti",
          "Hubungkan kedua titik menggunakan jenis garis yang sesuai dengan tanda aslinya",
        ],
      },
      {
        title: "Menentukan jenis garis: penuh atau putus-putus",
        body:
          "Inilah bagian yang paling sering keliru. Jenis garis ditentukan semata-mata oleh ADA atau TIDAKNYA unsur \"sama dengan\" pada tanda pertidaksamaan aslinya. Maknanya: apakah titik-titik yang tepat berada pada garis ikut menjadi penyelesaian atau tidak.",
        list: [
          "Tanda ≤ atau ≥ memuat \"sama dengan\" → titik pada garis IKUT menjadi penyelesaian → GARIS PENUH",
          "Tanda < atau > tidak memuat \"sama dengan\" → titik pada garis TIDAK ikut → GARIS PUTUS-PUTUS",
        ],
        steps:
          "2x + 3y ≤ 12\n" +
          "> Tanda ≤ memuat \"sama dengan\", sehingga garis pembatas digambar PENUH.\n" +
          "2x + 3y < 12\n" +
          "> Tanda < tidak memuat \"sama dengan\", sehingga garis pembatas digambar PUTUS-PUTUS.",
        tip:
          "Cara mengingat: garis putus-putus itu \"berlubang\", menandakan titik-titik di atasnya bolong alias tidak termasuk penyelesaian.",
      },
      {
        title: "Ketelitian saat memplot titik",
        body:
          "Kesalahan menggambar sering terjadi bukan karena hitungan salah, melainkan karena penempatan titik yang keliru. Ingat kembali aturan pembacaan koordinat: pasangan (x, y) berarti bergerak mendatar sejauh x lebih dahulu, baru kemudian bergerak tegak sejauh y.",
        list: [
          "Titik (6, 0): dari titik asal bergerak 6 satuan ke kanan, tetap di sumbu X",
          "Titik (0, 4): dari titik asal bergerak 4 satuan ke atas, tetap di sumbu Y",
          "Titik (0, −3): dari titik asal bergerak 3 satuan ke bawah, di sumbu Y bagian negatif",
        ],
      },
      {
        title: "Membaca persamaan dari gambar garis",
        body:
          "Kemampuan sebaliknya juga penting: bila diberikan gambar garis, kita harus dapat menemukan persamaannya. Caranya dengan membaca kedua titik potongnya, lalu memakai rumus cepat berikut. Jika garis memotong sumbu X di (p, 0) dan sumbu Y di (0, q), maka persamaannya adalah qx + py = pq.",
        steps:
          "> Misalkan sebuah garis memotong sumbu X di (4, 0) dan sumbu Y di (0, 2).\n" +
          "> Berarti p = 4 dan q = 2, sehingga:\n" +
          "qx + py = pq\n" +
          "2x + 4y = 8\n" +
          "> Sederhanakan dengan membagi kedua ruas dengan 2:\n" +
          "x + 2y = 4",
      },
      {
        title: "Kemiringan garis: naik atau turun?",
        body:
          "Perhatikan arah garis untuk memeriksa kembali gambarmu. Jika koefisien x dan y sama-sama positif (misalnya 2x + 3y = 12), garis akan miring TURUN dari kiri atas ke kanan bawah. Namun bila salah satu koefisien negatif (misalnya 2x − 3y = 6), garis akan miring NAIK dari kiri bawah ke kanan atas. Pemeriksaan sederhana ini sering menyelamatkanmu dari kesalahan menggambar.",
      },
    ],
    videoQuery: "menggambar garis pembatas pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Gambarlah garis pembatas dari pertidaksamaan 3x + 4y ≥ 12, lalu tentukan jenis garisnya.",
      stages: [
        {
          label: "Langkah 1 — Mengubah menjadi persamaan",
          explain:
            "Yang digambar adalah garis pembatasnya, maka tanda ≥ untuk sementara kita ganti dengan tanda sama dengan. Tanda aslinya jangan dilupakan, karena nanti dipakai untuk menentukan jenis garis.",
          steps: "3x + 4y ≥ 12\n> Ubah menjadi persamaan garis pembatas:\n3x + 4y = 12",
        },
        {
          label: "Langkah 2 — Titik potong sumbu X",
          explain:
            "Substitusikan y = 0. Suku 4y menjadi 4 dikali 0 yang hasilnya 0, sehingga hilang dari persamaan.",
          steps:
            "3x + 4y = 12\n> Kita ubah y = 0, maka:\n3x + 4(0) = 12\n3x = 12\nx = frac(12,3)\nx = 4\n> Titik potong sumbu X adalah (4, 0).",
        },
        {
          label: "Langkah 3 — Titik potong sumbu Y",
          explain:
            "Sekarang substitusikan x = 0 sehingga suku 3x yang hilang, menyisakan persamaan dalam y.",
          steps:
            "3x + 4y = 12\n> Kita ubah x = 0, maka:\n3(0) + 4y = 12\n4y = 12\ny = frac(12,4)\ny = 3\n> Titik potong sumbu Y adalah (0, 3).",
        },
        {
          label: "Langkah 4 — Menentukan jenis garis",
          explain:
            "Kembali lihat tanda aslinya, yaitu ≥. Tanda ini memuat unsur \"sama dengan\", artinya titik-titik yang tepat berada pada garis ikut menjadi penyelesaian. Oleh karena itu garis digambar penuh (tidak putus-putus).",
          steps: "> Tanda asli: ≥ (memuat \"sama dengan\")\n> Kesimpulan: garis digambar PENUH.",
        },
        {
          label: "Langkah 5 — Menggambar",
          explain:
            "Plot titik (4, 0) pada sumbu X dan titik (0, 3) pada sumbu Y, lalu hubungkan keduanya dengan garis penuh dan perpanjang sedikit ke kedua ujungnya. Karena kedua koefisien positif, garis akan miring turun ke kanan — cocokkan dengan gambarmu sebagai pemeriksaan akhir.",
        },
      ],
      jawaban: "Garis PENUH yang melalui titik (4, 0) dan (0, 3)",
    },
    simulation: "line",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: "Uji Titik & Daerah Penyelesaian",
    levelRef: "Level 6",
    focus: "Uji titik (0,0), menentukan daerah penyelesaian",
    materi: [
      {
        title: "Garis membelah bidang menjadi dua daerah",
        body:
          "Setelah garis pembatas tergambar, bidang koordinat otomatis terbagi menjadi dua bagian yang terpisah oleh garis tersebut. Salah satu bagian memuat semua titik yang memenuhi pertidaksamaan (inilah daerah penyelesaian), sedangkan bagian lainnya memuat titik-titik yang tidak memenuhi. Tugas kita adalah menentukan bagian yang mana.",
      },
      {
        title: "Metode uji titik",
        body:
          "Cara termudah menentukan daerah penyelesaian adalah dengan mengambil satu titik sembarang yang TIDAK terletak pada garis, lalu memeriksa apakah titik itu memenuhi pertidaksamaan. Titik (0, 0) adalah pilihan paling favorit karena perhitungannya paling ringan. Namun bila garis justru melewati titik (0, 0), pilihlah titik lain misalnya (1, 0) atau (0, 1).",
        list: [
          "Jika hasil substitusi BENAR → daerah penyelesaian adalah sisi yang memuat titik uji tersebut",
          "Jika hasil substitusi SALAH → daerah penyelesaian adalah sisi seberangnya",
        ],
      },
      {
        title: "Contoh pengerjaan uji titik",
        body:
          "Perhatikan bagaimana substitusi dilakukan secara utuh, tidak dilompati. Tuliskan bentuk substitusinya lebih dahulu, baru hasil hitungnya.",
        steps:
          "2x + 3y ≤ 12\n" +
          "> Ambil titik uji (0, 0), lalu substitusikan:\n" +
          "2(0) + 3(0) ≤ 12\n" +
          "0 + 0 ≤ 12\n" +
          "0 ≤ 12   → BENAR\n" +
          "> Karena pernyataannya BENAR, maka titik (0, 0) termasuk penyelesaian.\n" +
          "> Daerah penyelesaian adalah sisi garis yang memuat titik (0, 0).",
      },
      {
        title: "Contoh ketika hasilnya salah",
        body:
          "Tidak semua uji titik menghasilkan pernyataan benar. Bila hasilnya salah, jangan panik — itu justru memberi tahu kita bahwa daerah penyelesaiannya berada di sisi seberang titik uji.",
        steps:
          "4x + 5y ≥ 20\n" +
          "> Ambil titik uji (0, 0), lalu substitusikan:\n" +
          "4(0) + 5(0) ≥ 20\n" +
          "0 ≥ 20   → SALAH\n" +
          "> Karena pernyataannya SALAH, titik (0, 0) bukan penyelesaian.\n" +
          "> Daerah penyelesaian adalah sisi garis yang TIDAK memuat titik (0, 0).",
      },
      {
        title: "Konvensi arsiran yang dipakai di sini",
        body:
          "Pada platform ini kita memakai konvensi yang lazim dipakai dalam program linear: yang DIARSIR adalah daerah yang BUKAN penyelesaian. Dengan begitu, daerah penyelesaian tampil bersih tanpa arsiran, sehingga mudah dibaca — terutama nanti ketika kendalanya sudah banyak dan arsiran saling bertumpuk.",
        tip:
          "Bacalah gambar dengan kalimat: \"daerah yang bersih itulah jawabannya\". Ini sangat membantu ketika nanti ada tiga atau empat kendala sekaligus.",
      },
      {
        title: "Rangkuman alur satu pertidaksamaan",
        body:
          "Seluruh proses dari awal hingga akhir untuk satu PtLDV dapat diringkas dalam lima langkah berikut. Alur inilah yang nanti diulang berkali-kali saat menghadapi sistem.",
        list: [
          "Ubah pertidaksamaan menjadi persamaan",
          "Cari titik potong kedua sumbu",
          "Gambar garis (penuh untuk ≤ dan ≥, putus-putus untuk < dan >)",
          "Uji satu titik di luar garis, biasanya (0, 0)",
          "Tentukan daerah penyelesaian, lalu arsir daerah yang BUKAN penyelesaian",
        ],
      },
    ],
    videoQuery: "uji titik daerah penyelesaian pertidaksamaan linear dua variabel",
    contoh: {
      soal: "Tentukan daerah penyelesaian dari pertidaksamaan 2x + 3y ≤ 12.",
      stages: [
        {
          label: "Langkah 1 — Menggambar garis pembatas",
          explain:
            "Ubah tandanya menjadi sama dengan, lalu cari kedua titik potongnya seperti yang sudah dipelajari pada sub-bab sebelumnya.",
          steps:
            "2x + 3y = 12\n" +
            "> Kita ubah y = 0, maka:\n2x + 3(0) = 12\n2x = 12\nx = 6\n" +
            "> Kita ubah x = 0, maka:\n2(0) + 3y = 12\n3y = 12\ny = 4\n" +
            "> Garis melalui titik (6, 0) dan (0, 4).",
        },
        {
          label: "Langkah 2 — Menentukan jenis garis",
          explain:
            "Tanda pada soal adalah ≤ yang memuat unsur \"sama dengan\", sehingga garis pembatas digambar penuh.",
          steps: "> Tanda ≤ memuat \"sama dengan\" → GARIS PENUH.",
        },
        {
          label: "Langkah 3 — Melakukan uji titik",
          explain:
            "Pilih titik (0, 0) karena garis tidak melewatinya dan perhitungannya paling mudah. Substitusikan secara lengkap.",
          steps:
            "2x + 3y ≤ 12\n" +
            "> Substitusikan titik (0, 0):\n" +
            "2(0) + 3(0) ≤ 12\n0 ≤ 12   → BENAR",
        },
        {
          label: "Langkah 4 — Menyimpulkan daerahnya",
          explain:
            "Karena hasil uji titik bernilai BENAR, maka titik (0, 0) berada di dalam daerah penyelesaian. Jadi daerah penyelesaiannya adalah sisi garis yang memuat titik asal, yaitu daerah di bawah-kiri garis. Sesuai konvensi kita, yang diarsir justru daerah seberangnya (di atas-kanan garis).",
        },
      ],
      jawaban:
        "Daerah penyelesaian adalah sisi garis yang memuat titik (0, 0), dengan garis pembatas penuh melalui (6, 0) dan (0, 4)",
    },
    simulation: "region",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title: "Pengenalan SPtLDV",
    levelRef: "Level 7 (intro)",
    focus: "Konsep sistem dan irisan daerah",
    materi: [
      {
        title: "Dari satu kendala menjadi banyak kendala",
        body:
          "Dalam kehidupan nyata, jarang sekali hanya ada satu batasan. Seorang pengrajin dibatasi oleh persediaan bahan baku, sekaligus oleh jumlah jam kerja, sekaligus oleh kapasitas tempat penyimpanan. Semua batasan itu berlaku bersamaan — tidak boleh dipilih salah satu. Kumpulan dua pertidaksamaan atau lebih yang harus dipenuhi secara bersamaan inilah yang disebut Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV).",
        steps:
          "> Contoh sebuah sistem dengan empat kendala:\n" +
          "x + y ≤ 10\n2x + y ≤ 14\nx ≥ 0\ny ≥ 0",
      },
      {
        title: "Kendala non-negatif dan Kuadran I",
        body:
          "Pada soal kontekstual, variabel biasanya menyatakan BANYAKNYA sesuatu: banyak kursi, banyak roti, banyak kemasan. Banyaknya benda tidak mungkin negatif, sehingga otomatis berlaku x ≥ 0 dan y ≥ 0. Kedua kendala inilah yang mengurung daerah penyelesaian di Kuadran I (bagian kanan atas bidang koordinat).",
        list: [
          "Kendala x ≥ 0 membatasi daerah agar berada di kanan sumbu Y",
          "Kendala y ≥ 0 membatasi daerah agar berada di atas sumbu X",
          "Akibatnya daerah penyelesaian terkurung di Kuadran I",
        ],
        tip:
          "Kedua kendala ini sering TIDAK tertulis di soal cerita. Kamulah yang harus menambahkannya sendiri saat memodelkan.",
      },
      {
        title: "Penyelesaian sistem adalah irisan",
        body:
          "Setiap pertidaksamaan menghasilkan satu daerah penyelesaian. Karena seluruh kendala harus dipenuhi secara BERSAMAAN, maka penyelesaian sistem adalah bagian yang menjadi anggota SEMUA daerah tersebut sekaligus — dalam bahasa himpunan disebut IRISAN. Daerah hasil irisan inilah yang dinamakan Daerah Himpunan Penyelesaian, disingkat DHP.",
        tip:
          "Irisan berbeda dengan gabungan. Kalau gabungan, cukup memenuhi salah satu kendala. Pada sistem, wajib memenuhi semuanya.",
      },
      {
        title: "Memeriksa apakah sebuah titik merupakan penyelesaian",
        body:
          "Untuk memeriksa keanggotaan sebuah titik, substitusikan koordinatnya ke setiap kendala satu per satu. Bila SEMUA kendala menghasilkan pernyataan benar, titik itu penyelesaian. Bila ada SATU saja yang salah, titik itu langsung gugur — tidak perlu memeriksa sisanya.",
        steps:
          "> Periksa apakah (2, 3) memenuhi sistem berikut:\n" +
          "x + y ≤ 10\n" +
          "> Substitusikan:\n2 + 3 ≤ 10\n5 ≤ 10   → BENAR\n" +
          "2x + y ≤ 14\n" +
          "> Substitusikan:\n2(2) + 3 ≤ 14\n7 ≤ 14   → BENAR\n" +
          "> Nilai x = 2 ≥ 0 dan y = 3 ≥ 0 juga terpenuhi.\n" +
          "> Kesimpulan: (2, 3) adalah penyelesaian sistem.",
      },
      {
        title: "Contoh titik yang gugur",
        body:
          "Perhatikan contoh berikut, di mana sebuah titik lolos pada kendala pertama tetapi gagal pada kendala kedua. Satu kegagalan sudah cukup membuatnya bukan penyelesaian.",
        steps:
          "> Periksa apakah (6, 3) memenuhi sistem yang sama:\n" +
          "6 + 3 ≤ 10\n9 ≤ 10   → BENAR\n" +
          "2(6) + 3 ≤ 14\n15 ≤ 14   → SALAH\n" +
          "> Karena ada satu kendala yang tidak terpenuhi, (6, 3) BUKAN penyelesaian sistem.",
      },
    ],
    videoQuery: "sistem pertidaksamaan linear dua variabel konsep irisan",
    contoh: {
      soal:
        "Periksalah apakah titik (1, 4) merupakan penyelesaian dari sistem x + y ≤ 6, 3x + y ≥ 6, x ≥ 0, y ≥ 0.",
      stages: [
        {
          label: "Langkah 1 — Menyusun rencana",
          explain:
            "Ada empat kendala yang harus diperiksa. Kita uji satu per satu secara berurutan. Jika sampai ada satu kendala yang menghasilkan pernyataan salah, pemeriksaan dapat langsung dihentikan.",
        },
        {
          label: "Langkah 2 — Menguji kendala pertama",
          explain: "Substitusikan x = 1 dan y = 4 ke dalam kendala x + y ≤ 6.",
          steps: "x + y ≤ 6\n> Substitusikan (1, 4):\n1 + 4 ≤ 6\n5 ≤ 6   → BENAR",
        },
        {
          label: "Langkah 3 — Menguji kendala kedua",
          explain:
            "Lanjutkan ke kendala 3x + y ≥ 6. Perhatikan bahwa kali ini tandanya ≥, sehingga yang kita harapkan adalah hasil ruas kiri yang lebih besar atau sama dengan 6.",
          steps: "3x + y ≥ 6\n> Substitusikan (1, 4):\n3(1) + 4 ≥ 6\n7 ≥ 6   → BENAR",
        },
        {
          label: "Langkah 4 — Menguji kendala non-negatif",
          explain:
            "Terakhir periksa kendala x ≥ 0 dan y ≥ 0. Nilai x = 1 dan y = 4, keduanya bilangan positif sehingga jelas memenuhi.",
          steps: "x = 1   → 1 ≥ 0 BENAR\ny = 4   → 4 ≥ 0 BENAR",
        },
        {
          label: "Langkah 5 — Menyimpulkan",
          explain:
            "Keempat kendala menghasilkan pernyataan benar, artinya titik (1, 4) memenuhi seluruh kendala secara bersamaan. Dengan demikian titik tersebut berada di dalam DHP.",
        },
      ],
      jawaban: "Ya, titik (1, 4) memenuhi semua kendala sehingga merupakan penyelesaian sistem",
    },
    simulation: null,
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: "Menggambar SPtLDV & DHP",
    levelRef: "Level 7–8",
    focus: "Banyak garis dalam satu bidang, menentukan DHP",
    materi: [
      {
        title: "Menggambar beberapa garis dalam satu bidang",
        body:
          "Prinsipnya tidak berubah dari sub-bab sebelumnya, hanya saja sekarang dikerjakan berulang untuk setiap kendala pada bidang koordinat yang SAMA. Kerjakan satu kendala sampai tuntas, baru lanjut ke kendala berikutnya, supaya tidak tertukar.",
        list: [
          "Kerjakan kendala pertama: cari titik potong, gambar garis, tentukan daerah penyelesaiannya",
          "Kerjakan kendala kedua dengan cara yang sama pada bidang yang sama",
          "Ulangi untuk setiap kendala yang tersisa, termasuk x ≥ 0 dan y ≥ 0",
          "Temukan daerah yang memenuhi SEMUA kendala sekaligus — itulah DHP",
        ],
      },
      {
        title: "Menentukan skala gambar",
        body:
          "Sebelum menggambar, lihat dahulu seluruh titik potong yang akan muncul. Pilih jangkauan sumbu yang cukup lebar agar semua titik muat dan tidak berdesakan. Bila titik potong terbesar adalah 14, jangan menggambar sumbu yang hanya sampai 10.",
        tip:
          "Beri jarak antar-angka pada sumbu secara konsisten. Skala yang tidak konsisten membuat garis tergambar miring dan titik potongnya salah.",
      },
      {
        title: "Kendala non-negatif juga punya garis pembatas",
        body:
          "Jangan lupakan kendala x ≥ 0 dan y ≥ 0 — keduanya juga merupakan pertidaksamaan yang punya garis pembatas. Garis pembatas x = 0 adalah sumbu Y itu sendiri, dan garis pembatas y = 0 adalah sumbu X. Daerah yang bukan penyelesaiannya pun ikut diarsir.",
        list: [
          "Kendala x ≥ 0 → garis pembatasnya sumbu Y, daerah bukan penyelesaian ada di KIRI sumbu Y",
          "Kendala y ≥ 0 → garis pembatasnya sumbu X, daerah bukan penyelesaian ada di BAWAH sumbu X",
        ],
      },
      {
        title: "Menemukan DHP",
        body:
          "Setelah semua daerah bukan penyelesaian diarsir, DHP adalah satu-satunya daerah yang tersisa bersih tanpa arsiran sama sekali. Inilah keunggulan konvensi \"arsir yang bukan penyelesaian\": semakin banyak kendala, daerah bersihnya justru semakin jelas terlihat.",
      },
      {
        title: "DHP terbatas dan tidak terbatas",
        body:
          "Bentuk DHP bergantung pada arah pertidaksamaannya. Bila seluruh kendala bertanda ≤ (ditambah kendala non-negatif), DHP biasanya berupa bangun tertutup seperti segitiga atau segi empat — inilah DHP terbatas. Namun bila ada kendala bertanda ≥ yang mendominasi, daerahnya bisa memanjang tanpa ujung — disebut DHP tidak terbatas.",
        tip:
          "Untuk mencari nilai maksimum, DHP terbatas selalu aman. Pada DHP tidak terbatas, nilai maksimum bisa jadi tidak ada.",
      },
    ],
    videoQuery: "menggambar daerah himpunan penyelesaian sistem pertidaksamaan",
    contoh: {
      soal: "Gambarlah DHP dari sistem x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      stages: [
        {
          label: "Langkah 1 — Garis pembatas pertama",
          explain: "Kerjakan kendala x + y ≤ 6 sampai tuntas terlebih dahulu.",
          steps:
            "x + y = 6\n" +
            "> Kita ubah y = 0, maka:\nx = 6\n" +
            "> Kita ubah x = 0, maka:\ny = 6\n" +
            "> Garis melalui (6, 0) dan (0, 6), digambar penuh karena tandanya ≤.",
        },
        {
          label: "Langkah 2 — Uji titik untuk kendala pertama",
          explain: "Gunakan titik (0, 0) untuk menentukan sisi mana yang menjadi penyelesaian.",
          steps: "> Substitusikan (0, 0) ke x + y ≤ 6:\n0 + 0 ≤ 6\n0 ≤ 6   → BENAR\n> Daerah penyelesaian ada di sisi yang memuat titik asal.",
        },
        {
          label: "Langkah 3 — Garis pembatas kedua",
          explain: "Sekarang kerjakan kendala x + 2y ≤ 8 dengan cara yang persis sama.",
          steps:
            "x + 2y = 8\n" +
            "> Kita ubah y = 0, maka:\nx = 8\n" +
            "> Kita ubah x = 0, maka:\n2y = 8\ny = frac(8,2)\ny = 4\n" +
            "> Garis melalui (8, 0) dan (0, 4), juga digambar penuh.",
        },
        {
          label: "Langkah 4 — Uji titik untuk kendala kedua",
          explain: "Kembali pakai titik (0, 0) karena garis kedua juga tidak melewatinya.",
          steps: "> Substitusikan (0, 0) ke x + 2y ≤ 8:\n0 ≤ 8   → BENAR\n> Daerah penyelesaian juga di sisi yang memuat titik asal.",
        },
        {
          label: "Langkah 5 — Menentukan DHP",
          explain:
            "Tambahkan kendala x ≥ 0 dan y ≥ 0 yang mengurung daerah di Kuadran I. DHP adalah daerah bersih yang dibatasi oleh sumbu X, sumbu Y, serta kedua garis tadi. Bila diperiksa, sudut-sudutnya berada di (0, 0), (6, 0), (4, 2), dan (0, 4).",
        },
      ],
      jawaban: "DHP berupa segi empat di Kuadran I dengan sudut (0, 0), (6, 0), (4, 2), dan (0, 4)",
    },
    simulation: "system",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: "Titik Pojok dari DHP",
    levelRef: "Level 9.1",
    focus: "Mengidentifikasi titik sudut DHP",
    materi: [
      {
        title: "Apa itu titik pojok?",
        body:
          "Titik pojok (disebut juga titik sudut atau titik ekstrem) adalah titik-titik yang menjadi sudut dari daerah himpunan penyelesaian. Secara teknis, titik pojok terbentuk dari perpotongan dua garis pembatas, dengan syarat titik perpotongan tersebut masih berada di dalam DHP.",
      },
      {
        title: "Mengapa titik pojok begitu penting?",
        body:
          "Terdapat sebuah teorema penting dalam program linear: pada DHP yang terbatas, nilai maksimum maupun minimum dari fungsi tujuan PASTI tercapai di salah satu titik pojok, tidak pernah di tengah-tengah daerah. Berkat teorema ini, kita tidak perlu memeriksa titik yang jumlahnya tak terhingga — cukup beberapa titik sudut saja.",
      },
      {
        title: "Tiga sumber titik pojok",
        body:
          "Ketika menelusuri batas DHP, titik pojok dapat berasal dari tiga jenis perpotongan berikut. Periksa ketiganya agar tidak ada yang terlewat:",
        list: [
          "Perpotongan sumbu X dengan sumbu Y, yaitu titik asal (0, 0)",
          "Perpotongan sebuah garis kendala dengan salah satu sumbu",
          "Perpotongan dua garis kendala satu sama lain",
        ],
      },
      {
        title: "Menentukan titik pojok dari gambar",
        body:
          "Cara termudah adalah menelusuri tepi DHP satu putaran penuh, misalnya searah jarum jam mulai dari titik asal. Setiap kali arah tepi berbelok, di situlah terdapat sebuah titik pojok. Hitung dan catat koordinatnya satu per satu.",
        tip:
          "Banyaknya titik pojok sama dengan banyaknya sudut pada bangun DHP. DHP berbentuk segitiga punya 3 titik pojok, segi empat punya 4 titik pojok.",
      },
      {
        title: "Hati-hati: tidak semua perpotongan adalah titik pojok",
        body:
          "Dua garis kendala selalu berpotongan di suatu titik (kecuali sejajar), tetapi titik potong itu belum tentu titik pojok. Syaratnya, titik tersebut harus memenuhi SELURUH kendala. Bila titik potong berada di luar DHP, ia harus dibuang.",
        steps:
          "> Misalkan dua garis berpotongan di titik (7, 2), sedangkan salah satu kendala lain adalah x + y ≤ 6.\n" +
          "> Periksa titik tersebut:\n" +
          "7 + 2 ≤ 6\n9 ≤ 6   → SALAH\n" +
          "> Karena melanggar kendala, (7, 2) berada di LUAR DHP dan BUKAN titik pojok.",
      },
    ],
    videoQuery: "menentukan titik pojok daerah himpunan penyelesaian program linear",
    contoh: {
      soal: "Tentukan semua titik pojok DHP dari sistem x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      stages: [
        {
          label: "Langkah 1 — Titik pojok dari kedua sumbu",
          explain:
            "Perpotongan sumbu X dan sumbu Y menghasilkan titik asal. Titik ini perlu diperiksa apakah memenuhi semua kendala.",
          steps: "> Periksa (0, 0):\n0 + 0 ≤ 6   → BENAR\n0 + 2(0) ≤ 8   → BENAR\n> Titik (0, 0) adalah titik pojok.",
        },
        {
          label: "Langkah 2 — Titik pojok pada sumbu X",
          explain:
            "Kedua garis memotong sumbu X di (6, 0) dan (8, 0). Yang menjadi titik pojok hanyalah yang memenuhi semua kendala, jadi keduanya harus diperiksa.",
          steps:
            "> Periksa (6, 0) pada kendala x + 2y ≤ 8:\n6 + 2(0) ≤ 8\n6 ≤ 8   → BENAR, jadi titik pojok.\n" +
            "> Periksa (8, 0) pada kendala x + y ≤ 6:\n8 + 0 ≤ 6\n8 ≤ 6   → SALAH, jadi BUKAN titik pojok.",
        },
        {
          label: "Langkah 3 — Titik pojok pada sumbu Y",
          explain: "Dengan cara yang sama, periksa titik potong kedua garis dengan sumbu Y, yaitu (0, 6) dan (0, 4).",
          steps:
            "> Periksa (0, 6) pada kendala x + 2y ≤ 8:\n0 + 2(6) ≤ 8\n12 ≤ 8   → SALAH, bukan titik pojok.\n" +
            "> Periksa (0, 4) pada kendala x + y ≤ 6:\n0 + 4 ≤ 6\n4 ≤ 6   → BENAR, jadi titik pojok.",
        },
        {
          label: "Langkah 4 — Perpotongan kedua garis (metode campuran)",
          explain:
            "Titik pojok terakhir berasal dari perpotongan kedua garis kendala. Hitung dengan metode campuran, yaitu eliminasi lebih dahulu kemudian substitusi.",
          steps:
            "> Persamaan garis pembatas:\nx + y = 6   …(1)\nx + 2y = 8   …(2)\n" +
            "> LANGKAH 1 — ELIMINASI x:\n" +
            "> Koefisien x sudah sama, maka kurangkan (2) − (1):\n" +
            "y = 2\n" +
            "> LANGKAH 2 — SUBSTITUSI y = 2 ke persamaan (1):\n" +
            "x + 2 = 6\nx = 4\n" +
            "> Diperoleh titik (4, 2).",
        },
        {
          label: "Langkah 5 — Menuliskan seluruh titik pojok",
          explain:
            "Kumpulkan semua titik yang lolos pemeriksaan. Urutkan searah tepi DHP agar rapi dan mudah dicek ulang.",
          steps: "> Titik pojok DHP:\n(0, 0)\n(6, 0)\n(4, 2)\n(0, 4)",
        },
      ],
      jawaban: "Titik pojoknya adalah (0, 0), (6, 0), (4, 2), dan (0, 4)",
    },
    simulation: "corner",
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title: "Titik Pojok Metode Campuran",
    levelRef: "Level 9.1 lanjut",
    focus: "Eliminasi lalu substitusi",
    materi: [
      {
        title: "Mengapa perlu metode campuran?",
        body:
          "Titik pojok yang berada pada sumbu mudah dibaca langsung dari gambar. Namun titik pojok hasil perpotongan dua garis kendala sering kali tidak jatuh tepat di perpotongan grid, sehingga membaca dari gambar menjadi tidak akurat. Cara yang pasti adalah menghitungnya secara aljabar dengan metode campuran: ELIMINASI terlebih dahulu, kemudian SUBSTITUSI.",
      },
      {
        title: "Tahap eliminasi",
        body:
          "Tujuan eliminasi adalah menghilangkan salah satu variabel agar tersisa persamaan dengan satu variabel saja. Ikuti urutan berikut:",
        list: [
          "Pilih variabel yang akan dihilangkan (biasanya yang koefisiennya paling mudah disamakan)",
          "Samakan koefisien variabel tersebut dengan mengalikan salah satu atau kedua persamaan",
          "Jika koefisiennya bertanda sama, KURANGKAN kedua persamaan",
          "Jika koefisiennya berlawanan tanda, JUMLAHKAN kedua persamaan",
          "Selesaikan persamaan satu variabel yang tersisa",
        ],
      },
      {
        title: "Tahap substitusi",
        body:
          "Nilai variabel yang sudah ditemukan pada tahap eliminasi kemudian dimasukkan kembali ke salah satu persamaan semula untuk memperoleh nilai variabel yang lain. Pilih persamaan yang angkanya paling sederhana agar perhitungan ringan.",
      },
      {
        title: "Contoh lengkap metode campuran",
        body:
          "Perhatikan pengerjaan berikut. Setiap baris ditulis lengkap agar alurnya jelas dan mudah diperiksa ulang bila ada kekeliruan.",
        steps:
          "> Persamaan garis pembatas:\n" +
          "2x + y = 10   …(1)\n" +
          "x + 3y = 15   …(2)\n" +
          "> LANGKAH 1 — ELIMINASI x:\n" +
          "> Samakan koefisien x: kalikan (2) dengan 2.\n" +
          "2x + y = 10\n" +
          "2x + 6y = 30\n" +
          "> Koefisien x bertanda sama, maka kurangkan (2) − (1):\n" +
          "5y = 20\n" +
          "y = frac(20,5)\n" +
          "y = 4\n" +
          "> LANGKAH 2 — SUBSTITUSI y = 4 ke persamaan (1):\n" +
          "2x + 4 = 10\n" +
          "2x = 6\n" +
          "x = frac(6,2)\n" +
          "x = 3\n" +
          "> Jadi titik potong kedua garis adalah (3, 4).",
      },
      {
        title: "Memeriksa hasil perhitungan",
        body:
          "Setelah memperoleh titik potong, lakukan dua pemeriksaan. Pertama, substitusikan kembali ke KEDUA persamaan semula untuk memastikan hitunganmu benar. Kedua, periksa apakah titik tersebut memenuhi seluruh kendala sistem — bila melanggar salah satu, titik itu bukan titik pojok DHP.",
        steps:
          "> Periksa (3, 4) pada persamaan (1):\n2(3) + 4 = 10\n10 = 10   → cocok\n" +
          "> Periksa (3, 4) pada persamaan (2):\n3 + 3(4) = 15\n15 = 15   → cocok",
      },
    ],
    videoQuery: "metode campuran eliminasi substitusi sistem persamaan linear",
    contoh: {
      soal: "Tentukan titik potong garis 3x + 2y = 16 dan x + 2y = 8 dengan metode campuran.",
      stages: [
        {
          label: "Langkah 1 — Mengamati koefisien",
          explain:
            "Perhatikan koefisien y pada kedua persamaan, keduanya sama-sama 2. Karena sudah sama, kita dapat langsung mengeliminasi y tanpa perlu mengalikan persamaan apa pun.",
          steps: "3x + 2y = 16   …(1)\nx + 2y = 8   …(2)",
        },
        {
          label: "Langkah 2 — Eliminasi y",
          explain:
            "Koefisien y pada kedua persamaan bertanda sama (keduanya positif 2), sehingga kita KURANGKAN persamaan (1) dengan persamaan (2). Suku y akan saling menghapus.",
          steps:
            "> LANGKAH 1 — ELIMINASI y:\n" +
            "3x + 2y = 16\nx + 2y = 8\n" +
            "> Kurangkan (1) − (2):\n" +
            "2x = 8\nx = frac(8,2)\nx = 4",
        },
        {
          label: "Langkah 3 — Substitusi",
          explain:
            "Masukkan nilai x = 4 ke salah satu persamaan semula. Pilih persamaan (2) karena angkanya lebih sederhana.",
          steps:
            "> LANGKAH 2 — SUBSTITUSI x = 4 ke persamaan (2):\n" +
            "4 + 2y = 8\n2y = 4\ny = frac(4,2)\ny = 2",
        },
        {
          label: "Langkah 4 — Memeriksa hasil",
          explain:
            "Substitusikan kembali titik (4, 2) ke persamaan (1) untuk memastikan perhitungan kita benar.",
          steps: "3(4) + 2(2) = 16\n12 + 4 = 16\n16 = 16   → cocok",
        },
      ],
      jawaban: "Titik potong kedua garis adalah (4, 2)",
    },
    simulation: null,
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title: "Fungsi Tujuan & Nilai Optimum",
    levelRef: "Level 9.2",
    focus: "Nilai maksimum dan minimum",
    materi: [
      {
        title: "Apa itu fungsi tujuan?",
        body:
          "Fungsi tujuan (fungsi objektif) adalah bentuk aljabar yang hendak dioptimalkan, biasanya ditulis f(x, y) = ax + by. Dalam konteks nyata, fungsi tujuan menyatakan hal yang ingin kita capai sebesar-besarnya (misalnya keuntungan) atau sekecil-kecilnya (misalnya biaya produksi).",
        list: [
          "Kata \"keuntungan\", \"pendapatan\", \"hasil penjualan\" → dicari nilai MAKSIMUM",
          "Kata \"biaya\", \"pengeluaran\", \"ongkos\" → dicari nilai MINIMUM",
        ],
      },
      {
        title: "Menghitung nilai fungsi tujuan di sebuah titik",
        body:
          "Menghitung nilai fungsi tujuan berarti mensubstitusikan koordinat sebuah titik ke dalam rumusnya. Lakukan perkalian lebih dahulu, baru penjumlahan.",
        steps:
          "> Diketahui f(x, y) = 5x + 3y. Hitung nilainya di titik (4, 2).\n" +
          "f(4, 2) = 5(4) + 3(2)\nf(4, 2) = 20 + 6\nf(4, 2) = 26",
      },
      {
        title: "Metode uji titik pojok",
        body:
          "Inilah metode baku untuk mencari nilai optimum. Kerjakan berurutan agar tidak ada titik yang terlewat:",
        list: [
          "Gambar DHP dari seluruh kendala",
          "Tentukan semua titik pojok DHP (pakai metode campuran bila perlu)",
          "Hitung nilai fungsi tujuan pada setiap titik pojok",
          "Susun hasilnya dalam sebuah tabel evaluasi",
          "Nilai terbesar adalah maksimum, nilai terkecil adalah minimum",
        ],
      },
      {
        title: "Contoh tabel evaluasi",
        body:
          "Menyusun tabel membuat pekerjaan rapi dan mengurangi risiko salah hitung. Tuliskan setiap substitusi secara lengkap, jangan langsung menulis hasilnya.",
        steps:
          "> Fungsi tujuan f(x, y) = 5x + 3y dengan titik pojok (0,0), (6,0), (4,2), (0,4).\n" +
          "f(0, 0) = 5(0) + 3(0)\nf(0, 0) = 0\n" +
          "f(6, 0) = 5(6) + 3(0)\nf(6, 0) = 30\n" +
          "f(4, 2) = 5(4) + 3(2)\nf(4, 2) = 26\n" +
          "f(0, 4) = 5(0) + 3(4)\nf(0, 4) = 12\n" +
          "> Nilai terbesar adalah 30 di titik (6, 0) → MAKSIMUM.\n" +
          "> Nilai terkecil adalah 0 di titik (0, 0) → MINIMUM.",
      },
      {
        title: "Mengapa cukup memeriksa titik pojok?",
        body:
          "Fungsi linear berubah dengan laju yang tetap ke satu arah tertentu. Bayangkan sebuah garis selidik ax + by = k yang digeser sejajar melintasi DHP: nilai k terus membesar seiring pergeseran. Garis tersebut akan meninggalkan DHP terakhir kali tepat di sebuah sudut. Itulah sebabnya nilai optimum selalu dicapai di titik pojok, bukan di bagian tengah daerah.",
        tip:
          "Bila dua titik pojok kebetulan menghasilkan nilai sama, berarti nilai optimum tercapai di sepanjang ruas garis yang menghubungkan keduanya.",
      },
    ],
    videoQuery: "nilai optimum fungsi tujuan metode uji titik pojok",
    contoh: {
      soal:
        "DHP suatu sistem memiliki titik pojok (0, 0), (6, 0), (4, 2), dan (0, 4). Tentukan nilai maksimum dan minimum dari f(x, y) = 5x + 3y.",
      stages: [
        {
          label: "Langkah 1 — Menyiapkan rencana",
          explain:
            "Titik pojok sudah diketahui, sehingga kita tinggal menghitung nilai fungsi tujuan pada keempat titik tersebut, lalu membandingkannya.",
        },
        {
          label: "Langkah 2 — Menghitung di dua titik pertama",
          explain: "Substitusikan koordinat masing-masing titik ke dalam f(x, y) = 5x + 3y.",
          steps:
            "f(0, 0) = 5(0) + 3(0)\nf(0, 0) = 0\n" +
            "f(6, 0) = 5(6) + 3(0)\nf(6, 0) = 30 + 0\nf(6, 0) = 30",
        },
        {
          label: "Langkah 3 — Menghitung di dua titik berikutnya",
          explain: "Lanjutkan dengan dua titik pojok yang tersisa.",
          steps:
            "f(4, 2) = 5(4) + 3(2)\nf(4, 2) = 20 + 6\nf(4, 2) = 26\n" +
            "f(0, 4) = 5(0) + 3(4)\nf(0, 4) = 0 + 12\nf(0, 4) = 12",
        },
        {
          label: "Langkah 4 — Membandingkan seluruh nilai",
          explain:
            "Urutkan keempat hasil perhitungan, lalu pilih yang terbesar sebagai maksimum dan yang terkecil sebagai minimum. Jangan lupa menyebutkan di titik mana nilai itu tercapai.",
          steps:
            "> Nilai-nilai yang diperoleh: 0, 30, 26, dan 12.\n" +
            "> Nilai terbesar adalah 30, tercapai di titik (6, 0).\n" +
            "> Nilai terkecil adalah 0, tercapai di titik (0, 0).",
        },
      ],
      jawaban: "Nilai maksimum 30 di titik (6, 0) dan nilai minimum 0 di titik (0, 0)",
    },
    simulation: null,
  },

  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 10,
    title: "Pemodelan Soal Cerita",
    levelRef: "Integrasi",
    focus: "Variabel, kendala, dan fungsi tujuan",
    materi: [
      {
        title: "Alur lengkap menyelesaikan soal cerita",
        body:
          "Sub-bab ini menggabungkan seluruh keterampilan yang sudah kamu pelajari. Urutan pengerjaannya selalu sama, mulai dari membaca soal sampai menafsirkan jawaban kembali ke konteks nyata:",
        list: [
          "Memisalkan variabel x dan y beserta satuannya",
          "Menyusun seluruh kendala dari batasan yang ada di soal",
          "Menambahkan kendala non-negatif x ≥ 0 dan y ≥ 0",
          "Menyusun fungsi tujuan dari hal yang ingin dioptimalkan",
          "Menggambar DHP dan menentukan titik-titik pojoknya",
          "Menghitung nilai fungsi tujuan di setiap titik pojok",
          "Menafsirkan jawaban kembali ke dalam kalimat konteks soal",
        ],
      },
      {
        title: "Memisalkan variabel dengan benar",
        body:
          "Variabel harus menyatakan BANYAKNYA benda yang jumlahnya bisa kita atur, bukan harga, bukan keuntungan, dan bukan total. Tuliskan pemisalan secara eksplisit lengkap dengan satuan agar tidak keliru di langkah berikutnya.",
        steps:
          "> Contoh pemisalan yang benar:\n" +
          "> x = banyak kursi yang diproduksi (buah)\n" +
          "> y = banyak meja yang diproduksi (buah)\n" +
          "> Contoh pemisalan yang keliru: x = keuntungan kursi. Keuntungan bukan variabel, melainkan bagian dari fungsi tujuan.",
      },
      {
        title: "Menyusun kendala dengan bantuan tabel",
        body:
          "Cara paling aman menyusun kendala adalah dengan membuat tabel bantu: baris untuk setiap sumber daya, kolom untuk setiap objek. Isikan kebutuhan tiap objek, lalu tuliskan batas ketersediaan di kolom terakhir. Setiap baris tabel langsung menjadi satu pertidaksamaan.",
        steps:
          "> Misalkan setiap kursi butuh 2 jam kerja dan setiap meja 4 jam kerja, dengan total waktu tersedia 32 jam.\n" +
          "> Bentuk kebutuhan waktu:\n" +
          "2x + 4y\n" +
          "> Karena waktu yang tersedia terbatas 32 jam, maka:\n" +
          "2x + 4y ≤ 32",
        tip:
          "Pastikan satuan ruas kiri dan ruas kanan sejenis. Jangan mencampur jam dengan rupiah dalam satu pertidaksamaan.",
      },
      {
        title: "Menyusun fungsi tujuan",
        body:
          "Fungsi tujuan disusun dari nilai per satuan objek dikalikan banyaknya objek. Perhatikan satuan yang dipakai dan tuliskan dengan konsisten, misalnya dalam ribuan rupiah agar angkanya tidak terlalu besar.",
        steps:
          "> Keuntungan setiap kursi Rp40.000 dan setiap meja Rp60.000.\n" +
          "> Maka fungsi tujuannya (dalam ribuan rupiah):\n" +
          "f(x, y) = 40x + 60y\n" +
          "> Karena yang dicari keuntungan terbesar, fungsi ini akan dimaksimumkan.",
      },
      {
        title: "Menafsirkan jawaban kembali ke konteks",
        body:
          "Jawaban akhir soal cerita tidak boleh berhenti pada angka. Kembalikan hasil perhitungan ke dalam kalimat yang menjawab pertanyaan soal, lengkap dengan satuan yang sesuai. Periksa juga kewajarannya: jika hasilnya berupa pecahan padahal yang dihitung adalah banyak benda, kemungkinan ada kekeliruan dalam pemodelan.",
        steps:
          "> Misalkan diperoleh nilai maksimum 520 di titik (4, 6).\n" +
          "> Penafsirannya: keuntungan terbesar Rp520.000 dicapai dengan memproduksi 4 kursi dan 6 meja.",
      },
    ],
    videoQuery: "model matematika program linear soal cerita kelas 10",
    contoh: {
      soal:
        "Sebuah pabrik membuat kursi (x) dan meja (y). Setiap kursi memerlukan 2 jam kerja dan setiap meja memerlukan 4 jam kerja, dengan total waktu tersedia 32 jam. Ruang pamer hanya mampu menampung 10 furnitur. Keuntungan setiap kursi Rp40.000 dan setiap meja Rp60.000. Susunlah model matematikanya.",
      stages: [
        {
          label: "Langkah 1 — Memisalkan variabel",
          explain:
            "Yang jumlahnya dapat diatur oleh pabrik adalah banyaknya kursi dan banyaknya meja, maka keduanya menjadi variabel.",
          steps: "> x = banyak kursi yang diproduksi (buah)\n> y = banyak meja yang diproduksi (buah)",
        },
        {
          label: "Langkah 2 — Kendala waktu kerja",
          explain:
            "Setiap kursi butuh 2 jam sehingga x kursi butuh 2x jam. Setiap meja butuh 4 jam sehingga y meja butuh 4y jam. Totalnya tidak boleh melebihi waktu yang tersedia.",
          steps: "2x + 4y ≤ 32",
        },
        {
          label: "Langkah 3 — Kendala kapasitas ruang",
          explain:
            "Ruang pamer menampung seluruh furnitur, baik kursi maupun meja, dengan total paling banyak 10 buah. Karena setiap furnitur memakan satu tempat, koefisien keduanya adalah 1 — cukup ditulis x dan y saja.",
          steps: "x + y ≤ 10",
        },
        {
          label: "Langkah 4 — Kendala non-negatif",
          explain:
            "Banyak kursi dan meja yang diproduksi tidak mungkin negatif. Kendala ini tidak tertulis di soal, tetapi wajib ditambahkan.",
          steps: "x ≥ 0\ny ≥ 0",
        },
        {
          label: "Langkah 5 — Fungsi tujuan",
          explain:
            "Yang ingin dioptimalkan adalah keuntungan, dan keuntungan selalu dicari sebesar-besarnya. Tuliskan dalam ribuan rupiah agar ringkas.",
          steps: "f(x, y) = 40x + 60y\n> Fungsi ini dicari nilai MAKSIMUM-nya.",
        },
      ],
      jawaban:
        "Maksimumkan f(x, y) = 40x + 60y dengan kendala 2x + 4y ≤ 32, x + y ≤ 10, x ≥ 0, dan y ≥ 0",
    },
    simulation: null,
  },
];

export function getSubbab(id: number): SubbabContent {
  return SUBBABS[Math.min(Math.max(id, 1), SUBBABS.length) - 1];
}

export const TOTAL_SUBBAB = SUBBABS.length;
