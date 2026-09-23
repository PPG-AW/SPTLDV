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
  stepsInterceptX,
  stepsInterceptY,
  stepsMixedMethod,
  stepsTestPoint,
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
  check(answer: unknown): CheckResult;
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
const SYM: Record<Sign, string> = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
const isDashed = (s: Sign) => s === "<" || s === ">";
const flip = (s: Sign): Sign => ({ "<=": ">=", ">=": "<=", "<": ">", ">": "<" } as Record<Sign, Sign>)[s];
const ineqStr = (i: IneqSpec) => eqStr(i.a, i.b, i.c, SYM[i.sign]);

/** Jangkauan sumbu menyesuaikan titik-titik penting (boleh negatif). */
function rangeFor(values: number[], minSpan = 6): [number, number] {
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  let a = Math.floor(lo) - 1;
  let b = Math.ceil(hi) + 1;
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

function mcCheck(answerId: string, notes: Record<string, string> = {}) {
  return (answer: unknown): CheckResult => {
    const a = String(answer ?? "");
    if (a === answerId) return { ok: true };
    return { ok: false, note: notes[a] ?? "Pilihan belum tepat." };
  };
}

function fillCheck(
  expected: Record<string, number>, labels: Record<string, string>,
  swapPairs: [string, string, string][] = []
) {
  return (answer: unknown): CheckResult => {
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
}

function pointsCheck(targets: Pt[], need: number, tol = 0.55) {
  return (answer: unknown): CheckResult => {
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
      lines = [{ ...lineFromIntercepts(ri(3, 8), ri(3, 8)), sign: "<=" }];
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
      "Singkirkan opsi yang memuat pangkat dua, perkalian antarvariabel (xy), atau tanda sama dengan.",
      `Hanya satu opsi yang memenuhi seluruh syarat, yaitu ${correct}.`,
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
      "Koefisien adalah bilangan yang menempel pada variabel. Tanda negatif ikut menjadi bagian koefisien.",
      `Pada ${text}: koefisien x adalah ${neg(a)}, koefisien y adalah ${neg(b)}, dan konstanta adalah ${neg(c)}.`,
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
  const s = pick([
    { A: "buku tulis", B: "pensil", hA: ri(3, 5) * 1000, hB: ri(1, 2) * 1000, tot: pick([20000, 25000, 30000]) },
    { A: "roti cokelat", B: "roti keju", hA: ri(2, 4) * 1000, hB: ri(2, 5) * 1000, tot: pick([30000, 40000, 50000]) },
  ]);
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
    `Harga sebuah ${s.A} adalah Rp${s.hA.toLocaleString("id-ID")} dan sebuah ${s.B} adalah Rp${s.hB.toLocaleString("id-ID")}. Misalkan x = banyak ${s.A} dan y = banyak ${s.B}. Jika total belanja tidak lebih dari Rp${s.tot.toLocaleString("id-ID")}, model matematikanya adalah…`,
    [
      "Susun dahulu bentuk total belanjanya: (harga satuan) dikali (banyaknya), untuk kedua barang.",
      `Total belanja = ${s.hA}x + ${s.hB}y. Sekarang terjemahkan frasa \"tidak lebih dari\".`,
      `\"Tidak lebih dari\" berarti ≤, sehingga modelnya menjadi ${correct}.`,
    ],
    `Total belanja adalah ${s.hA}x + ${s.hB}y, dan karena tidak boleh melebihi Rp${s.tot.toLocaleString("id-ID")} maka tandanya ≤.`,
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
  const line = lineFromIntercepts(p, negY ? -q : q);
  return { p, q: negY ? -q : q, line };
}

function t21(): Question {
  const { p, line } = sub2Line();
  const steps = stepsInterceptX(line.a, line.b, line.c);
  const q = baseQ(2, "2.1", "fill",
    "Tentukan koordinat titik potong garis berikut dengan sumbu X.",
    [
      "Setiap titik pada sumbu X selalu berbentuk (p, 0), artinya nilai y-nya nol.",
      `Substitusikan y = 0:\n${eqStr(line.a, line.b, line.c)}\n${linExpr(line.a, 0)} + ${line.b}(0) = ${neg(line.c)}`,
      steps,
    ],
    `Dengan mensubstitusikan y = 0 diperoleh x = ${neg(p)}, sehingga titik potong sumbu X adalah (${neg(p)}, 0).`,
    {
      math: eqStr(line.a, line.b, line.c),
      canvas: specFor([{ ...line, sign: "<=" }], { points: [{ p: pt(p, 0), hollow: true }] }),
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
      "Setiap titik pada sumbu Y selalu berbentuk (0, q), artinya nilai x-nya nol.",
      `Substitusikan x = 0, lalu selesaikan:\n${eqStr(line.a, line.b, line.c)}\n${line.a}(0) + ${linExpr(0, line.b)} = ${neg(line.c)}`,
      steps,
    ],
    `Dengan mensubstitusikan x = 0 diperoleh y = ${neg(yInt)}, sehingga titik potong sumbu Y adalah (0, ${neg(yInt)}).`,
    {
      math: eqStr(line.a, line.b, line.c),
      canvas: specFor([{ ...line, sign: "<=" }], { points: [{ p: pt(0, yInt), hollow: true }] }),
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
      "Kerjakan dalam dua perhitungan terpisah: sumbu X dengan y = 0, sumbu Y dengan x = 0.",
      stepsInterceptX(line.a, line.b, line.c),
      stepsInterceptY(line.a, line.b, line.c),
    ],
    `Titik potong sumbu X adalah (${neg(p)}, 0) dan titik potong sumbu Y adalah (0, ${neg(yInt)}).`,
    {
      math: eqStr(line.a, line.b, line.c),
      canvas: specFor([{ ...line, sign: "<=" }]),
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
  return { ...lineFromIntercepts(p, negY ? -q : q), sign: pick<Sign>(["<=", ">=", "<", ">"]) };
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
      "Perhatikan tanda relasinya: apakah memuat unsur \"sama dengan\" atau tidak?",
      "Tanda ≤ dan ≥ memuat \"sama dengan\" → garis penuh. Tanda < dan > tidak memuat → garis putus-putus.",
      `Tanda pada soal adalah ${SYM[ineq.sign]}, sehingga garisnya ${dashed ? "PUTUS-PUTUS" : "PENUH"}.`,
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
  const line = lineFromIntercepts(p, q0);
  const wrongLine = lineFromIntercepts(q0 === p ? p + 2 : q0, p); // titik potong tertukar
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
      "Periksa dua hal: letak kedua titik potong dengan sumbu, dan jenis garis (penuh atau putus-putus).",
      `Hitung titik potongnya lebih dahulu:\n${stepsInterceptX(line.a, line.b, line.c)}`,
      `${stepsInterceptY(line.a, line.b, line.c)}\n> Tanda ${SYM[sign]} → garis ${dashed ? "PUTUS-PUTUS" : "PENUH"}.`,
    ],
    `Garis melalui (${p}, 0) dan (0, ${q0}), digambar ${dashed ? "putus-putus" : "penuh"} karena tandanya ${SYM[sign]}.`,
    {
      math: eqStr(line.a, line.b, line.c, SYM[sign]),
      graphOptions: variants.map((v) => v.spec),
      explainSteps: steps,
    });
  q.check = (answer) => {
    const idx = Number(answer);
    return idx === variants.findIndex((v) => v.ok)
      ? { ok: true }
      : { ok: false, note: variants[idx]?.why ?? "Grafik belum tepat." };
  };
  return q;
}

function t33(): Question {
  const p = ri(2, 6), q0 = ri(2, 6);
  const line = lineFromIntercepts(p, q0);
  const sign = pick<Sign>(["<=", ">="]);
  const steps = `${stepsInterceptX(line.a, line.b, line.c)}\n${stepsInterceptY(line.a, line.b, line.c)}\n> Ketuk kedua titik tersebut, lalu hubungkan menjadi garis pembatas.`;
  const q = baseQ(3, "3.3", "points",
    "Ketuk TEPAT pada dua titik potong garis berikut dengan sumbu koordinat (urutan bebas).",
    [
      "Cari satu titik pada sumbu X (dengan y = 0) dan satu titik pada sumbu Y (dengan x = 0).",
      stepsInterceptX(line.a, line.b, line.c),
      stepsInterceptY(line.a, line.b, line.c),
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
  const p = ri(3, 6), q0 = ri(3, 6);
  return { ...lineFromIntercepts(p, q0), sign: pick<Sign>(["<=", ">="]) };
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
      `Tuliskan substitusinya secara lengkap:\n${ineqStr(ineq)}\n${ineq.a}(${tp.x}) + ${ineq.b}(${tp.y}) ${SYM[ineq.sign]} ${neg(ineq.c)}`,
      r.text,
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
      "Substitusikan x = 0 dan y = 0 ke pertidaksamaan, lalu nilai kebenaran pernyataannya.",
      `Tuliskan substitusinya:\n${ineqStr(ineq)}\n${ineq.a}(0) + ${ineq.b}(0) ${SYM[ineq.sign]} ${neg(ineq.c)}\n0 ${SYM[ineq.sign]} ${neg(ineq.c)}`,
      `${r.text}\n> Bila hasilnya BENAR, daerah penyelesaian memuat titik (0, 0). Bila SALAH, daerah penyelesaian ada di sisi seberangnya.`,
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
        `> Jika hasil uji SALAH → titik uji bukan penyelesaian → daerah penyelesaian ada di sisi seberangnya.\n` +
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
    { spec: mk({ ...ineq, sign: flip(ineq.sign) }), why: "Sisi yang diarsir terbalik. Ingat: yang diarsir adalah daerah yang BUKAN penyelesaian.", ok: false },
    { spec: mk({ ...ineq, dashed: true }), why: "Jenis garisnya keliru — tanda ≤ atau ≥ digambar dengan garis penuh.", ok: false },
    { spec: mk({ a: ineq.b, b: ineq.a, c: ineq.c, sign: ineq.sign }), why: "Garis pembatasnya bukan yang diminta; periksa kembali kedua titik potongnya.", ok: false },
  ]);
  const q = baseQ(4, "4.3", "graph",
    "Manakah gambar yang TEPAT untuk pertidaksamaan berikut? (arsiran menandai daerah yang BUKAN penyelesaian)",
    [
      "Tentukan dahulu garis pembatasnya melalui kedua titik potong, lalu lakukan uji titik (0, 0).",
      `${stepsInterceptX(ineq.a, ineq.b, ineq.c)}\n${stepsInterceptY(ineq.a, ineq.b, ineq.c)}`,
      `${r.text}\n> Daerah penyelesaian (yang BERSIH tanpa arsiran) adalah sisi yang ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).`,
    ],
    `Garis penuh melalui (${num(ineq.c / ineq.a)}, 0) dan (0, ${num(ineq.c / ineq.b)}), dengan daerah bersih (penyelesaian) di sisi yang ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).`,
    {
      math: ineqStr(ineq),
      graphOptions: variants.map((v) => v.spec),
      explainSteps:
        `${stepsInterceptX(ineq.a, ineq.b, ineq.c)}\n${stepsInterceptY(ineq.a, ineq.b, ineq.c)}\n${r.text}\n` +
        `> Karena hasil uji ${r.ok ? "BENAR" : "SALAH"}, daerah penyelesaian ${r.ok ? "memuat" : "tidak memuat"} titik (0, 0).\n` +
        `> Arsiran diletakkan pada daerah seberangnya, yaitu daerah yang BUKAN penyelesaian.`,
    });
  q.check = (answer) => {
    const idx = Number(answer);
    return idx === variants.findIndex((v) => v.ok)
      ? { ok: true }
      : { ok: false, note: variants[idx]?.why ?? "Gambar belum tepat." };
  };
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
      "SPtLDV terdiri atas dua PtLDV atau lebih yang berlaku bersamaan.",
      "Periksa setiap opsi: adakah pangkat dua? adakah tanda sama dengan? adakah yang hanya bervariabel tunggal?",
      "Opsi yang benar memuat beberapa pertidaksamaan linear dua variabel sekaligus, termasuk kendala x ≥ 0 dan y ≥ 0.",
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
      "Setiap kendala menghasilkan satu daerah penyelesaian tersendiri.",
      "Titik penyelesaian sistem harus memenuhi SEMUA kendala sekaligus.",
      "Dalam bahasa himpunan, \"memenuhi semuanya sekaligus\" berarti IRISAN.",
    ],
    "Karena setiap titik penyelesaian harus memenuhi seluruh kendala secara bersamaan, DHP merupakan IRISAN dari semua daerah penyelesaian.",
    { mcOptions: opts });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t53(): Question {
  const tx = ri(2, 4), ty = ri(2, 4);
  const s1 = tx + ty + ri(1, 3);
  const s2 = 3 * tx + 2 * ty - ri(1, 3);
  const ineqs: IneqSpec[] = [
    { a: 1, b: 1, c: s1, sign: "<=" },
    { a: 3, b: 2, c: s2, sign: ">=" },
    ...NON_NEG,
  ];
  const good = pt(tx, ty);
  const bads = [pt(tx, s1 - tx + 2), pt(0, 0), pt(s1 - ty + 2, ty)]
    .filter((p) => !ineqs.every((i) => satisfies(p, i)))
    .slice(0, 3);
  while (bads.length < 3) bads.push(pt(tx + bads.length + 2, ty + 2));
  const variants = shuffle([{ p: good, ok: true }, ...bads.map((p) => ({ p, ok: false }))]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: `(${num(v.p.x)}, ${num(v.p.y)})` }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (v.ok) return;
    const viol = ineqs.find((x) => !satisfies(v.p, x));
    notes[`o${i}`] = viol
      ? `Titik (${num(v.p.x)}, ${num(v.p.y)}) melanggar kendala ${ineqStr(viol)}.`
      : "Titik ini melanggar salah satu kendala sistem.";
  });
  const stepText =
    `> Uji titik (${tx}, ${ty}) pada setiap kendala:\n` +
    `${ineqStr(ineqs[0])}\n${tx} + ${ty} = ${tx + ty}\n${tx + ty} ≤ ${s1}   → BENAR\n` +
    `${ineqStr(ineqs[1])}\n3(${tx}) + 2(${ty}) = ${3 * tx + 2 * ty}\n${3 * tx + 2 * ty} ≥ ${s2}   → BENAR\n` +
    `> Kendala x ≥ 0 dan y ≥ 0 juga terpenuhi.\n` +
    `> Karena semua kendala terpenuhi, titik (${tx}, ${ty}) berada di dalam DHP.`;
  const q = baseQ(5, "5.3", "mc",
    "Titik manakah yang merupakan penyelesaian dari sistem berikut?",
    [
      "Titik penyelesaian harus memenuhi SEMUA kendala. Uji satu per satu dan hentikan bila ada yang gagal.",
      `Mulailah dari kendala pertama:\n${ineqStr(ineqs[0])}`,
      stepText,
    ],
    `Hanya titik (${tx}, ${ty}) yang memenuhi seluruh kendala sistem sehingga berada di dalam DHP.`,
    {
      math: `${ineqStr(ineqs[0])} ;  ${ineqStr(ineqs[1])} ;  x ≥ 0 ;  y ≥ 0`,
      canvas: specFor([ineqs[0], ineqs[1]], { dhpIneqs: ineqs }),
      mcOptions: opts,
      explainSteps: stepText,
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
      "Metode campuran: hilangkan dahulu satu variabel dengan eliminasi, baru cari variabel lainnya dengan substitusi.",
      "Samakan koefisien salah satu variabel. Jika tandanya sama, kurangkan kedua persamaan; jika berlawanan, jumlahkan.",
      mm.text,
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
    { spec: mk([l1, l2], sys.lines), why: "Kendala x ≥ 0 dan y ≥ 0 belum diterapkan, padahal DHP seharusnya terkurung di Kuadran I.", ok: false },
    { spec: mk(sys.ineqs, [{ ...l1, dashed: true }, l2]), why: "Jenis garis keliru — tanda ≤ digambar dengan garis penuh, bukan putus-putus.", ok: false },
  ]);
  const q = baseQ(6, "6.2", "graph",
    "Manakah gambar DHP yang TEPAT untuk sistem berikut? (arsiran = bukan daerah penyelesaian)",
    [
      "Periksa tiga hal: sisi penyelesaian tiap kendala, penerapan kendala x ≥ 0 dan y ≥ 0, serta jenis garisnya.",
      "Uji titik (0, 0) pada kedua kendala untuk memastikan sisi mana yang bersih (menjadi penyelesaian).",
      "DHP yang benar berada di Kuadran I, di bawah kedua garis, dengan kedua garis digambar penuh.",
    ],
    "DHP yang benar adalah daerah bersih di Kuadran I yang dibatasi oleh kedua garis penuh serta kedua sumbu.",
    {
      math: `${ineqStr(l1)} ;  ${ineqStr(l2)} ;  x ≥ 0 ;  y ≥ 0`,
      graphOptions: variants.map((v) => v.spec),
      explainSteps:
        `> Uji titik (0, 0) pada kendala pertama:\n${stepsTestPoint(l1.a, l1.b, l1.c, SYM[l1.sign], 0, 0).text}\n` +
        `> Uji titik (0, 0) pada kendala kedua:\n${stepsTestPoint(l2.a, l2.b, l2.c, SYM[l2.sign], 0, 0).text}\n` +
        `> Tambahkan kendala x ≥ 0 dan y ≥ 0 yang mengurung daerah di Kuadran I.\n` +
        `> DHP adalah daerah bersih dengan titik pojok: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
    });
  q.check = (answer) => {
    const idx = Number(answer);
    return idx === variants.findIndex((v) => v.ok)
      ? { ok: true }
      : { ok: false, note: variants[idx]?.why ?? "Gambar DHP belum tepat." };
  };
  return q;
}

function t63(): Question {
  const sys = integerCornerSystem(true);
  const [l1, l2] = sys.lines;
  const q = baseQ(6, "6.3", "region-tap",
    "Ketuk satu titik berkoordinat bulat yang berada DI DALAM DHP sistem berikut (daerah bersih tanpa arsiran).",
    [
      "Titik di dalam DHP harus memenuhi SEMUA kendala, termasuk x ≥ 0 dan y ≥ 0.",
      `Pastikan titik pilihanmu memenuhi ${ineqStr(l1)} dan juga ${ineqStr(l2)}.`,
      `Contoh pemeriksaan untuk titik (1, 1):\n1 + 1 = 2\n> Periksa apakah hasil ini memenuhi kedua kendala. Titik kecil dekat titik asal biasanya aman untuk sistem bertanda ≤.`,
    ],
    "Setiap titik yang memenuhi seluruh kendala berada di dalam DHP, yaitu daerah bersih tanpa arsiran.",
    {
      math: `${ineqStr(l1)} ;  ${ineqStr(l2)} ;  x ≥ 0 ;  y ≥ 0`,
      canvas: specFor([l1, l2], { dhpIneqs: sys.ineqs }),
      needPoints: 1,
      tapPointsLabel: "Ketuk 1 titik di dalam DHP",
      explainSteps:
        `> Sebuah titik berada di dalam DHP bila memenuhi seluruh kendala:\n` +
        `${ineqStr(l1)}\n${ineqStr(l2)}\nx ≥ 0\ny ≥ 0\n` +
        `> Titik pojok DHP ini: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}. Titik mana pun di dalam daerah bersih tersebut adalah jawaban yang benar.`,
    });
  q.check = (answer) => {
    const taps = (answer ?? []) as Pt[];
    const tap = taps[0];
    if (!tap) return { ok: false, note: "Ketuk satu titik pada grafik." };
    const s = pt(Math.round(tap.x), Math.round(tap.y));
    const ok = sys.ineqs.every((i) => satisfies(s, i));
    if (ok) return { ok: true };
    const viol = sys.ineqs.find((i) => !satisfies(s, i));
    return { ok: false, note: `Titik (${s.x}, ${s.y}) melanggar kendala ${viol ? ineqStr(viol) : "sistem"}.` };
  };
  return q;
}

// ════════════════ SUB-BAB 7 ═════════════════════════════════════════════════

function cornerSpec(sys: { ineqs: IneqSpec[]; lines: IneqSpec[]; corners: Pt[] }, extra: Partial<CanvasSpec> = {}): CanvasSpec {
  const xs = sys.corners.map((c) => c.x);
  const ys = sys.corners.map((c) => c.y);
  return {
    xRange: rangeFor(xs), yRange: rangeFor(ys),
    lines: sys.lines, dhpIneqs: sys.ineqs, ...extra,
  };
}

function t71(): Question {
  const sys = integerCornerSystem();
  const n = sys.corners.length;
  const opts = [2, 3, 4, 5].map((k, i) => ({ id: `o${i}`, label: `${k} titik`, k }));
  const q = baseQ(7, "7.1", "mc",
    "Perhatikan DHP (daerah bersih tanpa arsiran) pada grafik. Berapa banyak titik pojok yang dimilikinya?",
    [
      "Titik pojok adalah sudut-sudut daerah bersih tersebut. Telusuri tepinya satu putaran penuh.",
      "Hitung setiap kali tepi daerah berbelok arah — di situlah letak sebuah titik pojok. Jangan lupa titik asal (0, 0) bila termasuk.",
      `Sudut-sudutnya berada di: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}, sehingga banyaknya ada ${n}.`,
    ],
    `DHP ini memiliki ${n} sudut, yaitu di ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
    {
      canvas: cornerSpec(sys, { points: sys.corners.map((c) => ({ p: c, hollow: true, color: "#7C3AED" })) }),
      mcOptions: opts.map(({ id, label }) => ({ id, label })),
      explainSteps:
        `> Telusuri tepi daerah bersih dan catat setiap sudutnya:\n` +
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
      "Mulailah dari titik yang paling mudah: perpotongan kedua sumbu dan perpotongan garis dengan sumbu.",
      "Setelah itu cari perpotongan antar-garis kendala yang masih berada di dalam daerah bersih.",
      `Titik pojoknya: ${sys.corners.map((c) => `(${num(c.x)}, ${num(c.y)})`).join(", ")}.`,
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
      "Titik pojok ini tidak berada di sumbu, sehingga harus dihitung dengan menyelesaikan kedua persamaan garisnya.",
      "Metode campuran: eliminasi lebih dahulu untuk menghilangkan satu variabel, kemudian substitusi untuk variabel sisanya.",
      mm.text,
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
      "Perhatikan koefisien x pada kedua persamaan: keduanya sudah sama, sehingga eliminasi dapat langsung dilakukan.",
      "Karena koefisien x bertanda sama, KURANGKAN kedua persamaan agar suku x saling menghapus.",
      mm.text,
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
      "Koefisien x pada kedua persamaan berbeda (1 dan 2), sehingga harus disamakan lebih dahulu.",
      "Kalikan persamaan pertama dengan 2 agar koefisien x-nya menjadi sama, kemudian kurangkan kedua persamaan.",
      mm.text,
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
      "Koefisien y pada kedua persamaan sama-sama 1, sehingga variabel y paling mudah dieliminasi.",
      "Karena koefisien y bertanda sama, kurangkan kedua persamaan. Berhati-hatilah saat mengurangkan bilangan negatif.",
      mm.text,
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
      "Menghitung nilai fungsi tujuan berarti mensubstitusikan koordinat titik ke dalam rumusnya.",
      `Tuliskan substitusinya lebih dahulu:\nf(${p.x}, ${p.y}) = ${fa}(${p.x}) + ${fb}(${p.y})`,
      steps,
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
      "Gunakan metode uji titik pojok: hitung nilai fungsi tujuan di setiap titik pojok, lalu bandingkan.",
      `Mulai dari titik pertama:\nf(${num(s.corners[0].x)}, ${num(s.corners[0].y)}) = ${s.fa}(${num(s.corners[0].x)}) + ${s.fb}(${num(s.corners[0].y)})`,
      steps,
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
      "Susun tabel evaluasi: hitung nilai fungsi tujuan pada setiap titik pojok tanpa ada yang terlewat.",
      tableSteps(s.fa, s.fb, s.corners),
      steps,
    ],
    `Nilai maksimum ${num(s.maxV)} dicapai di (${num(s.maxPt.x)}, ${num(s.maxPt.y)}), dan nilai minimum ${num(s.minV)} dicapai di (${num(s.minPt.x)}, ${num(s.minPt.y)}).`,
    {
      math: `f(x, y) = ${s.fa}x + ${s.fb}y`,
      canvas: cornerSpec(s.sys, { points: s.corners.map((c, i) => ({ p: c, color: "#7C3AED", label: `${num(s.values[i])}` })) }),
      fillFields: [{ key: "max", label: "nilai maksimum" }, { key: "min", label: "nilai minimum" }],
      explainSteps: steps,
    });
  q.check = fillCheck({ max: s.maxV, min: s.minV }, { max: "maksimum", min: "minimum" },
    [["max", "min", "Tertukar: maksimum adalah nilai terbesar dan minimum adalah nilai terkecil."]]);
  return q;
}

