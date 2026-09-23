"use client";

import { useMemo, useState } from "react";
import { Check, Dices, Eye, EyeOff, MapPin, X } from "lucide-react";
import CartesianCanvas from "./CartesianCanvas";
import {
  cornerPoints,
  ineqToString,
  lineFromIntercepts,
  satisfies,
  type IneqSpec,
  type Pt,
  type Sign,
} from "@/lib/geometry";
import type { CanvasSpec } from "@/lib/templates";
import type { SimulationKind } from "@/lib/curriculum";
import { ri, pick } from "@/lib/templates";

const SIGNS: Sign[] = ["<=", ">=", "<", ">"];
const SYM: Record<Sign, string> = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
const isDashed = (s: Sign) => s === "<" || s === ">";

// spesifikasi simulasi per sub-bab (dari tabel kurikulum)
export function simSpecFor(subbab: number): { kind: SimulationKind } | null {
  switch (subbab) {
    case 3: return { kind: "line" };
    case 4: return { kind: "region" };
    case 6: return { kind: "system" };
    case 7: return { kind: "corner" };
    default: return null;
  }
}

function axisConstraints(): IneqSpec[] {
  return [
    { a: 1, b: 0, c: 0, sign: ">=" },
    { a: 0, b: 1, c: 0, sign: ">=" },
  ];
}

export default function SimulationCanvas({ kind }: { kind: SimulationKind }) {
  const [seed, setSeed] = useState(0);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
        <span className="text-xs font-bold tracking-widest text-[#737373]">SIMULASI INTERAKTIF</span>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E5E5E5] px-3 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5F5] active:scale-95"
        >
          <Dices size={14} /> Acak Ulang
        </button>
      </div>
      <div className="px-4 py-4 sm:px-5" key={seed}>
        {kind === "line" && <LineSim />}
        {kind === "region" && <RegionSim />}
        {kind === "system" && <SystemSim />}
        {kind === "corner" && <CornerSim />}
      </div>
    </div>
  );
}

/* ── Sim 3: gaya garis bergantung tanda relasi ─────────────────────────────── */
function LineSim() {
  const [p] = useState(() => ri(2, 6));
  const [q] = useState(() => ri(2, 6));
  const [sign, setSign] = useState<Sign>("<=");
  const line = useMemo(() => lineFromIntercepts(p, q), [p, q]);
  const ineq: IneqSpec = { ...line, sign, dashed: isDashed(sign) };
  const spec: CanvasSpec = {
    xRange: [0, 8], yRange: [0, 8],
    lines: [ineq],
    points: [{ p: { x: p, y: 0 }, hollow: true }, { p: { x: 0, y: q }, hollow: true }],
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#525252]">
        Ubah tanda relasi dan perhatikan bagaimana gaya garis pembatas berubah. Titik potongnya: <b className="font-mono">({p}, 0)</b> dan <b className="font-mono">(0, {q})</b>.
      </p>
      <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] py-2.5 text-center font-mono text-lg">
        {ineqToString({ ...line, sign })}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {SIGNS.map((s) => (
          <button
            key={s}
            onClick={() => setSign(s)}
            className={`min-h-[44px] rounded-xl border text-lg font-bold transition active:scale-95 ${
              sign === s ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#C9C9C9]"
            }`}
          >
            {SYM[s]}
          </button>
        ))}
      </div>
      <CartesianCanvas spec={spec} height={260} />
      <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs leading-relaxed text-[#525252]">
        {isDashed(sign)
          ? "Tanda tanpa “sama dengan” → garis PUTUS-PUTUS (titik pada garis tidak ikut menjadi penyelesaian)."
          : "Tanda memuat “sama dengan” → garis PENUH (titik pada garis ikut menjadi penyelesaian)."}
      </p>
    </div>
  );
}

