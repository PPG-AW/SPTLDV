// ─── Mesin Soal Formatif — 30 template (3 per sub-bab) ──────────────────────
// Semua angka integer-friendly. Petunjuk & pembahasan memakai sintaks MathSteps.

import {
  cornerPoints,
  intersectLines,
  lineFromIntercepts,
  satisfies,
  type IneqSpec,
  type Pt,
  type Sign,
} from "./geometry";
import {
  eqStr,
  frac,
  linExpr,
  neg,
  num,
  simplifyLine,
  stepsInterceptX,
  stepsInterceptY,
  stepsMixedMethod,
  stepsTestPoint,
  hintInterceptX,
  hintInterceptY,
  hintMixedMethod,
  hintTestPoint,
  hintObjective,
  tableText,
} from "./mathfmt";

// ── Tipe ─────────────────────────────────────────────────────────────────────

export interface PlotPoint { p: Pt; color?: string; hollow?: boolean; label?: string }

export interface CanvasSpec {
  xRange: [number, number];
  yRange: [number, number];
  lines?: IneqSpec[];
  shadeIndices?: number[];
  dhpIneqs?: IneqSpec[];
  points?: PlotPoint[];
  crosshair?: Pt;
}

export interface MCOption { id: string; label: string }
export interface FillField { key: string; label: string; suffix?: string }
export type QKind = "mc" | "fill" | "points" | "graph" | "region-tap";
export interface CheckResult { ok: boolean; note?: string }
/** Fungsi pemeriksa yang membawa kunci jawabannya (dipakai untuk audit otomatis). */
export type CheckFn = ((answer: unknown) => CheckResult) & { key?: unknown };

export interface Question {
  subbab: number;
  templateId: string;
  kind: QKind;
  prompt: string;
  math?: string;
  canvas?: CanvasSpec;
  hints: [string, string, string];
  explain: string;
  explainSteps?: string;
  mcOptions?: MCOption[];
  fillFields?: FillField[];
  graphOptions?: CanvasSpec[];
  graphCaptions?: string[];
  needPoints?: number;
  tapPointsLabel?: string;
  check: CheckFn;
  /** Jawaban benar (diisi otomatis) — untuk audit & tampilan kunci bagi guru. */
  answerKey?: unknown;
}

// ── Util acak ────────────────────────────────────────────────────────────────

export const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function parseNum(raw: unknown): number {
  if (typeof raw === "number") return raw;
  const s = String(raw ?? "").trim().replace(",", ".").replace(/[−–—]/g, "-").replace(/\s/g, "");
  if (s === "" || s === "-") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const pt = (x: number, y: number): Pt => ({ x, y });

/** Format rupiah baku Indonesia: Rp20.000,00 */
const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")},00`;

/** Garis dari dua titik potong sumbu, disederhanakan sampai FPB(a,b,c) = 1. */
function intLine(p: number, q: number): { a: number; b: number; c: number } {
  const l = lineFromIntercepts(p, q);
  return simplifyLine(l.a, l.b, l.c);
}

/** Pastikan pertidaksamaan tampil dalam bentuk paling sederhana. */
function simp<T extends { a: number; b: number; c: number }>(l: T): T {
  return { ...l, ...simplifyLine(l.a, l.b, l.c) };
}
const SYM: Record<Sign, string> = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
const isDashed = (s: Sign) => s === "<" || s === ">";
const flip = (s: Sign): Sign => ({ "<=": ">=", ">=": "<=", "<": ">", ">": "<" } as Record<Sign, Sign>)[s];
const ineqStr = (i: IneqSpec) => eqStr(i.a, i.b, i.c, SYM[i.sign]);

/** Jangkauan sumbu menyesuaikan titik-titik penting (boleh negatif). */
function rangeFor(values: number[], minSpan = 7): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  const lo = Math.min(0, ...finite);
  const hi = Math.max(0, ...finite);
  // Margin proporsional: makin besar jangkauan, makin lebar ruang kosongnya,
  // sehingga garis tidak menempel tepi dan daerah penyelesaian tampak lapang.
  const span = Math.max(hi - lo, 1);
  const margin = Math.max(2, Math.round(span * 0.22));
  let a = Math.floor(lo) - margin;
  let b = Math.ceil(hi) + margin;
  // jangan terlalu jauh ke daerah negatif bila semua titik penting tidak negatif
  if (lo >= 0) a = Math.max(a, -Math.max(2, Math.round(span * 0.18)));
  if (b - a < minSpan) b = a + minSpan;
  return [a, b];
}

function specFor(lines: IneqSpec[], extra: Partial<CanvasSpec> = {}): CanvasSpec {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const l of lines) {
    if (l.a !== 0) xs.push(l.c / l.a);
    if (l.b !== 0) ys.push(l.c / l.b);
  }
  for (const p of extra.points ?? []) { xs.push(p.p.x); ys.push(p.p.y); }
  if (extra.crosshair) { xs.push(extra.crosshair.x); ys.push(extra.crosshair.y); }
  return { xRange: rangeFor(xs), yRange: rangeFor(ys), lines, ...extra };
}

// ── Pembuat pertanyaan ───────────────────────────────────────────────────────

function baseQ(
  subbab: number, templateId: string, kind: QKind, prompt: string,
  hints: [string, string, string], explain: string, extra: Partial<Question> = {}
): Question {
  return { subbab, templateId, kind, prompt, hints, explain, check: () => ({ ok: false }), ...extra };
}

function mcCheck(answerId: string, notes: Record<string, string> = {}): CheckFn {
  const fn: CheckFn = (answer: unknown): CheckResult => {
    const a = String(answer ?? "");
    if (a === answerId) return { ok: true };
    return { ok: false, note: notes[a] ?? "Pilihan belum tepat." };
  };
  fn.key = answerId;
  return fn;
}

/** Pemeriksa untuk soal pilihan grafik; otomatis mengunci indeks yang benar. */
function graphCheck(variants: { why: string; ok: boolean }[]): CheckFn {
  const correct = variants.findIndex((v) => v.ok);
  const fn: CheckFn = (answer: unknown): CheckResult => {
    const idx = Number(answer);
    if (idx === correct) return { ok: true };
    return { ok: false, note: variants[idx]?.why ?? "Grafik belum tepat." };
  };
  fn.key = correct;
  return fn;
}

function fillCheck(
  expected: Record<string, number>, labels: Record<string, string>,
  swapPairs: [string, string, string][] = []
): CheckFn {
  const fn: CheckFn = (answer: unknown): CheckResult => {
    const ans = (answer ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(expected)) {
      const v = parseNum(ans[key]);
      if (!Number.isFinite(v)) return { ok: false, note: `Kolom "${labels[key]}" belum diisi angka yang valid.` };
      if (Math.abs(v - expected[key]) > 0.01) {
        for (const [ka, kb, msg] of swapPairs) {
          if (Math.abs(parseNum(ans[ka]) - expected[kb]) <= 0.01 && Math.abs(parseNum(ans[kb]) - expected[ka]) <= 0.01) {
            return { ok: false, note: msg };
          }
        }
        if (Math.abs(v + expected[key]) <= 0.01 && expected[key] !== 0) {
          return { ok: false, note: `Nilai "${labels[key]}" tertukar tandanya (positif/negatif). Periksa kembali pembagian bilangan negatif.` };
        }
        return { ok: false, note: `Nilai "${labels[key]}" belum tepat.` };
      }
    }
    return { ok: true };
  };
  fn.key = expected;
  return fn;
}

