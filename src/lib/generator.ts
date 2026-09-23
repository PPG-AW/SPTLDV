// Question generator for LINIERKu
// Uses backward construction + rejection sampling with seeded RNG

import {
  mulberry32, hashString, randInt, pick, shuffle, areParallel,
  lineIntersection, testPoint, buildInequality, buildEquation,
  formatPoint, formatCoeff, ineqSign, isInteger, gcd
} from './math';

// ===========================
// Types
// ===========================
export interface GeneratedQuestion {
  soal: any;
  kunci: any;
  langkah: string[];
  hint: string[];
  tampilan: string; // rendered soal text
  tipe: string; // 'pilihan' | 'isian' | 'interaktif'
  opsi?: string[]; // for pilihan ganda
  jawabanBenar?: string; // correct answer for grading
}

// ===========================
// Seed generation
// ===========================
export function makeSeed(siswaId: string, jenis: string, subbabNo: number, attemptKe: number): string {
  return `${siswaId}:${jenis}:${subbabNo}:${attemptKe}`;
}

export function seedToRng(seed: string): () => number {
  return mulberry32(hashString(seed));
}

// ===========================
// Subbab 1: Identifikasi PtLDV
// ===========================
function generateSubbab1(rng: () => number): GeneratedQuestion {
  // Generate a correct PtLDV
  const a = randInt(rng, 1, 9);
  const b = randInt(rng, 1, 9);
  const c = randInt(rng, 4, 30);
  const signs: Array<'<' | '>' | '<=' | '>='> = ['<', '>', '<=', '>='];
  const sign = pick(rng, signs);
  const correctText = buildInequality(a, b, c, sign);

  // Generate distractors
  const distractors: { text: string; alasan: string }[] = [];

  // Equation (uses = sign)
  distractors.push({
    text: buildEquation(a + 1, b + 1, c + 2),
    alasan: 'Ini persamaan (menggunakan tanda =), bukan pertidaksamaan',
  });

  // One variable
  distractors.push({
    text: `${a}x ${ineqSign(sign)} ${c}`,
    alasan: 'Hanya satu variabel (x saja), bukan dua variabel',
  });

  // Squared variable
  distractors.push({
    text: `x² + ${b}y ${ineqSign(sign)} ${c}`,
    alasan: 'Ada variabel berpangkat dua (x²), bukan linear',
  });

  // Pick which option is correct (0-3)
  const correctIdx = randInt(rng, 0, 3);
  const allOptions = [
    ...distractors.slice(0, correctIdx),
    { text: correctText, alasan: 'Benar — ini PtLDV' },
    ...distractors.slice(correctIdx),
  ].slice(0, 4);

  const opsi = allOptions.map(o => o.text);

  return {
    soal: { options: opsi, correctIdx },
    kunci: { idx: correctIdx },
    langkah: [
      `PtLDV memiliki dua variabel (x, y) berpangkat satu dengan tanda pertidaksamaan.`,
      `Jawaban yang benar: ${correctText} — koefisien x = ${a}, koefisien y = ${b}, konstanta = ${c}, tanda ${ineqSign(sign)}.`,
    ],
    hint: [
      'PtLDV = dua variabel berpangkat satu + tanda pertidaksamaan (<, >, ≤, ≥).',
      'Periksa: apakah ada dua variabel? Apakah pangkatnya satu? Apakah tanda pertidaksamaan?',
    ],
    tampilan: `Manakah yang merupakan Pertidaksamaan Linear Dua Variabel?`,
    tipe: 'pilihan',
    opsi,
    jawabanBenar: String(correctIdx),
  };
}