/* ── Sim 4: uji titik bebas + arsiran ──────────────────────────────────────── */
function RegionSim() {
  const [ineq] = useState<IneqSpec>(() => ({ ...lineFromIntercepts(ri(3, 6), ri(3, 6)), sign: pick(["<=", ">="] as Sign[]) }));
  const [testPt, setTestPt] = useState<Pt | null>(null);
  const [showShade, setShowShade] = useState(false);
  const verdict = testPt ? satisfies(testPt, ineq) : null;
  const spec: CanvasSpec = {
    xRange: [0, 8], yRange: [0, 8],
    lines: [ineq],
    shadeIndices: showShade ? [0] : [],
    points: testPt ? [{ p: testPt, color: verdict ? "#10B981" : "#EF4444" }] : [],
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#525252]">
        Ketuk titik mana pun untuk mengujinya terhadap <b className="font-mono">{ineqToString(ineq)}</b>. Kapan titik berwarna hijau?
      </p>
      <CartesianCanvas
        spec={spec}
        height={280}
        interactive
        onTap={(_, snapped) => setTestPt(snapped)}
      />
      <div className="flex flex-wrap items-center gap-2">
        {testPt && (
          <span className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${verdict ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`}>
            {verdict ? <Check size={15} /> : <X size={15} />}
            ({testPt.x}, {testPt.y}) {verdict ? "memenuhi" : "tidak memenuhi"}
          </span>
        )}
        <button
          onClick={() => setShowShade((s) => !s)}
          className="ml-auto flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1A1A1A] px-3.5 text-xs font-semibold transition active:scale-95"
        >
          {showShade ? <EyeOff size={14} /> : <Eye size={14} />}
          {showShade ? "Sembunyikan Arsiran" : "Tampilkan Arsiran"}
        </button>
      </div>
      <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs leading-relaxed text-[#525252]">
        Semua titik hijau berkumpul membentuk DAERAH PENYELESAIAN — itulah sisi garis yang diarsir.
      </p>
    </div>
  );
}

/* ── Sim 6: dua kendala → DHP irisan ───────────────────────────────────────── */
function SystemSim() {
  const [{ l1, l2 }] = useState(() => {
    const ix = ri(2, 4), iy = ri(2, 4);
    return {
      l1: { a: 1, b: 1, c: ix + iy, sign: "<=" } as IneqSpec,
      l2: { a: 2, b: 1, c: 2 * ix + iy, sign: "<=" } as IneqSpec,
    };
  });
  const full = useMemo(() => [l1, l2, ...axisConstraints()], [l1, l2]);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [dhp, setDhp] = useState(false);
  const [testPt, setTestPt] = useState<Pt | null>(null);
  const spec: CanvasSpec = {
    xRange: [0, 10], yRange: [0, 10],
    lines: [l1, l2],
    shadeIndices: [...(s1 ? [0] : []), ...(s2 ? [1] : [])],
    dhpIneqs: dhp ? full : undefined,
    points: testPt ? [{ p: testPt, color: full.every((i) => satisfies(testPt, i)) ? "#10B981" : "#EF4444" }] : [],
  };
  const report = testPt
    ? full.map((i, k) => ({ label: ineqToString(i), ok: satisfies(testPt, i) })).filter((_, k) => k < 2)
    : null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#525252]">
        Nyalakan arsiran tiap kendala satu per satu, lalu temukan irisan keduanya (DHP). Kamu juga bisa mengetuk titik untuk mengujinya.
      </p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        <button onClick={() => setS1((v) => !v)} className={`min-h-[44px] rounded-xl border px-2 font-mono text-xs font-semibold transition active:scale-95 ${s1 ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-[#E5E5E5] bg-white"}`}>
          {ineqToString(l1)}
        </button>
        <button onClick={() => setS2((v) => !v)} className={`min-h-[44px] rounded-xl border px-2 font-mono text-xs font-semibold transition active:scale-95 ${s2 ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-[#E5E5E5] bg-white"}`}>
          {ineqToString(l2)}
        </button>
        <button onClick={() => setDhp((v) => !v)} className={`min-h-[44px] rounded-xl border px-2 text-xs font-bold transition active:scale-95 ${dhp ? "border-[#8B5CF6] bg-[#8B5CF6] text-white" : "border-[#E5E5E5] bg-white"}`}>
          Tampilkan DHP
        </button>
      </div>
      <CartesianCanvas spec={spec} height={300} interactive onTap={(_, snapped) => setTestPt(snapped)} />
      {report && testPt && (
        <div className="space-y-1.5">
          {report.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs ${r.ok ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`}>
              {r.ok ? <Check size={13} /> : <X size={13} />} ({testPt.x}, {testPt.y}) → {r.label}
            </div>
          ))}
          <p className="text-xs text-[#525252]">
            {full.every((i) => satisfies(testPt, i))
              ? "Kedua kendala (plus x ≥ 0, y ≥ 0) terpenuhi → titik berada DI DALAM DHP."
              : "Ada kendala yang dilanggar → titik di LUAR DHP. Perhatikan kendala x ≥ 0 dan y ≥ 0 juga!"}
          </p>
        </div>
      )}
      <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs leading-relaxed text-[#525252]">
        DHP berwarna ungu adalah IRISAN semua arsiran — satu-satunya daerah yang memenuhi seluruh kendala sekaligus.
      </p>
    </div>
  );
}

/* ── Sim 7: berburu titik pojok ────────────────────────────────────────────── */
function CornerSim() {
  const [sys] = useState(() => {
    const single = Math.random() < 0.5;
    if (single) {
      const l: IneqSpec = { ...lineFromIntercepts(ri(4, 7), ri(4, 7)), sign: "<=" };
      const ineqs = [l, ...axisConstraints()];
      return { ineqs, lines: [l] };
    }
    const ix = ri(2, 4), iy = ri(2, 4);
    const l1: IneqSpec = { a: 1, b: 1, c: ix + iy, sign: "<=" };
    const l2: IneqSpec = { a: 3, b: 1, c: 3 * ix + iy, sign: "<=" };
    return { ineqs: [l1, l2, ...axisConstraints()], lines: [l1, l2] };
  });
  const corners = useMemo(() => cornerPoints(sys.ineqs), [sys]);
  const [found, setFound] = useState<Pt[]>([]);
  const [reveal, setReveal] = useState(false);
  const shown = reveal ? corners : found;
  const spec: CanvasSpec = {
    xRange: [0, 10], yRange: [0, 10],
    lines: sys.lines,
    dhpIneqs: sys.ineqs,
    points: shown.map((c) => ({ p: c, color: "#7C3AED", label: `(${c.x}, ${c.y})` })),
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#525252]">
        DHP ungu punya <b>{corners.length} titik pojok</b>. Ketuk sudut-sudutnya satu per satu untuk menemukannya ({found.length}/{corners.length}).
      </p>
      <CartesianCanvas
        spec={spec}
        height={300}
        interactive={!reveal && found.length < corners.length}
        onTap={(raw) => {
          const hit = corners.find((c) => Math.hypot(raw.x - c.x, raw.y - c.y) < 0.6);
          if (hit && !found.some((f) => f.x === hit.x && f.y === hit.y)) {
            setFound((f) => [...f, hit]);
          }
        }}
      />
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg bg-[#8B5CF6]/10 px-3 py-2 text-xs font-bold text-[#6D28D9]">
          <MapPin size={13} /> {reveal ? corners.length : found.length}/{corners.length} ditemukan
        </span>
        <button
          onClick={() => setReveal(true)}
          className="ml-auto flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#1A1A1A] px-3.5 text-xs font-semibold transition active:scale-95"
        >
          <Eye size={14} /> Tampilkan Semua
        </button>
      </div>
      <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs leading-relaxed text-[#525252]">
        Titik pojok = sudut poligon DHP. Di titik-titik inilah nanti nilai optimum fungsi tujuan dicek satu per satu.
      </p>
    </div>
  );
}