function pointsCheck(targets: Pt[], need: number, tol = 0.55): CheckFn {
  const fn: CheckFn = (answer: unknown): CheckResult => {
    const taps = (answer ?? []) as Pt[];
    if (taps.length < need) return { ok: false, note: `Butuh ${need} titik.` };
    const used = new Set<number>();
    for (const t of targets) {
      let best = -1, bestD = Infinity;
      taps.forEach((tap, i) => {
        if (used.has(i)) return;
        const d = Math.hypot(tap.x - t.x, tap.y - t.y);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best < 0 || bestD > tol) {
        return { ok: false, note: "Ada titik yang belum tepat posisinya." };
      }
      used.add(best);
    }
    return { ok: true };
  };
  fn.key = targets;
  return fn;
}

const NON_NEG: IneqSpec[] = [
  { a: 1, b: 0, c: 0, sign: ">=" },
  { a: 0, b: 1, c: 0, sign: ">=" },
];

/** Sistem dengan SEMUA titik pojok bilangan bulat (gradien bervariasi). */
function integerCornerSystem(forceTwoLines = false): { ineqs: IneqSpec[]; lines: IneqSpec[]; corners: Pt[] } {
  for (let attempt = 0; attempt < 60; attempt++) {
    const mode = forceTwoLines ? ri(1, 3) : ri(0, 3);
    let lines: IneqSpec[];
    if (mode === 0) {
      lines = [simp({ ...lineFromIntercepts(ri(3, 8), ri(3, 8)), sign: "<=" })];
    } else if (mode === 1) {
      const px = ri(1, 4), py = ri(1, 4);
      lines = [
        { a: 1, b: 1, c: px + py, sign: "<=" },
        { a: 1, b: 2, c: px + 2 * py, sign: "<=" },
      ];
    } else if (mode === 2) {
      // garis kedua bergradien POSITIF: −x + y ≤ k  (yaitu y ≤ x + k)
      const px = ri(1, 4), py = ri(2, 5), k = py - px;
      lines = [
        { a: 1, b: 1, c: px + py, sign: "<=" },
        { a: -1, b: 1, c: k, sign: "<=" },
      ];
    } else {
      const px = ri(1, 4), py = ri(1, 4);
      lines = [
        { a: 2, b: 1, c: 2 * px + py, sign: "<=" },
        { a: 1, b: 2, c: px + 2 * py, sign: "<=" },
      ];
    }
    const ineqs = [...lines, ...NON_NEG];
    const corners = cornerPoints(ineqs);
    if (corners.length < 3) continue;
    if (!corners.every((c) => Number.isInteger(c.x) && Number.isInteger(c.y))) continue;
    if (corners.some((c) => c.x > 12 || c.y > 12)) continue;
    return { ineqs, lines, corners };
  }
  const l: IneqSpec = { a: 1, b: 1, c: 6, sign: "<=" };
  const ineqs = [l, ...NON_NEG];
  return { ineqs, lines: [l], corners: cornerPoints(ineqs) };
}

// ════════════════ SUB-BAB 1 ═════════════════════════════════════════════════

function t11(): Question {
  const a = ri(2, 5), b = ri(2, 5), c = ri(6, 20);
  const sign = pick<Sign>(["<=", ">=", "<", ">"]);
  const correct = `${a}x + ${b}y ${SYM[sign]} ${c}`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `${a}x² + ${b}y ${SYM[sign]} ${c}`, why: "Variabel x berpangkat dua, sehingga bentuknya tidak linear.", ok: false },
    { label: `${a}x + ${b}y = ${c}`, why: "Memakai tanda sama dengan, jadi ini PERSAMAAN, bukan pertidaksamaan.", ok: false },
    { label: `${a}xy + ${b}y ${SYM[sign]} ${c}`, why: "Ada perkalian antarvariabel (xy), sehingga tidak linear.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(1, "1.1", "mc",
    "Manakah bentuk berikut yang merupakan pertidaksamaan linear dua variabel (PtLDV)?",
    [
      "PtLDV harus memuat dua variabel yang masing-masing berpangkat satu, dan dihubungkan tanda <, >, ≤, atau ≥.",
      "Periksa setiap opsi satu per satu: adakah variabel berpangkat dua? adakah perkalian antarvariabel seperti xy? adakah yang memakai tanda sama dengan?",
      "Coret setiap opsi yang melanggar salah satu syarat. Opsi yang tidak melanggar syarat apa pun itulah jawabannya.",
    ],
    `Bentuk ${correct} memenuhi semua syarat PtLDV: dua variabel, keduanya berpangkat satu, tanpa perkalian antarvariabel, dan memakai tanda ketidaksamaan.`,
    {
      math: "ax + by ≤ c",
      mcOptions: opts,
      explainSteps:
        "> Syarat sebuah bentuk disebut PtLDV:\n" +
        "> 1. Memuat dua variabel (x dan y)\n" +
        "> 2. Setiap variabel berpangkat satu\n" +
        "> 3. Tidak ada perkalian antarvariabel seperti xy\n" +
        "> 4. Dihubungkan tanda <, >, ≤, atau ≥ (bukan =)\n" +
        `> Bentuk yang memenuhi semuanya: ${correct}`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t12(): Question {
  const a = ri(2, 6), b = pick([-1, 1]) * ri(2, 6), c = ri(8, 24);
  const sign = pick<Sign>(["<=", ">="]);
  const text = eqStr(a, b, c, SYM[sign]);
  const q = baseQ(1, "1.2", "fill",
    "Tentukan koefisien x, koefisien y, dan konstanta dari pertidaksamaan berikut.",
    [
      "Bandingkan bentuk pada soal dengan bentuk umum ax + by ≤ c.",
      "Koefisien adalah bilangan yang menempel pada variabel, sedangkan konstanta adalah suku tanpa variabel di ruas kanan.",
      "Perhatikan tanda di depan setiap suku. Bila sebuah suku didahului tanda minus, maka koefisiennya bernilai NEGATIF — tanda itu ikut ditulis, jangan dibuang.",
    ],
    `Koefisien x = ${neg(a)}, koefisien y = ${neg(b)}, konstanta = ${neg(c)}.`,
    {
      math: text,
      fillFields: [
        { key: "a", label: "a (koefisien x)" },
        { key: "b", label: "b (koefisien y)" },
        { key: "c", label: "c (konstanta)" },
      ],
      explainSteps:
        `> Bandingkan dengan bentuk umum ax + by ≤ c:\n${text}\n` +
        `> Bilangan yang menempel pada x:\na = ${neg(a)}\n` +
        `> Bilangan yang menempel pada y (tanda ikut):\nb = ${neg(b)}\n` +
        `> Suku tanpa variabel di ruas kanan:\nc = ${neg(c)}`,
    });
  q.check = fillCheck({ a, b, c }, { a: "a", b: "b", c: "c" });
  return q;
}

function t13(): Question {
  let s = pick([
    { A: "buku tulis", B: "pensil", hA: ri(3, 5) * 1000, hB: ri(1, 2) * 1000, tot: pick([20000, 25000, 30000]) },
    { A: "roti cokelat", B: "roti keju", hA: ri(2, 4) * 1000, hB: ri(2, 5) * 1000, tot: pick([30000, 40000, 50000]) },
  ]);
  // harga kedua barang WAJIB berbeda, agar distraktor "koefisien tertukar"
  // tidak menghasilkan opsi yang kembar dengan kunci jawaban
  let guard = 0;
  while (s.hA === s.hB && guard++ < 20) {
    s = { ...s, hB: ri(1, 5) * 1000 };
  }
  if (s.hA === s.hB) s = { ...s, hB: s.hA + 1000 };
  const model = (p: number, q2: number, rel: string) => `${p}x + ${q2}y ${rel} ${s.tot}`;
  const correct = model(s.hA, s.hB, "≤");
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: model(s.hA, s.hB, "≥"), why: "Frasa \"tidak lebih dari\" berarti ≤, bukan ≥.", ok: false },
    { label: model(s.hB, s.hA, "≤"), why: `Koefisiennya tertukar. x mewakili banyak ${s.A}, sehingga koefisiennya adalah harga ${s.A}.`, ok: false },
    { label: model(s.hA, s.hB, "="), why: "\"Tidak lebih dari\" adalah batas atas (≤), bukan harus tepat sama dengan.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(1, "1.3", "mc",
    `Harga sebuah ${s.A} adalah ${rupiah(s.hA)} dan sebuah ${s.B} adalah ${rupiah(s.hB)}. Misalkan x = banyak ${s.A} dan y = banyak ${s.B}. Jika total belanja tidak lebih dari ${rupiah(s.tot)}, model matematikanya adalah…`,
    [
      "Susun dahulu bentuk total belanjanya: (harga satuan) dikali (banyaknya), untuk kedua barang.",
      `Belanja ${s.A} adalah ${s.hA}x dan belanja ${s.B} adalah ${s.hB}y. Jumlahkan keduanya untuk memperoleh bentuk total belanja.`,
      "Sekarang terjemahkan frasa \"tidak lebih dari\". Frasa ini menyatakan BATAS ATAS — nilainya boleh kurang, tetapi tidak boleh melebihi, dan tidak harus tepat sama. Pilih tanda ketidaksamaan yang sesuai serta pastikan koefisiennya tidak tertukar.",
    ],
    `Total belanja adalah ${s.hA}x + ${s.hB}y, dan karena tidak boleh melebihi ${rupiah(s.tot)} maka tandanya ≤.`,
    {
      mcOptions: opts,
      explainSteps:
        `> Belanja ${s.A}: harga × banyaknya\n${s.hA}x\n` +
        `> Belanja ${s.B}:\n${s.hB}y\n` +
        `> Total belanja:\n${s.hA}x + ${s.hB}y\n` +
        `> Frasa \"tidak lebih dari\" berarti batas atas, yaitu tanda ≤:\n${correct}`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

// ════════════════ SUB-BAB 2 ═════════════════════════════════════════════════

/** Garis dengan titik potong bulat; sebagian bergradien positif (ada yang negatif). */
function sub2Line() {
  const p = ri(2, 7);
  const q = ri(2, 7);
  const negY = Math.random() < 0.4; // titik potong sumbu Y negatif → gradien positif
  const line = intLine(p, negY ? -q : q);
  return { p, q: negY ? -q : q, line };
}

function t21(): Question {
  const { p, line } = sub2Line();
  const steps = stepsInterceptX(line.a, line.b, line.c);
  const q = baseQ(2, "2.1", "fill",
    "Tentukan koordinat titik potong garis berikut dengan sumbu X.",
    [
      "Setiap titik pada sumbu X selalu berbentuk (p, 0), artinya nilai y-nya sama dengan nol.",
      "Substitusikan y = 0 ke dalam persamaan garisnya. Suku yang memuat y akan hilang karena dikali nol.",
      hintInterceptX(line.a, line.b, line.c),
    ],
    `Dengan mensubstitusikan y = 0 diperoleh x = ${neg(p)}, sehingga titik potong sumbu X adalah (${neg(p)}, 0).`,
    {
      math: eqStr(line.a, line.b, line.c),
      fillFields: [{ key: "x", label: "nilai x pada titik (x, 0)" }],
      explainSteps: steps,
    });
  q.check = fillCheck({ x: p }, { x: "x" });
  return q;
}

function t22(): Question {
  const { q: yInt, line } = sub2Line();
  const steps = stepsInterceptY(line.a, line.b, line.c);
  const q = baseQ(2, "2.2", "fill",
    "Tentukan koordinat titik potong garis berikut dengan sumbu Y.",
    [
      "Setiap titik pada sumbu Y selalu berbentuk (0, q), artinya nilai x-nya sama dengan nol.",
      "Substitusikan x = 0 ke dalam persamaan garisnya. Suku yang memuat x akan hilang karena dikali nol.",
      hintInterceptY(line.a, line.b, line.c),
    ],
    `Dengan mensubstitusikan x = 0 diperoleh y = ${neg(yInt)}, sehingga titik potong sumbu Y adalah (0, ${neg(yInt)}).`,
    {
      math: eqStr(line.a, line.b, line.c),
      fillFields: [{ key: "y", label: "nilai y pada titik (0, y)" }],
      explainSteps: steps,
    });
  q.check = fillCheck({ y: yInt }, { y: "y" });
  return q;
}

function t23(): Question {
  const { p, q: yInt, line } = sub2Line();
  const steps = `${stepsInterceptX(line.a, line.b, line.c)}\n${stepsInterceptY(line.a, line.b, line.c)}`;
  const q = baseQ(2, "2.3", "fill",
    "Tentukan KEDUA titik potong garis berikut dengan sumbu koordinat.",
    [
      "Kerjakan dalam dua perhitungan yang terpisah: sumbu X dicari dengan y = 0, dan sumbu Y dicari dengan x = 0.",
      hintInterceptX(line.a, line.b, line.c),
      hintInterceptY(line.a, line.b, line.c),
    ],
    `Titik potong sumbu X adalah (${neg(p)}, 0) dan titik potong sumbu Y adalah (0, ${neg(yInt)}).`,
    {
      math: eqStr(line.a, line.b, line.c),
      fillFields: [
        { key: "x", label: "x, untuk titik (x, 0)" },
        { key: "y", label: "y, untuk titik (0, y)" },
      ],
      explainSteps: steps,
    });
  q.check = fillCheck({ x: p, y: yInt }, { x: "titik potong sumbu X", y: "titik potong sumbu Y" },
    [["x", "y", "Kedua nilai tertukar. Titik potong sumbu X berbentuk (x, 0) dan sumbu Y berbentuk (0, y)."]]);
  return q;
}

// ════════════════ SUB-BAB 3 ═════════════════════════════════════════════════
// Catatan: sub-bab ini BELUM membahas arsiran — fokus pada garis & titik potong.

function sub3Ineq(): IneqSpec {
  const p = ri(2, 6);
  const q = ri(2, 6);
  const negY = Math.random() < 0.35;
  return simp({ ...lineFromIntercepts(p, negY ? -q : q), sign: pick<Sign>(["<=", ">=", "<", ">"]) });
}

function t31(): Question {
  const ineq = sub3Ineq();
  const dashed = isDashed(ineq.sign);
  const correctLabel = dashed ? "Garis putus-putus" : "Garis penuh";
  const variants = shuffle([
    { label: "Garis penuh", ok: !dashed },
    { label: "Garis putus-putus", ok: dashed },
    { label: "Garis bergelombang", ok: false },
    { label: "Tidak perlu menggambar garis", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (v.ok) return;
    notes[`o${i}`] =
      v.label === "Garis penuh"
        ? "Tanda < atau > TIDAK memuat \"sama dengan\", sehingga garisnya putus-putus."
        : v.label === "Garis putus-putus"
        ? "Tanda ≤ atau ≥ MEMUAT \"sama dengan\", sehingga garisnya penuh."
        : v.label === "Garis bergelombang"
        ? "Tidak ada gaya garis bergelombang pada grafik PtLDV."
        : "Garis pembatas wajib digambar karena ia memisahkan kedua daerah.";
  });
  const q = baseQ(3, "3.1", "mc",
    "Jenis garis pembatas yang tepat untuk pertidaksamaan berikut adalah…",
    [
      "Perhatikan tanda relasi pada soal: apakah memuat unsur \"sama dengan\" atau tidak?",
      "Tanda ≤ dan ≥ memuat \"sama dengan\", sehingga titik-titik tepat pada garis IKUT menjadi penyelesaian. Tanda < dan > tidak memuatnya.",
      "Tanyakan pada dirimu: untuk tanda yang ada di soal ini, apakah titik pada garis ikut menjadi penyelesaian? Bila ikut, garis digambar utuh; bila tidak ikut, garis digambar terputus-putus.",
    ],
    `Tanda ${SYM[ineq.sign]} ${dashed ? "tidak memuat" : "memuat"} unsur "sama dengan", sehingga garis pembatas digambar ${dashed ? "putus-putus" : "penuh"}.`,
    {
      math: ineqStr(ineq),
      mcOptions: opts,
      explainSteps:
        `${ineqStr(ineq)}\n` +
        `> Tanda relasinya adalah ${SYM[ineq.sign]}.\n` +
        (dashed
          ? "> Tanda ini TIDAK memuat \"sama dengan\", artinya titik-titik tepat pada garis tidak ikut menjadi penyelesaian.\n> Kesimpulan: GARIS PUTUS-PUTUS."
          : "> Tanda ini MEMUAT \"sama dengan\", artinya titik-titik tepat pada garis ikut menjadi penyelesaian.\n> Kesimpulan: GARIS PENUH."),
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  void correctLabel;
  return q;
}

function t32(): Question {
  // Memilih grafik dari titik potong + jenis garis (BELUM ada arsiran)
  const p = ri(2, 6), q0 = ri(2, 6);
  const sign = pick<Sign>(["<=", ">=", "<", ">"]);
  const dashed = isDashed(sign);
  const line = intLine(p, q0);
  const wrongLine = lineFromIntercepts(q0 === p ? p + 2 : q0, p); // titik potong tertukar (distraktor visual)
  const xr = rangeFor([p, q0, wrongLine.c / wrongLine.a]);
  const yr = rangeFor([q0, p, wrongLine.c / wrongLine.b]);
  const mk = (l: { a: number; b: number; c: number }, dash: boolean): CanvasSpec => ({
    xRange: xr, yRange: yr,
    lines: [{ ...l, sign: "<=", dashed: dash }],
    points: [
      { p: pt(l.c / l.a, 0), hollow: true },
      { p: pt(0, l.c / l.b), hollow: true },
    ],
  });
  const variants = shuffle([
    { spec: mk(line, dashed), why: "", ok: true },
    { spec: mk(line, !dashed), why: `Titik potongnya benar, tetapi jenis garisnya keliru. Tanda ${SYM[sign]} seharusnya digambar ${dashed ? "putus-putus" : "penuh"}.`, ok: false },
    { spec: mk(wrongLine, dashed), why: `Jenis garis benar, tetapi titik potongnya tertukar. Seharusnya memotong sumbu X di (${p}, 0) dan sumbu Y di (0, ${q0}).`, ok: false },
    { spec: mk(wrongLine, !dashed), why: "Titik potong dan jenis garis keduanya keliru.", ok: false },
  ]);
  const steps =
    `${eqStr(line.a, line.b, line.c, SYM[sign])}\n` +
    `> Ubah menjadi persamaan garis pembatas:\n${eqStr(line.a, line.b, line.c)}\n` +
    `${stepsInterceptX(line.a, line.b, line.c)}\n${stepsInterceptY(line.a, line.b, line.c)}\n` +
    `> Tanda ${SYM[sign]} ${dashed ? "tidak memuat" : "memuat"} \"sama dengan\" → garis ${dashed ? "PUTUS-PUTUS" : "PENUH"}.`;
  const q = baseQ(3, "3.2", "graph",
    "Manakah grafik garis pembatas yang TEPAT untuk pertidaksamaan berikut? Perhatikan letak titik potong dan jenis garisnya.",
    [
      "Periksa dua hal pada setiap pilihan: letak kedua titik potong dengan sumbu, dan jenis garisnya.",
      hintInterceptX(line.a, line.b, line.c),
      `${hintInterceptY(line.a, line.b, line.c)}\n> Setelah kedua titik potong diperoleh, tentukan jenis garisnya dari tanda relasi pada soal.`,
    ],
    `Garis melalui (${p}, 0) dan (0, ${q0}), digambar ${dashed ? "putus-putus" : "penuh"} karena tandanya ${SYM[sign]}.`,
    {
      math: eqStr(line.a, line.b, line.c, SYM[sign]),
      graphOptions: variants.map((v) => v.spec),
      explainSteps: steps,
    });
  q.check = graphCheck(variants);
  return q;
}

function t33(): Question {
  const p = ri(2, 6), q0 = ri(2, 6);
  const line = intLine(p, q0);
  const sign = pick<Sign>(["<=", ">="]);
  const steps = `${stepsInterceptX(line.a, line.b, line.c)}\n${stepsInterceptY(line.a, line.b, line.c)}\n> Ketuk kedua titik tersebut, lalu hubungkan menjadi garis pembatas.`;
  const q = baseQ(3, "3.3", "points",
    "Ketuk TEPAT pada dua titik potong garis berikut dengan sumbu koordinat (urutan bebas).",
    [
      "Carilah satu titik pada sumbu X (dengan y = 0) dan satu titik pada sumbu Y (dengan x = 0).",
      hintInterceptX(line.a, line.b, line.c),
      hintInterceptY(line.a, line.b, line.c),
    ],
    `Kedua titik potongnya adalah (${p}, 0) dan (0, ${q0}).`,
    {
      math: eqStr(line.a, line.b, line.c, SYM[sign]),
      canvas: { xRange: rangeFor([p, q0]), yRange: rangeFor([q0, p]) },
      needPoints: 2,
      tapPointsLabel: "Ketuk 2 titik potong",
      explainSteps: steps,
    });
  q.check = pointsCheck([pt(p, 0), pt(0, q0)], 2);
  return q;
}

// ════════════════ SUB-BAB 4 ═════════════════════════════════════════════════

function sub4Ineq(): IneqSpec {
  const p = ri(3, 6);
  let q0 = ri(3, 6);
  // pastikan p ≠ q0 supaya distraktor "koefisien tertukar" tidak kembar dengan kunci
  while (q0 === p) q0 = ri(3, 6);
  return simp({ ...lineFromIntercepts(p, q0), sign: pick<Sign>(["<=", ">="]) });
}

function t41(): Question {
  const ineq = sub4Ineq();
  const inside = Math.random() < 0.5;
  let tp = inside ? pt(ri(0, 2), ri(0, 2)) : pt(ri(4, 7), ri(4, 7));
  if (inside !== satisfies(tp, ineq)) tp = inside ? pt(0, 0) : pt(7, 7);
  const r = stepsTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], tp.x, tp.y);
  const opts = shuffle([{ id: "ya", label: "Ya, titik tersebut memenuhi" }, { id: "no", label: "Tidak memenuhi" }]);
  const q = baseQ(4, "4.1", "mc",
    `Apakah titik (${tp.x}, ${tp.y}) memenuhi pertidaksamaan berikut?`,
    [
      "Substitusikan nilai x dan y dari titik tersebut ke ruas kiri pertidaksamaan.",
      hintTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], tp.x, tp.y),
      "Hitung hasil ruas kiri dengan teliti, lalu bandingkan dengan ruas kanan sesuai tandanya. Jika pernyataan yang terbentuk bernilai benar, berarti titik itu memenuhi pertidaksamaan.",
    ],
    `Hasil substitusi memberi ${neg(r.lhs)} ${SYM[ineq.sign]} ${neg(ineq.c)} yang bernilai ${r.ok ? "BENAR" : "SALAH"}, sehingga titik (${tp.x}, ${tp.y}) ${r.ok ? "memenuhi" : "tidak memenuhi"} pertidaksamaan.`,
    {
      math: ineqStr(ineq),
      canvas: specFor([ineq], { shadeIndices: [0], crosshair: tp }),
      mcOptions: opts,
      explainSteps: r.text,
    });
  q.check = mcCheck(r.ok ? "ya" : "no", {
    [r.ok ? "no" : "ya"]: `Periksa kembali substitusimu: ${ineq.a}(${tp.x}) + ${ineq.b}(${tp.y}) = ${neg(r.lhs)}.`,
  });
  return q;
}

function t42(): Question {
  const ineq = sub4Ineq();
  const r = stepsTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], 0, 0);
  const variants = shuffle([
    {
      label: "Hasil ujinya BENAR, sehingga daerah penyelesaian adalah sisi garis yang MEMUAT titik (0, 0)",
      ok: r.ok,
      why: "Coba hitung ulang: hasil substitusi (0, 0) ternyata bernilai SALAH, jadi titik asal tidak termasuk penyelesaian.",
    },
    {
      label: "Hasil ujinya SALAH, sehingga daerah penyelesaian adalah sisi garis yang TIDAK memuat titik (0, 0)",
      ok: !r.ok,
      why: "Coba hitung ulang: hasil substitusi (0, 0) ternyata bernilai BENAR, jadi titik asal termasuk penyelesaian.",
    },
    {
      label: "Daerah penyelesaiannya hanya titik-titik yang tepat berada pada garis",
      ok: false,
      why: "Pertidaksamaan menghasilkan sebuah DAERAH (setengah bidang), bukan hanya garisnya saja.",
    },
    {
      label: "Seluruh bidang koordinat merupakan daerah penyelesaian",
      ok: false,
      why: "Garis pembatas membagi bidang menjadi dua; hanya satu sisi yang menjadi penyelesaian.",
    },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(4, "4.2", "mc",
    "Lakukan uji titik (0, 0) pada pertidaksamaan berikut. Manakah kesimpulan yang BENAR?",
    [
      "Substitusikan x = 0 dan y = 0 ke pertidaksamaan, lalu nilai kebenaran pernyataan yang terbentuk.",
      hintTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], 0, 0),
      "Aturannya: bila hasil uji BENAR, titik (0, 0) termasuk penyelesaian sehingga daerah penyelesaian berada di sisi yang memuatnya. Bila hasil uji SALAH, daerah penyelesaian berada di sisi seberangnya. Sekarang hitung hasil ujimu dan tentukan pilihannya.",
    ],
    `Uji titik (0, 0) menghasilkan pernyataan ${r.ok ? "BENAR" : "SALAH"}, sehingga daerah penyelesaiannya adalah sisi garis yang ${r.ok ? "MEMUAT" : "TIDAK memuat"} titik (0, 0).`,
    {
      math: ineqStr(ineq),
      canvas: specFor([ineq], { crosshair: pt(0, 0) }),
      mcOptions: opts,
      explainSteps:
        `${r.text}\n` +
        `> Aturan penarikan kesimpulan:\n` +
        `> Jika hasil uji BENAR → titik uji termasuk penyelesaian → daerah penyelesaian ada di sisi yang memuat titik itu.\n` +
        `> Jika hasil uji SALAH → titik uji tidak termasuk penyelesaian → daerah penyelesaian ada di sisi seberangnya.\n` +
        `> Pada soal ini hasilnya ${r.ok ? "BENAR" : "SALAH"}, jadi daerah penyelesaian ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t43(): Question {
  const ineq = sub4Ineq();
  const r = stepsTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], 0, 0);
  const base = specFor([ineq], { shadeIndices: [0] });
  const mk = (i: IneqSpec): CanvasSpec => ({ ...base, lines: [i], shadeIndices: [0] });
  const variants = shuffle([
    { spec: mk(ineq), why: "", ok: true },
    { spec: mk({ ...ineq, sign: flip(ineq.sign) }), why: "Sisi yang diarsir terbalik. Periksa: yang diarsir haruslah daerah penyelesaian sesuai hasil uji titik.", ok: false },
    { spec: mk({ ...ineq, dashed: true }), why: "Jenis garisnya keliru — tanda ≤ atau ≥ digambar dengan garis penuh.", ok: false },
    { spec: mk({ a: ineq.b, b: ineq.a, c: ineq.c, sign: ineq.sign }), why: "Garis pembatasnya bukan yang diminta; periksa kembali kedua titik potongnya.", ok: false },
  ]);
  const q = baseQ(4, "4.3", "graph",
    "Manakah gambar yang TEPAT untuk pertidaksamaan berikut? (daerah berwarna = daerah penyelesaian)",
    [
      "Tentukan dahulu garis pembatasnya melalui kedua titik potong, kemudian lakukan uji titik (0, 0).",
      `${hintInterceptX(ineq.a, ineq.b, ineq.c)}\n${hintInterceptY(ineq.a, ineq.b, ineq.c)}`,
      `${hintTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], 0, 0)}\n> Ingat konvensinya: yang DIARSIR adalah daerah penyelesaian. Sisi mana yang diarsir ditentukan oleh hasil uji titik (0, 0).`,
    ],
    `Garis penuh melalui (${num(ineq.c / ineq.a)}, 0) dan (0, ${num(ineq.c / ineq.b)}), dengan daerah penyelesaian (yang diarsir) di sisi yang ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).`,
    {
      math: ineqStr(ineq),
      graphOptions: variants.map((v) => v.spec),
      explainSteps:
        `${stepsInterceptX(ineq.a, ineq.b, ineq.c)}\n${stepsInterceptY(ineq.a, ineq.b, ineq.c)}\n${r.text}\n` +
        `> Karena hasil uji ${r.ok ? "BENAR" : "SALAH"}, daerah penyelesaian ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).\n` +
        `> Arsiran diletakkan tepat pada daerah penyelesaian yang dipilih oleh uji titik.`,
    });
  q.check = graphCheck(variants);
  return q;
}

// ════════════════ SUB-BAB 5 ═════════════════════════════════════════════════

function t51(): Question {
  const a1 = ri(1, 4), b1 = ri(1, 4), c1 = ri(6, 14);
  const a2 = ri(1, 4), b2 = ri(1, 4), c2 = ri(5, 14);
  const sysText = `${linExpr(a1, b1)} ≤ ${c1} ; ${linExpr(a2, b2)} ≥ ${c2} ; x ≥ 0 ; y ≥ 0`;
  const variants = shuffle([
    { label: sysText, why: "", ok: true },
    { label: `${linExpr(a1, b1)} ≤ ${c1} ; ${a2}x² + y ≤ ${c2}`, why: "Kendala kedua memuat x berpangkat dua sehingga tidak linear.", ok: false },
    { label: `${linExpr(a1, b1)} = ${c1} ; ${linExpr(a2, b2)} = ${c2}`, why: "Keduanya memakai tanda sama dengan, jadi ini sistem PERSAMAAN.", ok: false },
    { label: `${a1}x ≤ ${c1} ; ${a2}y ≥ ${c2}`, why: "Masing-masing hanya memuat satu variabel, bukan dua variabel.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(5, "5.1", "mc",
    "Manakah yang merupakan Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV)?",
    [
      "SPtLDV terdiri atas dua PtLDV atau lebih yang berlaku secara bersamaan.",
      "Periksa setiap opsi: adakah variabel berpangkat dua? adakah yang memakai tanda sama dengan? adakah pertidaksamaan yang hanya memuat satu variabel?",
      "Coret semua opsi yang melanggar syarat tersebut. Opsi yang seluruh pertidaksamaannya linear, bervariabel dua, dan bertanda ketidaksamaan itulah jawabannya.",
    ],
    "SPtLDV harus terdiri atas beberapa pertidaksamaan yang semuanya linear, memuat dua variabel, dan berlaku secara bersamaan.",
    { mcOptions: opts });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t52(): Question {
  const variants = shuffle([
    { label: "Irisan dari semua daerah penyelesaian tiap pertidaksamaan", ok: true, why: "" },
    { label: "Gabungan dari semua daerah penyelesaian tiap pertidaksamaan", ok: false, why: "Gabungan berarti cukup memenuhi salah satu kendala, padahal semua kendala harus dipenuhi bersamaan." },
    { label: "Hanya titik perpotongan garis-garis pembatasnya", ok: false, why: "Perpotongan garis hanyalah beberapa titik, sedangkan DHP berupa sebuah daerah." },
    { label: "Daerah di luar semua garis pembatas", ok: false, why: "Daerah di luar justru melanggar kendala-kendala yang bertanda ≤." },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(5, "5.2", "mc",
    "Daerah Himpunan Penyelesaian (DHP) dari sebuah SPtLDV adalah…",
    [
      "Setiap kendala pada sistem menghasilkan satu daerah penyelesaian tersendiri.",
      "Sebuah titik disebut penyelesaian sistem hanya jika memenuhi SEMUA kendala sekaligus, bukan cukup salah satu.",
      "Bandingkan makna dua istilah dalam teori himpunan: \"gabungan\" berarti cukup menjadi anggota salah satu, sedangkan \"irisan\" berarti harus menjadi anggota semuanya. Mana yang sesuai dengan syarat di atas?",
    ],
    "Karena setiap titik penyelesaian harus memenuhi seluruh kendala secara bersamaan, DHP merupakan IRISAN dari semua daerah penyelesaian.",
    { mcOptions: opts });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t53(): Question {
  const a1 = ri(1, 4), b1 = ri(1, 4), c1 = ri(6, 14);
  const a2 = ri(1, 4), b2 = ri(1, 4), c2 = ri(5, 14);
  const sysText = `${linExpr(a1, b1)} ≤ ${c1} ;  ${linExpr(a2, b2)} ≥ ${c2} ;  x ≥ 0 ;  y ≥ 0`;
  const variants = shuffle([
    { label: "4 kendala, dengan 2 di antaranya merupakan kendala non negatif", ok: true, why: "" },
    { label: "2 kendala, karena x ≥ 0 dan y ≥ 0 tidak dihitung sebagai kendala", ok: false, why: "Kendala x ≥ 0 dan y ≥ 0 tetap dihitung sebagai kendala karena ikut membatasi daerah penyelesaian." },
    { label: "1 kendala, karena semuanya digabung menjadi satu sistem", ok: false, why: "Sebuah sistem tetap terdiri atas beberapa kendala terpisah, bukan satu kendala." },
    { label: "4 kendala, dan semuanya merupakan kendala non negatif", ok: false, why: "Kendala non negatif hanyalah x ≥ 0 dan y ≥ 0, sedangkan dua kendala lainnya adalah kendala sumber daya." },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(5, "5.3", "mc",
    "Perhatikan sistem berikut. Ada berapa kendala di dalamnya, dan apa jenis dua kendala terakhirnya?",
    [
      "Hitung seluruh baris pertidaksamaan pada sistem, jangan ada yang terlewat.",
      "Kendala x ≥ 0 dan y ≥ 0 juga dihitung, karena keduanya ikut membatasi daerah penyelesaian.",
      "Dua kendala terakhir memiliki nama khusus. Keduanya menyatakan bahwa nilai variabel tidak boleh kurang dari nol.",
    ],
    "Sistem itu memuat 4 kendala. Dua yang pertama adalah kendala sumber daya, sedangkan x ≥ 0 dan y ≥ 0 disebut kendala non negatif.",
    {
      math: sysText,
      mcOptions: opts,
      explainSteps:
        "> Hitung seluruh baris kendalanya:\n" +
        `${linExpr(a1, b1)} ≤ ${c1}   …kendala 1\n` +
        `${linExpr(a2, b2)} ≥ ${c2}   …kendala 2\n` +
        "x ≥ 0   …kendala 3 (non negatif)\n" +
        "y ≥ 0   …kendala 4 (non negatif)\n" +
        "> Jumlah seluruhnya 4 kendala, dua di antaranya kendala non negatif.",
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

// ════════════════ SUB-BAB 6 ═════════════════════════════════════════════════

function t61(): Question {
  const sys = integerCornerSystem(true);
  const [l1, l2] = sys.lines;
  const mm = stepsMixedMethod(l1, l2, { eliminate: Math.abs(l1.a) === Math.abs(l2.a) ? "x" : "y" });
  const q = baseQ(6, "6.1", "fill",
    "Tentukan titik potong kedua garis pembatas berikut menggunakan METODE CAMPURAN (eliminasi lalu substitusi).",
    [
      "Metode campuran: hilangkan dahulu satu variabel dengan ELIMINASI, kemudian cari variabel sisanya dengan SUBSTITUSI.",
      "Samakan koefisien salah satu variabel lebih dahulu. Bila koefisiennya bertanda sama, kurangkan kedua persamaan; bila berlawanan tanda, jumlahkan.",
      hintMixedMethod(l1, l2, Math.abs(l1.a) === Math.abs(l2.a) ? "x" : "y"),
    ],
    `Melalui eliminasi kemudian substitusi diperoleh titik potong (${num(mm.x)}, ${num(mm.y)}).`,
    {
      math: `${eqStr(l1.a, l1.b, l1.c)}   ;   ${eqStr(l2.a, l2.b, l2.c)}`,
      canvas: specFor([l1, l2], { points: [{ p: pt(mm.x, mm.y), hollow: true }] }),
      fillFields: [{ key: "x", label: "x" }, { key: "y", label: "y" }],
      explainSteps: mm.text,
    });
  q.check = fillCheck({ x: mm.x, y: mm.y }, { x: "x", y: "y" },
    [["x", "y", "Nilai x dan y tertukar. Periksa kembali langkah substitusimu."]]);
  return q;
}

function t62(): Question {
  const sys = integerCornerSystem(true);
  const [l1, l2] = sys.lines;
  const xs = [...sys.corners.map((c) => c.x), l1.c / l1.a, l2.c / l2.a];
  const ys = [...sys.corners.map((c) => c.y), l1.c / l1.b, l2.c / l2.b];
  const XR = rangeFor(xs.filter(Number.isFinite));
  const YR = rangeFor(ys.filter(Number.isFinite));
  const mk = (ineqs: IneqSpec[], lines: IneqSpec[]): CanvasSpec => ({ xRange: XR, yRange: YR, lines, dhpIneqs: ineqs });
  const variants = shuffle([
    { spec: mk(sys.ineqs, sys.lines), why: "", ok: true },
    { spec: mk([{ ...l1, sign: flip(l1.sign) }, l2, ...NON_NEG], sys.lines), why: "Daerah penyelesaian kendala pertama terbalik — lakukan uji titik (0, 0) untuk memastikan sisinya.", ok: false },
    { spec: mk([l1, l2], sys.lines), why: "Kendala x ≥ 0 dan y ≥ 0 belum diterapkan, padahal DHP seharusnya berada di bagian kanan atas bidang.", ok: false },
    { spec: mk(sys.ineqs, [{ ...l1, dashed: true }, l2]), why: "Jenis garis keliru — tanda ≤ digambar dengan garis penuh, bukan putus-putus.", ok: false },
  ]);
  const q = baseQ(6, "6.2", "graph",
    "Manakah gambar DHP yang TEPAT untuk sistem berikut? (arsiran = bukan daerah penyelesaian)",
    [
      "Periksa tiga hal pada setiap pilihan: sisi penyelesaian tiap kendala, penerapan kendala x ≥ 0 dan y ≥ 0, serta jenis garisnya.",
      `Lakukan uji titik (0, 0) pada kedua kendala:\n${hintTestPoint(l1.a, l1.b, l1.c, SYM[l1.sign], 0, 0)}`,
      "Sekarang bandingkan setiap pilihan: apakah daerah ungu (DHP) berada di bagian kanan atas bidang? apakah sisi arsirannya sesuai hasil uji titikmu? apakah jenis garisnya sesuai tanda pada kendala? Hanya satu pilihan yang lolos ketiganya.",
    ],
    "DHP yang benar adalah daerah ungu di bagian kanan atas yang dibatasi oleh kedua garis penuh serta kedua sumbu.",
    {
      math: `${ineqStr(l1)} ;  ${ineqStr(l2)} ;  x ≥ 0 ;  y ≥ 0`,
      graphOptions: variants.map((v) => v.spec),
      explainSteps:
        `> Uji titik (0, 0) pada kendala pertama:\n${stepsTestPoint(l1.a, l1.b, l1.c, SYM[l1.sign], 0, 0).text}\n` +
        `> Uji titik (0, 0) pada kendala kedua:\n${stepsTestPoint(l2.a, l2.b, l2.c, SYM[l2.sign], 0, 0).text}\n` +
        `> Tambahkan kendala x ≥ 0 dan y ≥ 0 yang membatasi daerah pada bagian kanan atas bidang.\n` +
        `> DHP adalah daerah ungu dengan titik pojok: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
    });
  q.check = graphCheck(variants);
  return q;
}

