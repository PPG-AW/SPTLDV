// ─── Asesmen Sumatif (2 soal FIXED) — konstanta & penilaian per langkah ─────
// Dipakai baik di client (render) maupun server (scoring).

import { cornerPoints, type IneqSpec, type Pt } from "./geometry";

export const SUMATIVE = {
  story:
    "Sebuah home industry memproduksi dua jenis keripik: keripik singkong (x) dan keripik pisang (y). Setiap kemasan keripik singkong memerlukan 2 ons bahan baku dan setiap kemasan keripik pisang 1 ons, dengan total bahan tersedia 12 ons. Kapasitas produksi harian seluruhnya paling banyak 8 kemasan. Keuntungan setiap kemasan keripik singkong Rp5.000 dan keripik pisang Rp3.000.",
  variables: "x = banyak kemasan keripik singkong, y = banyak kemasan keripik pisang",
  constraint1: { a: 2, b: 1, c: 12, sign: "<=" } as IneqSpec, // 2x + y ≤ 12
  constraint2: { a: 1, b: 1, c: 8, sign: "<=" } as IneqSpec,  // x + y ≤ 8
  objectiveFa: 5,
  objectiveFb: 3, // f(x,y) = 5x + 3y (ribu rupiah)
};

const NONNEG: IneqSpec[] = [
  { a: 1, b: 0, c: 0, sign: ">=" },
  { a: 0, b: 1, c: 0, sign: ">=" },
];

export const SUMATIVE_INEQS: IneqSpec[] = [
  SUMATIVE.constraint1,
  SUMATIVE.constraint2,
  ...NONNEG,
];

export const SUMATIVE_CORNERS: Pt[] = cornerPoints(SUMATIVE_INEQS);
// → (0,0), (6,0), (4,4), (0,8)

export function sumativeObjective(p: Pt): number {
  return SUMATIVE.objectiveFa * p.x + SUMATIVE.objectiveFb * p.y;
}

export const SUMATIVE_MAX = Math.max(...SUMATIVE_CORNERS.map(sumativeObjective)); // 32 di (4,4)
export const SUMATIVE_MIN = Math.min(...SUMATIVE_CORNERS.map(sumativeObjective)); // 0 di (0,0)
export const SUMATIVE_MAX_PT = SUMATIVE_CORNERS.find(
  (c) => sumativeObjective(c) === SUMATIVE_MAX
)!;
export const SUMATIVE_MIN_PT = SUMATIVE_CORNERS.find(
  (c) => sumativeObjective(c) === SUMATIVE_MIN
)!;

// Bank pilihan kendala (Soal 1b): 4 benar
export const CONSTRAINT_BANK = [
  { id: "k1", label: "2x + y ≤ 12", correct: true },
  { id: "k2", label: "x + y ≤ 8", correct: true },
  { id: "k3", label: "x ≥ 0", correct: true },
  { id: "k4", label: "y ≥ 0", correct: true },
  { id: "k5", label: "2x + y ≥ 12", correct: false },
  { id: "k6", label: "x + y ≥ 8", correct: false },
];

// ── Struktur jawaban ─────────────────────────────────────────────────────────

export interface SumativeAnswer1 {
  variablesChoice: string; // id opsi variabel
  constraints: string[]; // id kendala terpilih
  graphPoints: Pt[]; // 4 titik ketukan: 2 intercept tiap garis
  corners: Pt[]; // titik pojok yang diketuk
}

export interface SumativeAnswer2 {
  maxValue: number;
  maxX: number;
  maxY: number;
  minValue: number;
  minX: number;
  minY: number;
}

export const VARIABLE_OPTIONS = [
  { id: "v1", label: "x = banyak kemasan keripik singkong, y = banyak kemasan keripik pisang", correct: true },
  { id: "v2", label: "x = banyak kemasan keripik pisang, y = banyak kemasan keripik singkong", correct: false },
  { id: "v3", label: "x = total keuntungan, y = total produksi", correct: false },
];

// ── Penilaian per langkah (partial scoring) ──────────────────────────────────

export interface ScorePart {
  key: string;
  label: string;
  earned: number;
  max: number;
}

function nearPoint(target: Pt, taps: Pt[], tol = 0.6): boolean {
  return taps.some((t) => Math.hypot(t.x - target.x, t.y - target.y) <= tol);
}

export function scoreSoal1Part1(a: SumativeAnswer1): ScorePart {
  const ok = a.variablesChoice === "v1";
  return { key: "variabel", label: "Identifikasi variabel", earned: ok ? 15 : 0, max: 15 };
}

export function scoreSoal1Part2(a: SumativeAnswer1): ScorePart {
  const chosen = new Set(a.constraints ?? []);
  let earned = 0;
  for (const opt of CONSTRAINT_BANK) {
    const should = opt.correct;
    const did = chosen.has(opt.id);
    if (should && did) earned += 3.5; // 4 benar × 3.5 = 14
    if (!should && !did) earned += 3;  // 2 salah tak dipilih × 3 = 6
  }
  return {
    key: "kendala",
    label: "Menyusun kendala",
    earned: Math.round(earned),
    max: 20,
  };
}

export function scoreSoal1Part3(a: SumativeAnswer1): ScorePart {
  const targets: Pt[] = [
    { x: 6, y: 0 }, { x: 0, y: 12 }, // intercepts 2x + y = 12
    { x: 8, y: 0 }, { x: 0, y: 8 },  // intercepts x + y = 8
  ];
  const hits = targets.filter((t) => nearPoint(t, a.graphPoints ?? [])).length;
  return {
    key: "grafik",
    label: "Grafik & jenis garis",
    earned: Math.round((hits / 4) * 20),
    max: 20,
  };
}

export function scoreSoal1Part4(a: SumativeAnswer1): ScorePart {
  const hits = SUMATIVE_CORNERS.filter((c) => nearPoint(c, a.corners ?? [])).length;
  return {
    key: "pojok",
    label: "Titik pojok DHP",
    earned: Math.round((hits / SUMATIVE_CORNERS.length) * 20),
    max: 20,
  };
}

export function scoreSoal2(a: SumativeAnswer2): ScorePart {
  let earned = 0;
  const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
  if (n(a.maxValue) === SUMATIVE_MAX) earned += 10;
  if (n(a.maxX) === SUMATIVE_MAX_PT.x && n(a.maxY) === SUMATIVE_MAX_PT.y) earned += 5;
  if (n(a.minValue) === SUMATIVE_MIN) earned += 5;
  if (n(a.minX) === SUMATIVE_MIN_PT.x && n(a.minY) === SUMATIVE_MIN_PT.y) earned += 5;
  return { key: "optimum", label: "Nilai maksimum & minimum", earned, max: 25 };
}

export function scoreSumative(a1: SumativeAnswer1, a2: SumativeAnswer2) {
  const parts = [
    scoreSoal1Part1(a1),
    scoreSoal1Part2(a1),
    scoreSoal1Part3(a1),
    scoreSoal1Part4(a1),
    scoreSoal2(a2),
  ];
  const total = parts.reduce((s, p) => s + p.earned, 0);
  return { parts, total };
}
