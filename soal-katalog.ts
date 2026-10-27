// ─── Katalog tipe soal per sub-bab (referensi untuk guru) ───────────────────

export interface KatalogItem {
  id: string;
  /** jenis interaksi yang dihadapi siswa */
  jenis: "Pilihan Ganda" | "Isian Singkat" | "Pilih Grafik" | "Ketuk Titik" | "Ketuk Daerah";
  judul: string;
  /** apa yang diminta dari siswa */
  tugas: string;
  /** kemampuan yang diukur */
  mengukur: string;
  /** kekeliruan yang sering muncul */
  miskonsepsi: string;
}

export interface KatalogSubbab {
  subbab: number;
  judul: string;
  items: KatalogItem[];
}

export const SOAL_KATALOG: KatalogSubbab[] = [
  {
    subbab: 1,
    judul: "Pengenalan PtLDV",
    items: [
      {
        id: "1.1", jenis: "Pilihan Ganda", judul: "Mengenali bentuk PtLDV",
        tugas: "Memilih satu bentuk yang merupakan PtLDV dari empat pilihan.",
        mengukur: "Pemahaman syarat PtLDV: dua variabel, pangkat satu, tanpa perkalian antar variabel, bertanda ketidaksamaan.",
        miskonsepsi: "Menganggap bentuk berpangkat dua, bentuk dengan xy, atau persamaan bertanda sama dengan sebagai PtLDV.",
      },
      {
        id: "1.2", jenis: "Isian Singkat", judul: "Menentukan koefisien dan konstanta",
        tugas: "Mengisi nilai koefisien x, koefisien y, dan konstanta dari sebuah pertidaksamaan.",
        mengukur: "Ketelitian membaca unsur pada bentuk umum ax + by ≤ c, termasuk tanda negatif.",
        miskonsepsi: "Menuliskan koefisien tanpa tanda minus, misalnya menulis 4 padahal sukunya −4y.",
      },
      {
        id: "1.3", jenis: "Pilihan Ganda", judul: "Menerjemahkan kalimat ke model",
        tugas: "Memilih model matematika yang sesuai dengan sebuah situasi belanja.",
        mengukur: "Kemampuan menerjemahkan frasa kunci menjadi tanda pertidaksamaan yang tepat.",
        miskonsepsi: "Memakai ≥ untuk frasa tidak lebih dari, atau menukar koefisien kedua objek.",
      },
    ],
  },
  {
    subbab: 2,
    judul: "Titik Potong pada PtLDV",
    items: [
      {
        id: "2.1", jenis: "Isian Singkat", judul: "Titik potong sumbu X",
        tugas: "Menghitung nilai x pada titik potong garis dengan sumbu X (tanpa bantuan grafik).",
        mengukur: "Penerapan substitusi y = 0 dan penyelesaian persamaan satu variabel.",
        miskonsepsi: "Menukar langkah dengan mensubstitusi x = 0, atau salah tanda saat membagi bilangan negatif.",
      },
      {
        id: "2.2", jenis: "Isian Singkat", judul: "Titik potong sumbu Y",
        tugas: "Menghitung nilai y pada titik potong garis dengan sumbu Y (tanpa bantuan grafik).",
        mengukur: "Penerapan substitusi x = 0 dan ketelitian pembagian, termasuk hasil negatif.",
        miskonsepsi: "Lupa bahwa hasil bagi bilangan positif dengan negatif bernilai negatif.",
      },
      {
        id: "2.3", jenis: "Isian Singkat", judul: "Kedua titik potong sekaligus",
        tugas: "Menghitung titik potong sumbu X dan sumbu Y dalam satu soal.",
        mengukur: "Kemampuan memisahkan dua perhitungan dan menuliskan koordinat pada posisi yang benar.",
        miskonsepsi: "Menukar kedua hasil, menulis (0, p) padahal seharusnya (p, 0).",
      },
    ],
  },
  {
    subbab: 3,
    judul: "Menggambar Garis PtLDV",
    items: [
      {
        id: "3.1", jenis: "Pilihan Ganda", judul: "Menentukan jenis garis",
        tugas: "Memilih apakah garis pembatas digambar penuh atau putus putus.",
        mengukur: "Pemahaman hubungan tanda pertidaksamaan dengan jenis garis.",
        miskonsepsi: "Menganggap ≤ memakai garis putus putus, atau mengira jenis garis ditentukan arah arsiran.",
      },
      {
        id: "3.2", jenis: "Pilih Grafik", judul: "Memilih gambar garis yang benar",
        tugas: "Memilih satu dari empat grafik berdasarkan letak titik potong dan jenis garisnya.",
        mengukur: "Kemampuan membaca grafik serta memadukan hasil hitung titik potong dengan jenis garis.",
        miskonsepsi: "Hanya memeriksa titik potong tanpa memperhatikan jenis garis, atau sebaliknya.",
      },
      {
        id: "3.3", jenis: "Ketuk Titik", judul: "Memplot dua titik potong",
        tugas: "Mengetuk tepat pada dua titik potong garis dengan sumbu koordinat.",
        mengukur: "Ketepatan menghitung titik potong sekaligus menempatkannya pada bidang koordinat.",
        miskonsepsi: "Menukar urutan koordinat sehingga titik jatuh di sumbu yang keliru.",
      },
    ],
  },
  {
    subbab: 4,
    judul: "Uji Titik dan Daerah Penyelesaian",
    items: [
      {
        id: "4.1", jenis: "Pilihan Ganda", judul: "Memeriksa titik memenuhi atau tidak",
        tugas: "Menentukan apakah sebuah titik memenuhi pertidaksamaan yang diberikan.",
        mengukur: "Ketelitian substitusi dan membandingkan hasil ruas kiri dengan ruas kanan.",
        miskonsepsi: "Salah hitung perkalian, atau keliru membaca arah tanda ketidaksamaan.",
      },
      {
        id: "4.2", jenis: "Pilihan Ganda", judul: "Menyimpulkan hasil uji titik (0, 0)",
        tugas: "Memilih kesimpulan yang benar setelah menguji titik asal.",
        mengukur: "Pemahaman aturan: hasil uji benar berarti daerah memuat titik uji, hasil salah berarti sisi seberang.",
        miskonsepsi: "Membalik kesimpulan, atau mengira daerah penyelesaian hanya berupa garis.",
      },
      {
        id: "4.3", jenis: "Pilih Grafik", judul: "Memilih gambar daerah penyelesaian",
        tugas: "Memilih grafik dengan arsiran daerah penyelesaian yang tepat.",
        mengukur: "Perpaduan tiga hal: titik potong, jenis garis, dan sisi arsiran hasil uji titik.",
        miskonsepsi: "Mengarsir sisi yang berlawanan karena lupa melakukan uji titik.",
      },
    ],
  },
  {
    subbab: 5,
    judul: "Pengenalan SPtLDV",
    items: [
      {
        id: "5.1", jenis: "Pilihan Ganda", judul: "Mengenali bentuk SPtLDV",
        tugas: "Memilih kumpulan pertidaksamaan yang merupakan SPtLDV.",
        mengukur: "Pemahaman bahwa sistem terdiri dari beberapa PtLDV yang berlaku bersamaan.",
        miskonsepsi: "Menganggap sistem persamaan atau pertidaksamaan satu variabel sebagai SPtLDV.",
      },
      {
        id: "5.2", jenis: "Pilihan Ganda", judul: "Memahami makna DHP",
        tugas: "Memilih definisi DHP yang benar di antara empat pernyataan.",
        mengukur: "Pemahaman bahwa DHP adalah irisan, bukan gabungan.",
        miskonsepsi: "Tertukar antara irisan dan gabungan, atau mengira DHP hanya titik potong garis.",
      },
      {
        id: "5.3", jenis: "Pilihan Ganda", judul: "Menghitung banyak kendala",
        tugas: "Menentukan banyaknya kendala pada sebuah sistem dan mengenali kendala non negatif.",
        mengukur: "Ketelitian membaca susunan sistem serta pemahaman peran kendala x ≥ 0 dan y ≥ 0.",
        miskonsepsi: "Tidak menghitung x ≥ 0 dan y ≥ 0 sebagai kendala.",
      },
    ],
  },
  {
    subbab: 6,
    judul: "Menggambar SPtLDV dan DHP",
    items: [
      {
        id: "6.1", jenis: "Isian Singkat", judul: "Titik potong dua garis (metode campuran)",
        tugas: "Menghitung titik potong dua garis pembatas dengan eliminasi lalu substitusi.",
        mengukur: "Penguasaan metode campuran secara berurutan dan benar.",
        miskonsepsi: "Menjumlahkan padahal seharusnya mengurangkan, atau menukar nilai x dan y saat menulis jawaban.",
      },
      {
        id: "6.2", jenis: "Pilih Grafik", judul: "Memilih gambar DHP",
        tugas: "Memilih gambar DHP yang tepat dari empat pilihan.",
        mengukur: "Kemampuan memadukan arsiran tiap kendala, penerapan kendala non negatif, dan jenis garis.",
        miskonsepsi: "Lupa menerapkan x ≥ 0 dan y ≥ 0, sehingga daerah meluas ke bagian negatif.",
      },
      {
        id: "6.3", jenis: "Ketuk Daerah", judul: "Menunjuk titik di dalam DHP",
        tugas: "Mengetuk satu titik berkoordinat bulat yang berada di dalam DHP.",
        mengukur: "Kemampuan membaca daerah hasil irisan dan menguji keanggotaan sebuah titik.",
        miskonsepsi: "Memilih titik yang hanya memenuhi satu kendala, atau titik di luar batas sumbu.",
      },
    ],
  },
  {
    subbab: 7,
    judul: "Titik Pojok dari DHP",
    items: [
      {
        id: "7.1", jenis: "Pilihan Ganda", judul: "Menghitung banyak titik pojok",
        tugas: "Menentukan jumlah sudut DHP berdasarkan gambar.",
        mengukur: "Kemampuan menelusuri tepi daerah dan mengenali setiap belokan sebagai titik pojok.",
        miskonsepsi: "Melewatkan titik asal (0, 0) atau titik potong garis dengan sumbu.",
      },
      {
        id: "7.2", jenis: "Ketuk Titik", judul: "Menunjuk semua titik pojok",
        tugas: "Mengetuk seluruh titik pojok DHP pada grafik.",
        mengukur: "Ketepatan membaca koordinat setiap sudut daerah penyelesaian.",
        miskonsepsi: "Mengetuk titik potong garis yang berada di luar DHP.",
      },
      {
        id: "7.3", jenis: "Isian Singkat", judul: "Titik pojok perpotongan dua garis",
        tugas: "Menghitung titik pojok hasil perpotongan dua garis kendala dengan metode campuran.",
        mengukur: "Penguasaan perhitungan aljabar untuk titik yang tidak terbaca langsung dari grafik.",
        miskonsepsi: "Membaca kira kira dari gambar sehingga hasilnya meleset.",
      },
    ],
  },
  {
    subbab: 8,
    judul: "Menggambar DHP Secara Lengkap",
    items: [
      {
        id: "8.1", jenis: "Isian Singkat", judul: "Eliminasi langsung",
        tugas: "Mencari titik potong dua garis yang koefisiennya sudah sama.",
        mengukur: "Pemahaman kapan kedua persamaan dijumlahkan dan kapan dikurangkan.",
        miskonsepsi: "Salah memilih operasi sehingga variabel tidak hilang.",
      },
      {
        id: "8.2", jenis: "Isian Singkat", judul: "Menyamakan koefisien dahulu",
        tugas: "Mencari titik potong dua garis yang koefisiennya harus disamakan terlebih dulu.",
        mengukur: "Kemampuan mengalikan persamaan dengan bilangan yang tepat sebelum eliminasi.",
        miskonsepsi: "Hanya mengalikan sebagian suku, bukan seluruh persamaan.",
      },
      {
        id: "8.3", jenis: "Isian Singkat", judul: "Eliminasi dengan koefisien negatif",
        tugas: "Mencari titik potong dua garis yang memuat koefisien negatif.",
        mengukur: "Ketelitian operasi bilangan negatif saat eliminasi dan substitusi.",
        miskonsepsi: "Keliru mengurangkan bilangan negatif sehingga tanda hasilnya terbalik.",
      },
    ],
  },
  {
    subbab: 9,
    judul: "Fungsi Tujuan dan Nilai Optimum",
    items: [
      {
        id: "9.1", jenis: "Isian Singkat", judul: "Menghitung nilai fungsi tujuan",
        tugas: "Menghitung nilai f(x, y) pada satu titik tertentu.",
        mengukur: "Ketelitian substitusi dan urutan operasi: kalikan dahulu, baru jumlahkan.",
        miskonsepsi: "Menjumlahkan koordinat terlebih dahulu sebelum mengalikan koefisien.",
      },
      {
        id: "9.2", jenis: "Pilihan Ganda", judul: "Menentukan nilai maksimum",
        tugas: "Memilih nilai maksimum fungsi tujuan dari titik pojok yang diberikan.",
        mengukur: "Penerapan metode uji titik pojok secara menyeluruh.",
        miskonsepsi: "Memilih nilai minimum, atau hanya menghitung sebagian titik pojok.",
      },
      {
        id: "9.3", jenis: "Isian Singkat", judul: "Maksimum dan minimum sekaligus",
        tugas: "Menentukan nilai maksimum dan minimum berdasarkan titik pojok pada grafik.",
        mengukur: "Kelengkapan tabel evaluasi dan ketepatan membandingkan seluruh hasil.",
        miskonsepsi: "Menukar jawaban maksimum dengan minimum.",
      },
    ],
  },
  {
    subbab: 10,
    judul: "Pemodelan Soal Cerita",
    items: [
      {
        id: "10.1", jenis: "Pilihan Ganda", judul: "Memisalkan variabel",
        tugas: "Memilih pemisalan variabel yang tepat untuk sebuah usaha produksi.",
        mengukur: "Pemahaman bahwa variabel menyatakan banyaknya objek, bukan harga atau keuntungan.",
        miskonsepsi: "Memisalkan keuntungan atau total produksi sebagai variabel.",
      },
      {
        id: "10.2", jenis: "Pilihan Ganda", judul: "Menyusun satu kendala",
        tugas: "Memilih pertidaksamaan yang sesuai dengan batasan sumber daya.",
        mengukur: "Kemampuan menyusun bentuk kebutuhan dan memilih tanda yang tepat.",
        miskonsepsi: "Memakai tanda ≥ atau =, atau menukar koefisien kedua objek.",
      },
      {
        id: "10.3", jenis: "Pilihan Ganda", judul: "Menyusun model lengkap",
        tugas: "Memilih model matematika lengkap: fungsi tujuan, kendala, dan kendala non negatif.",
        mengukur: "Keutuhan pemodelan serta ketepatan arah optimasi.",
        miskonsepsi: "Lupa menyertakan x ≥ 0 dan y ≥ 0, atau meminimumkan keuntungan.",
      },
    ],
  },
];

export const TOTAL_TEMPLATE = SOAL_KATALOG.reduce((n, s) => n + s.items.length, 0);