function t63(): Question {
  const sys = integerCornerSystem(true);
  const [l1, l2] = sys.lines;
  const q = baseQ(6, "6.3", "region-tap",
    "Ketuk satu titik berkoordinat bulat yang berada DI DALAM DHP sistem berikut (daerah ungu hasil irisan).",
    [
      "Titik di dalam DHP harus memenuhi SEMUA kendala, termasuk x ≥ 0 dan y ≥ 0.",
      `Pilih sebuah titik percobaan di bagian kanan atas bidang, lalu substitusikan ke setiap kendala:\n${ineqStr(l1)}\n${ineqStr(l2)}`,
      "Perhatikan bahwa kedua kendala bertanda ≤. Artinya semakin kecil nilai x dan y, semakin besar peluang titik itu memenuhi keduanya. Uji dahulu titik pilihanmu dengan substitusi sebelum mengetuk grafik.",
    ],
    "Setiap titik yang memenuhi seluruh kendala berada di dalam DHP, yaitu daerah ungu hasil irisan.",
    {
      math: `${ineqStr(l1)} ;  ${ineqStr(l2)} ;  x ≥ 0 ;  y ≥ 0`,
      canvas: specFor([l1, l2], { dhpIneqs: sys.ineqs }),
      needPoints: 1,
      tapPointsLabel: "Ketuk 1 titik di dalam DHP",
      explainSteps:
        `> Sebuah titik berada di dalam DHP bila memenuhi seluruh kendala:\n` +
        `${ineqStr(l1)}\n${ineqStr(l2)}\nx ≥ 0\ny ≥ 0\n` +
        `> Titik pojok DHP ini: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}. Titik mana pun di dalam daerah ungu tersebut adalah jawaban yang benar.`,
    });
  const checker: CheckFn = (answer) => {
    const taps = (answer ?? []) as Pt[];
    const tap = taps[0];
    if (!tap) return { ok: false, note: "Ketuk satu titik pada grafik." };
    const s = pt(Math.round(tap.x), Math.round(tap.y));
    const ok = sys.ineqs.every((i) => satisfies(s, i));
    if (ok) return { ok: true };
    const viol = sys.ineqs.find((i) => !satisfies(s, i));
    return { ok: false, note: `Titik (${s.x}, ${s.y}) melanggar kendala ${viol ? ineqStr(viol) : "sistem"}.` };
  };
  // kunci: salah satu titik lattice yang pasti berada di dalam DHP
  const inside: Pt[] = [];
  for (let gx = 0; gx <= 14 && inside.length === 0; gx++) {
    for (let gy = 0; gy <= 14 && inside.length === 0; gy++) {
      const c = pt(gx, gy);
      if (sys.ineqs.every((i) => satisfies(c, i))) inside.push(c);
    }
  }
  checker.key = inside.length ? [inside[0]] : [sys.corners[0]];
  q.check = checker;
  return q;
}

