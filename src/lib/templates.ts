// ─── Mesin Soal Formatif — 30 template (3 per sub-bab) ──────────────────────
// Semua angka dirancang integer-friendly. Berjalan murni di client.

import {
  cornerPoints,
  fmtNum,
  ineqToString,
  intersectLines,
  lineFromIntercepts,
  lineToString,
  satisfies,
  axisIntercepts,
  SIGN_SYMBOL,
  type IneqSpec,
  type Pt,
  type Sign,
} from "./geometry";

// ── Tipe ─────────────────────────────────────────────────────────────────────

export interface PlotPoint {
  p: Pt;
  color?: string;
  hollow?: boolean;
  label?: string;
}

export interface CanvasSpec {
  xRange: [number, number];
  yRange: [number, number];
  lines?: IneqSpec[];
  shadeIndices?: number[];
  dhpIneqs?: IneqSpec[];
  points?: PlotPoint[];
  crosshair?: Pt;
}

export interface MCOption {
  id: string;
  label: string;
}

export interface FillField {
  key: string;
  label: string;
  suffix?: string;
}

export type QKind = "mc" | "fill" | "points" | "graph" | "region-tap";

export interface CheckResult {
  ok: boolean;
  note?: string;
}

export interface Question {
  subbab: number;
  templateId: string;
  kind: QKind;
  prompt: string;
  math?: string;
  canvas?: CanvasSpec;
  hints: [string, string, string];
  explain: string;
  mcOptions?: MCOption[];
  fillFields?: FillField[];
  graphOptions?: CanvasSpec[];
  needPoints?: number;
  tapPointsLabel?: string;
  check(answer: unknown): CheckResult;
}

// ── Util ─────────────────────────────────────────────────────────────────────

export const ri = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

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
  const s = String(raw ?? "").trim().replace(",", ".").replace("−", "-");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const isDashed = (s: Sign) => s === "<" || s === ">";

const pt = (x: number, y: number): Pt => ({ x, y });
const range10: [number, number] = [0, 10];
const range8: [number, number] = [0, 8];
const negRange: [number, number] = [-8, 8];

function signWord(s: Sign): string {
  return { "<=": "≤", ">=": "≥", "<": "<", ">": ">" }[s];
}

// ── Pembuat skeletal question ────────────────────────────────────────────────

let uid = 0;
function baseQ(
  subbab: number,
  templateId: string,
  kind: QKind,
  prompt: string,
  hints: [string, string, string],
  explain: string,
  extra: Partial<Question> = {}
): Question {
  uid += 1;
  return {
    subbab,
    templateId,
    kind,
    prompt,
    hints,
    explain,
    check: () => ({ ok: false }),
    ...extra,
  };
}

function mcCheck(answerId: string, notes: Record<string, string>) {
  return (answer: unknown): CheckResult => {
    const a = String(answer ?? "");
    if (a === answerId) return { ok: true };
    return { ok: false, note: notes[a] ?? "Pilihan belum tepat. Periksa kembali konsepnya." };
  };
}

function fillCheck(
  expected: Record<string, number>,
  labels: Record<string, string>,
  swapPairs: [string, string, string][] = []
) {
  return (answer: unknown): CheckResult => {
    const ans = (answer ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(expected)) {
      const v = parseNum(ans[key]);
      if (!Number.isFinite(v)) return { ok: false, note: `Kolom "${labels[key]}" belum diisi angka yang valid.` };
      if (Math.abs(v - expected[key]) > 0.01) {
        for (const [ka, kb, msg] of swapPairs) {
          const va = parseNum(ans[ka]);
          const vb = parseNum(ans[kb]);
          if (Math.abs(va - expected[kb]) <= 0.01 && Math.abs(vb - expected[ka]) <= 0.01) {
            return { ok: false, note: msg };
          }
        }
        return { ok: false, note: `Nilai "${labels[key]}" belum tepat. Ulangi perhitungannya.` };
      }
    }
    return { ok: true };
  };
}