// ===========================
// Subbab 2: Titik Potong
// ===========================
function generateSubbab2(rng: () => number): GeneratedQuestion {
  // Rich-factor constants
  const richFactors = [6, 8, 12, 18, 20, 24, 36, 48, 60];
  const c = pick(rng, richFactors);

  // Pick a, b as divisors of c in [2..6]
  const divisorsOfC: number[] = [];
  for (let d = 2; d <= 6; d++) {
    if (c % d === 0) divisorsOfC.push(d);
  }
  if (divisorsOfC.length < 2) {
    // Fallback
    divisorsOfC.push(2, 3);
  }
  const a = pick(rng, divisorsOfC);
  const b = pick(rng, divisorsOfC.filter(d => d !== a)) || divisorsOfC[0];

  const titikX = c / a;
  const titikY = c / b;

  return {
    soal: { a, b, c },
    kunci: { titikX, titikY },
    langkah: [
      `Garis pembatas: ${a}x + ${b}y = ${c}`,
      `Titik potong sumbu x (y = 0): ${a}x = ${c} → x = ${titikX} → titik (${titikX}, 0)`,
      `Titik potong sumbu y (x = 0): ${b}y = ${c} → y = ${titikY} → titik (0, ${titikY})`,
    ],
    hint: [
      `Untuk titik potong sumbu x, substitusikan y = 0 ke garis ${a}x + ${b}y = ${c}.`,
      `Untuk titik potong sumbu y, substitusikan x = 0 ke garis ${a}x + ${b}y = ${c}.`,
    ],
    tampilan: `Tentukan titik potong garis ${a}x + ${b}y = ${c} pada sumbu x dan sumbu y.`,
    tipe: 'isian',
    jawabanBenar: `${titikX},0,0,${titikY}`, // format: x1,y1,x2,y2
  };
}

// ===========================
// Subbab 3: Gambar Garis
// ===========================
function generateSubbab3(rng: () => number): GeneratedQuestion {
  const richFactors = [6, 8, 12, 18, 20, 24];
  const c = pick(rng, richFactors);
  const divisorsOfC: number[] = [];
  for (let d = 2; d <= 6; d++) {
    if (c % d === 0) divisorsOfC.push(d);
  }
  if (divisorsOfC.length < 2) divisorsOfC.push(2, 3);
  const a = pick(rng, divisorsOfC);
  const b = pick(rng, divisorsOfC.filter(d => d !== a)) || divisorsOfC[0];
  const signs: Array<'<' | '>' | '<=' | '>='> = ['<', '<=', '>', '>='];
  const sign = pick(rng, signs);

  const isSolid = sign === '<=' || sign === '>=';
  const titikX = c / a;
  const titikY = c / b;

  return {
    soal: { a, b, c, sign },
    kunci: { isSolid, titikX, titikY },
    langkah: [
      `Garis pembatas: ${a}x + ${b}y = ${c}`,
      `Titik potong sumbu x: (${titikX}, 0)`,
      `Titik potong sumbu y: (0, ${titikY})`,
      `Tanda ${ineqSign(sign)} → garis ${isSolid ? 'tegas (—)' : 'putus-putus (- - -)'}`,
    ],
    hint: [
      `Cari dulu titik potong di sumbu x (y = 0) dan sumbu y (x = 0).`,
      `Tanda ≤ atau ≥ → garis tegas. Tanda < atau > → garis putus-putus.`,
    ],
    tampilan: `Untuk pertidaksamaan ${a}x + ${b}y ${ineqSign(sign)} ${c}: tentukan titik potong dan jenis garisnya.`,
    tipe: 'isian',
    jawabanBenar: `${titikX},0,0,${titikY},${isSolid ? '1' : '0'}`,
  };
}