// ════════════════ SUB-BAB 7 ═════════════════════════════════════════════════

function cornerSpec(sys: { ineqs: IneqSpec[]; lines: IneqSpec[]; corners: Pt[] }, extra: Partial<CanvasSpec> = {}): CanvasSpec {
  // sertakan titik potong tiap garis dengan sumbu agar garis tergambar utuh
  const xs = [...sys.corners.map((c) => c.x)];
  const ys = [...sys.corners.map((c) => c.y)];
  for (const l of sys.lines) {
    if (l.a !== 0) xs.push(l.c / l.a);
    if (l.b !== 0) ys.push(l.c / l.b);
  }
  return {
    xRange: rangeFor(xs), yRange: rangeFor(ys),
    lines: sys.lines, dhpIneqs: sys.ineqs, ...extra,
  };
}

function t71(): Question {
  let sys = integerCornerSystem();
  // opsi jawaban hanya 2–5 titik, jadi pastikan jumlah pojoknya berada di rentang itu
  for (let i = 0; i < 30 && (sys.corners.length < 3 || sys.corners.length > 5); i++) {
    sys = integerCornerSystem();
  }
  const n = Math.min(Math.max(sys.corners.length, 2), 5);
  const opts = [2, 3, 4, 5].map((k, i) => ({ id: `o${i}`, label: `${k} titik`, k }));
  const q = baseQ(7, "7.1", "mc",
    "Perhatikan DHP (daerah ungu yang diarsir) pada grafik. Berapa banyak titik pojok yang dimilikinya?",
    [
      "Titik pojok adalah sudut-sudut dari daerah ungu tersebut. Telusuri tepinya satu putaran penuh.",
      "Perhatikan setiap kali tepi daerah berbelok arah — di setiap belokan itulah terdapat sebuah titik pojok.",
      "Jangan sampai ada yang terlewat: hitung juga sudut yang dibentuk oleh sumbu X dengan sumbu Y, sudut tempat garis kendala memotong sumbu, serta sudut tempat dua garis kendala berpotongan.",
    ],
    `DHP ini memiliki ${n} sudut, yaitu di ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
    {
      canvas: cornerSpec(sys, { points: sys.corners.map((c) => ({ p: c, hollow: true, color: "#7C3AED" })) }),
      mcOptions: opts.map(({ id, label }) => ({ id, label })),
      explainSteps:
        `> Telusuri tepi daerah ungu dan catat setiap sudutnya:\n` +
        sys.corners.map((c, i) => `> Sudut ke-${i + 1}: (${num(c.x)}, ${num(c.y)})`).join("\n") +
        `\n> Banyaknya titik pojok = ${n}.`,
    });
  q.check = mcCheck(opts.find((o) => o.k === n)?.id ?? "o1", {});
  return q;
}

function t72(): Question {
  const sys = integerCornerSystem();
  const need = sys.corners.length;
  const q = baseQ(7, "7.2", "points",
    `Ketuk SEMUA titik pojok DHP berikut (${need} titik, urutan bebas).`,
    [
      "Mulailah dari sudut yang paling mudah dibaca, yaitu perpotongan kedua sumbu dan perpotongan garis dengan sumbu.",
      "Setelah itu, perhatikan sudut tempat dua garis kendala saling berpotongan — pastikan titik tersebut masih berada pada tepi daerah ungu.",
      "Periksa ulang hasilmu: setiap titik pojok harus merupakan pertemuan dua garis pembatas DAN harus memenuhi seluruh kendala. Titik yang berada di luar daerah ungu bukan titik pojok.",
    ],
    `Titik pojok DHP ini adalah ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
    {
      canvas: cornerSpec(sys),
      needPoints: need,
      tapPointsLabel: `Ketuk ${need} titik pojok`,
      explainSteps:
        `> Titik pojok berasal dari perpotongan dua garis pembatas yang masih di dalam DHP:\n` +
        sys.corners.map((c, i) => `> Titik pojok ${i + 1}: (${num(c.x)}, ${num(c.y)})`).join("\n"),
    });
  q.check = pointsCheck(sys.corners, need);
  return q;
}

