// ─── Kurikulum SPtLDV Fase E (Kelas X) — 10 Sub-Bab ─────────────────────────
// Bahasa sederhana untuk siswa Kelas X. Tanpa tanda pisah em-dash.
// Sintaks langkah: baris ">" = kalimat penjelas, frac(a,b) = pecahan atas bawah.
// KONVENSI GRAFIK: daerah yang DIARSIR adalah daerah penyelesaian / DHP.

import type { IneqSpec, Pt } from "./geometry";

export type SimulationKind = "line" | "region" | "system" | "corner";

/** Gambar grafik yang menyertai materi atau contoh soal. */
export interface FigureSpec {
  xRange: [number, number];
  yRange: [number, number];
  lines?: IneqSpec[];
  shadeIndices?: number[];
  dhpIneqs?: IneqSpec[];
  points?: { p: Pt; label?: string; color?: string; hollow?: boolean }[];
  crosshair?: Pt;
  caption?: string;
}

export interface MateriTable {
  header: string[];
  rows: string[][];
}

export interface MateriBlock {
  title: string;
  body: string;
  list?: string[];
  steps?: string;
  math?: string[];
  tip?: string;
  table?: MateriTable;
  figure?: FigureSpec;
}

export interface ContohStage {
  label: string;
  explain: string;
  steps?: string;
  figure?: FigureSpec;
  table?: MateriTable;
}

export interface SubbabContent {
  id: number;
  title: string;
  levelRef: string;
  focus: string;
  materi: MateriBlock[];
  /** ID video YouTube yang di-embed, null bila tidak ada video khusus */
  videoId: string | null;
  videoNote?: string;
  contoh: { soal: string; math?: string[]; stages: ContohStage[]; jawaban: string };
  simulation: SimulationKind | null;
}