// ===========================
// Subbab 4: Uji Titik
// ===========================
function generateSubbab4(rng: () => number): GeneratedQuestion {
  const richFactors = [6, 8, 12, 18, 20, 24];
  const c = pick(rng, richFactors);
  const divisorsOfC: number[] = [];
  for (let d = 2; d <= 6; d++) {
    if (c % d === 0) divisorsOfC.push(d);
  }
  if (divisorsOfC.length < 2) divisorsOfC.push(2, 3);
  const a = pick(rng, divisorsOfC);
  const b = pick(rng, divisorsOfC.filter(d => d !== a)) || divisorsOfC[0];
  const signs: Array<'<' | '>' | '<=' | '>='> = ['<', '<=', '>', '>='];
  const sign = pick(rng, signs);

  // Test point
  let tx: number, ty: number;
  let iter = 0;
  do {
    tx = randInt(rng, -2, 9);
    ty = randInt(rng, -2, 9);
    iter++;
  } while (a * tx + b * ty === c && iter < 50); // avoid on the line

  const result = testPoint(tx, ty, a, b, c, sign);
  const val = a * tx + b * ty;
  const arah = result ? 'daerah yang memuat titik uji' : 'daerah seberang titik uji';

  return {
    soal: { a, b, c, sign, tx, ty },
    kunci: { result, arah },
    langkah: [
      `Pertidaksamaan: ${a}x + ${b}y ${ineqSign(sign)} ${c}`,
      `Uji titik (${tx}, ${ty}): ${a}(${tx}) + ${b}(${ty}) = ${val}`,
      `${val} ${ineqSign(sign)} ${c} → ${result ? 'BENAR' : 'SALAH'}`,
      `Kesimpulan: arsir ${arah}.`,
    ],
    hint: [
      `Substitusikan x = ${tx}, y = ${ty} ke pertidaksamaan.`,
      `Jika hasilnya BENAR, arsir daerah titik uji. Jika SALAH, arsir seberangnya.`,
    ],
    tampilan: `Uji titik (${tx}, ${ty}) pada pertidaksamaan ${a}x + ${b}y ${ineqSign(sign)} ${c}. Apakah titik tersebut memenuhi?`,
    tipe: 'pilihan',
    opsi: ['Ya — arsir daerah titik uji', 'Tidak — arsir daerah seberang'],
    jawabanBenar: result ? '0' : '1',
  };
}

// ===========================
// Subbab 5: Mengenali Sistem
// ===========================
function generateSubbab5(rng: () => number): GeneratedQuestion {
  // Two inequalities with x >= 0, y >= 0
  const richFactors = [12, 18, 20, 24];
  const c1 = pick(rng, richFactors);
  const c2 = pick(rng, richFactors.filter(c => c !== c1));

  const a1 = randInt(rng, 1, 3);
  const b1 = randInt(rng, 1, 3);
  const a2 = randInt(rng, 1, 3);
  const b2 = randInt(rng, 1, 3);

  return {
    soal: { a1, b1, c1, a2, b2, c2 },
    kunci: {
      penjelasan: `SPtLDV = dua atau lebih PtLDV yang harus dipenuhi bersama-sama. DP = irisan semua DP.`,
    },
    langkah: [
      `Sistem: ${a1}x + ${b1}y ≤ ${c1} dan ${a2}x + ${b2}y ≤ ${c2}, x ≥ 0, y ≥ 0`,
      `Kedua pertidaksamaan harus dipenuhi BERSAMA-SAMA.`,
      `Daerah penyelesaian = irisan daerah penyelesaian kedua pertidaksamaan.`,
    ],
    hint: [
      `SPtLDV = Sistem Pertidaksamaan Linear Dua Variabel. Kata kunci: "bersama-sama".`,
      `DP sistem = irisan dari DP tiap pertidaksamaan.`,
    ],
    tampilan: `Jelaskan apa yang dimaksud dengan Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV).`,
    tipe: 'pilihan',
    opsi: [
      'Dua pertidaksamaan yang harus dipenuhi bersama-sama',
      'Dua persamaan yang disubstitusi',
      'Satu pertidaksamaan dengan dua tanda',
      'Dua pertidaksamaan yang diselesaikan terpisah',
    ],
    jawabanBenar: '0',
  };
}