function t73(): Question {
  // Titik pojok dari perpotongan DUA GARIS → wajib metode campuran
  const sys = integerCornerSystem(true);
  const [l1, l2] = sys.lines;
  const ip = intersectLines(l1, l2)!;
  const mm = stepsMixedMethod(l1, l2, { eliminate: Math.abs(l1.a) === Math.abs(l2.a) ? "x" : "y" });
  const q = baseQ(7, "7.3", "fill",
    "Tentukan titik pojok DHP yang merupakan perpotongan KEDUA garis kendala. Gunakan metode campuran (eliminasi lalu substitusi).",
    [
      "Titik pojok ini tidak berada pada sumbu, sehingga harus dihitung dengan menyelesaikan kedua persamaan garisnya.",
      "Gunakan metode campuran: ELIMINASI lebih dahulu untuk menghilangkan satu variabel, kemudian SUBSTITUSI untuk mencari variabel sisanya.",
      hintMixedMethod(l1, l2, Math.abs(l1.a) === Math.abs(l2.a) ? "x" : "y"),
    ],
    `Perpotongan kedua garis kendala berada di titik (${num(ip.x)}, ${num(ip.y)}), dan titik ini memenuhi seluruh kendala sehingga merupakan titik pojok DHP.`,
    {
      math: `${eqStr(l1.a, l1.b, l1.c)}   ;   ${eqStr(l2.a, l2.b, l2.c)}`,
      canvas: cornerSpec(sys),
      fillFields: [{ key: "x", label: "x" }, { key: "y", label: "y" }],
      explainSteps:
        `${mm.text}\n` +
        `> Periksa apakah titik ini memenuhi seluruh kendala:\n` +
        `> (${num(ip.x)}, ${num(ip.y)}) memenuhi semua kendala → benar merupakan titik pojok DHP.`,
    });
  q.check = fillCheck({ x: ip.x, y: ip.y }, { x: "x", y: "y" },
    [["x", "y", "Nilai x dan y tertukar. Periksa kembali hasil substitusimu."]]);
  return q;
}