// ════════════════ SUB-BAB 10 ════════════════════════════════════════════════

interface Story {
  A: string; B: string; pa: number; pb: number; kap1: number; sat1: string;
  kap2: number; ua: number; ub: number;
}
const STORIES: Story[] = [
  { A: "kursi", B: "meja", pa: 2, pb: 4, kap1: 32, sat1: "jam kerja", kap2: 10, ua: 40, ub: 60 },
  { A: "kue bolu", B: "kue brownies", pa: 2, pb: 1, kap1: 24, sat1: "ons tepung", kap2: 15, ua: 5, ub: 4 },
  { A: "kaos", B: "kemeja", pa: 1, pb: 2, kap1: 20, sat1: "meter kain", kap2: 12, ua: 30, ub: 50 },
];

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
      "Variabel harus menyatakan sesuatu yang banyaknya dapat diatur oleh pelaku usaha.",
      "Objek yang disebut pertama pada soal biasanya dimisalkan sebagai x, dan objek kedua sebagai y.",
      `Pemisalan yang tepat: ${correct}.`,
    ],
    `Variabel menyatakan banyaknya objek yang diproduksi, sehingga ${correct}.`,
    { mcOptions: opts });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t102(): Question {
  const s = pick(STORIES);
  const correct = `${linExpr(s.pa, s.pb)} ≤ ${s.kap1}`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `${linExpr(s.pa, s.pb)} ≥ ${s.kap1}`, why: "Sumber daya yang \"tersedia\" adalah batas ATAS, sehingga tandanya ≤.", ok: false },
    { label: `${linExpr(s.pb, s.pa)} ≤ ${s.kap1}`, why: "Koefisien kebutuhan kedua objek tertukar.", ok: false },
    { label: `${linExpr(s.pa, s.pb)} = ${s.kap1}`, why: "Bahan tidak harus habis persis; cukup tidak melebihi kapasitas.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => { if (!v.ok) notes[`o${i}`] = v.why; });
  const q = baseQ(10, "10.2", "mc",
    `Setiap ${s.A} memerlukan ${s.pa} ${s.sat1} dan setiap ${s.B} memerlukan ${s.pb} ${s.sat1}. Total yang tersedia adalah ${s.kap1} ${s.sat1}. Kendala yang tepat adalah…`,
    [
      `Susun bentuk total kebutuhannya: (kebutuhan per ${s.A}) × x ditambah (kebutuhan per ${s.B}) × y.`,
      `Total kebutuhan:\n${linExpr(s.pa, s.pb)}\n> Sekarang tentukan tanda yang sesuai dengan kata \"tersedia\".`,
      `Karena pemakaian tidak boleh melebihi yang tersedia, tandanya ≤ sehingga kendalanya ${correct}.`,
    ],
    `Total kebutuhan ${linExpr(s.pa, s.pb)} tidak boleh melebihi ${s.kap1}, sehingga kendalanya adalah ${correct}.`,
    {
      mcOptions: opts,
      explainSteps:
        `> Kebutuhan untuk ${s.A}:\n${s.pa === 1 ? "x" : `${s.pa}x`}\n` +
        `> Kebutuhan untuk ${s.B}:\n${s.pb === 1 ? "y" : `${s.pb}y`}\n` +
        `> Total kebutuhan:\n${linExpr(s.pa, s.pb)}\n` +
        `> Total tidak boleh melebihi ${s.kap1} ${s.sat1}:\n${correct}`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

function t103(): Question {
  const s = pick(STORIES);
  const k1 = `${linExpr(s.pa, s.pb)} ≤ ${s.kap1}`;
  const k2 = `${linExpr(1, 1)} ≤ ${s.kap2}`;
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
    `Keuntungan setiap ${s.A} adalah Rp${s.ua}.000 dan setiap ${s.B} adalah Rp${s.ub}.000, dengan kendala ${k1} dan ${k2}. Model matematika LENGKAP yang benar adalah…`,
    [
      "Model lengkap terdiri atas fungsi tujuan, seluruh kendala sumber daya, dan kendala non-negatif.",
      "Kata \"keuntungan\" menandakan fungsi tujuan dimaksimumkan. Jangan lupa menambahkan x ≥ 0 dan y ≥ 0.",
      `Model lengkapnya: ${correct}.`,
    ],
    `Model lengkap memuat fungsi tujuan ${obj} yang dimaksimumkan, beserta kendala ${k1}, ${k2}, x ≥ 0, dan y ≥ 0.`,
    {
      mcOptions: opts,
      explainSteps:
        `> Fungsi tujuan dari keuntungan per unit:\n${obj}\n` +
        `> Kendala sumber daya:\n${k1}\n${k2}\n` +
        `> Kendala non-negatif (wajib):\nx ≥ 0\ny ≥ 0\n` +
        `> Karena yang dicari keuntungan terbesar, fungsi tujuan DIMAKSIMUMKAN.`,
    });
  q.check = mcCheck(opts[variants.findIndex((v) => v.ok)].id, notes);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════

const GENERATORS: Record<number, (() => Question)[]> = {
  1: [t11, t12, t13], 2: [t21, t22, t23], 3: [t31, t32, t33], 4: [t41, t42, t43],
  5: [t51, t52, t53], 6: [t61, t62, t63], 7: [t71, t72, t73], 8: [t81, t82, t83],
  9: [t91, t92, t93], 10: [t101, t102, t103],
};

export function generateQuestion(subbab: number, avoidTemplateId?: string): Question {
  const gens = GENERATORS[Math.min(Math.max(subbab, 1), 10)] ?? GENERATORS[1];
  for (let i = 0; i < 10; i++) {
    const q = pick(gens)();
    if (avoidTemplateId && q.templateId === avoidTemplateId && gens.length > 1) continue;
    return q;
  }
  return gens[0]();
}

export type { IneqSpec, Pt, Sign };