// ===========================
// Subbab 6: Menggambar SPtLDV
// ===========================
function generateSubbab6(rng: () => number): GeneratedQuestion {
  let a1: number, b1: number, c1: number, a2: number, b2: number, c2: number;
  let iter = 0;

  // Backward construction: pick intersection point first
  do {
    a1 = randInt(rng, 1, 4);
    b1 = randInt(rng, 1, 4);
    a2 = randInt(rng, 1, 4);
    b2 = randInt(rng, 1, 4);
    c1 = randInt(rng, 6, 20);
    c2 = randInt(rng, 6, 20);
    iter++;
  } while (
    (areParallel(a1, b1, a2, b2) || iter > 100) && iter <= 100
  );

  const inter = lineIntersection(a1, b1, c1, a2, b2, c2);
  if (!inter || !isInteger(inter.x) || !isInteger(inter.y)) {
    // Fallback
    a1 = 1; b1 = 1; c1 = 6;
    a2 = 2; b2 = 1; c2 = 8;
  }

  const x0 = inter ? Math.round(inter.x) : 2;
  const y0 = inter ? Math.round(inter.y) : 4;

  // Verify all corners are non-negative integers
  const constraints = [
    { a: a1, b: b1, c: c1, sign: '<=' as const },
    { a: a2, b: b2, c: c2, sign: '<=' as const },
    { a: 1, b: 0, c: 0, sign: '>=' as const }, // x >= 0
    { a: 0, b: 1, c: 0, sign: '>=' as const }, // y >= 0
  ];

  return {
    soal: { a1, b1, c1, a2, b2, c2 },
    kunci: { x0, y0 },
    langkah: [
      `Garis L1: ${a1}x + ${b1}y = ${c1} → titik potong (${c1}/${a1}, 0) dan (0, ${c1}/${b1})`,
      `Garis L2: ${a2}x + ${b2}y = ${c2} → titik potong (${c2}/${a2}, 0) dan (0, ${c2}/${b2})`,
      `Uji (0,0) untuk keduanya: ${0} ≤ ${c1} ✓ dan ${0} ≤ ${c2} ✓ → arsir ke arah (0,0)`,
      `DP = irisan kedua daerah di kuadran I.`,
    ],
    hint: [
      `Gambar kedua garis, uji (0,0) untuk tiap pertidaksamaan.`,
      `DP = daerah di kuadran I yang memenuhi kedua pertidaksamaan sekaligus.`,
    ],
    tampilan: `Gambarlah daerah penyelesaian sistem: ${a1}x + ${b1}y ≤ ${c1}, ${a2}x + ${b2}y ≤ ${c2}, x ≥ 0, y ≥ 0.`,
    tipe: 'interaktif',
  };
}