// ════════════════ SUB-BAB 8 ═════════════════════════════════════════════════

function t81(): Question {
  const x0 = ri(2, 6), y0 = ri(1, 5);
  const l1 = { a: 1, b: 1, c: x0 + y0 };
  const l2 = { a: 1, b: -1, c: x0 - y0 };
  const mm = stepsMixedMethod(l1, l2, { eliminate: "x" });
  const q = baseQ(8, "8.1", "fill",
    "Tentukan titik potong kedua garis berikut dengan metode campuran (eliminasi lalu substitusi).",
    [
      "Amati koefisien x pada kedua persamaan. Bila sudah sama, eliminasi dapat langsung dilakukan tanpa perlu mengalikan apa pun.",
      "Koefisien yang bertanda sama dihilangkan dengan cara MENGURANGKAN kedua persamaan; koefisien yang berlawanan tanda dihilangkan dengan MENJUMLAHKAN.",
      hintMixedMethod(l1, l2, "x"),
    ],
    `Eliminasi menghasilkan nilai salah satu variabel, lalu substitusi memberikan variabel lainnya, yaitu titik (${num(mm.x)}, ${num(mm.y)}).`,
    {
      math: `${eqStr(l1.a, l1.b, l1.c)}   ;   ${eqStr(l2.a, l2.b, l2.c)}`,
      fillFields: [{ key: "x", label: "x" }, { key: "y", label: "y" }],
      explainSteps: mm.text,
    });
  q.check = fillCheck({ x: mm.x, y: mm.y }, { x: "x", y: "y" },
    [["x", "y", "Nilai x dan y tertukar."]]);
  return q;
}

function t82(): Question {
  const x0 = ri(2, 5), y0 = ri(2, 5);
  const l1 = { a: 1, b: 1, c: x0 + y0 };
  const l2 = { a: 2, b: 3, c: 2 * x0 + 3 * y0 };
  const mm = stepsMixedMethod(l1, l2, { eliminate: "x" });
  const q = baseQ(8, "8.2", "fill",
    "Tentukan titik potong kedua garis berikut. Samakan dahulu koefisiennya, lalu gunakan metode campuran.",
    [
      "Koefisien x pada kedua persamaan belum sama, sehingga harus disamakan terlebih dahulu sebelum dieliminasi.",
      "Kalikan salah satu persamaan dengan bilangan yang tepat agar koefisien x-nya menjadi sama besar, lalu lakukan eliminasi.",
      hintMixedMethod(l1, l2, "x"),
    ],
    `Setelah koefisien disamakan, eliminasi dan substitusi menghasilkan titik potong (${num(mm.x)}, ${num(mm.y)}).`,
    {
      math: `${eqStr(l1.a, l1.b, l1.c)}   ;   ${eqStr(l2.a, l2.b, l2.c)}`,
      fillFields: [{ key: "x", label: "x" }, { key: "y", label: "y" }],
      explainSteps: mm.text,
    });
  q.check = fillCheck({ x: mm.x, y: mm.y }, { x: "x", y: "y" });
  return q;
}