function pointsCheck(targets: Pt[], need: number, tolerance = 0.6) {
  return (answer: unknown): CheckResult => {
    const taps = (answer ?? []) as Pt[];
    if (taps.length < need) return { ok: false, note: `Butuh ${need} titik. Ketuk ${need} titik pada grafik.` };
    const used = new Set<number>();
    for (const t of targets) {
      let best = -1;
      let bestD = Infinity;
      taps.forEach((tap, i) => {
        if (used.has(i)) return;
        const d = Math.hypot(tap.x - t.x, tap.y - t.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best < 0 || bestD > tolerance) {
        return {
          ok: false,
          note: `Belum tepat. Pastikan setiap titik berada tepat pada perpotongan garis/sumbu yang diminta.`,
        };
      }
      used.add(best);
    }
    return { ok: true };
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 1 — Pengenalan PtLDV
// ════════════════════════════════════════════════════════════════════════════

function t11(): Question {
  const a = ri(2, 5), b = ri(2, 5), c = ri(6, 20);
  const sign = pick(["<=", ">=", "<", ">"] as Sign[]);
  const correct = lineToString({ a, b, c }, signWord(sign));
  const variants: { label: string; why: string; ok: boolean }[] = shuffle([
    { label: `${a}x + ${b}y ${signWord(sign)} ${c}`, why: "", ok: true },
    { label: `${a}x² + ${b}y ${signWord(sign)} ${c}`, why: "Mengandung x pangkat dua — bukan linear.", ok: false },
    { label: `${a}x + ${b}y = ${c}`, why: "Memakai tanda “=” — itu persamaan, bukan pertidaksamaan.", ok: false },
    { label: `${a}xy + ${b}y ${signWord(sign)} ${c}`, why: "Mengandung perkalian antarvariabel (xy) — bukan linear.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    1, "1.1", "mc",
    "Manakah di antara berikut ini yang merupakan pertidaksamaan linear dua variabel (PtLDV)?",
    [
      "PtLDV: dua variabel, masing-masing berpangkat SATU, dihubungkan tanda <, >, ≤, atau ≥.",
      "Singkirkan yang punya pangkat dua, perkalian variabel, atau tanda sama dengan.",
      `Syarat lengkap: ax + by relasi c, dengan x dan y berpangkat satu. Jawabannya “${correct}”.`,
    ],
    `PtLDV harus linear (pangkat satu, tanpa xy) DAN bertanda ketidaksamaan. Hanya “${correct}” yang memenuhi keduanya.`,
    { math: "ax + by ≤ c", mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t12(): Question {
  const a = ri(2, 6), b = pick([-1, 1]) * ri(2, 6), c = ri(8, 24);
  const sign = pick(["<=", ">="] as Sign[]);
  const lineText = lineToString({ a, b, c }, signWord(sign));
  const q = baseQ(
    1, "1.2", "fill",
    `Perhatikan pertidaksamaan berikut. Tentukan koefisien x (a), koefisien y (b), dan konstanta (c).`,
    [
      "Bandingkan dengan bentuk umum ax + by relasi c.",
      "Koefisien adalah angka yang menempel pada variabel — termasuk tanda negatifnya.",
      `Pada “${lineText}”: angka di depan x adalah a, di depan y adalah b, dan angka di ruas kanan adalah c.`,
    ],
    `a = ${a}, b = ${b}, c = ${c}. Konstanta c adalah suku tanpa variabel.`,
    {
      math: lineText,
      fillFields: [
        { key: "a", label: "a (koefisien x)" },
        { key: "b", label: "b (koefisien y)" },
        { key: "c", label: "c (konstanta)" },
      ],
    }
  );
  q.check = fillCheck({ a, b, c }, { a: "a", b: "b", c: "c" });
  return q;
}

function t13(): Question {
  const storyBank = [
    { objekA: "buku tulis", objekB: "pensil", hargaA: ri(3, 5) * 1000, hargaB: ri(1, 2) * 1000, total: pick([20000, 25000, 30000]) },
    { objekA: "roti cokelat", objekB: "roti keju", hargaA: ri(2, 4) * 1000, hargaB: ri(2, 5) * 1000, total: pick([30000, 40000, 50000]) },
    { objekA: "kaos", objekB: "kemeja", hargaA: ri(5, 8) * 10000, hargaB: ri(8, 12) * 10000, total: pick([200000, 300000, 400000]) },
  ];
  const s = pick(storyBank);
  const model = (sa: string, sb: string, rel: string) => `${sa}x + ${sb}y ${rel} ${s.total}`;
  const A = String(s.hargaA), B = String(s.hargaB);
  const correct = model(A, B, "≤");
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: model(A, B, "≥"), why: "“Tidak lebih dari” berarti ≤, bukan ≥.", ok: false },
    { label: model(B, A, "≤"), why: "Koefisien tertukar: x mewakili " + s.objekA + ", y mewakili " + s.objekB + ".", ok: false },
    { label: model(A, B, "="), why: "Total “tidak lebih dari” bukan “tepat sama dengan”.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    1, "1.3", "mc",
    `Harga sebuah ${s.objekA} adalah Rp${s.hargaA.toLocaleString("id-ID")} dan sebuah ${s.objekB} Rp${s.hargaB.toLocaleString("id-ID")}. Misalkan x = banyak ${s.objekA} dan y = banyak ${s.objekB}. Jika total belanja tidak lebih dari Rp${s.total.toLocaleString("id-ID")}, model matematikanya adalah…`,
    [
      "Modelkan dulu total belanja: (harga A)·x + (harga B)·y.",
      "Terjemahkan frasa kunci: “tidak lebih dari” → ≤.",
      `Total belanja = ${A}x + ${B}y, dan batasnya adalah ≤ ${s.total}.`,
    ],
    `Belanja total ${A}x + ${B}y dan “tidak lebih dari” berarti ≤, sehingga modelnya ${correct}.`,
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 2 — Titik Potong
// ════════════════════════════════════════════════════════════════════════════

function sub2Line() {
  // qx + py = pq → x-int (p,0), y-int (0,q); varian negatif y-int
  const p = ri(2, 7);
  const q = ri(2, 7);
  const bSign = pick([1, -1]);
  const line = lineFromIntercepts(p, bSign * q);
  return { p, q, bSign, line };
}

function t21(): Question {
  const { p, line } = sub2Line();
  const text = lineToString(line, "=");
  const q = baseQ(
    2, "2.1", "fill",
    `Tentukan koordinat titik potong garis berikut dengan sumbu X.`,
    [
      "Titik potong dengan sumbu X terjadi saat nilai y = 0.",
      `Substitusikan y = 0 ke “${text}”, lalu selesaikan untuk x.`,
      `Setelah substitusi, persamaan menjadi ${line.a}x = ${line.c}, sehingga x = ${line.c}/${line.a}.`,
    ],
    `Saat y = 0: ${line.a}x = ${line.c} → x = ${p}. Titik potong X adalah (${p}, 0).`,
    {
      math: text,
      canvas: {
        xRange: [-1, 9], yRange: line.b < 0 ? [-8, 4] : [-2, 8],
        lines: [{ ...line, sign: "<=" }],
        points: [{ p: pt(p, 0), hollow: true }],
      },
      fillFields: [{ key: "x", label: "x (pada titik (x, 0))" }],
    }
  );
  q.check = fillCheck({ x: p }, { x: "x" });
  return q;
}

function t22(): Question {
  const { q: yInt, line } = sub2Line();
  const text = lineToString(line, "=");
  const expectedY = line.b < 0 ? -Math.abs(yInt) : yInt;
  const q = baseQ(
    2, "2.2", "fill",
    `Tentukan koordinat titik potong garis berikut dengan sumbu Y.`,
    [
      "Titik potong dengan sumbu Y terjadi saat nilai x = 0.",
      `Substitusikan x = 0 ke “${text}”, lalu selesaikan untuk y.`,
      `Setelah substitusi: ${line.b}y = ${line.c}, sehingga y = ${line.c}/${line.b}. Perhatikan tandanya!`,
    ],
    `Saat x = 0: ${line.b}y = ${line.c} → y = ${expectedY}. Titik potong Y adalah (0, ${expectedY}).`,
    {
      math: text,
      canvas: {
        xRange: [-1, 9], yRange: line.b < 0 ? [-8, 4] : [-2, 8],
        lines: [{ ...line, sign: "<=" }],
        points: [{ p: pt(0, expectedY), hollow: true }],
      },
      fillFields: [{ key: "y", label: "y (pada titik (0, y))" }],
    }
  );
  q.check = fillCheck({ y: expectedY }, { y: "y" });
  return q;
}

function t23(): Question {
  const { p, q: yInt, line } = sub2Line();
  const expectedY = line.b < 0 ? -Math.abs(yInt) : yInt;
  const text = lineToString(line, "=");
  const q = baseQ(
    2, "2.3", "fill",
    `Tentukan KEDUA titik potong garis berikut dengan sumbu koordinat.`,
    [
      "Sumbu X dicari dengan y = 0, sumbu Y dengan x = 0. Dua perhitungan terpisah.",
      `Sumbu X: ${line.a}x = ${line.c}. Sumbu Y: ${line.b}y = ${line.c}.`,
      `x = ${line.c}/${line.a} = ${p} dan y = ${line.c}/${line.b} = ${expectedY}.`,
    ],
    `Titik potong X: (${p}, 0). Titik potong Y: (0, ${expectedY}).`,
    {
      math: text,
      canvas: {
        xRange: [-1, 9], yRange: line.b < 0 ? [-8, 4] : [-2, 8],
        lines: [{ ...line, sign: "<=" }],
      },
      fillFields: [
        { key: "x", label: "x, untuk titik (x, 0)" },
        { key: "y", label: "y, untuk titik (0, y)" },
      ],
    }
  );
  q.check = fillCheck(
    { x: p, y: expectedY }, { x: "titik potong X", y: "titik potong Y" },
    [["x", "y", "Tertukar! Sumbu X berbentuk (p, 0) dan sumbu Y berbentuk (0, q)."]]
  );
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 3 — Menggambar Garis
// ════════════════════════════════════════════════════════════════════════════

function sub3Ineq(): IneqSpec {
  const p = ri(2, 6), q = ri(2, 6);
  const sign = pick(["<=", ">=", "<", ">"] as Sign[]);
  return { ...lineFromIntercepts(p, q), sign };
}

function t31(): Question {
  const ineq = sub3Ineq();
  const dashed = isDashed(ineq.sign);
  const text = ineqToString(ineq);
  const variants = shuffle([
    { label: "Garis penuh", why: "", ok: !dashed },
    { label: "Garis putus-putus", why: "", ok: dashed },
    { label: "Garis bergelombang", why: "Tidak ada gaya garis seperti itu pada grafik PtLDV.", ok: false },
    { label: "Tidak perlu digambar garis", why: "Garis pembatas wajib digambar; ia membatasi daerah penyelesaian.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok && v.why) notes[`o${i}`] = v.why;
  });
  const wrongStyle = dashed ? "Garis penuh" : "Garis putus-putus";
  notes[opts.find((o) => o.label === wrongStyle)!.id] = dashed
    ? "Relasi < atau > TIDAK memuat “sama dengan”, jadi garisnya putus-putus."
    : "Relasi ≤ atau ≥ MEMUAT “sama dengan”, jadi garisnya penuh.";
  const q = baseQ(
    3, "3.1", "mc",
    `Jika kamu menggambar garis pembatas untuk pertidaksamaan berikut, garisnya harus berupa…`,
    [
      "Perhatikan tanda relasinya: apakah memuat “sama dengan”?",
      "≤ dan ≥ → garis penuh. < dan > → garis putus-putus.",
      `Tanda pada soal adalah ${signWord(ineq.sign)} sehingga garisnya ${dashed ? "putus-putus" : "penuh"}.`,
    ],
    `Tanda ${signWord(ineq.sign)} ${dashed ? "tidak" : ""} memuat “sama dengan”, sehingga garis pembatas berupa garis ${dashed ? "putus-putus" : "penuh"}.`,
    { math: text, mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t32(): Question {
  const ineq = sub3Ineq();
  const flipSign: Sign = ({ "<=": ">=", ">=": "<=", "<": ">", ">": "<" } as Record<Sign, Sign>)[ineq.sign];
  const solid = !isDashed(ineq.sign);
  const make = (shadeSign: Sign, dashed: boolean): CanvasSpec => ({
    xRange: range8, yRange: range8,
    lines: [{ a: ineq.a, b: ineq.b, c: ineq.c, sign: shadeSign, dashed }],
    shadeIndices: [0],
  });
  const variants: { spec: CanvasSpec; why: string; ok: boolean }[] = shuffle([
    { spec: make(ineq.sign, !solid), why: "", ok: true },
    { spec: make(flipSign, !solid), why: "Arsiran berada di sisi garis yang salah. Uji titik (0, 0)!", ok: false },
    { spec: make(ineq.sign, solid), why: solid ? "Garisnya putus-putus, padahal tandanya memuat “sama dengan”." : "Garisnya penuh, padahal tandanya tidak memuat “sama dengan”.", ok: false },
    { spec: make(flipSign, solid), why: "Arsiran dan jenis garis keduanya keliru.", ok: false },
  ]);
  const q = baseQ(
    3, "3.2", "graph",
    `Manakah grafik garis pembatas (dengan arsiran daerah penyelesaian) yang TEPAT untuk pertidaksamaan berikut?`,
    [
      "Cek dua hal: (1) jenis garis dari tanda relasi, (2) sisi arsiran dari uji titik (0, 0).",
      `Tanda ${signWord(ineq.sign)} → garis ${solid ? "penuh" : "putus-putus"}. Uji (0,0): 0 ${signWord(ineq.sign)} ${ineq.c} → ${satisfies(pt(0, 0), ineq) ? "BENAR, arsir sisi yang memuat (0,0)" : "SALAH, arsir sisi yang TIDAK memuat (0,0)"}.`,
      `Grafik yang benar: garis ${solid ? "penuh" : "putus-putus"}, arsiran di sisi yang ${satisfies(pt(0, 0), ineq) ? "memuat" : "tidak memuat"} titik asal.`,
    ],
    `Garis ${solid ? "penuh" : "putus-putus"} dan arsiran di sisi yang ${satisfies(pt(0, 0), ineq) ? "memuat" : "tidak memuat"} (0, 0) — hanya satu opsi memenuhi keduanya.`,
    { math: ineqToString(ineq), graphOptions: variants.map((v) => v.spec) }
  );
  q.check = (answer) => {
    const idx = Number(answer);
    if (idx === variants.findIndex((v) => v.ok)) return { ok: true };
    return { ok: false, note: variants[idx]?.why ?? "Grafik belum tepat." };
  };
  return q;
}

function t33(): Question {
  const p = ri(2, 6), qq = ri(2, 6);
  const line = lineFromIntercepts(p, qq);
  const sign = pick(["<=", ">="] as Sign[]);
  const targets = [pt(p, 0), pt(0, qq)];
  const q = baseQ(
    3, "3.3", "points",
    `Ketuk TEPAT pada dua titik potong garis berikut dengan sumbu koordinat (urutan bebas). Grafik akan menggambar garismu.`,
    [
      "Cari pasangan titik potong: satu di sumbu X (y = 0), satu di sumbu Y (x = 0).",
      `Sumbu X: ${line.a}x = ${line.c} → x = …  ;  Sumbu Y: ${line.b}y = ${line.c} → y = …`,
      `x = ${p} dan y = ${qq}. Ketuk titik (${p}, 0) dan (0, ${qq}) pada grafik.`,
    ],
    `Titik potong: (${p}, 0) dan (0, ${qq}). Menghubungkan keduanya menghasilkan garis pembatas.`,
    {
      math: ineqToString({ ...line, sign }),
      canvas: { xRange: range8, yRange: range8 },
      needPoints: 2,
      tapPointsLabel: "Ketuk 2 titik potong",
    }
  );
  q.check = pointsCheck(targets, 2);
  (q as Question & { lineAnswer?: IneqSpec }).lineAnswer = { ...line, sign };
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 4 — Uji Titik & Daerah Penyelesaian
// ════════════════════════════════════════════════════════════════════════════

function sub4Ineq(): IneqSpec {
  const p = ri(3, 6), q = ri(3, 6);
  const sign = pick(["<=", ">="] as Sign[]);
  return { ...lineFromIntercepts(p, q), sign };
}

function t41(): Question {
  const ineq = sub4Ineq();
  // bangun titik uji: kadang memenuhi, kadang tidak
  const inside = Math.random() < 0.5;
  let testPoint: Pt;
  if (inside) {
    testPoint = pt(ri(0, 2), ri(0, 2));
    if (!satisfies(testPoint, ineq)) testPoint = pt(0, 0);
  } else {
    testPoint = pt(ri(4, 6), ri(4, 6));
    if (satisfies(testPoint, ineq)) testPoint = pt(6, 6);
  }
  const truth = satisfies(testPoint, ineq);
  const lhs = ineq.a * testPoint.x + ineq.b * testPoint.y;
  const opts = shuffle([
    { id: "ya", label: "Ya, memenuhi" },
    { id: "no", label: "Tidak memenuhi" },
  ]);
  const answerId = truth ? "ya" : "no";
  const q = baseQ(
    4, "4.1", "mc",
    `Apakah titik (${testPoint.x}, ${testPoint.y}) memenuhi pertidaksamaan berikut?`,
    [
      "Substitusikan x dan y dari titik tersebut ke ruas kiri.",
      `Hitung: ${ineq.a}·(${testPoint.x}) + (${ineq.b})·(${testPoint.y}) = ${lhs}. Bandingkan dengan ${ineq.c}.`,
      `${lhs} ${signWord(ineq.sign)} ${ineq.c} bernilai ${truth ? "BENAR" : "SALAH"} — maka titik ${truth ? "memenuhi" : "tidak memenuhi"}.`,
    ],
    `Substitusi memberikan ${lhs} ${signWord(ineq.sign)} ${ineq.c}, yang bernilai ${truth ? "BENAR" : "SALAH"}. Titik (${testPoint.x}, ${testPoint.y}) ${truth ? "memenuhi" : "tidak memenuhi"} pertidaksamaan.`,
    {
      math: ineqToString(ineq),
      canvas: {
        xRange: range8, yRange: range8,
        lines: [ineq], shadeIndices: [0],
        crosshair: testPoint,
      },
      mcOptions: opts,
    }
  );
  q.check = mcCheck(answerId, {
    [truth ? "no" : "ya"]: `Cek substitusimu: ${ineq.a}·${testPoint.x} + ${ineq.b}·${testPoint.y} = ${lhs}, dan ${lhs} ${signWord(ineq.sign)} ${ineq.c} bernilai ${truth ? "BENAR" : "SALAH"}.`,
  });
  return q;
}

function t42(): Question {
  const ineq = sub4Ineq();
  const truth = satisfies(pt(0, 0), ineq);
  const labelA = "Sisi yang memuat titik (0, 0)";
  const labelB = "Sisi yang TIDAK memuat titik (0, 0)";
  const variants = shuffle([
    { label: labelA, why: truth ? "" : `Uji (0,0): 0 ${signWord(ineq.sign)} ${ineq.c} adalah SALAH, jadi daerah yang memuat (0,0) bukan penyelesaian.`, ok: truth },
    { label: labelB, why: !truth ? "" : `Uji (0,0): 0 ${signWord(ineq.sign)} ${ineq.c} adalah BENAR, jadi sisi yang memuat (0,0) adalah penyelesaiannya.`, ok: !truth },
    { label: "Pada garis pembatasnya saja", why: "Pertidaksamaan memiliki daerah, bukan hanya garis.", ok: false },
    { label: "Seluruh bidang koordinat", why: "Garis pembatas mengecualikan salah satu sisi bidang.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    4, "4.2", "mc",
    `Dengan uji titik (0, 0), daerah penyelesaian pertidaksamaan berikut terletak di…`,
    [
      "Substitusikan x = 0 dan y = 0 ke pertidaksamaan, lalu nilai pernyataannya.",
      `Uji (0,0): ruas kiri = 0. Apakah 0 ${signWord(ineq.sign)} ${ineq.c}?`,
      `0 ${signWord(ineq.sign)} ${ineq.c} bernilai ${truth ? "BENAR → arsir sisi yang memuat (0,0)" : "SALAH → arsir sisi seberangnya"}.`,
    ],
    `Uji titik (0, 0) menghasilkan pernyataan ${truth ? "BENAR" : "SALAH"}, sehingga daerah penyelesaian adalah ${truth ? "sisi yang memuat titik (0, 0)" : "sisi yang TIDAK memuat titik (0, 0)"}.`,
    {
      math: ineqToString(ineq),
      canvas: { xRange: range8, yRange: range8, lines: [ineq], crosshair: pt(0, 0) },
      mcOptions: opts,
    }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t43(): Question {
  const ineq = sub4Ineq();
  const flipSign: Sign = ineq.sign === "<=" ? ">=" : "<=";
  const make = (s: Sign): CanvasSpec => ({
    xRange: range8, yRange: range8,
    lines: [{ a: ineq.a, b: ineq.b, c: ineq.c, sign: s }],
    shadeIndices: [0],
  });
  const correctSide = satisfies(pt(0, 0), ineq) ? "memuat (0,0)" : "tidak memuat (0,0)";
  const variants = shuffle([
    { spec: make(ineq.sign), why: "", ok: true },
    { spec: make(flipSign), why: "Sisi arsiran terbalik. Uji titik (0, 0) untuk menentukan sisi yang benar.", ok: false },
    { spec: { xRange: range8, yRange: range8, lines: [{ a: ineq.a, b: ineq.b, c: ineq.c, sign: ineq.sign, dashed: true }], shadeIndices: [0] }, why: "Jenis garis salah: tanda ≤/≥ memakai garis penuh.", ok: false },
    { spec: { xRange: range8, yRange: range8, lines: [{ a: ineq.b, b: ineq.a, c: ineq.c, sign: ineq.sign }], shadeIndices: [0] }, why: "Garisnya bukan garis yang diminta — perhatikan titik potong kedua sumbu.", ok: false },
  ]);
  const q = baseQ(
    4, "4.3", "graph",
    `Manakah arsiran daerah penyelesaian yang TEPAT untuk pertidaksamaan berikut?`,
    [
      "Pertama tentukan garis pembatasnya (titik potong sumbu), lalu uji titik (0, 0) untuk sisi arsiran.",
      `Titik potong: (${fmtNum(ineq.c / ineq.a)}, 0) dan (0, ${fmtNum(ineq.c / ineq.b)}). Uji (0,0): pernyataan ${satisfies(pt(0, 0), ineq) ? "BENAR" : "SALAH"}.`,
      `Arsiran harus di sisi yang ${correctSide} dengan garis penuh.`,
    ],
    `Garis penuh melalui (${fmtNum(ineq.c / ineq.a)}, 0) dan (0, ${fmtNum(ineq.c / ineq.b)}), dengan arsiran pada sisi yang ${correctSide}.`,
    { math: ineqToString(ineq), graphOptions: variants.map((v) => v.spec) }
  );
  q.check = (answer) => {
    const idx = Number(answer);
    if (idx === variants.findIndex((v) => v.ok)) return { ok: true };
    return { ok: false, note: variants[idx]?.why ?? "Arsiran belum tepat." };
  };
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 5 — Pengenalan SPtLDV
// ════════════════════════════════════════════════════════════════════════════

function t51(): Question {
  const a1 = ri(1, 4), b1 = ri(1, 4), c1 = ri(6, 14);
  const a2 = ri(1, 4), b2 = ri(1, 4), c2 = ri(5, 14);
  const sys = `${a1}x + ${b1}y ≤ ${c1}   ;   ${a2}x + ${b2}y ≥ ${c2}   ;   x ≥ 0, y ≥ 0`;
  const variants = shuffle([
    { label: sys, why: "", ok: true },
    { label: `${a1}x + ${b1}y ≤ ${c1}   ;   ${a2}x² + y ≤ ${c2}`, why: "Kendala kedua mengandung x² — sistem bukan linear.", ok: false },
    { label: `${a1}x + ${b1}y = ${c1}   ;   ${a2}x + ${b2}y = ${c2}`, why: "Keduanya persamaan (=), bukan pertidaksamaan.", ok: false },
    { label: `${a1}x ≤ ${c1}   ;   ${a2}y ≥ ${c1}`, why: "Kedua pertidaksamaan hanya memuat SATU variabel — bukan dua variabel.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    5, "5.1", "mc",
    "Manakah yang merupakan Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV)?",
    [
      "SPtLDV: DUA atau lebih PtLDV, semua linear, dua variabel yang sama.",
      "Periksa tiap opsi: adakah pangkat dua? adakah tanda “=”? adakah yang bervariabel tunggal?",
      "Satu opsi berisi beberapa pertidaksamaan linear dua variabel sekaligus — itulah sistemnya.",
    ],
    "SPtLDV terdiri dari beberapa PtLDV (linear, dua variabel, tanda ketidaksamaan) yang berlaku bersamaan. Hanya satu opsi yang memenuhi seluruh kriteria.",
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t52(): Question {
  const variants = shuffle([
    { label: "Irisan semua daerah penyelesaian tiap pertidaksamaan", why: "", ok: true },
    { label: "Gabungan semua daerah penyelesaian tiap pertidaksamaan", why: "Gabungan berarti cukup memenuhi SATU kendala — padahal semua kendala harus dipenuhi sekaligus.", ok: false },
    { label: "Titik perpotongan garis-garisnya saja", why: "Perpotongan garis hanyalah satu titik; DHP adalah sebuah daerah.", ok: false },
    { label: "Daerah di luar semua garis pembatas", why: "Di luar semua garis justru melanggar kendala-kendala ≤.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    5, "5.2", "mc",
    "Daerah Himpunan Penyelesaian (DHP) dari sebuah SPtLDV adalah…",
    [
      "Setiap kendala menghasilkan satu daerah. Titik penyelesaian sistem harus memenuhi SEMUA kendala.",
      "“Memenuhi semua sekaligus” dalam teori himpunan berarti irisan.",
      "DHP = irisan (∩) semua daerah penyelesaian masing-masing pertidaksamaan.",
    ],
    "Karena setiap titik penyelesaian harus memenuhi SEMUA kendala sekaligus, DHP adalah IRISAN daerah penyelesaian semua pertidaksamaan.",
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t53(): Question {
  // sistem: x+y ≤ s1, 3x+2y ≥ s2, x≥0, y≥0 ; satu titik benar, tiga salah
  const tx = ri(2, 4), ty = ri(2, 4);
  const s1 = tx + ty + ri(1, 3);
  const s2 = 3 * tx + 2 * ty - ri(1, 3);
  const ineqs: IneqSpec[] = [
    { a: 1, b: 1, c: s1, sign: "<=" },
    { a: 3, b: 2, c: s2, sign: ">=" },
    { a: 1, b: 0, c: 0, sign: ">=" },
    { a: 0, b: 1, c: 0, sign: ">=" },
  ];
  const bad1 = pt(tx, s1 - tx + 1);            // langgar kendala 1
  const bad2 = pt(tx - 1 > 0 ? tx - 1 : 0, 0); // langgar kendala 2
  const bad3 = pt(s1 - ty + 1, ty);            // langgar kendala 1 (varian)
  const candidates = shuffle([
    { p: pt(tx, ty), ok: true },
    { p: bad1, ok: false },
    { p: bad2, ok: false },
    { p: bad3, ok: false },
  ]).map((c) => ({ ...c, ok: c.ok && c.p.x >= 0 && c.p.y >= 0 && ineqs.every((i) => satisfies(c.p, i)) }));
  const opts = candidates.map((c, i) => ({ id: `o${i}`, label: `(${c.p.x}, ${c.p.y})` }));
  const answerId = opts[candidates.findIndex((c) => c.ok)].id;
  const notes: Record<string, string> = {};
  candidates.forEach((c, i) => {
    if (!c.ok) {
      const viol = ineqs.find((i) => !satisfies(c.p, i));
      notes[`o${i}`] = viol
        ? `Titik (${c.p.x}, ${c.p.y}) melanggar kendala ${ineqToString(viol)}.`
        : "Titik ini melanggar salah satu kendala sistem.";
    }
  });
  const sysMath = `x + y ≤ ${s1}   ;   3x + 2y ≥ ${s2}   ;   x ≥ 0, y ≥ 0`;
  const q = baseQ(
    5, "5.3", "mc",
    `Titik manakah yang merupakan penyelesaian dari sistem berikut?`,
    [
      "Sebuah titik penyelesaian harus memenuhi SEMUA kendala — uji satu per satu.",
      `Coba substitusikan tiap titik ke x + y ≤ ${s1} terlebih dahulu untuk menyaring kandidat.`,
      `Titik (${tx}, ${ty}): ${tx} + ${ty} = ${tx + ty} ≤ ${s1} ✓ dan 3·${tx} + 2·${ty} = ${3 * tx + 2 * ty} ≥ ${s2} ✓.`,
    ],
    `Hanya (${tx}, ${ty}) yang memenuhi seluruh kendala sistem, sehingga hanya titik itu yang berada di dalam DHP.`,
    {
      math: sysMath,
      canvas: { xRange: range10, yRange: range10, dhpIneqs: ineqs, lines: [ineqs[0], ineqs[1]] },
      mcOptions: opts,
    }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 6 — Menggambar Sistem & DHP
// ════════════════════════════════════════════════════════════════════════════

function sub6System() {
  const ix = ri(2, 4), iy = ri(2, 4);
  const l1: IneqSpec = { a: 1, b: 1, c: ix + iy, sign: "<=" };
  const l2: IneqSpec = { a: 2, b: 1, c: 2 * ix + iy, sign: "<=" };
  const system: IneqSpec[] = [
    l1, l2,
    { a: 1, b: 0, c: 0, sign: ">=" },
    { a: 0, b: 1, c: 0, sign: ">=" },
  ];
  return { ix, iy, l1, l2, system };
}

function t61(): Question {
  const { ix, iy, l1, l2 } = sub6System();
  const q = baseQ(
    6, "6.1", "fill",
    `Tentukan titik potong antara kedua garis pembatas sistem berikut.`,
    [
      "Titik potong dua garis dicari dengan menyelesaikan sistem dua persamaan (eliminasi/substitusi).",
      `Kurangkan persamaan pertama dari kedua: (2x + y) − (x + y) = ${l2.c} − ${l1.c} → x = ${ix}.`,
      `Substitusikan x = ${ix} ke x + y = ${l1.c} → y = ${iy}.`,
    ],
    `Eliminasi menghasilkan x = ${ix}, lalu substitusi memberi y = ${iy}. Titik potong: (${ix}, ${iy}).`,
    {
      math: `x + y = ${l1.c}   ;   2x + y = ${l2.c}`,
      canvas: { xRange: range10, yRange: range10, lines: [l1, l2] },
      fillFields: [
        { key: "x", label: "x" },
        { key: "y", label: "y" },
      ],
    }
  );
  q.check = fillCheck({ x: ix, y: iy }, { x: "x", y: "y" }, [
    ["x", "y", "Tertukar! Periksa kembali saat substitusi nilai pertama ke persamaan."],
  ]);
  return q;
}

function t62(): Question {
  const { system, l1, l2 } = sub6System();
  const l1f: IneqSpec = { ...l1, sign: ">=" };
  const make = (mod: number): CanvasSpec => {
    let ineqs = system;
    if (mod === 1) ineqs = [l1f, system[1], system[2], system[3]];
    if (mod === 2) ineqs = system.slice(0, 2); // tanpa kendala non-negatif
    return {
      xRange: range10, yRange: range10,
      lines: mod === 3 ? [{ ...l1, dashed: true }, l2] : [l1, l2],
      dhpIneqs: ineqs,
    };
  };
  const variants = shuffle([
    { spec: make(0), why: "", ok: true },
    { spec: make(1), why: "Daerah penyelesaian kendala pertama keliru — uji titik (0, 0).", ok: false },
    { spec: make(2), why: "Kendala x ≥ 0 dan y ≥ 0 tidak diterapkan — DHP seharusnya hanya di Kuadran I.", ok: false },
    { spec: make(3), why: "Jenis garis salah — tanda ≤ memakai garis penuh, bukan putus-putus.", ok: false },
  ]);
  const q = baseQ(
    6, "6.2", "graph",
    `Manakah gambar DHP yang TEPAT untuk sistem berikut?`,
    [
      "Periksa: arsiran tiap kendala (uji titik), kendala x ≥ 0 dan y ≥ 0 (Kuadran I), serta jenis garis.",
      "DHP harus di Kuadran I, di bawah kedua garis, dengan garis penuh.",
      "Hanya satu opsi yang arsirannya di bawah kedua garis DAN terbatas pada Kuadran I dengan garis penuh.",
    ],
    "DHP yang benar: irisan di bawah kedua garis (garis penuh) dan terkurung di Kuadran I.",
    {
      math: `x + y ≤ ${l1.c}   ;   2x + y ≤ ${l2.c}   ;   x ≥ 0, y ≥ 0`,
      graphOptions: variants.map((v) => v.spec),
    }
  );
  q.check = (answer) => {
    const idx = Number(answer);
    if (idx === variants.findIndex((v) => v.ok)) return { ok: true };
    return { ok: false, note: variants[idx]?.why ?? "Gambar DHP belum tepat." };
  };
  return q;
}

function t63(): Question {
  const { system, l1, l2 } = sub6System();
  const q = baseQ(
    6, "6.3", "region-tap",
    `Ketuk SATU titik lattice (titik berkoordinat bilangan bulat) yang berada DI DALAM DHP sistem berikut. Titik uji akan dinilai otomatis.`,
    [
      "Titik di dalam DHP memenuhi KEEMPAT kendala. Ambil titik kecil di Kuadran I, lalu cek substitusi.",
      `Pastikan titikmu memenuhi x + y ≤ ${l1.c} dan 2x + y ≤ ${l2.c}.`,
      `Contoh pemeriksaan: untuk titik (1, 1): 1+1=2 ≤ ${l1.c} ✓ dan 2+1=3 ≤ ${l2.c} ✓ — titik seperti itu aman.`,
    ],
    "Setiap titik yang memenuhi semua kendala berada di dalam DHP. Titik kecil di dekat titik asal biasanya memenuhi sistem ≤ semacam ini.",
    {
      math: `x + y ≤ ${l1.c}   ;   2x + y ≤ ${l2.c}   ;   x ≥ 0, y ≥ 0`,
      canvas: { xRange: range10, yRange: range10, lines: [l1, l2] },
      needPoints: 1,
      tapPointsLabel: "Ketuk 1 titik di dalam DHP",
    }
  );
  q.check = (answer) => {
    const taps = (answer ?? []) as Pt[];
    const tap = taps[0];
    if (!tap) return { ok: false, note: "Ketuk satu titik pada grafik." };
    const snapped = pt(Math.round(tap.x), Math.round(tap.y));
    if (Math.hypot(snapped.x - tap.x, snapped.y - tap.y) > 0.4) {
      return { ok: false, note: "Ketuk lebih dekat ke titik lattice (perpotongan grid)." };
    }
    const ok = system.every((i) => satisfies(snapped, i));
    if (ok) return { ok: true };
    const viol = system.find((i) => !satisfies(snapped, i));
    return {
      ok: false,
      note: `Titik (${snapped.x}, ${snapped.y}) melanggar kendala ${viol ? ineqToString(viol) : "sistem"}.`,
    };
  };
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 7 — Titik Pojok
// ════════════════════════════════════════════════════════════════════════════

interface CornerSystem {
  ineqs: IneqSpec[];
  lines: IneqSpec[]; // yang digambar (tanpa sumbu)
  corners: Pt[];
  kind: "single" | "double";
}

function buildCornerSystem(): CornerSystem {
  if (Math.random() < 0.45) {
    const p = ri(4, 7), q = ri(4, 7);
    const l: IneqSpec = { ...lineFromIntercepts(p, q), sign: "<=" };
    const ineqs: IneqSpec[] = [l, { a: 1, b: 0, c: 0, sign: ">=" }, { a: 0, b: 1, c: 0, sign: ">=" }];
    return { ineqs, lines: [l], corners: cornerPoints(ineqs), kind: "single" };
  }
  const ix = ri(2, 4), iy = ri(2, 4);
  const l1: IneqSpec = { a: 1, b: 1, c: ix + iy, sign: "<=" };
  const l2: IneqSpec = { a: 3, b: 1, c: 3 * ix + iy, sign: "<=" };
  const ineqs: IneqSpec[] = [l1, l2, { a: 1, b: 0, c: 0, sign: ">=" }, { a: 0, b: 1, c: 0, sign: ">=" }];
  return { ineqs, lines: [l1, l2], corners: cornerPoints(ineqs), kind: "double" };
}

function t71(): Question {
  const sys = buildCornerSystem();
  const n = sys.corners.length;
  const labels = ["2 titik", "3 titik", "4 titik", "5 titik"].map((l, i) => ({
    id: `o${i}`,
    label: l,
    n: i + 2,
  }));
  const answerId = labels.find((l) => l.n === n)?.id ?? "o2";
  const q = baseQ(
    7, "7.1", "mc",
    "Perhatikan DHP (daerah ungu) pada grafik berikut. Berapa banyak titik pojok yang dimiliki DHP tersebut?",
    [
      "Titik pojok adalah titik-titik sudut poligon DHP — telusuri batas DHP sekali putaran.",
      "Hitung sudut di mana dua garis pembatas bertemu, termasuk pertemuan garis dengan sumbu.",
      `Telusuri batas DHP: ada ${n} sudut berbeda, masing-masing sebuah titik pojok.`,
    ],
    `DHP memiliki ${n} sudut, jadi ada ${n} titik pojok.`,
    {
      canvas: {
        xRange: range10, yRange: range10,
        dhpIneqs: sys.ineqs, lines: sys.lines,
        points: sys.corners.map((c) => ({ p: c, hollow: true })),
      },
      mcOptions: labels,
    }
  );
  q.check = mcCheck(answerId, {
    [labels.find((l) => l.n === (n === 4 ? 3 : 4))!.id]:
      "Hitung lagi perlahan: titik pojok meliputi titik potong dengan sumbu DAN titik potong antargaris yang masih di dalam DHP.",
  });
  return q;
}

function t72(): Question {
  const sys = buildCornerSystem();
  const need = sys.corners.length;
  const q = baseQ(
    7, "7.2", "points",
    `Ketuk SEMUA titik pojok DHP berikut (${need} titik). Urutan bebas — sistem akan memeriksa ketelitianmu.`,
    [
      "Titik pojok = sudut poligon DHP. Mulailah dari titik potong garis dengan kedua sumbu.",
      "Setelah sumbu, cari titik potong ANTAR garis pembatas (jika ada) yang masih di dalam DHP.",
      `DHP ini punya ${need} titik pojok. Daftar: ${sys.corners.map((c) => `(${fmtNum(c.x)}, ${fmtNum(c.y)})`).join(", ")}.`,
    ],
    `Titik pojoknya: ${sys.corners.map((c) => `(${fmtNum(c.x)}, ${fmtNum(c.y)})`).join(", ")}.`,
    {
      canvas: {
        xRange: range10, yRange: range10,
        dhpIneqs: sys.ineqs, lines: sys.lines,
      },
      needPoints: need,
      tapPointsLabel: `Ketuk ${need} titik pojok`,
    }
  );
  q.check = pointsCheck(sys.corners, need);
  return q;
}

function t73(): Question {
  const sys = buildCornerSystem();
  const corner = pick(sys.corners);
  // pilihan salah: interior bergeser, eksterior, titik pada garis bukan pojok
  const interior = pt(Math.max(0, Math.round(corner.x / 2 + 1)), Math.max(0, Math.round(corner.y / 2 + 0.5)));
  const exterior = pt(corner.x + 3, corner.y + 3);
  const edgeMid = sys.corners.length >= 2
    ? pt(Math.round((sys.corners[0].x + sys.corners[1].x) / 2), Math.round((sys.corners[0].y + sys.corners[1].y) / 2))
    : pt(corner.x + 1, corner.y);
  const bad = [interior, exterior, edgeMid].filter(
    (p) => !sys.corners.some((c) => c.x === p.x && c.y === p.y)
  ).slice(0, 3);
  while (bad.length < 3) bad.push(pt(corner.x + 1 + bad.length, corner.y));
  const variants = shuffle([
    { p: corner, ok: true },
    ...bad.map((p) => ({ p, ok: false })),
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: `(${v.p.x}, ${v.p.y})` }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) {
      const insideAll = sys.ineqs.every((ineq) => satisfies(v.p, ineq));
      notes[`o${i}`] = insideAll
        ? `(${v.p.x}, ${v.p.y}) memang di dalam/di batas DHP, tetapi BUKAN titik sudutnya.`
        : `(${v.p.x}, ${v.p.y}) berada di LUAR DHP — melanggar kendala.`;
    }
  });
  const q = baseQ(
    7, "7.3", "mc",
    "Dengan melihat DHP pada grafik, manakah yang merupakan TITIK POJOK DHP?",
    [
      "Titik pojok adalah titik sudut poligon DHP — bukan titik di tengah sisi, bukan pula titik di dalam/luar.",
      "Periksa setiap opsi pada grafik: apakah titik itu tepat di pertemuan dua garis pembatas DHP?",
      `Titik sudut yang benar ada di koordinat (${corner.x}, ${corner.y}).`,
    ],
    `Titik pojok harus merupakan sudut poligon DHP. Hanya (${corner.x}, ${corner.y}) yang memenuhi.`,
    {
      canvas: {
        xRange: range10, yRange: range10,
        dhpIneqs: sys.ineqs, lines: sys.lines,
      },
      mcOptions: opts,
    }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 8 — Titik Pojok Metode Campuran
// ════════════════════════════════════════════════════════════════════════════

function solveFields(x0: number, y0: number): FillField[] {
  return [
    { key: "x", label: "x" },
    { key: "y", label: "y" },
  ];
}

function t81(): Question {
  const x0 = ri(2, 6), y0 = ri(1, 5);
  const s1 = x0 + y0, s2 = x0 - y0;
  const q = baseQ(
    8, "8.1", "fill",
    "Selesaikan sistem berikut dengan ELIMINASI untuk menentukan titik potong kedua garis.",
    [
      "Kedua persamaan sama-sama memuat y dengan tanda berlawanan — jumlahkan kedua persamaan!",
      `Menjumlahkan: 2x = ${s1 + s2} → x = ${x0}.`,
      `Substitusi x = ${x0} ke x + y = ${s1} → y = ${y0}.`,
    ],
    `Eliminasi memberikan x = ${x0}; substitusi memberikan y = ${y0}. Titik potong: (${x0}, ${y0}).`,
    {
      math: `x + y = ${s1}   ;   x − y = ${s2}`,
      fillFields: solveFields(x0, y0),
    }
  );
  q.check = fillCheck({ x: x0, y: y0 }, { x: "x", y: "y" }, [
    ["x", "y", "Tertukar antara nilai x dan y. Cek kembali hasil eliminasimu."],
  ]);
  return q;
}

function t82(): Question {
  const x0 = ri(2, 5), y0 = ri(2, 5);
  const c1 = x0 + y0;           // x + y
  const c2 = 2 * x0 + 3 * y0;   // 2x + 3y
  const q = baseQ(
    8, "8.2", "fill",
    "Selesaikan sistem berikut dengan ELIMINASI (samakan koefisien salah satu variabel lebih dahulu).",
    [
      "Koefisien x adalah 1 dan 2 — kalikan persamaan pertama dengan 2 agar sama.",
      `2×(persamaan 1): 2x + 2y = ${2 * c1}. Kurangkan dari persamaan 2: y = ${c2 - 2 * c1}.`,
      `y = ${y0}; lalu substitusikan ke x + y = ${c1} → x = ${x0}.`,
    ],
    `Eliminasi (setelah menyamakan koefisien) memberi y = ${y0} dan x = ${x0}. Titik potong: (${x0}, ${y0}).`,
    {
      math: `x + y = ${c1}   ;   2x + 3y = ${c2}`,
      fillFields: solveFields(x0, y0),
    }
  );
  q.check = fillCheck({ x: x0, y: y0 }, { x: "x", y: "y" });
  return q;
}

function t83(): Question {
  const x0 = ri(1, 5), m = ri(1, 3), n = ri(1, 4);
  const y0 = m * x0 + n; // y = mx + n
  const c = 2 * x0 + y0; // 2x + y = c
  const q = baseQ(
    8, "8.3", "fill",
    "Selesaikan sistem berikut dengan SUBSTITUSI.",
    [
      "Persamaan y = " + (m === 1 ? "x" : `${m}x`) + ` + ${n} sudah siap disubstitusikan ke persamaan kedua.`,
      `Ganti y pada 2x + y = ${c} dengan ${m}x + ${n}: 2x + ${m}x + ${n} = ${c} → ${2 + m}x = ${c - n} → x = ${x0}.`,
      `x = ${x0} → y = ${m}·${x0} + ${n} = ${y0}.`,
    ],
    `Substitusi menghasilkan x = ${x0} dan y = ${y0}. Titik potong: (${x0}, ${y0}).`,
    {
      math: `y = ${m === 1 ? "x" : `${m}x`} + ${n}   ;   2x + y = ${c}`,
      fillFields: solveFields(x0, y0),
    }
  );
  q.check = fillCheck({ x: x0, y: y0 }, { x: "x", y: "y" });
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 9 — Fungsi Tujuan & Nilai Optimum
// ════════════════════════════════════════════════════════════════════════════

function sub9Setup() {
  const fa = ri(2, 6), fb = ri(2, 6);
  const corners = [pt(0, 0), pt(ri(5, 7), 0), pt(ri(2, 4), ri(3, 5)), pt(0, ri(5, 8))];
  const values = corners.map((c) => fa * c.x + fb * c.y);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const maxPt = corners[values.indexOf(maxV)];
  const minPt = corners[values.indexOf(minV)];
  return { fa, fb, corners, values, maxV, minV, maxPt, minPt };
}

function t91(): Question {
  const fa = ri(2, 7), fb = ri(2, 7);
  const p = pt(ri(1, 6), ri(1, 6));
  const val = fa * p.x + fb * p.y;
  const q = baseQ(
    9, "9.1", "fill",
    `Tentukan nilai fungsi tujuan f(x, y) = ${fa}x + ${fb}y di titik (${p.x}, ${p.y}).`,
    [
      "Substitusikan koordinat titik ke dalam fungsi: kalikan lalu jumlahkan.",
      `f = ${fa}·${p.x} + ${fb}·${p.y}.`,
      `f = ${fa * p.x} + ${fb * p.y} = ${val}.`,
    ],
    `f(${p.x}, ${p.y}) = ${fa}·${p.x} + ${fb}·${p.y} = ${fa * p.x} + ${fb * p.y} = ${val}.`,
    {
      math: `f(x, y) = ${fa}x + ${fb}y`,
      fillFields: [{ key: "v", label: "nilai f" }],
    }
  );
  q.check = fillCheck({ v: val }, { v: "nilai f" });
  return q;
}

function t92(): Question {
  const s = sub9Setup();
  const distract = new Set<number>([s.maxV, s.minV]);
  while (distract.size < 4) distract.add(s.maxV - ri(1, 4) * ri(1, 3));
  const variants = shuffle([...distract].map((v) => ({ v, ok: v === s.maxV })));
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: String(v.v) }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const table = s.corners.map((c, i) => `f(${c.x}, ${c.y}) = ${s.values[i]}`).join("   ");
  const q = baseQ(
    9, "9.2", "mc",
    `DHP suatu sistem memiliki titik pojok (0, 0), (${s.corners[1].x}, 0), (${s.corners[2].x}, ${s.corners[2].y}), dan (0, ${s.corners[3].y}). Tentukan NILAI MAKSIMUM fungsi tujuan f(x, y) = ${s.fa}x + ${s.fb}y.`,
    [
      "Metode uji titik pojok: hitung nilai f di SETIAP titik pojok, lalu bandingkan.",
      `Hitung: ${table}.`,
      `Nilai terbesar adalah ${s.maxV}, dicapai di titik (${s.maxPt.x}, ${s.maxPt.y}).`,
    ],
    `Evaluasi semua titik pojok: ${table}. Maksimum = ${s.maxV} di (${s.maxPt.x}, ${s.maxPt.y}).`,
    {
      math: `f(x, y) = ${s.fa}x + ${s.fb}y`,
      canvas: {
        xRange: range10, yRange: range10,
        points: s.corners.map((c) => ({ p: c, label: `(${c.x}, ${c.y})` })),
      },
      mcOptions: opts,
    }
  );
  q.check = mcCheck(answerId, {
    [opts.find((o) => o.label === String(s.minV))!.id]: `${s.minV} adalah nilai MINIMUM, bukan maksimum. Cari nilai terbesar.`,
  });
  return q;
}

function t93(): Question {
  const s = sub9Setup();
  const table = s.corners.map((c, i) => `f(${c.x}, ${c.y}) = ${s.values[i]}`).join("   ");
  const q = baseQ(
    9, "9.3", "fill",
    `Lengkapi: untuk titik pojok (0,0), (${s.corners[1].x},0), (${s.corners[2].x},${s.corners[2].y}), (0,${s.corners[3].y}) dan f(x, y) = ${s.fa}x + ${s.fb}y, tentukan nilai maksimum DAN minimum.`,
    [
      "Nilai optimum dicari dari tabel evaluasi seluruh titik pojok.",
      `${table}.`,
      `Maksimum = ${s.maxV} (di (${s.maxPt.x}, ${s.maxPt.y})). Minimum = ${s.minV} (di (${s.minPt.x}, ${s.minPt.y})).`,
    ],
    `Maksimum ${s.maxV} di (${s.maxPt.x}, ${s.maxPt.y}); minimum ${s.minV} di (${s.minPt.x}, ${s.minPt.y}).`,
    {
      math: `f(x, y) = ${s.fa}x + ${s.fb}y`,
      canvas: {
        xRange: range10, yRange: range10,
        points: s.corners.map((c, i) => ({
          p: c, label: `(${c.x}, ${c.y}) → ${s.values[i]}`,
        })),
      },
      fillFields: [
        { key: "max", label: "maksimum" },
        { key: "min", label: "minimum" },
      ],
    }
  );
  q.check = fillCheck({ max: s.maxV, min: s.minV }, { max: "maksimum", min: "minimum" }, [
    ["max", "min", "Tertukar! Maksimum adalah nilai terbesar, minimum nilai terkecil."],
  ]);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-BAB 10 — Pemodelan Soal Cerita
// ════════════════════════════════════════════════════════════════════════════

interface Story {
  objekA: string; objekB: string;
  padaA: number; padaB: number; kapasitas1: number; satuan1: string;
  kapA: number; kapB: number; kapasitas2: number; satuan2: string;
  untungA: number; untungB: number;
}

function story(): Story {
  return pick([
    { objekA: "kursi", objekB: "meja", padaA: 2, padaB: 4, kapasitas1: 32, satuan1: "jam kerja", kapA: 1, kapB: 1, kapasitas2: 10, satuan2: "unit ruang pamer", untungA: 40, untungB: 60 },
    { objekA: "kue bolu", objekB: "kue brownies", padaA: 2, padaB: 1, kapasitas1: 24, satuan1: "ons tepung", kapA: 1, kapB: 1, kapasitas2: 15, satuan2: " Loyang oven", untungA: 5, untungB: 4 },
    { objekA: "kaos", objekB: "kemeja", padaA: 1, padaB: 2, kapasitas1: 20, satuan1: "meter kain", kapA: 1, kapB: 1, kapasitas2: 12, satuan2: " potong jahitan", untungA: 30, untungB: 50 },
  ]);
}

function t101(): Question {
  const s = story();
  const correct = `x = banyak ${s.objekA}, y = banyak ${s.objekB}`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `x = banyak ${s.objekB}, y = banyak ${s.objekA}`, why: "Tertukar! Perhatikan objek pertama dan kedua pada soal.", ok: false },
    { label: `x = total produksi, y = sisa bahan`, why: "Variabel harus menunjuk banyak masing-masing objek, bukan total/sisa.", ok: false },
    { label: `x = keuntungan ${s.objekA}, y = keuntungan ${s.objekB}`, why: "Keuntungan per unit masuk ke fungsi tujuan; variabel adalah BANYAKNYA objek.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    10, "10.1", "mc",
    `Sebuah usaha memproduksi ${s.objekA} dan ${s.objekB}. Pemisalan variabel yang TEPAT untuk memodelkan masalah ini adalah…`,
    [
      "Variabel x dan y harus mewakili BANYAKNYA masing-masing objek yang diproduksi.",
      "Tetapkan objek pertama sebagai x, objek kedua sebagai y — jangan tertukar.",
      `x = banyak ${s.objekA}, y = banyak ${s.objekB}.`,
    ],
    `Variabel menunjuk banyaknya objek: x = banyak ${s.objekA} dan y = banyak ${s.objekB}.`,
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t102(): Question {
  const s = story();
  const correct = `${s.padaA}x + ${s.padaB}y ≤ ${s.kapasitas1}`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `${s.padaA}x + ${s.padaB}y ≥ ${s.kapasitas1}`, why: "Sumber daya “tersedia paling banyak” berarti pemakaian ≤ kapasitas.", ok: false },
    { label: `${s.padaB}x + ${s.padaA}y ≤ ${s.kapasitas1}`, why: "Koefisien kebutuhan tiap objek tertukar.", ok: false },
    { label: `${s.padaA}x + ${s.padaB}y = ${s.kapasitas1}`, why: "Kapasitas adalah batas maksimum (≤), bukan harus habis persis.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    10, "10.2", "mc",
    `Setiap ${s.objekA} membutuhkan ${s.padaA} ${s.satuan1} dan setiap ${s.objekB} membutuhkan ${s.padaB} ${s.satuan1}. Total tersedia ${s.kapasitas1} ${s.satuan1}. Kendala yang tepat adalah…`,
    [
      `Kebutuhan = ${s.padaA}·(banyak ${s.objekA}) + ${s.padaB}·(banyak ${s.objekB}).`,
      "“Tersedia” berarti pemakaian tidak melebihi kapasitas → ≤.",
      `Kendala: ${correct}.`,
    ],
    `Kebutuhan total ${s.padaA}x + ${s.padaB}y dibatasi kapasitas ${s.kapasitas1}, sehingga kendalanya ${correct}.`,
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

function t103(): Question {
  const s = story();
  const k1 = `${s.padaA}x + ${s.padaB}y ≤ ${s.kapasitas1}`;
  const k2 = `${s.kapA === 1 ? "" : s.kapA}x + ${s.kapB === 1 ? "" : s.kapB}y ≤ ${s.kapasitas2}`;
  const obj = `f(x, y) = ${s.untungA}x + ${s.untungB}y (ribu rupiah)`;
  const correct = `Maks ${obj}; kendala: ${k1}; ${k2}; x ≥ 0, y ≥ 0`;
  const variants = shuffle([
    { label: correct, why: "", ok: true },
    { label: `Min ${obj}; kendala: ${k1}; ${k2}; x ≥ 0, y ≥ 0`, why: "Keuntungan diMAKSIMUMkan, bukan diminimumkan.", ok: false },
    { label: `Maks ${obj}; kendala: ${k1}; ${k2}`, why: "Kendala non-negatif x ≥ 0 dan y ≥ 0 wajib disertakan — banyak produksi tidak mungkin negatif.", ok: false },
    { label: `Maks f(x, y) = ${s.untungB}x + ${s.untungA}y; kendala: ${k1}; ${k2}; x ≥ 0, y ≥ 0`, why: "Koefisien fungsi tujuan tertukar dengan objeknya.", ok: false },
  ]);
  const opts = variants.map((v, i) => ({ id: `o${i}`, label: v.label }));
  const answerId = opts[variants.findIndex((v) => v.ok)].id;
  const notes: Record<string, string> = {};
  variants.forEach((v, i) => {
    if (!v.ok) notes[`o${i}`] = v.why;
  });
  const q = baseQ(
    10, "10.3", "mc",
    `Keuntungan tiap ${s.objekA} Rp${s.untungA}.000 dan tiap ${s.objekB} Rp${s.untungB}.000, dengan kendala ${k1} dan ${k2}. Model matematika LENGKAP yang benar adalah…`,
    [
      "Model lengkap = fungsi tujuan + SEMUA kendala + kendala non-negatif.",
      "Keuntungan → maksimumkan. Jangan lupakan x ≥ 0 dan y ≥ 0.",
      `${correct}.`,
    ],
    `Model lengkap: maksimumkan ${obj} dengan kendala ${k1}; ${k2}; x ≥ 0; y ≥ 0.`,
    { mcOptions: opts }
  );
  q.check = mcCheck(answerId, notes);
  return q;
}

// ════════════════════════════════════════════════════════════════════════════

const GENERATORS: Record<number, (() => Question)[]> = {
  1: [t11, t12, t13],
  2: [t21, t22, t23],
  3: [t31, t32, t33],
  4: [t41, t42, t43],
  5: [t51, t52, t53],
  6: [t61, t62, t63],
  7: [t71, t72, t73],
  8: [t81, t82, t83],
  9: [t91, t92, t93],
  10: [t101, t102, t103],
};

export function generateQuestion(subbab: number, avoidTemplateId?: string): Question {
  const gens = GENERATORS[Math.min(Math.max(subbab, 1), 10)] ?? GENERATORS[1];
  const pool = gens.filter((g) => {
    try {
      return true;
    } catch {
      return false;
    }
  });
  for (let attempt = 0; attempt < 8; attempt++) {
    const gen = pick(pool);
    const q = gen();
    if (avoidTemplateId && q.templateId === avoidTemplateId && pool.length > 1) continue;
    return q;
  }
  const gen = gens[ri(0, gens.length - 1)];
  return gen();
}

export { ineqToString, lineToString, axisIntercepts, intersectLines, SIGN_SYMBOL };
export type { IneqSpec, Pt, Sign };