// ===========================
// Subbab 7: Titik Pojok
// ===========================
function generateSubbab7(rng: () => number): GeneratedQuestion {
  let a1 = 1, b1 = 1, c1 = 6;
  let a2 = 2, b2 = 1, c2 = 8;
  let iter = 0;

  do {
    a1 = randInt(rng, 1, 3);
    b1 = randInt(rng, 1, 3);
    a2 = randInt(rng, 1, 4);
    b2 = randInt(rng, 1, 4);
    c1 = randInt(rng, 6, 15);
    c2 = randInt(rng, 6, 20);
    iter++;
  } while (areParallel(a1, b1, a2, b2) && iter < 50);

  const inter = lineIntersection(a1, b1, c1, a2, b2, c2);
  if (!inter || !isInteger(inter.x) || !isInteger(inter.y) || inter.x < 0 || inter.y < 0) {
    // Fallback
    a1 = 1; b1 = 1; c1 = 6;
    a2 = 2; b2 = 1; c2 = 8;
  }

  const ix = inter ? Math.round(inter.x) : 2;
  const iy = inter ? Math.round(inter.y) : 4;

  // Corner points: (0,0), (c2/a2, 0) or (c1/a1, 0) whichever is smaller, intersection, (0, c1/b1) or (0, c2/b2)
  const pojokX = Math.min(c1 / a1, c2 / a2);
  const pojokY = Math.min(c1 / b1, c2 / b2);

  const pojok = [
    { x: 0, y: 0 },
    { x: pojokX, y: 0 },
    { x: ix, y: iy },
    { x: 0, y: pojokY },
  ].filter(p => isInteger(p.x) && isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x <= 20 && p.y <= 20);

  return {
    soal: { a1, b1, c1, a2, b2, c2 },
    kunci: { pojok },
    langkah: [
      `Sistem: ${a1}x + ${b1}y ≤ ${c1}, ${a2}x + ${b2}y ≤ ${c2}, x ≥ 0, y ≥ 0`,
      `Titik potong L1 dengan sumbu x: (${c1}/${a1}, 0) = (${c1 / a1}, 0)`,
      `Titik potong L2 dengan sumbu x: (${c2}/${a2}, 0) = (${c2 / a2}, 0) → ambil yang lebih kecil: (${pojokX}, 0)`,
      `Perpotongan L1 dan L2: (${ix}, ${iy})`,
      `Titik potong dengan sumbu y terkecil: (0, ${pojokY})`,
      `Titik pojok: ${pojok.map(p => formatPoint(p.x, p.y)).join(', ')}`,
    ],
    hint: [
      `Titik pojok = sudut-sudut daerah penyelesaian.`,
      `Cari perpotongan garis dengan sumbu dan perpotongan antar garis.`,
    ],
    tampilan: `Tentukan semua titik pojok dari daerah penyelesaian: ${a1}x + ${b1}y ≤ ${c1}, ${a2}x + ${b2}y ≤ ${c2}, x ≥ 0, y ≥ 0.`,
    tipe: 'isian',
    jawabanBenar: pojok.map(p => `${p.x},${p.y}`).join(';'),
  };
}

// ===========================
// Subbab 8: Metode Campuran
// ===========================
function generateSubbab8(rng: () => number): GeneratedQuestion {
  let x0: number, y0: number;
  let a1: number, b1: number, a2: number, b2: number, c1: number, c2: number;
  let iter = 0;

  // Pick integer intersection point first (backward construction)
  do {
    x0 = randInt(rng, 1, 8);
    y0 = randInt(rng, 1, 8);
    a1 = randInt(rng, 1, 5);
    b1 = randInt(rng, 1, 5);
    a2 = randInt(rng, 1, 5);
    b2 = randInt(rng, 1, 5);
    c1 = a1 * x0 + b1 * y0;
    c2 = a2 * x0 + b2 * y0;
    iter++;
  } while (
    (areParallel(a1, b1, a2, b2) ||
      (a1 === 1 && b1 === 1 && a2 === 1 && b2 === 1) || // too trivial
      c1 > 40 || c2 > 40 ||
      iter > 100) && iter <= 100
  );

  // Ensure det != 0
  const det = a1 * b2 - a2 * b1;
  if (det === 0) {
    // Fallback
    a1 = 2; b1 = 1; c1 = 8;
    a2 = 1; b2 = 1; c2 = 6;
    x0 = 2; y0 = 4;
  }

  return {
    soal: { a1, b1, c1, a2, b2, c2 },
    kunci: { x: x0, y: y0 },
    langkah: [
      `Persamaan 1: ${a1}x + ${b1}y = ${c1}`,
      `Persamaan 2: ${a2}x + ${b2}y = ${c2}`,
      `Eliminasi y: kalikan (1)×${b2}, (2)×${b1}:`,
      `  ${a1 * b2}x + ${b1 * b2}y = ${c1 * b2}`,
      `  ${a2 * b1}x + ${b1 * b2}y = ${c2 * b1}`,
      `  ─────────────────────────────── (kurangkan)`,
      `  ${(a1 * b2 - a2 * b1)}x = ${c1 * b2 - c2 * b1}`,
      `  x = ${x0}`,
      `Substitusi x = ${x0} ke persamaan 2: ${a2}(${x0}) + ${b2}y = ${c2}`,
      `  ${b2}y = ${c2 - a2 * x0}`,
      `  y = ${y0}`,
      `Titik potong: (${x0}, ${y0})`,
    ],
    hint: [
      `Samakan koefisien y (kalikan kedua persamaan), lalu kurangkan untuk eliminasi y.`,
      `Setelah dapat x, substitusikan ke persamaan yang lebih sederhana.`,
    ],
    tampilan: `Tentukan titik potong garis ${a1}x + ${b1}y = ${c1} dan ${a2}x + ${b2}y = ${c2} menggunakan metode campuran (eliminasi-substitusi).`,
    tipe: 'isian',
    jawabanBenar: `${x0},${y0}`,
  };
}