function t83(): Question {
  // melibatkan garis bergradien positif (koefisien negatif)
  const x0 = ri(2, 5), y0 = ri(2, 6);
  const l1 = { a: -1, b: 1, c: y0 - x0 };  // y = x + k
  const l2 = { a: 2, b: 1, c: 2 * x0 + y0 };
  const mm = stepsMixedMethod(l1, l2, { eliminate: "y" });
  const q = baseQ(8, "8.3", "fill",
    "Tentukan titik potong kedua garis berikut dengan metode campuran. Perhatikan adanya koefisien negatif.",
    [
      "Amati koefisien y pada kedua persamaan — variabel inilah yang paling mudah dieliminasi.",
      "Berhati-hatilah dengan koefisien negatif. Mengurangkan bilangan negatif sama artinya dengan menjumlahkan bilangan positifnya.",
      hintMixedMethod(l1, l2, "y"),
    ],
    `Eliminasi y kemudian substitusi menghasilkan titik potong (${num(mm.x)}, ${num(mm.y)}).`,
    {
      math: `${eqStr(l1.a, l1.b, l1.c)}   ;   ${eqStr(l2.a, l2.b, l2.c)}`,
      fillFields: [{ key: "x", label: "x" }, { key: "y", label: "y" }],
      explainSteps: mm.text,
    });
  q.check = fillCheck({ x: mm.x, y: mm.y }, { x: "x", y: "y" });
  return q;
}

// ════════════════ SUB-BAB 9 ═════════════════════════════════════════════════

function sub9Setup() {
  const sys = integerCornerSystem(true);
  const fa = ri(2, 6), fb = ri(2, 6);
  const corners = sys.corners;
  const values = corners.map((c) => fa * c.x + fb * c.y);
  const maxV = Math.max(...values), minV = Math.min(...values);
  return {
    sys, fa, fb, corners, values, maxV, minV,
    maxPt: corners[values.indexOf(maxV)],
    minPt: corners[values.indexOf(minV)],
  };
}

function tableSteps(fa: number, fb: number, corners: Pt[]): string {
  return corners
    .map((c) => `f(${num(c.x)}, ${num(c.y)}) = ${fa}(${num(c.x)}) + ${fb}(${num(c.y)})\nf(${num(c.x)}, ${num(c.y)}) = ${num(fa * c.x + fb * c.y)}`)
    .join("\n");
}

function t91(): Question {
  const fa = ri(2, 7), fb = ri(2, 7);
  const p = pt(ri(1, 6), ri(1, 6));
  const val = fa * p.x + fb * p.y;
  const steps = `f(x, y) = ${fa}x + ${fb}y\n> Substitusikan titik (${p.x}, ${p.y}):\nf(${p.x}, ${p.y}) = ${fa}(${p.x}) + ${fb}(${p.y})\nf(${p.x}, ${p.y}) = ${fa * p.x} + ${fb * p.y}\nf(${p.x}, ${p.y}) = ${val}`;
  const q = baseQ(9, "9.1", "fill",
    `Tentukan nilai fungsi tujuan f(x, y) = ${fa}x + ${fb}y pada titik (${p.x}, ${p.y}).`,
    [
      "Menghitung nilai fungsi tujuan berarti mensubstitusikan koordinat titik ke dalam rumus f(x, y).",
      hintObjective(fa, fb, p),
      "Kerjakan kedua perkalian lebih dahulu, kemudian jumlahkan hasilnya. Perhatikan urutan operasi ini agar tidak keliru.",
    ],
    `Substitusi memberikan f(${p.x}, ${p.y}) = ${fa * p.x} + ${fb * p.y} = ${val}.`,
    {
      math: `f(x, y) = ${fa}x + ${fb}y`,
      fillFields: [{ key: "v", label: "nilai f" }],
      explainSteps: steps,
    });
  q.check = fillCheck({ v: val }, { v: "nilai f" });
  return q;
}

function t92(): Question {
  const s = sub9Setup();
  const set = new Set<number>([s.maxV, s.minV, ...s.values]);
  while (set.size < 4) set.add(s.maxV + ri(1, 6));
  const variants = shuffle([...set].slice(0, 4).map((v) => ({ v, ok: v === s.maxV })));
  if (!variants.some((v) => v.ok)) variants[0] = { v: s.maxV, ok: true };
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: num(v.v) }));
  const steps = `${tableSteps(s.fa, s.fb, s.corners)}\n> Bandingkan seluruh nilai: ${s.values.map(num).join(", ")}.\n> Nilai TERBESAR adalah ${num(s.maxV)} di titik (${num(s.maxPt.x)}, ${num(s.maxPt.y)}).`;
  const q = baseQ(9, "9.2", "mc",
    `Titik pojok DHP adalah ${s.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}. Tentukan NILAI MAKSIMUM dari f(x, y) = ${s.fa}x + ${s.fb}y.`,
    [
      "Gunakan metode uji titik pojok: hitung nilai fungsi tujuan pada setiap titik pojok, lalu bandingkan seluruh hasilnya.",
      hintObjective(s.fa, s.fb, s.corners[0]),
      "Pastikan seluruh titik pojok dihitung tanpa ada yang terlewat, lalu susun hasilnya berjajar. Nilai maksimum adalah yang paling besar di antara semuanya — jangan tertukar dengan yang paling kecil.",
    ],
    `Setelah seluruh titik pojok dievaluasi, nilai terbesarnya adalah ${num(s.maxV)} yang dicapai di titik (${num(s.maxPt.x)}, ${num(s.maxPt.y)}).`,
    {
      math: `f(x, y) = ${s.fa}x + ${s.fb}y`,
      canvas: cornerSpec(s.sys, { points: s.corners.map((c) => ({ p: c, color: "#7C3AED", label: `(${num(c.x)}, ${num(c.y)})` })) }),
      mcOptions: opts,
      explainSteps: steps,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, {
    [opts[variants.findIndex((v) => v.v === s.minV && !v.ok)]?.id ?? "-"]:
      `${num(s.minV)} adalah nilai MINIMUM, sedangkan yang diminta adalah nilai maksimum.`,
  });
  return q;
}

function t93(): Question {
  const s = sub9Setup();
  const steps =
    `${tableSteps(s.fa, s.fb, s.corners)}\n` +
    `> Nilai terbesar (MAKSIMUM) adalah ${num(s.maxV)} di titik (${num(s.maxPt.x)}, ${num(s.maxPt.y)}).\n` +
    `> Nilai terkecil (MINIMUM) adalah ${num(s.minV)} di titik (${num(s.minPt.x)}, ${num(s.minPt.y)}).`;
  const q = baseQ(9, "9.3", "fill",
    `Dengan titik pojok ${s.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")} dan f(x, y) = ${s.fa}x + ${s.fb}y, tentukan nilai maksimum dan minimumnya.`,
    [
      "Susun tabel evaluasi: hitung nilai fungsi tujuan pada setiap titik pojok satu per satu.",
      hintObjective(s.fa, s.fb, s.corners[0]),
      "Setelah seluruh nilai diperoleh, urutkan dari yang terkecil hingga terbesar. Nilai terbesar menjadi maksimum dan nilai terkecil menjadi minimum — perhatikan jangan sampai tertukar saat menuliskannya.",
    ],
    `Nilai maksimum ${num(s.maxV)} dicapai di (${num(s.maxPt.x)}, ${num(s.maxPt.y)}), dan nilai minimum ${num(s.minV)} dicapai di (${num(s.minPt.x)}, ${num(s.minPt.y)}).`,
    {
      math: `f(x, y) = ${s.fa}x + ${s.fb}y`,
      // titik pojok ditandai tanpa label nilai f — siswa yang harus menghitungnya
      canvas: cornerSpec(s.sys, { points: s.corners.map((c) => ({ p: c, color: "#7C3AED", hollow: true })) }),
      fillFields: [{ key: "max", label: "nilai maksimum" }, { key: "min", label: "nilai minimum" }],
      explainSteps: steps,
    });
  q.check = fillCheck({ max: s.maxV, min: s.minV }, { max: "maksimum", min: "minimum" },
    [["max", "min", "Tertukar: maksimum adalah nilai terbesar dan minimum adalah nilai terkecil."]]);
  return q;
}

// ════════════════ SUB-BAB 10 ════════════════════════════════════════════════

interface Story {
  A: string; B: string;
  pa1: number; pb1: number; kap1: number; sat1: string;
  pa2: number; pb2: number; kap2: number; sat2: string;
  ua: number; ub: number;
}
/** Semua angka dipilih agar FPB tiap kendala = 1 (bentuk paling sederhana). */
const STORIES: Story[] = [
  { A: "kursi", B: "meja", pa1: 2, pb1: 3, kap1: 18, sat1: "jam kerja", pa2: 1, pb2: 2, kap2: 12, sat2: "peti gudang", ua: 40, ub: 60 },
  { A: "kue bolu", B: "kue brownies", pa1: 2, pb1: 3, kap1: 24, sat1: "ons tepung", pa2: 1, pb2: 2, kap2: 16, sat2: "loyang oven", ua: 5, ub: 4 },
  { A: "kaos", B: "kemeja", pa1: 1, pb1: 2, kap1: 20, sat1: "meter kain", pa2: 1, pb2: 3, kap2: 21, sat2: "kancing", ua: 30, ub: 50 },
];

/** Tabel bantu cerita (monospace) untuk pembahasan Sub-Bab 10. */
function tabelCerita(s: Story): string {
  return tableText({
    header: ["Sumber daya", `${s.A}(x)`, `${s.B}(y)`, "Tersedia"],
    rows: [
      [s.sat1, String(s.pa1), String(s.pb1), String(s.kap1)],
      [s.sat2, String(s.pa2), String(s.pb2), String(s.kap2)],
    ],
  });
}