export const SUBBABS: SubbabContent[] = [
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Pengenalan PtLDV",
    levelRef: "Level 1",
    focus: "Bentuk umum, unsur, cara memeriksa titik",
    videoId: "nZqBMyDW1s0",
    materi: [
      {
        title: "Dari persamaan ke pertidaksamaan",
        body:
          "Selama ini kamu akrab dengan persamaan seperti x + y = 10. Artinya jumlah kedua nilai TEPAT sepuluh, tidak boleh kurang dan tidak boleh lebih. Kenyataan di sekitar kita tidak selalu seketat itu. Uang saku yang dibawa paling banyak Rp20.000, waktu belajar minimal 2 jam, muatan truk tidak melebihi 5 ton. Semua batasan itu menyatakan rentang, bukan satu nilai pasti. Batasan rentang seperti ini dimodelkan oleh pertidaksamaan.",
      },
      {
        title: "Mengenal tanda pertidaksamaan",
        body:
          "Ada empat tanda yang dipakai dalam pertidaksamaan. Hafalkan nama dan artinya karena semua langkah berikutnya tergantung pada tanda ini.",
        table: {
          header: ["Tanda", "Nama", "Artinya"],
          rows: [
            ["<", "Kurang dari", "Nilai kiri lebih kecil, tanpa boleh sama"],
            ["≤", "Kurang dari atau sama dengan", "Nilai kiri lebih kecil atau boleh sama"],
            [">", "Lebih dari", "Nilai kiri lebih besar, tanpa boleh sama"],
            ["≥", "Lebih dari atau sama dengan", "Nilai kiri lebih besar atau boleh sama"],
          ],
        },
        tip:
          "Kalimat tidak lebih dari dan paling banyak memakai ≤. Kalimat tidak kurang dari, paling sedikit, dan minimal memakai ≥.",
      },
      {
        title: "Apa itu PtLDV",
        body:
          "Pertidaksamaan Linear Dua Variabel, disingkat PtLDV, adalah kalimat terbuka yang memuat dua variabel, masing-masing berpangkat satu, dan dihubungkan salah satu dari empat tanda di atas. Ada empat bentuk umumnya:",
        list: [
          "ax + by < c",
          "ax + by ≤ c",
          "ax + by > c",
          "ax + by ≥ c",
        ],
      },
      {
        title: "Membedakan PtLDV dan bukan PtLDV",
        body:
          "Sebuah bentuk disebut PtLDV hanya jika memenuhi SEMUA syarat berikut: tepat dua variabel (x dan y), setiap variabel berpangkat satu, tidak ada perkalian antar variabel, tidak ada variabel di dalam akar atau penyebut, dan dihubungkan tanda ketidaksamaan. Satu syarat saja gagal, maka bentuknya bukan PtLDV.",
        list: [
          "2x + 3y ≤ 12 adalah PtLDV karena semua syarat terpenuhi",
          "x² + y ≤ 6 bukan PtLDV karena x berpangkat dua",
          "xy + 2y ≥ 8 bukan PtLDV karena ada perkalian x dengan y",
          "2x + 3y = 12 bukan pertidaksamaan karena memakai tanda sama dengan",
          "5x ≤ 20 bukan dua variabel karena hanya memuat x saja",
        ],
      },
      {
        title: "Unsur unsur di dalam PtLDV",
        body:
          "Setiap bagian kecil pada bentuk ax + by ≤ c punya nama resmi yang akan selalu dipakai di sub-bab berikutnya.",
        list: [
          "a disebut koefisien x, yaitu bilangan yang menempel pada x",
          "b disebut koefisien y, termasuk tanda minusnya bila ada",
          "c disebut konstanta, yaitu suku yang tidak memuat variabel",
          "x dan y disebut variabel, nilainya belum diketahui dan boleh berubah",
        ],
        steps:
          "> Contoh pengenalan unsur:\n" +
          "3x + 2y ≤ 12\n" +
          "a = 3, b = 2, c = 12\n" +
          "x − 4y > 8\n" +
          "a = 1 karena x sama dengan 1x\n" +
          "b = −4 karena tanda minus ikut koefisien\n" +
          "c = 8",
      },
      {
        title: "Dari kalimat menjadi model matematika",
        body:
          "Soal cerita diubah menjadi pertidaksamaan dengan tiga langkah: misalkan objek sebagai x dan y, susun bentuk yang mewakili keadaan (biasanya total harga, total bahan, atau total waktu), lalu pilih tanda yang sesuai kata kuncinya.",
        steps:
          "> \"Dina membeli 3 buku dan 2 pensil dengan total tidak lebih dari Rp20.000\"\n" +
          "> Pemisalan: x = harga sebuah buku, y = harga sebuah pensil\n" +
          "3x + 2y\n" +
          "> Frasa tidak lebih dari berarti ≤, maka:\n" +
          "3x + 2y ≤ 20000",
      },
    ],
    contoh: {
      soal:
        "Perhatikan pertidaksamaan 4x − 3y ≤ 24.\nA. Sebutkan variabel, koefisien x, koefisien y, dan konstantanya.\nB. Apakah bentuk tersebut termasuk PtLDV? Jelaskan alasannya.",
      stages: [
        {
          label: "Menentukan variabelnya",
          explain:
            "Variabel adalah huruf yang nilainya belum diketahui. Pada bentuk ini ada dua huruf, yaitu x dan y, sehingga variabelnya ada dua.",
          steps: "4x − 3y ≤ 24\n> Variabelnya adalah x dan y.",
        },
        {
          label: "Menentukan koefisien x",
          explain:
            "Koefisien x adalah bilangan yang menempel pada x. Pada suku 4x, bilangan yang menempel adalah 4 dan tandanya positif.",
          steps: "> Suku yang memuat x adalah 4x, maka:\na = 4",
        },
        {
          label: "Menentukan koefisien y",
          explain:
            "Koefisien y adalah bilangan yang menempel pada y. Perhatikan tanda di depannya. Karena sukunya −3y, maka koefisiennya negatif, bukan 3 melainkan −3.",
          steps: "> Suku yang memuat y adalah −3y, maka:\nb = −3",
        },
        {
          label: "Menentukan konstanta",
          explain:
            "Konstanta adalah suku yang tidak memuat variabel apa pun. Pada bentuk ini, suku tersebut berada di ruas kanan.",
          steps: "> Suku tanpa variabel adalah 24, maka:\nc = 24",
        },
        {
          label: "Memeriksa apakah termasuk PtLDV",
          explain:
            "Periksa syaratnya satu per satu. Ada dua variabel yaitu x dan y, keduanya berpangkat satu, tidak ada perkalian antar variabel seperti xy, tidak ada variabel di dalam akar atau penyebut, dan tandanya ≤ yang merupakan tanda ketidaksamaan. Semua syarat terpenuhi.",
          steps:
            "> Dua variabel: ada (x dan y)\n> Pangkat tiap variabel: satu\n> Perkalian antar variabel: tidak ada\n> Tanda: ≤ (tanda ketidaksamaan)\n> Kesimpulan: bentuk ini TERMASUK PtLDV.",
        },
      ],
      jawaban:
        "Variabel x dan y, dengan a = 4, b = −3, c = 24. Bentuk tersebut termasuk PtLDV karena memenuhi semua syaratnya",
    },
    simulation: null,
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: "Titik Potong pada PtLDV",
    levelRef: "Level 2",
    focus: "Menyederhanakan dulu, lalu titik potong sumbu",
    videoId: "1hg5reqZJTw",
    materi: [
      {
        title: "Mengapa perlu titik potong",
        body:
          "Untuk menggambar sebuah garis kita hanya butuh dua titik. Dari semua titik yang dilalui garis, dua yang paling mudah dihitung adalah titik potong dengan sumbu X dan titik potong dengan sumbu Y. Alasannya sederhana: pada kedua titik itu, salah satu koordinatnya selalu nol, sehingga perhitungannya ringan.",
      },
      {
        title: "Sederhanakan dahulu bila memungkinkan",
        body:
          "Sebelum mencari titik potong, perhatikan dulu angka angkanya. Bila koefisien x, koefisien y, dan konstantanya sama sama habis dibagi satu bilangan, bagilah ketiganya dengan bilangan itu. Bentuk yang lebih sederhana membuat perhitungan jauh lebih ringan, sedangkan gambar garisnya tetap sama persis.",
        steps:
          "6x + 4y ≤ 24\n" +
          "> Ketiga angka (6, 4, dan 24) sama sama habis dibagi 2, maka bagi semuanya dengan 2:\n" +
          "3x + 2y ≤ 12\n" +
          "> Sekarang bentuknya sudah sederhana dan siap dikerjakan.",
        tip:
          "Tanda pertidaksamaan tidak berubah selama kita membagi dengan bilangan positif. Bila angka angkanya sudah tidak bisa dibagi bersama lagi, berarti bentuknya memang sudah sederhana.",
      },
      {
        title: "Idenya: jadikan satu variabel nol",
        body:
          "Perhatikan ciri sumbu koordinat. Semua titik pada sumbu X berbentuk (p, 0). Semua titik pada sumbu Y berbentuk (0, q). Karena ada bagian yang selalu nol, kita dapat memanfaatkannya: nolkan variabel yang tepat, lalu hitung variabel satunya.",
        list: [
          "Titik potong sumbu X dicari dengan mensubstitusi y = 0",
          "Titik potong sumbu Y dicari dengan mensubstitusi x = 0",
        ],
      },
      {
        title: "Langkah lengkap titik potong sumbu X",
        body:
          "Ubah dulu pertidaksamaan menjadi persamaan karena yang kita gambar adalah garis pembatasnya. Kemudian kerjakan langkah berikut tanpa melompat.",
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
          "Prosesnya sama persis, hanya variabel yang dijadikan nol berbeda. Sekarang giliran x yang kita nolkan.",
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
          "Jangan tertukar. Hasil hitungan sumbu X ditulis (6, 0) dengan angka di depan, sedangkan hasil sumbu Y ditulis (0, 4) dengan angka di belakang.",
      },
      {
        title: "Bila ada koefisien negatif",
        body:
          "Langkahnya tidak berubah. Yang perlu dijaga hanyalah pembagian dengan bilangan negatif: membagi bilangan positif dengan bilangan negatif menghasilkan bilangan negatif.",
        steps:
          "3x − 7y = 21\n" +
          "> Kita ubah x = 0, maka:\n" +
          "3(0) − 7y = 21\n" +
          "−7y = 21\n" +
          "y = frac(21,−7)\n" +
          "y = −3\n" +
          "> Titik potong dengan sumbu Y adalah (0, −3), di bawah titik asal.",
      },
      {
        title: "Kasus khusus: garis lewat titik asal",
        body:
          "Bila konstantanya nol (misalnya 2x − y = 0), mensubstitusi y = 0 memberi x = 0 juga. Kedua titik potong berimpit di (0, 0) sehingga kita hanya punya satu titik. Jalan keluarnya: pilih nilai x lain yang mudah, misalnya x = 2, hitung y nya, dan pakai itu sebagai titik kedua.",
        steps:
          "2x − y = 0\n" +
          "> Kita ambil x = 2, maka:\n" +
          "2(2) − y = 0\n" +
          "4 − y = 0\n" +
          "y = 4\n" +
          "> Titik kedua yang dilalui garis adalah (2, 4).",
      },
    ],
    contoh: {
      soal:
        "Sederhanakan pertidaksamaan 6x + 4y ≤ 24, kemudian tentukan titik potong garis pembatasnya dengan kedua sumbu.",
      stages: [
        {
          label: "Menyederhanakan bentuknya",
          explain:
            "Perhatikan ketiga angkanya: 6, 4, dan 24. Ketiganya sama sama habis dibagi 2, sehingga bentuknya masih bisa disederhanakan. Bagi seluruh suku dengan 2. Tanda pertidaksamaan tidak berubah karena kita membagi dengan bilangan positif.",
          steps:
            "6x + 4y ≤ 24\n> Bagi setiap suku dengan 2:\n3x + 2y ≤ 12",
        },
        {
          label: "Mengubah menjadi persamaan",
          explain:
            "Yang kita gambar adalah garis pembatasnya, sehingga tanda ≤ untuk sementara diganti dengan tanda sama dengan.",
          steps: "3x + 2y = 12",
        },
        {
          label: "Titik potong sumbu X",
          explain: "Substitusikan y = 0 lalu hitung nilai x.",
          steps:
            "3x + 2y = 12\n" +
            "> Kita ubah y = 0, maka:\n3x + 2(0) = 12\n3x = 12\nx = frac(12,3)\nx = 4\n" +
            "> Titik potong sumbu X adalah (4, 0).",
        },
        {
          label: "Titik potong sumbu Y",
          explain: "Sekarang substitusikan x = 0 lalu hitung nilai y.",
          steps:
            "3x + 2y = 12\n" +
            "> Kita ubah x = 0, maka:\n3(0) + 2y = 12\n2y = 12\ny = frac(12,2)\ny = 6\n" +
            "> Titik potong sumbu Y adalah (0, 6).",
        },
      ],
      jawaban: "Bentuk sederhananya 3x + 2y ≤ 12, dengan titik potong (4, 0) dan (0, 6)",
    },
    simulation: null,
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: "Menggambar Garis PtLDV",
    levelRef: "Level 3",
    focus: "Plot dua titik, jenis garis penuh atau putus",
    videoId: "01xAzLU1Fb8",
    materi: [
      {
        title: "Empat langkah menggambar garis pembatas",
        body:
          "Urutan kerjanya selalu sama, dari sub-bab ini sampai sistem yang rumit. Hafalkan urutan ini agar tidak ada bagian yang terlewat.",
        list: [
          "Ubah tanda pertidaksamaan menjadi tanda sama dengan, sehingga terbentuk persamaan garis pembatas",
          "Cari titik potong garis dengan sumbu X dan dengan sumbu Y",
          "Gambar kedua titik itu pada bidang Kartesius",
          "Hubungkan kedua titik dengan jenis garis yang sesuai tanda aslinya",
        ],
      },
      {
        title: "Tabel jenis garis: penuh atau putus putus",
        body:
          "Gaya garis ditentukan semata mata oleh tanda pertidaksamaan aslinya. Pertanyaan pengujinya: apakah titik yang tepat berada pada garis ikut menjadi penyelesaian atau tidak.",
        table: {
          header: ["Tanda", "Jenis garis", "Titik pada garis"],
          rows: [
            ["≤", "Penuh", "Ikut menjadi penyelesaian"],
            ["≥", "Penuh", "Ikut menjadi penyelesaian"],
            ["<", "Putus putus", "Tidak ikut menjadi penyelesaian"],
            [">", "Putus putus", "Tidak ikut menjadi penyelesaian"],
          ],
        },
        steps:
          "2x + 3y ≤ 12\n" +
          "> Tanda ≤ memuat sama dengan, sehingga garis digambar PENUH.\n" +
          "2x + 3y < 12\n" +
          "> Tanda < tidak memuat sama dengan, sehingga garis digambar PUTUS PUTUS.",
        tip:
          "Ingat: garis putus putus itu berlubang, menandakan titik di atasnya tidak dihitung sebagai penyelesaian.",
      },
      {
        title: "Garis horizontal dan garis vertikal",
        body:
          "Ada dua bentuk istimewa. Bila tidak ada suku y (misalnya x = 4), garisnya VERTIKAL memotong sumbu X di 4. Bila tidak ada suku x (misalnya y = 3), garisnya HORIZONTAL memotong sumbu Y di 3. Untuk keduanya cukup digambar langsung tanpa mencari dua titik.",
        steps:
          "> Garis x = 4 adalah garis tegak melalui titik (4, 0).\n" +
          "> Garis y = 3 adalah garis datar melalui titik (0, 3).\n" +
          "> Garis x = 0 adalah sumbu Y, dan garis y = 0 adalah sumbu X.",
        figure: {
          xRange: [-1, 7], yRange: [-1, 7],
          lines: [
            { a: 1, b: 0, c: 4, sign: "<=" },
            { a: 0, b: 1, c: 3, sign: "<=", color: "#DC2626" },
          ],
          points: [
            { p: { x: 4, y: 0 }, label: "(4, 0)", hollow: true },
            { p: { x: 0, y: 3 }, label: "(0, 3)", hollow: true, color: "#DC2626" },
          ],
          caption: "Garis biru x = 4 (tegak) dan garis merah y = 3 (datar)",
        },
      },
      {
        title: "Ketelitian saat menaruh titik",
        body:
          "Garis yang salah seringnya bukan karena hitungan keliru, melainkan karena titiknya salah taruh. Ingat aturan membaca koordinat: angka pertama bergerak mendatar, angka kedua bergerak tegak.",
        list: [
          "Titik A(6, 0) bergerak 6 satuan ke kanan dari titik asal, tetap pada sumbu X",
          "Titik B(0, 4) bergerak 4 satuan ke atas dari titik asal, tetap pada sumbu Y",
          "Titik C(0, −3) bergerak 3 satuan ke bawah dari titik asal, di bagian negatif sumbu Y",
          "Titik D(3, 2) bergerak 3 satuan ke kanan lalu 2 satuan ke atas",
        ],
        figure: {
          xRange: [-2, 8], yRange: [-4, 6],
          points: [
            { p: { x: 6, y: 0 }, label: "A(6, 0)" },
            { p: { x: 0, y: 4 }, label: "B(0, 4)" },
            { p: { x: 0, y: -3 }, label: "C(0, −3)" },
            { p: { x: 3, y: 2 }, label: "D(3, 2)" },
          ],
          caption: "Penulisan nama titik yang benar: huruf kapital diikuti koordinatnya",
        },
      },
      {
        title: "Membaca kembali persamaan dari grafik",
        body:
          "Diberi gambar garis, kita juga bisa menemukan persamaannya. Baca kedua titik potongnya, lalu pakai rumus cepat: garis yang memotong sumbu X di (p, 0) dan sumbu Y di (0, q) punya persamaan qx + py = pq.",
        steps:
          "> Garis melalui (4, 0) dan (0, 2), berarti p = 4 dan q = 2:\n" +
          "qx + py = pq\n" +
          "2x + 4y = 8\n" +
          "> Sederhanakan, dibagi 2:\n" +
          "x + 2y = 4",
      },
    ],
    contoh: {
      soal: "Gambarlah garis pembatas dari 3x + 4y ≥ 12 dan tentukan jenis garisnya.",
      stages: [
        {
          label: "Langkah 1: ubah menjadi persamaan",
          explain:
            "Yang digambar adalah garis pembatasnya, maka tanda ≥ untuk sementara kita ubah menjadi tanda sama dengan. Tanda aslinya tetap diingat karena menentukan jenis garis nanti.",
          steps: "3x + 4y ≥ 12\n> Ubah menjadi persamaan garis pembatas:\n3x + 4y = 12",
        },
        {
          label: "Langkah 2: titik potong sumbu X",
          explain: "Substitusikan y = 0 sehingga suku 4y menjadi hilang.",
          steps: "3x + 4y = 12\n> Kita ubah y = 0, maka:\n3x + 4(0) = 12\n3x = 12\nx = frac(12,3)\nx = 4\n> Titik potong sumbu X adalah (4, 0).",
        },
        {
          label: "Langkah 3: titik potong sumbu Y",
          explain: "Sekarang substitusikan x = 0 sehingga suku 3x yang hilang.",
          steps: "3x + 4y = 12\n> Kita ubah x = 0, maka:\n3(0) + 4y = 12\n4y = 12\ny = frac(12,4)\ny = 3\n> Titik potong sumbu Y adalah (0, 3).",
        },
        {
          label: "Langkah 4: tentukan jenis garis",
          explain:
            "Kembali ke tanda aslinya, yaitu ≥. Tanda ini memuat unsur sama dengan, artinya titik tepat pada garis ikut menjadi penyelesaian. Oleh karena itu garis digambar penuh.",
          steps: "> Tanda asli: ≥ (memuat sama dengan)\n> Kesimpulan: garis digambar PENUH.",
        },
        {
          label: "Langkah 5: gambarkan",
          explain:
            "Taruh titik A(4, 0) pada sumbu X dan titik B(0, 3) pada sumbu Y, hubungkan keduanya dengan garis penuh, lalu perpanjang sedikit keluar kedua ujungnya. Hasil gambarnya tampak seperti berikut.",
          figure: {
            xRange: [-1, 6], yRange: [-1, 5],
            lines: [{ a: 3, b: 4, c: 12, sign: ">=" }],
            points: [
              { p: { x: 4, y: 0 }, label: "A(4, 0)", hollow: true },
              { p: { x: 0, y: 3 }, label: "B(0, 3)", hollow: true },
            ],
            caption: "Garis penuh 3x + 4y = 12 melalui A(4, 0) dan B(0, 3)",
          },
        },
      ],
      jawaban: "Garis penuh yang melalui titik (4, 0) dan (0, 3)",
    },
    simulation: "line",
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: "Uji Titik & Daerah Penyelesaian",
    levelRef: "Level 4",
    focus: "Uji titik, arsiran = daerah penyelesaian",
    videoId: "pwAJn6GQYuc",
    materi: [
      {
        title: "Garis membagi bidang menjadi dua",
        body:
          "Saat garis pembatas sudah tergambar, bidang koordinat otomatis terbelah menjadi dua bagian. Satu bagian berisi semua titik yang memenuhi pertidaksamaan, itulah daerah penyelesaian. Bagian lainnya berisi titik yang tidak memenuhi. Pekerjaan kita tinggal menentukan bagian yang mana.",
      },
      {
        title: "Konvensi arsiran yang dipakai",
        body:
          "Sesuai standar pada buku dan video pembelajaran, yang kita ARSIR adalah daerah penyelesaiannya. Jadi saat membaca gambar, daerah yang diberi warna itulah jawabannya, sedangkan daerah putih di luarnya tidak termasuk penyelesaian.",
        tip:
          "Ingat kalimatnya: arsir daerah penyelesaian. Kebiasaan ini akan sangat membantu saat banyak kendala bertumpuk di sub-bab berikutnya.",
      },
      {
        title: "Metode uji titik",
        body:
          "Cara menentukan sisi mana yang diarsir: ambil satu titik percobaan yang tidak terletak pada garis, lalu periksa apakah titik itu memenuhi pertidaksamaan. Titik (0, 0) adalah pilihan termudah karena menghitungnya paling ringan. Bila garis justru melalui (0, 0), pilih titik lain seperti (1, 0).",
        list: [
          "Jika hasil substitusi BENAR, daerah penyelesaian ada di sisi yang memuat titik uji",
          "Jika hasil substitusi SALAH, daerah penyelesaian ada di sisi seberangnya",
        ],
      },
      {
        title: "Contoh lengkap dengan tanda ≤",
        body:
          "Perhatikan cara menuliskan substitusi secara utuh, tanpa melompat langsung ke kesimpulan.",
        steps:
          "2x + 3y ≤ 12\n" +
          "> Ambil titik uji (0, 0), lalu substitusikan:\n" +
          "2(0) + 3(0) ≤ 12\n" +
          "0 ≤ 12   → BENAR\n" +
          "> Titik (0, 0) memenuhi pertidaksamaan.\n" +
          "> Maka daerah yang memuat titik (0, 0) itulah yang kita arsir.",
        figure: {
          xRange: [-1, 8], yRange: [-1, 6],
          lines: [{ a: 2, b: 3, c: 12, sign: "<=" }],
          shadeIndices: [0],
          crosshair: { x: 0, y: 0 },
          caption: "Daerah berwarna adalah daerah penyelesaian 2x + 3y ≤ 12",
        },
      },
      {
        title: "Contoh lengkap dengan tanda ≥",
        body:
          "Sekarang coba tanda lain. Karena hasil ujinya salah, daerah penyelesaian justru ada di sisi yang tidak memuat titik uji.",
        steps:
          "4x + 5y ≥ 20\n" +
          "> Ambil titik uji (0, 0), lalu substitusikan:\n" +
          "4(0) + 5(0) ≥ 20\n" +
          "0 ≥ 20   → SALAH\n" +
          "> Titik (0, 0) tidak memenuhi pertidaksamaan.\n" +
          "> Maka yang kita arsir adalah daerah di sisi seberangnya.",
        figure: {
          xRange: [-1, 8], yRange: [-1, 7],
          lines: [{ a: 4, b: 5, c: 20, sign: ">=" }],
          shadeIndices: [0],
          crosshair: { x: 0, y: 0 },
          caption: "Daerah berwarna adalah daerah penyelesaian 4x + 5y ≥ 20",
        },
      },
      {
        title: "Peran kendala x ≥ 0 dan y ≥ 0",
        body:
          "Dalam soal kontekstual, x dan y biasanya menghitung banyaknya barang sehingga tidak mungkin negatif. Dua kendala tambahan ini membatasi daerah penyelesaian hanya pada bagian kanan atas bidang koordinat, yaitu daerah dengan nilai x dan y yang sama sama tidak negatif.",
        list: [
          "Kendala x ≥ 0: daerah yang diarsir berada di kanan sumbu Y",
          "Kendala y ≥ 0: daerah yang diarsir berada di atas sumbu X",
          "Akibat keduanya: daerah penyelesaian berada di bagian kanan atas bidang",
        ],
        figure: {
          xRange: [-4, 7], yRange: [-4, 7],
          lines: [],
          dhpIneqs: [
            { a: 1, b: 0, c: 0, sign: ">=" },
            { a: 0, b: 1, c: 0, sign: ">=" },
          ],
          caption: "Daerah berwarna memenuhi x ≥ 0 dan y ≥ 0 sekaligus",
        },
      },
      {
        title: "Alur lengkap satu pertidaksamaan",
        body:
          "Rangkum seluruh proses dari nol sampai gambar selesai. Alur inilah yang akan diulang berkali kali saat menghadapi sistem.",
        list: [
          "Sederhanakan pertidaksamaan bila perlu",
          "Ubah menjadi persamaan, cari titik potong kedua sumbu",
          "Gambar garis dengan jenis garis yang sesuai tanda",
          "Uji satu titik di luar garis untuk menentukan sisi penyelesaian",
          "Arsir daerah penyelesaiannya",
        ],
      },
    ],
    contoh: {
      soal: "Tentukan dan gambarkan daerah penyelesaian dari 2x + 3y ≤ 12. Ingat yang diarsir adalah daerah penyelesaian.",
      stages: [
        {
          label: "Langkah 1: garis pembatas",
          explain:
            "Ubah tandanya menjadi sama dengan, cari kedua titik potongnya seperti sub-bab sebelumnya, lalu gambar garisnya.",
          steps:
            "2x + 3y = 12\n" +
            "> Kita ubah y = 0, maka:\n2x + 3(0) = 12\n2x = 12\nx = 6\n" +
            "> Kita ubah x = 0, maka:\n2(0) + 3y = 12\n3y = 12\ny = 4\n" +
            "> Garis melalui (6, 0) dan (0, 4), digambar penuh karena tandanya ≤.",
        },
        {
          label: "Langkah 2: uji titik",
          explain:
            "Ambil titik (0, 0) karena garis tidak melewatinya dan perhitungannya paling mudah.",
          steps: "2x + 3y ≤ 12\n> Substitusikan titik uji (0, 0):\n2(0) + 3(0) ≤ 12\n0 ≤ 12   → BENAR",
        },
        {
          label: "Langkah 3: tentukan daerah yang diarsir",
          explain:
            "Hasil uji bernilai benar, sehingga titik (0, 0) berada di dalam daerah penyelesaian. Karena yang kita arsir adalah daerah penyelesaian, maka sisi garis yang memuat titik (0, 0) itulah yang diberi warna. Hasil akhirnya tampak seperti gambar berikut.",
          figure: {
            xRange: [-1, 8], yRange: [-1, 6],
            lines: [{ a: 2, b: 3, c: 12, sign: "<=" }],
            shadeIndices: [0],
            points: [
              { p: { x: 6, y: 0 }, label: "(6, 0)", hollow: true },
              { p: { x: 0, y: 4 }, label: "(0, 4)", hollow: true },
            ],
            caption: "Daerah penyelesaian 2x + 3y ≤ 12 ditandai dengan warna",
          },
        },
      ],
      jawaban:
        "Arsir daerah sisi garis yang memuat (0, 0), yaitu bawah kiri garis penuh 2x + 3y = 12",
    },
    simulation: "region",
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title: "Pengenalan SPtLDV",
    levelRef: "Level 5",
    focus: "Kendala bersamaan, irisan, cek titik sistem",
    videoId: "nZqBMyDW1s0",
    materi: [
      {
        title: "Dari satu kendala menjadi banyak kendala",
        body:
          "Di dunia nyata jarang ada hanya satu batasan. Pengrajin dibatasi bahan baku, sekaligus jam kerja, sekaligus ruang penyimpanan. Ketiga batasan itu berlaku bersamaan, tidak boleh dipilih salah satu. Kumpulan dua PtLDV atau lebih yang harus dipenuhi secara bersamaan disebut Sistem Pertidaksamaan Linear Dua Variabel, disingkat SPtLDV.",
      },
      {
        title: "Membandingkan PtLDV dengan SPtLDV",
        body:
          "Agar tidak tertukar antara satu pertidaksamaan dan sebuah sistem, bandingkan ciri keduanya pada tabel berikut.",
        table: {
          header: ["Aspek", "PtLDV", "SPtLDV"],
          rows: [
            ["Jumlah pertidaksamaan", "Satu", "Dua atau lebih"],
            ["Daerah yang membentuk jawaban", "Satu daerah setengah bidang", "Irisan semua daerah, disebut DHP"],
            ["Syarat titik menjadi jawaban", "Memenuhi pertidaksamaan itu", "Memenuhi semua pertidaksamaan"],
            ["Contoh", "x + y ≤ 10", "x + y ≤ 10 dan 2x + y ≤ 14 dan x ≥ 0 dan y ≥ 0"],
          ],
        },
      },
      {
        title: "Peran x ≥ 0 dan y ≥ 0 pada konteks nyata",
        body:
          "Dalam soal cerita, x dan y biasanya menghitung banyaknya benda: kursi, roti, kemasan, dan sebagainya. Banyak benda tidak mungkin negatif, sehingga otomatis berlaku x ≥ 0 dan y ≥ 0. Dua kendala ini sering tidak tertulis di soal, tetapi harus kamu tambahkan sendiri saat memodelkan.",
      },
      {
        title: "Penyelesaian sistem adalah irisan",
        body:
          "Setiap kendala menghasilkan daerah penyelesaian tersendiri. Karena seluruh kendala harus dipenuhi bersamaan, jawaban sistem adalah bagian yang menjadi anggota SEMUA daerah itu sekaligus, dalam bahasa himpunan disebut IRISAN. Daerah hasil irisan inilah yang disebut Daerah Himpunan Penyelesaian atau DHP.",
        tip:
          "Irisan berbeda dengan gabungan. Kalau gabungan cukup memenuhi salah satu, sedangkan untuk sistem wajib memenuhi semuanya.",
      },
    ],
    contoh: {
      soal:
        "Perhatikan kumpulan pertidaksamaan berikut.\nx + y ≤ 10\n2x + y ≤ 14\nx ≥ 0\ny ≥ 0\nA. Apakah kumpulan ini termasuk SPtLDV?\nB. Ada berapa kendala di dalamnya dan apa makna dua kendala terakhir?",
      stages: [
        {
          label: "Memeriksa syarat SPtLDV",
          explain:
            "SPtLDV adalah dua PtLDV atau lebih yang berlaku bersamaan. Periksa dahulu apakah setiap barisnya merupakan PtLDV, yaitu linear, memuat variabel yang sama, dan memakai tanda ketidaksamaan.",
          steps:
            "> Baris 1: x + y ≤ 10 → linear, dua variabel, bertanda ≤\n" +
            "> Baris 2: 2x + y ≤ 14 → linear, dua variabel, bertanda ≤\n" +
            "> Baris 3 dan 4: x ≥ 0 dan y ≥ 0 → kendala non negatif\n" +
            "> Semuanya pertidaksamaan linear yang berlaku bersamaan.",
        },
        {
          label: "Menyimpulkan jawaban A",
          explain:
            "Karena memuat lebih dari satu pertidaksamaan linear yang harus dipenuhi secara bersamaan, kumpulan ini memang sebuah SPtLDV.",
          steps: "> Kesimpulan: ya, kumpulan tersebut adalah SPtLDV.",
        },
        {
          label: "Menghitung banyak kendala",
          explain:
            "Hitung seluruh barisnya, termasuk kendala non negatif. Jangan lupa x ≥ 0 dan y ≥ 0 juga dihitung sebagai kendala.",
          steps: "> Banyak kendala seluruhnya: 4",
        },
        {
          label: "Memahami makna dua kendala terakhir",
          explain:
            "Kendala x ≥ 0 dan y ≥ 0 disebut kendala non negatif. Maknanya nilai x dan y tidak boleh negatif. Dalam soal nyata, kendala ini muncul karena x dan y biasanya menghitung banyaknya benda, dan banyak benda tidak mungkin kurang dari nol.",
        },
        {
          label: "Memahami arti penyelesaian sistem",
          explain:
            "Penyelesaian sistem bukan hanya memenuhi satu baris saja, melainkan harus memenuhi keempat kendala sekaligus. Daerah yang memenuhi semuanya disebut DHP, yaitu irisan dari seluruh daerah penyelesaian.",
        },
      ],
      jawaban:
        "Ya, kumpulan itu adalah SPtLDV dengan 4 kendala. Dua kendala terakhir adalah kendala non negatif yang menyatakan nilai x dan y tidak boleh negatif",
    },
    simulation: null,
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: "Menggambar SPtLDV dan DHP",
    levelRef: "Level 6",
    focus: "Banyak garis satu bidang, arsiran DHP",
    videoId: "An-olzAWm5E",
    materi: [
      {
        title: "Menggambar banyak garis pada satu bidang",
        body:
          "Prinsipnya tidak berubah, hanya sekarang dikerjakan berulang untuk setiap kendala pada bidang koordinat yang sama. Kerjakan satu kendala sampai tuntas dahulu, baru pindah ke kendala berikutnya agar tidak tertukar.",
        list: [
          "Kerjakan kendala pertama: cari titik potongnya, gambar garisnya, tentukan daerah penyelesaiannya",
          "Kerjakan kendala kedua dengan cara sama pada bidang yang sama",
          "Ulangi untuk kendala lain termasuk x ≥ 0 dan y ≥ 0",
          "Terakhir, temukan daerah yang bersih yang memenuhi semua kendala sekaligus sebagai DHP",
        ],
      },
      {
        title: "Cara mengarsir DHP sebagai irisan",
        body:
          "Tekniknya terlihat paling jelas seperti ini. Gambar arsiran daerah penyelesaian tiap kendala dengan warna tipis. Bagian yang ketumpuk oleh semua warna itulah IRISANnya. Irisan tersebut kita tebalkan warnanya menjadi daerah ungu yang satu itu, dan itulah DHP.",
        list: [
          "Arsir tipis daerah penyelesaian kendala pertama",
          "Arsir tipis daerah penyelesaian kendala kedua",
          "Bagian yang ketumpuk kedua arsiran, juga dibatasi kedua sumbu, adalah DHP",
          "Perjelas DHP dengan warna ungu yang lebih pekat",
        ],
        figure: {
          xRange: [-1, 10], yRange: [-1, 8],
          lines: [
            { a: 1, b: 1, c: 6, sign: "<=" },
            { a: 1, b: 2, c: 8, sign: "<=" },
          ],
          dhpIneqs: [
            { a: 1, b: 1, c: 6, sign: "<=" },
            { a: 1, b: 2, c: 8, sign: "<=" },
            { a: 1, b: 0, c: 0, sign: ">=" },
            { a: 0, b: 1, c: 0, sign: ">=" },
          ],
          caption: "Daerah ungu adalah DHP, yaitu irisan dari semua daerah penyelesaian",
        },
      },
      {
        title: "Kendala non negatif juga punya garis pembatas",
        body:
          "Jangan lupa x ≥ 0 dan y ≥ 0 adalah pertidaksamaan yang juga punya garis pembatas. Garis x = 0 adalah sumbu Y, dengan daerah yang diarsir di kanannya. Garis y = 0 adalah sumbu X, dengan daerah yang diarsir di atasnya. Karena arsiran adalah daerah penyelesaian, maka arsiran di kiri sumbu Y secara otomatis BUKAN bagian DHP.",
      },
      {
        title: "DHP terbatas dan DHP tidak terbatas",
        body:
          "Bentuk DHP ditentukan arah tanda kendala. Bila kendalanya bertanda ≤ ditambah kendala non negatif, DHP biasanya berupa bangun tertutup seperti segitiga atau segi empat, ini disebut DHP terbatas. Bila ada kendala ≥ yang dominan, daerahnya bisa membentang tanpa ujung, disebut DHP tidak terbatas.",
        tip:
          "Untuk nilai maksimum nanti, DHP terbatas selalu aman. Pada DHP tidak terbatas, nilai maksimum bisa saja tidak ada.",
      },
      {
        title: "Menyediakan ruang gambar yang cukup",
        body:
          "Sebelum menggambar, perhatikan dahulu semua titik potong yang akan muncul. Pastikan skala sumbumu cukup lebar agar semua titik muat dan tidak bertumpuk. Jarak antar angka pada sumbu harus konsisten, kalau tidak konsisten garis akan terlihat miring dan titik potong menjadi salah.",
      },
    ],
    contoh: {
      soal: "Gambarlah DHP dari sistem x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      stages: [
        {
          label: "Langkah 1: kendala pertama",
          explain: "Kerjakan x + y ≤ 6 sampai lengkap: garisnya dan daerah penyelesaiannya.",
          steps:
            "x + y = 6\n" +
            "> y = 0 memberi x = 6. x = 0 memberi y = 6.\n" +
            "> Garis penuh melalui (6, 0) dan (0, 6).\n" +
            "> Uji (0, 0) pada pertidaksamaannya: 0 ≤ 6 BENAR, maka arsir sisi bawah garis.",
        },
        {
          label: "Langkah 2: kendala kedua",
          explain: "Kerjakan x + 2y ≤ 8 dengan cara yang sama persis.",
          steps:
            "x + 2y = 8\n" +
            "> y = 0 memberi x = 8. x = 0 memberi y = 4, karena 2y = 8 dan y = 8/2.\n" +
            "> Garis penuh melalui (8, 0) dan (0, 4).\n" +
            "> Uji (0, 0): 0 ≤ 8 BENAR, maka arsir juga sisi bawah garis ini.",
        },
        {
          label: "Langkah 3: tambahkan kendala non negatif",
          explain:
            "Kendala x ≥ 0 dan y ≥ 0 mengurung semuanya di bagian kanan atas bidang, maka bagian arsiran di kiri sumbu Y dan di bawah sumbu X tidak ikut menjadi jawaban.",
        },
        {
          label: "Langkah 4: temukan DHP",
          explain:
            "DHP adalah daerah yang terkena semua arsiran sekaligus, yaitu daerah di bagian kanan atas yang berada di bawah kedua garis. Bila diteliti, sudut sudutnya berada di (0, 0), (6, 0), (4, 2), dan (0, 4).",
          figure: {
            xRange: [-1, 10], yRange: [-1, 8],
            lines: [
              { a: 1, b: 1, c: 6, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
            ],
            dhpIneqs: [
              { a: 1, b: 1, c: 6, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
              { a: 1, b: 0, c: 0, sign: ">=" },
              { a: 0, b: 1, c: 0, sign: ">=" },
            ],
            points: [
              { p: { x: 0, y: 0 }, label: "(0, 0)", color: "#7C3AED" },
              { p: { x: 6, y: 0 }, label: "(6, 0)", color: "#7C3AED" },
              { p: { x: 4, y: 2 }, label: "(4, 2)", color: "#7C3AED" },
              { p: { x: 0, y: 4 }, label: "(0, 4)", color: "#7C3AED" },
            ],
            caption: "DHP berwarna ungu dengan keempat titik pojoknya",
          },
        },
      ],
      jawaban: "DHP berupa segi empat di bagian kanan atas bidang dengan sudut (0, 0), (6, 0), (4, 2), dan (0, 4)",
    },
    simulation: "system",
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: "Titik Pojok dari DHP",
    levelRef: "Level 7",
    focus: "Tiga jenis titik pojok, cek keanggotaan di DHP",
    videoId: "yGhEM3RTyqA",
    materi: [
      {
        title: "Apa itu titik pojok",
        body:
          "Titik pojok, disebut juga titik sudut atau titik ekstrem, adalah titik titik yang menjadi sudut dari daerah himpunan penyelesaian. Setiap titik pojok lahir dari perpotongan dua garis pembatas, dan syaratnya titik itu harus masih berada di dalam DHP.",
      },
      {
        title: "Tiga jenis sumber titik pojok",
        body:
          "Saat menelusuri tepi DHP satu putaran, semua titik pojok hanya bisa berasal dari tiga sumber berikut. Periksa ketiganya supaya tidak ada yang terlewat.",
        list: [
          "Perpotongan sumbu X dengan sumbu Y, yaitu titik asal (0, 0)",
          "Perpotongan satu garis kendala dengan salah satu sumbu",
          "Perpotongan dua garis kendala satu dengan yang lain",
        ],
        figure: {
          xRange: [-1, 10], yRange: [-1, 8],
          lines: [
            { a: 1, b: 1, c: 6, sign: "<=" },
            { a: 1, b: 2, c: 8, sign: "<=" },
          ],
          dhpIneqs: [
            { a: 1, b: 1, c: 6, sign: "<=" },
            { a: 1, b: 2, c: 8, sign: "<=" },
            { a: 1, b: 0, c: 0, sign: ">=" },
            { a: 0, b: 1, c: 0, sign: ">=" },
          ],
          points: [
            { p: { x: 0, y: 0 }, label: "(0, 0) dua sumbu", color: "#7C3AED" },
            { p: { x: 6, y: 0 }, label: "(6, 0) garis & sumbu", color: "#7C3AED" },
            { p: { x: 4, y: 2 }, label: "(4, 2) dua garis", color: "#7C3AED" },
            { p: { x: 0, y: 4 }, label: "(0, 4) garis & sumbu", color: "#7C3AED" },
          ],
          caption: "Setiap sudut DHP berasal dari salah satu dari tiga jenis perpotongan",
        },
      },
      {
        title: "Cara memeriksa titik benar benar ada di DHP",
        body:
          "Sebelum menuliskan sebuah titik sebagai titik pojok, pastikan dulu titik itu memenuhi SELURUH kendala. Caranya substitusikan koordinatnya ke setiap pertidaksamaan. Bila semuanya benar, titik itu sah menjadi titik pojok. Bila ada satu kendala yang gagal, titik itu dibuang.",
        steps:
          "> Misalkan dua garis berpotongan di (7, 2), misalkan kendala lain x + y ≤ 6.\n" +
          "> Periksa titik itu:\n" +
          "7 + 2 ≤ 6\n9 ≤ 6   → SALAH\n" +
          "> Karena melanggar kendala, (7, 2) berada di luar DHP\n" +
          "> sehingga meskipun perpotongan garis, ia BUKAN titik pojok.",
      },
      {
        title: "Mengapa titik pojok sangat penting",
        body:
          "Ada teorema penting dalam program linear: pada DHP terbatas, nilai maksimum maupun minimum fungsi tujuan PASTI tercapai di salah satu titik pojok, tidak pernah di tengah daerah. Artinya kita hanya perlu memeriksa beberapa titik sudut, bukan semua titik yang jumlahnya tak terhingga.",
      },
      {
        title: "Membaca banyaknya titik pojok dari gambar",
        body:
          "Cara termudah ialah menelusuri tepi DHP satu putaran, mulai dari titik asal searah putaran jam. Setiap kali arah tepi berbelok, di situ ada titik pojok. Catat koordinatnya satu per satu agar tidak ada yang terhitung dua kali.",
        list: [
          "DHP berbentuk segitiga memiliki 3 titik pojok",
          "DHP berbentuk segi empat memiliki 4 titik pojok",
        ],
      },
    ],
    contoh: {
      soal: "Tentukan semua titik pojok DHP dari sistem x + y ≤ 6, x + 2y ≤ 8, x ≥ 0, y ≥ 0.",
      stages: [
        {
          label: "Langkah 1: titik pojok dari kedua sumbu",
          explain: "Perpotongan sumbu X dan sumbu Y menghasilkan titik asal. Periksa apakah memenuhi semua kendala.",
          steps: "> Periksa (0, 0):\n0 + 0 ≤ 6   → BENAR\n0 + 2(0) ≤ 8   → BENAR\n> Titik (0, 0) memenuhi, jadi ia titik pojok.",
        },
        {
          label: "Langkah 2: titik pojok pada sumbu X",
          explain:
            "Kedua garis memotong sumbu X di (6, 0) dan (8, 0). Yang sah menjadi titik pojok hanyalah yang memenuhi kendala lainnya.",
          steps:
            "> Periksa (6, 0) pada kendala x + 2y ≤ 8:\n6 + 2(0) ≤ 8\n6 ≤ 8   → BENAR, jadi titik pojok.\n" +
            "> Periksa (8, 0) pada kendala x + y ≤ 6:\n8 + 0 ≤ 6\n8 ≤ 6   → SALAH, jadi bukan titik pojok.",
        },
        {
          label: "Langkah 3: titik pojok pada sumbu Y",
          explain: "Periksa dengan cara sama untuk kandidat (0, 6) dan (0, 4).",
          steps:
            "> Periksa (0, 6) pada kendala x + 2y ≤ 8:\n0 + 2(6) ≤ 8\n12 ≤ 8   → SALAH, bukan titik pojok.\n" +
            "> Periksa (0, 4) pada kendala x + y ≤ 6:\n0 + 4 ≤ 6\n4 ≤ 6   → BENAR, jadi titik pojok.",
        },
        {
          label: "Langkah 4: perpotongan dua garis (metode campuran)",
          explain:
            "Titik pojok terakhir lahir dari perpotongan kedua garis kendala. Hitunglah dengan metode campuran: eliminasi dahulu, lalu substitusi.",
          steps:
            "> Persamaan garis pembatas:\nx + y = 6   …(1)\nx + 2y = 8   …(2)\n" +
            "> LANGKAH 1, eliminasi x:\n" +
            "> Koefisien x sama, maka kurangkan (2) dikurangi (1):\n" +
            "y = 2\n" +
            "> LANGKAH 2, substitusi y = 2 ke persamaan (1):\n" +
            "x + 2 = 6\nx = 4\n" +
            "> Diperoleh titik pojok (4, 2).",
        },
        {
          label: "Langkah 5: tuliskan semuanya",
          explain: "Kumpulkan titik yang lolos pemeriksaan. Urutkan mengikuti tepi DHP agar rapi dan mudah dicek ulang.",
          steps: "> Titik pojok DHP:\n(0, 0)\n(6, 0)\n(4, 2)\n(0, 4)",
          figure: {
            xRange: [-1, 10], yRange: [-1, 8],
            lines: [
              { a: 1, b: 1, c: 6, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
            ],
          dhpIneqs: [
            { a: 1, b: 1, c: 6, sign: "<=" },
            { a: 1, b: 2, c: 8, sign: "<=" },
            { a: 1, b: 0, c: 0, sign: ">=" },
            { a: 0, b: 1, c: 0, sign: ">=" },
          ],
            points: [
              { p: { x: 0, y: 0 }, label: "(0, 0)", color: "#7C3AED" },
              { p: { x: 6, y: 0 }, label: "(6, 0)", color: "#7C3AED" },
              { p: { x: 4, y: 2 }, label: "(4, 2)", color: "#7C3AED" },
              { p: { x: 0, y: 4 }, label: "(0, 4)", color: "#7C3AED" },
            ],
            caption: "Keempat titik pojok DHP",
          },
        },
      ],
      jawaban: "Titik pojoknya adalah (0, 0), (6, 0), (4, 2), dan (0, 4)",
    },
    simulation: "corner",
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 8,
    title: "Menggambar DHP Secara Lengkap",
    levelRef: "Level 8",
    focus: "Titik potong antar garis, DHP terbatas, cek titik di DHP",
    videoId: null,
    videoNote:
      "Untuk sub-bab ini tidak ada video khusus. Topiknya sudah tercakup dalam video Sub-Bab 7 di bawah ini.",
    materi: [
      {
        title: "Kapan metode campuran dibutuhkan",
        body:
          "Titik pojok yang berada pada sumbu mudah dibaca dari gambar. Namun titik pojok yang lahir dari perpotongan DUA garis kendala sering jatuh di tengah dan tidak tepat pada grid. Membaca dari gambar jadi tidak akurat. Solusinya, hitung lewat persamaan dengan metode campuran: eliminasi dahulu, lalu substitusi.",
      },
      {
        title: "Mencatat semua titik potong dalam tabel",
        body:
          "Sebelum menghitung perpotongan antar garis, rapihkan dulu semua titik potong dalam tabel seperti contoh berikut. Dengan cara ini tidak ada titik yang terlewat dan kamu tahu persis apa yang perlu dicari lebih lanjut.",
        table: {
          header: ["Garis / Sumbu", "Titik potong sumbu X", "Titik potong sumbu Y"],
          rows: [
            ["x + y = 6", "(6, 0)", "(0, 6)"],
            ["x + 2y = 8", "(8, 0)", "(0, 4)"],
          ],
        },
      },
      {
        title: "Tahap eliminasi",
        body:
          "Tujuan eliminasi adalah menghilangkan salah satu variabel sehingga tersisa persamaan satu variabel. Urutannya seperti ini:",
        list: [
          "Pilih variabel yang paling mudah disamakan koefisiennya",
          "Samakan koefisiennya dengan mengalikan persamaan bila perlu",
          "Bila koefisiennya bertanda sama, kurangkan kedua persamaan",
          "Bila berlawanan tanda, jumlahkan kedua persamaan",
          "Selesaikan persamaan satu variabel yang tersisa",
        ],
      },
      {
        title: "Tahap substitusi dan contoh lengkap",
        body:
          "Nilai yang ditemukan dari eliminasi kemudian dimasukkan kembali ke salah satu persamaan semula untuk memperoleh variabel lainnya. Pilih persamaan yang angkanya paling sederhana agar perhitungan ringan. Perhatikan contoh utuhnya.",
        steps:
          "> Persamaan garis pembatas:\n" +
          "2x + y = 10   …(1)\n" +
          "x + 3y = 15   …(2)\n" +
          "> LANGKAH 1, eliminasi x:\n" +
          "> Kalikan persamaan (2) dengan 2.\n" +
          "2x + y = 10\n" +
          "2x + 6y = 30\n" +
          "> Tanda keduanya sama, maka kurangkan (2) dikurangi (1):\n" +
          "5y = 20\n" +
          "y = frac(20,5)\n" +
          "y = 4\n" +
          "> LANGKAH 2, substitusi y = 4 ke persamaan (1):\n" +
          "2x + 4 = 10\n" +
          "2x = 6\n" +
          "x = frac(6,2)\n" +
          "x = 3\n" +
          "> Jadi titik potong kedua garis adalah (3, 4).",
      },
      {
        title: "Ciri DHP terbatas dan tidak terbatas",
        body:
          "Setelah semua garis digambar dengan lengkap, perhatikan bentuk daerah yang menjadi jawaban. Kenali perbedaan dua jenis DHP berikut karena berpengaruh pada tahap optimum nanti.",
        list: [
          "DHP terbatas berupa bangun tertutup (segitiga, segi empat, dst.) dan seluruhnya terkurung, biasanya dari kendala ≤ dan non negatif",
          "DHP tidak terbatas memanjang tanpa ujung ke satu arah, biasanya ada kendala ≥ yang dominan",
          "Nilai maksimum aman ada pada DHP terbatas; pada yang tidak terbatas maksimum bisa saja tidak ada",
        ],
      },
      {
        title: "Memastikan titik benar berada di DHP",
        body:
          "Terakhir selalu uji. Titik potong garis yang sudah dihitung akan dianggap titik pojok hanya bila memenuhi SELURUH kendala sistem. Substitusikan ke setiap pertidaksamaan, dan bila satu saja gagal, buang titik itu.",
        steps:
          "> Periksa (3, 4) pada sistem 2x + y ≤ 10 dan x + 3y ≤ 15:\n" +
          "2(3) + 4 ≤ 10\n10 ≤ 10   → BENAR\n" +
          "3 + 3(4) ≤ 15\n15 ≤ 15   → BENAR\n" +
          "> Karena semua kendala terpenuhi, (3, 4) SAH menjadi titik pojok DHP.",
        figure: {
          xRange: [-1, 16], yRange: [-1, 11],
          lines: [
            { a: 2, b: 1, c: 10, sign: "<=" },
            { a: 1, b: 3, c: 15, sign: "<=" },
          ],
          dhpIneqs: [
            { a: 2, b: 1, c: 10, sign: "<=" },
            { a: 1, b: 3, c: 15, sign: "<=" },
            { a: 1, b: 0, c: 0, sign: ">=" },
            { a: 0, b: 1, c: 0, sign: ">=" },
          ],
          points: [{ p: { x: 3, y: 4 }, label: "(3, 4)", color: "#7C3AED" }],
          caption: "Titik (3, 4) tepat berada di sudut DHP, jadi sah sebagai titik pojok",
        },
      },
    ],
    contoh: {
      soal: "Tentukan titik potong garis 3x + 2y = 16 dan x + 2y = 8 dengan metode campuran.",
      stages: [
        {
          label: "Langkah 1: amati koefisien",
          explain:
            "Koefisien y pada kedua persamaan sama sama 2. Karena sudah sama, eliminasi y bisa langsung dikerjakan tanpa mengalikan apa pun.",
          steps: "3x + 2y = 16   …(1)\nx + 2y = 8   …(2)",
        },
        {
          label: "Langkah 2: eliminasi y",
          explain:
            "Koefisien y bertanda sama, sehingga kita KURANGKAN persamaan (1) dengan persamaan (2). Suku y saling menghapus.",
          steps:
            "> LANGKAH 1, eliminasi y:\n" +
            "3x + 2y = 16\nx + 2y = 8\n" +
            "> Kurangkan (1) dikurangi (2):\n" +
            "2x = 8\nx = frac(8,2)\nx = 4",
        },
        {
          label: "Langkah 3: substitusi",
          explain: "Substitusikan x = 4 ke persamaan (2) karena angkanya paling sederhana.",
          steps:
            "> LANGKAH 2, substitusi x = 4 ke persamaan (2):\n" +
            "4 + 2y = 8\n2y = 4\ny = frac(4,2)\ny = 2",
        },
        {
          label: "Langkah 4: periksa kembali",
          explain: "Substitusikan titik (4, 2) ke persamaan (1) untuk memastikan perhitungan kita benar. Pada gambar, titik itu memang tepat berada di perpotongan kedua garis.",
          steps: "3(4) + 2(2) = 16\n12 + 4 = 16\n16 = 16   → cocok",
          figure: {
            xRange: [-1, 10], yRange: [-1, 9],
            lines: [
              { a: 3, b: 2, c: 16, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
            ],
            points: [{ p: { x: 4, y: 2 }, label: "(4, 2)", color: "#7C3AED" }],
            caption: "Perpotongan garis 3x + 2y = 16 dan x + 2y = 8",
          },
        },
      ],
      jawaban: "Titik potong kedua garis adalah (4, 2)",
    },
    simulation: null,
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 9,
    title: "Fungsi Tujuan dan Nilai Optimum",
    levelRef: "Level 9",
    focus: "Evaluasi di titik pojok, kapan optimum ada",
    videoId: "b07sImM1z0A",
    materi: [
      {
        title: "Apa itu fungsi tujuan",
        body:
          "Fungsi tujuan adalah bentuk aljabar yang ingin kita besarkan atau kecilkan, biasanya ditulis f(x, y) = ax + by. Dalam konteks nyata, fungsi tujuan adalah hal yang ingin dicapai paling besar (misalnya keuntungan) atau paling kecil (misalnya biaya produksi).",
        list: [
          "Kata keuntungan, pendapatan, hasil penjualan artinya cari nilai MAKSIMUM",
          "Kata biaya, pengeluaran, ongkos artinya cari nilai MINIMUM",
        ],
      },
      {
        title: "Menghitung nilai fungsi di satu titik",
        body:
          "Menilai fungsi tujuan pada sebuah titik berarti mensubstitusikan koordinatnya. Kerjakan perkalian lebih dulu, baru penjumlahan.",
        steps:
          "> Diketahui f(x, y) = 5x + 3y. Hitung nilai di titik (4, 2).\n" +
          "f(4, 2) = 5(4) + 3(2)\nf(4, 2) = 20 + 6\nf(4, 2) = 26",
      },
      {
        title: "Mengapa cukup memeriksa titik pojok saja",
        body:
          "Di dalam DHP terdapat titik yang jumlahnya tak terhingga, sehingga mustahil dihitung satu per satu. Untungnya ada sifat penting yang berlaku pada DHP terbatas: nilai terbesar maupun terkecil fungsi tujuan selalu jatuh tepat di salah satu sudut DHP, tidak pernah di tengah daerah. Sebabnya nilai fungsi berubah dengan laju tetap ke satu arah, sehingga nilai paling ujung pasti ditemukan di titik paling pojok. Berkat sifat ini, kita cukup memeriksa beberapa titik sudut saja.",
      },
      {
        title: "Kapan nilai optimum ada dan kapan tidak",
        body:
          "Bentuk DHP menentukan apakah nilai optimum dijamin ada. Pada DHP terbatas, nilai maksimum maupun minimum selalu ada. Namun bila DHP-nya tidak terbatas dan fungsi tujuan bertambah tanpa batas ke arah daerah terbuka, nilai maksimum bisa saja tidak ada. Inilah mengapa langkah sebelumnya penting untuk mengenali jenis DHP.",
      },
      {
        title: "Format tabel evaluasi yang seragam",
        body:
          "Menyusun nilai dalam tabel yang sama setiap waktu membuat pekerjaan rapi dan bebas dari titik yang terlewat. Selalu pakai format yang sama di bawah ini, titik pojok di kolom pertama, bentuk substitusi di kolom kedua, hasilnya di kolom ketiga.",
        table: {
          header: ["Titik pojok", "f(x, y) = 5x + 3y", "Nilai"],
          rows: [
            ["(0, 0)", "5(0) + 3(0)", "0"],
            ["(6, 0)", "5(6) + 3(0)", "30"],
            ["(4, 2)", "5(4) + 3(2)", "26"],
            ["(0, 4)", "5(0) + 3(4)", "12"],
          ],
        },
      },
      {
        title: "Alur lengkap mencari nilai optimum",
        body:
          "Seluruh proses dari kendala sampai jawaban optimum diringkas dalam lima langkah berikut.",
        list: [
          "Gambar DHP dari seluruh kendala",
          "Tentukan semua titik pojoknya, pakai metode campuran bila perlu",
          "Hitung nilai fungsi tujuan di setiap titik pojok",
          "Susun dalam tabel evaluasi yang sama",
          "Nilai terbesar adalah maksimum dan nilai terkecil adalah minimum",
        ],
      },
    ],
    contoh: {
      soal:
        "DHP suatu sistem memiliki titik pojok (0, 0), (6, 0), (4, 2), dan (0, 4). Tentukan nilai maksimum dan minimum dari f(x, y) = 5x + 3y.",
      stages: [
        {
          label: "Langkah 1: baca titik pojok dari grafik",
          explain:
            "Sebelum menghitung, pastikan dahulu titik pojoknya. Telusuri tepi daerah ungu pada gambar berikut satu putaran. Setiap kali tepinya berbelok, di situ ada titik pojok. Terbaca empat sudut, yaitu (0, 0), (6, 0), (4, 2), dan (0, 4).",
          figure: {
            xRange: [-1, 10], yRange: [-1, 8],
            lines: [
              { a: 1, b: 1, c: 6, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
            ],
            dhpIneqs: [
              { a: 1, b: 1, c: 6, sign: "<=" },
              { a: 1, b: 2, c: 8, sign: "<=" },
              { a: 1, b: 0, c: 0, sign: ">=" },
              { a: 0, b: 1, c: 0, sign: ">=" },
            ],
            points: [
              { p: { x: 0, y: 0 }, label: "(0, 0)", color: "#7C3AED" },
              { p: { x: 6, y: 0 }, label: "(6, 0)", color: "#7C3AED" },
              { p: { x: 4, y: 2 }, label: "(4, 2)", color: "#7C3AED" },
              { p: { x: 0, y: 4 }, label: "(0, 4)", color: "#7C3AED" },
            ],
            caption: "Membaca keempat titik pojok langsung dari gambar DHP",
          },
        },
        {
          label: "Langkah 2: dua titik pertama",
          explain: "Substitusikan koordinat masing masing titik ke f(x, y) = 5x + 3y.",
          steps:
            "f(0, 0) = 5(0) + 3(0)\nf(0, 0) = 0\n" +
            "f(6, 0) = 5(6) + 3(0)\nf(6, 0) = 30 + 0\nf(6, 0) = 30",
        },
        {
          label: "Langkah 3: dua titik berikutnya",
          explain: "Lanjutkan dengan dua titik pojok yang tersisa.",
          steps:
            "f(4, 2) = 5(4) + 3(2)\nf(4, 2) = 20 + 6\nf(4, 2) = 26\n" +
            "f(0, 4) = 5(0) + 3(4)\nf(0, 4) = 0 + 12\nf(0, 4) = 12",
        },
        {
          label: "Langkah 4: susun tabel dan bandingkan",
          explain:
            "Susun semua hasil dalam satu tabel seperti format baku, lalu pilih yang terbesar dan yang terkecil.",
          steps:
            "> Tabel evaluasi (Titik pojok, f(x,y), Nilai):\n" +
            "(0, 0):   0\n(6, 0):   30\n(4, 2):   26\n(0, 4):   12\n" +
            "> Nilai terbesar 30 tercapai di (6, 0), terkecil 0 di (0, 0).",
        },
      ],
      jawaban: "Nilai maksimum 30 di titik (6, 0) dan nilai minimum 0 di titik (0, 0)",
    },
    simulation: null,
  },

  // ════════════════════════════════════════════════════════════════════════
  {
    id: 10,
    title: "Pemodelan Soal Cerita",
    levelRef: "Integrasi",
    focus: "Variabel, tabel bantu, kendala, fungsi tujuan",
    videoId: "nZqBMyDW1s0",
    materi: [
      {
        title: "Cara membaca soal cerita",
        body:
          "Baca soal dua kali. Pada bacaan pertama, cari dua objek yang banyaknya bisa diatur, itulah calon variabel. Pada bacaan kedua, cari semua batasan sumber daya (bahan, waktu, uang, tempat), cari juga hal yang ingin dibesarkan atau dikecilkan. Frasa kunci tertentu menentukan tandanya.",
        table: {
          header: ["Frasa kata kunci", "Hubungan"],
          rows: [
            ["tidak lebih dari, paling banyak, maksimal", "≤"],
            ["tidak kurang dari, paling sedikit, minimal", "≥"],
            ["kurang dari, di bawah", "<"],
            ["lebih dari, melebihi, di atas", ">"],
            ["keuntungan, pendapatan", "maksimum"],
            ["biaya, pengeluaran", "minimum"],
          ],
        },
      },
      {
        title: "Memisalkan variabel dengan benar",
        body:
          "Variabel harus menyatakan BANYAKNYA benda yang jumlahnya dapat kita atur, bukan harga, bukan keuntungan, dan bukan total. Tulis pemisalan secara eksplisit lengkap dengan satuannya agar setiap langkah berikutnya tidak keliru.",
        steps:
          "> Contoh pemisalan yang benar:\n" +
          "> x = banyak kursi yang diproduksi (buah)\n" +
          "> y = banyak meja yang diproduksi (buah)\n" +
          "> Contoh yang salah: x = keuntungan kursi. Keuntungan adalah bagian fungsi tujuan,\n" +
          "> bukan sesuatu yang jumlahnya diatur.",
      },
      {
        title: "Menyusun kendala dengan tabel bantu",
        body:
          "Cara paling aman menyusun kendala adalah membuat tabel bantu terlebih dulu. Baris adalah sumber daya, kolom adalah kebutuhan tiap objek, dan kolom terakhir adalah batas ketersediaannya. Setiap baris tabel langsung menjadi satu pertidaksamaan.",
        table: {
          header: ["Sumber daya", "Per kursi (x)", "Per meja (y)", "Tersedia"],
          rows: [
            ["Jam kerja (jam)", "2", "3", "18"],
            ["Tempat gudang (peti)", "1", "2", "12"],
          ],
        },
        steps:
          "> Baris jam kerja menjadi kendala waktu:\n2x + 3y ≤ 18\n" +
          "> Baris gudang menjadi kendala tempat:\nx + 2y ≤ 12\n" +
          "> Tambahkan kendala non negatif:\nx ≥ 0\ny ≥ 0",
        tip:
          "Pastikan satuan ruas kiri dan kanan sejenis. Jangan mencampur jam dengan rupiah dalam satu pertidaksamaan.",
      },
      {
        title: "Menyusun fungsi tujuan dari konteks",
        body:
          "Fungsi tujuan disusun dari nilai per unit objek dikali banyaknya objek. Perhatikan satuan yang dipakai, tulislah dalam ribuan rupiah agar angkanya ringkas, lalu tentukan apakah dimaksimumkan atau diminimumkan.",
        steps:
          "> Keuntungan tiap kursi Rp40.000, tiap meja Rp60.000.\n" +
          "> Susun fungsi tujuannya (dalam ribuan rupiah):\n" +
          "f(x, y) = 40x + 60y\n" +
          "> Karena yang dicari keuntungan sebesar besarnya, fungsi ini DIMAKSIMUMKAN.",
      },
      {
        title: "Siklus lengkap sampai jadi kalimat jawaban",
        body:
          "Rangkum semua tahapannya sekali lagi agar alurnya jelas dari mulai soal sampai jawaban konteks.",
        list: [
          "Memisalkan variabel x dan y beserta satuan",
          "Membuat tabel bantu dan menyusun semua kendala",
          "Menambahkan kendala non negatif x ≥ 0 dan y ≥ 0",
          "Menyusun fungsi tujuan dari konteks",
          "Menggambar DHP dan menentukan titik pojoknya",
          "Menilai fungsi tujuan di setiap titik pojok",
          "Mengembalikan jawaban ke kalimat konteks dengan satuan yang benar",
        ],
      },
    ],
    contoh: {
      soal:
        "Sebuah pabrik membuat kursi (x) dan meja (y). Setiap kursi butuh 2 jam kerja dan meja 3 jam, total tersedia 18 jam. Gudang menampung 12 peti, setiap kursi memakan 1 peti dan meja memakan 2 peti. Keuntungan tiap kursi Rp40.000 dan tiap meja Rp60.000. Susunlah model matematikanya.",
      stages: [
        {
          label: "Langkah 1: pemisalan",
          explain: "Yang banyaknya dapat diatur pabrik adalah banyak kursi dan banyak meja, jadikan keduanya variabel.",
          steps: "> x = banyak kursi yang diproduksi (buah)\n> y = banyak meja yang diproduksi (buah)",
        },
        {
          label: "Langkah 2: susun tabel bantu dulu",
          explain:
            "Sebelum menulis pertidaksamaan, rangkum data kebutuhan dalam tabel. Setiap barisnya akan menjadi satu kendala.",
          steps: "> Isikan setiap data dari soal ke dalam tabel bantu seperti berikut.",
          table: {
            header: ["Sumber daya", "Kursi (x)", "Meja (y)", "Tersedia"],
            rows: [
              ["Jam kerja (jam)", "2", "3", "18"],
              ["Gudang (peti)", "1", "2", "12"],
            ],
          },
        },
        {
          label: "Langkah 3: ubah baris menjadi kendala",
          explain: "Setiap baris tabel dibaca seperti kalimat lalu ditulis menjadi pertidaksamaan.",
          steps:
            "> Baris jam kerja: 2x + 3y ≤ 18\n" +
            "> Baris gudang: x + 2y ≤ 12\n" +
            "> Tambahkan kendala non negatif: x ≥ 0 dan y ≥ 0.",
        },
        {
          label: "Langkah 4: susun fungsi tujuan",
          explain: "Keuntungan per unit dikali banyaknya unit, ditulis dalam ribuan rupiah agar ringkas.",
          steps: "f(x, y) = 40x + 60y\n> Karena yang dicari keuntungan terbesar, fungsi ini dimaksimumkan.",
        },
      ],
      jawaban:
        "Maksimumkan f(x, y) = 40x + 60y dengan kendala 2x + 3y ≤ 18, x + 2y ≤ 12, x ≥ 0, dan y ≥ 0",
    },
    simulation: null,
  },
];

export function getSubbab(id: number): SubbabContent {
  return SUBBABS[Math.min(Math.max(id, 1), SUBBABS.length) - 1];
}

export const TOTAL_SUBBAB = SUBBABS.length;