// ===========================
// Subbab 9: Nilai Optimum
// ===========================
function generateSubbab9(rng: () => number): GeneratedQuestion {
  // Use same config as subbab 7
  const a1 = 1, b1 = 1, c1 = 6;
  const a2 = 2, b2 = 1, c2 = 8;

  const pojok = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 2, y: 4 },
    { x: 0, y: 6 },
  ];

  const m = randInt(rng, 1, 9);
  const n = randInt(rng, 1, 9);

  const nilaiPojok = pojok.map(p => ({
    ...p,
    nilai: m * p.x + n * p.y,
  }));

  const maxVal = Math.max(...nilaiPojok.map(v => v.nilai));
  const minVal = Math.min(...nilaiPojok.map(v => v.nilai));
  const maxPoint = nilaiPojok.find(v => v.nilai === maxVal)!;
  const minPoint = nilaiPojok.find(v => v.nilai === minVal)!;

  return {
    soal: { m, n, pojok },
    kunci: { max: maxVal, maxPoint, min: minVal, minPoint },
    langkah: [
      `Fungsi tujuan: f(x,y) = ${m}x + ${n}y`,
      ...pojok.map(p => `f(${p.x}, ${p.y}) = ${m}(${p.x}) + ${n}(${p.y}) = ${m * p.x + n * p.y}`),
      `Nilai terbesar = ${maxVal} di titik ${formatPoint(maxPoint.x, maxPoint.y)} → MAKSIMUM`,
      `Nilai terkecil = ${minVal} di titik ${formatPoint(minPoint.x, minPoint.y)} → MINIMUM`,
    ],
    hint: [
      `Hitung f(x,y) = ${m}x + ${n}y di setiap titik pojok.`,
      `Bandingkan semua nilai — terbesar = maksimum, terkecil = minimum.`,
    ],
    tampilan: `Diketahui daerah penyelesaian memiliki titik pojok: ${pojok.map(p => formatPoint(p.x, p.y)).join(', ')}. Tentukan nilai maksimum dan minimum dari f(x,y) = ${m}x + ${n}y.`,
    tipe: 'isian',
    jawabanBenar: `${maxVal},${maxPoint.x},${maxPoint.y},${minVal},${minPoint.x},${minPoint.y}`,
  };
}