const kend1 = (s: Story) => `${linExpr(s.pa1, s.pb1)} ≤ ${s.kap1}`;
const kend2 = (s: Story) => `${linExpr(s.pa2, s.pb2)} ≤ ${s.kap2}`;

function t101(): Question {
  const s = pick(STORIES);
  const correct = `x = banyak ${s.A}, y = banyak ${s.B}`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `x = banyak ${s.B}, y = banyak ${s.A}`, why: "Tertukar — objek yang disebut pertama pada soal dimisalkan sebagai x.", ok: false },
    { label: "x = total produksi, y = sisa bahan baku", why: "Variabel harus menyatakan banyaknya masing-masing objek, bukan total atau sisa.", ok: false },
    { label: `x = keuntungan ${s.A}, y = keuntungan ${s.B}`, why: "Keuntungan per unit menjadi bagian fungsi tujuan; variabelnya adalah BANYAKNYA objek.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(10, "10.1", "mc",
    `Sebuah usaha memproduksi ${s.A} dan ${s.B}. Pemisalan variabel yang tepat adalah…`,
    [
      "Variabel harus menyatakan sesuatu yang banyaknya dapat diatur sendiri oleh pelaku usaha.",
      "Harga, keuntungan, total produksi, dan sisa bahan bukanlah variabel — semuanya justru dihitung DARI variabel.",
      "Periksa urutan penyebutan objek pada soal. Objek yang disebut lebih dahulu lazimnya dimisalkan sebagai x, dan objek berikutnya sebagai y. Pastikan pilihanmu tidak tertukar.",
    ],
    `Variabel menyatakan banyaknya objek yang diproduksi, sehingga ${correct}.`,
    { mcOptions: opts });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t102(): Question {
  const s = pick(STORIES);
  const correct = kend1(s);
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `${linExpr(s.pa1, s.pb1)} ≥ ${s.kap1}`, why: "Sumber daya yang \"tersedia\" adalah batas ATAS, sehingga tandanya ≤.", ok: false },
    { label: `${linExpr(s.pb1, s.pa1)} ≤ ${s.kap1}`, why: "Koefisien kebutuhan kedua objek tertukar.", ok: false },
    { label: `${linExpr(s.pa1, s.pb1)} = ${s.kap1}`, why: "Sumber daya tidak harus habis persis; cukup tidak melebihi kapasitas.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(10, "10.2", "mc",
    `Setiap ${s.A} memerlukan ${s.pa1} ${s.sat1} dan setiap ${s.B} memerlukan ${s.pb1} ${s.sat1}. Total yang tersedia adalah ${s.kap1} ${s.sat1}. Kendala yang tepat adalah…`,
    [
      "Susun bentuk total kebutuhannya: (kebutuhan per unit) dikali (banyaknya), untuk kedua objek.",
      `Kebutuhan untuk ${s.A} adalah ${s.pa1 === 1 ? "x" : `${s.pa1}x`} dan kebutuhan untuk ${s.B} adalah ${s.pb1 === 1 ? "y" : `${s.pb1}y`}. Jumlahkan keduanya.`,
      "Sekarang tentukan tandanya. Kata \"tersedia\" menunjukkan batas maksimum: pemakaian boleh kurang dari itu, tetapi tidak boleh melebihi, dan tidak harus habis persis. Pastikan pula koefisiennya tidak tertukar.",
    ],
    `Total kebutuhan ${linExpr(s.pa1, s.pb1)} tidak boleh melebihi ${s.kap1}, sehingga kendalanya adalah ${correct}.`,
    {
      mcOptions: opts,
      explainSteps:
        `> Susun tabel bantu dari data kebutuhan terlebih dahulu:\n${tabelCerita(s)}\n` +
        `> Dari baris tabel, kebutuhan untuk ${s.A}:\n${s.pa1 === 1 ? "x" : `${s.pa1}x`}\n` +
        `> Kebutuhan untuk ${s.B}:\n${s.pb1 === 1 ? "y" : `${s.pb1}y`}\n` +
        `> Total kebutuhan:\n${linExpr(s.pa1, s.pb1)}\n` +
        `> Total tidak boleh melebihi ${s.kap1} ${s.sat1}:\n${correct}`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t103(): Question {
  const s = pick(STORIES);
  const k1 = kend1(s);
  const k2 = kend2(s);
  const obj = `f(x, y) = ${linExpr(s.ua, s.ub)}`;
  const correct = `Maksimumkan ${obj} dengan kendala ${k1} ; ${k2} ; x ≥ 0 ; y ≥ 0`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `Minimumkan ${obj} dengan kendala ${k1} ; ${k2} ; x ≥ 0 ; y ≥ 0`, why: "Keuntungan dicari sebesar-besarnya, jadi dimaksimumkan bukan diminimumkan.", ok: false },
    { label: `Maksimumkan ${obj} dengan kendala ${k1} ; ${k2}`, why: "Kendala non-negatif x ≥ 0 dan y ≥ 0 wajib disertakan karena banyak produksi tidak mungkin negatif.", ok: false },
    { label: `Maksimumkan f(x, y) = ${linExpr(s.ub, s.ua)} dengan kendala ${k1} ; ${k2} ; x ≥ 0 ; y ≥ 0`, why: "Koefisien fungsi tujuan tertukar dengan objeknya.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(10, "10.3", "mc",
    `Keuntungan setiap ${s.A} adalah ${rupiah(s.ua * 1000)} dan setiap ${s.B} adalah ${rupiah(s.ub * 1000)}, dengan kendala ${k1} dan ${k2}. Model matematika LENGKAP yang benar adalah…`,
    [
      "Model lengkap terdiri atas tiga bagian: fungsi tujuan, seluruh kendala sumber daya, dan kendala non-negatif.",
      "Perhatikan kata kuncinya. Keuntungan selalu dicari sebesar-besarnya, sedangkan biaya dicari sekecil-kecilnya.",
      "Periksa setiap opsi dengan tiga pertanyaan: apakah arah optimasinya sudah sesuai? apakah koefisien fungsi tujuannya cocok dengan objeknya? apakah kendala x ≥ 0 dan y ≥ 0 disertakan? Hanya satu opsi yang lolos ketiganya.",
    ],
    `Model lengkap memuat fungsi tujuan ${obj} yang dimaksimumkan, beserta kendala ${k1}, ${k2}, x ≥ 0, dan y ≥ 0.`,
    {
      mcOptions: opts,
      explainSteps:
        `> Susun tabel bantu dari soal cerita:\n${tabelCerita(s)}\n` +
        `> Fungsi tujuan dari keuntungan per unit:\n${obj}\n` +
        `> Kendala sumber daya:\n${k1}\n${k2}\n` +
        `> Kendala non-negatif (wajib ditambahkan):\nx ≥ 0\ny ≥ 0\n` +
        `> Karena yang dicari keuntungan terbesar, fungsi tujuan DIMAKSIMUMKAN.`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}
// ════════════════════════════════════════════════════════════════════════════

const GENERATORS: Record<number, { id: string; gen: () => Question }[]> = {
  1: [
    { id: "1.1", gen: t11 }, { id: "1.2", gen: t12 }, { id: "1.3", gen: t13 },
  ],
  2: [
    { id: "2.1", gen: t21 }, { id: "2.2", gen: t22 }, { id: "2.3", gen: t23 },
  ],
  3: [
    { id: "3.1", gen: t31 }, { id: "3.2", gen: t32 }, { id: "3.3", gen: t33 },
  ],
  4: [
    { id: "4.1", gen: t41 }, { id: "4.2", gen: t42 }, { id: "4.3", gen: t43 },
  ],
  5: [
    { id: "5.1", gen: t51 }, { id: "5.2", gen: t52 }, { id: "5.3", gen: t53 },
  ],
  6: [
    { id: "6.1", gen: t61 }, { id: "6.2", gen: t62 }, { id: "6.3", gen: t63 },
  ],
  7: [
    { id: "7.1", gen: t71 }, { id: "7.2", gen: t72 }, { id: "7.3", gen: t73 },
  ],
  8: [
    { id: "8.1", gen: t81 }, { id: "8.2", gen: t82 }, { id: "8.3", gen: t83 },
  ],
  9: [
    { id: "9.1", gen: t91 }, { id: "9.2", gen: t92 }, { id: "9.3", gen: t93 },
  ],
  10: [
    { id: "10.1", gen: t101 }, { id: "10.2", gen: t102 }, { id: "10.3", gen: t103 },
  ],
};

export function generateQuestion(subbab: number, avoidTemplateId?: string): Question {
  const gens = GENERATORS[Math.min(Math.max(subbab, 1), 10)] ?? GENERATORS[1];
  let q: Question | null = null;
  for (let i = 0; i < 10; i++) {
    const cand = pick(gens).gen();
    if (avoidTemplateId && cand.templateId === avoidTemplateId && gens.length > 1) continue;
    q = cand;
    break;
  }
  if (!q) q = gens[0].gen();
  q.answerKey = q.check.key;
  return q;
}

/** Semua generator (dipakai oleh skrip audit kunci jawaban). */
export const ALL_GENERATORS = GENERATORS;

/** Daftar template yang tersedia per sub-bab, untuk pemilih kasus guru. */
export function templateIdsFor(subbab: number): string[] {
  const gens = GENERATORS[Math.min(Math.max(subbab, 1), 10)] ?? [];
  return gens.map((g) => g.id);
}

/** Membuat soal dari template tertentu, mis. "4.2" (dipakai Case Picker guru). */
export function generateByTemplate(templateId: string): Question | null {
  const sb = Number(templateId.split(".")[0]); // "2.0.1" → sub-bab 2, pencocokan id dilakukan penuh
  const gens = GENERATORS[sb];
  if (!gens) return null;
  const entry = gens.find((g) => g.id === templateId);
  if (!entry) return null;
  const q = entry.gen();
  q.answerKey = q.check.key;
  return q;
}