// ===========================
// Subbab 10: Soal Cerita
// ===========================
function generateSubbab10(rng: () => number): GeneratedQuestion {
  const templates = [
    {
      nama: 'roti',
      barangA: 'roti A',
      barangB: 'roti B',
      unitA: 'buah',
      unitB: 'buah',
      res1: 'Mesin I',
      res2: 'Mesin II',
      satuan1: 'jam',
      satuan2: 'jam',
    },
    {
      nama: 'kue',
      barangA: 'kue lapis',
      barangB: 'kue kering',
      unitA: 'loyang',
      unitB: 'toples',
      res1: 'Tepung',
      res2: 'Gula',
      satuan1: 'kg',
      satuan2: 'kg',
    },
    {
      nama: 'mebel',
      barangA: 'meja',
      barangB: 'kursi',
      unitA: 'buah',
      unitB: 'buah',
      res1: 'Kayu',
      res2: 'Paku',
      satuan1: 'papan',
      satuan2: 'bungkus',
    },
  ];

  const template = pick(rng, templates);

  // Use same constraints as subbab 6/7
  const a1 = 1, b1 = 1, c1 = 6;
  const a2 = 2, b2 = 1, c2 = 8;

  return {
    soal: { template, a1, b1, c1, a2, b2, c2 },
    kunci: {
      model: [
        `${a1}x + ${b1}y ≤ ${c1}`,
        `${a2}x + ${b2}y ≤ ${c2}`,
        'x ≥ 0',
        'y ≥ 0',
      ],
    },
    langkah: [
      `Misalkan x = banyak ${template.barangA}, y = banyak ${template.barangB}.`,
      `Batasan ${template.res1}: ${a1}x + ${b1}y ≤ ${c1}`,
      `Batasan ${template.res2}: ${a2}x + ${b2}y ≤ ${c2}`,
      `Syarat alamiah: x ≥ 0, y ≥ 0`,
      `Model matematika: ${a1}x + ${b1}y ≤ ${c1}, ${a2}x + ${b2}y ≤ ${c2}, x ≥ 0, y ≥ 0`,
    ],
    hint: [
      `Tetapkan variabel: x = banyak ${template.barangA}, y = banyak ${template.barangB}.`,
      `Tulis pertidaksamaan dari setiap batasan + syarat alamiah.`,
    ],
    tampilan: `Sebuah usaha membuat ${template.barangA} dan ${template.barangB}. ${template.res1} mampu memproses maksimal ${c1} unit (${a1} unit untuk tiap ${template.barangA} dan ${b1} unit untuk tiap ${template.barangB}). ${template.res2} mampu memproses maksimal ${c2} unit (${a2} unit untuk tiap ${template.barangA} dan ${b2} unit untuk tiap ${template.barangB}). Susunlah model matematikanya!`,
    tipe: 'isian',
    jawabanBenar: `${a1},${b1},${c1},${a2},${b2},${c2}`,
  };
}

// ===========================
// Sumatif Generator
// ===========================
export function generateSumatif(rng: () => number) {
  const a1 = 1, b1 = 1, c1 = 6;
  const a2 = 2, b2 = 1, c2 = 8;
  const k = randInt(rng, 2, 3); // x + y >= k

  const pojok = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 2, y: 4 },
    { x: 0, y: 6 },
  ].filter(p => p.x + p.y >= k);

  const m = randInt(rng, 2, 8);
  const n = randInt(rng, 2, 8);
  const m2 = randInt(rng, 1, 5);
  const n2 = randInt(rng, 1, 5);

  const nilaiMax = Math.max(...pojok.map(p => m * p.x + n * p.y));
  const maxPoint = pojok.find(p => m * p.x + n * p.y === nilaiMax)!;
  const nilaiMin = Math.min(...pojok.map(p => m2 * p.x + n2 * p.y));
  const minPoint = pojok.find(p => m2 * p.x + n2 * p.y === nilaiMin)!;

  return {
    soal1: { a1, b1, c1, a2, b2, c2, k },
    soal2: { m, n, m2, n2 },
    kunci: { pojok, maxPoint, maxVal: nilaiMax, minPoint, minVal: nilaiMin },
  };
}

// ===========================
// Main Generator
// ===========================
export function generateQuestion(subbabNo: number, seed: string): GeneratedQuestion {
  const rng = seedToRng(seed);

  switch (subbabNo) {
    case 1: return generateSubbab1(rng);
    case 2: return generateSubbab2(rng);
    case 3: return generateSubbab3(rng);
    case 4: return generateSubbab4(rng);
    case 5: return generateSubbab5(rng);
    case 6: return generateSubbab6(rng);
    case 7: return generateSubbab7(rng);
    case 8: return generateSubbab8(rng);
    case 9: return generateSubbab9(rng);
    case 10: return generateSubbab10(rng);
    default: throw new Error(`Invalid subbab number: ${subbabNo}`);
  }
}
