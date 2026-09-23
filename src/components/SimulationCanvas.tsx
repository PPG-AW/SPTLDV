"use client";

import { useMemo, useState } from "react";
import { Check, Dices, Eye, MapPin, RotateCcw, Undo2, X } from "lucide-react";
import CartesianCanvas from "./CartesianCanvas";
import MathSteps from "./MathText";
import {
  cornerPoints,
  lineFromIntercepts,
  satisfies,
  type IneqSpec,
  type Pt,
  type Sign,
} from "@/lib/geometry";
import type { CanvasSpec } from "@/lib/templates";
import type { SimulationKind } from "@/lib/curriculum";
import { ri, pick } from "@/lib/templates";
import { eqStr, neg, stepsInterceptX, stepsInterceptY, stepsTestPoint } from "@/lib/mathfmt";

const SYM: Record<Sign, string> = { "<=": "≤", ">=": "≥", "<": "<", ">": ">" };
const isDashed = (s: Sign) => s === "<" || s === ">";
const NON_NEG: IneqSpec[] = [
  { a: 1, b: 0, c: 0, sign: ">=" },
  { a: 0, b: 1, c: 0, sign: ">=" },
];
const ineqStr = (i: IneqSpec) => eqStr(i.a, i.b, i.c, SYM[i.sign]);

export default function SimulationCanvas({ kind }: { kind: SimulationKind }) {
  const [seed, setSeed] = useState(0);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
        <span className="text-xs font-bold tracking-widest text-[#737373]">SIMULASI INTERAKTIF</span>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E5E5E5] px-3 text-xs font-semibold transition hover:bg-[#F5F5F5] active:scale-95"
        >
          <Dices size={14} /> Soal Baru
        </button>
      </div>
      <div className="px-4 py-4 sm:px-5" key={seed}>
        {kind === "line" && <LineSim onNext={() => setSeed((s) => s + 1)} />}
        {kind === "region" && <RegionSim />}
        {kind === "system" && <SystemSim />}
        {kind === "corner" && <CornerSim />}
      </div>
    </div>
  );
}

/* ══ Sub-Bab 3 — pilih 2 titik potong + jenis garis, lalu dinilai ══════════ */
function LineSim({ onNext }: { onNext: () => void }) {
  const [p] = useState(() => ri(2, 6));
  const [q] = useState(() => ri(2, 6));
  const [sign] = useState<Sign>(() => pick<Sign>(["<=", ">=", "<", ">"]));
  const line = useMemo(() => lineFromIntercepts(p, q), [p, q]);
  const dashedCorrect = isDashed(sign);

  const [taps, setTaps] = useState<Pt[]>([]);
  const [styleChoice, setStyleChoice] = useState<"solid" | "dashed" | null>(null);
  const [checked, setChecked] = useState(false);

  const targets = [{ x: p, y: 0 }, { x: 0, y: q }];
  const pointsOk = useMemo(() => {
    if (taps.length < 2) return false;
    return targets.every((t) => taps.some((s) => Math.hypot(s.x - t.x, s.y - t.y) < 0.55));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taps, p, q]);
  const styleOk = styleChoice === (dashedCorrect ? "dashed" : "solid");
  const allOk = pointsOk && styleOk;

  const spec: CanvasSpec = {
    xRange: [Math.min(-1, -1), Math.max(p, q) + 2],
    yRange: [-1, Math.max(p, q) + 2],
    lines: checked && allOk
      ? [{ ...line, sign, dashed: dashedCorrect }]
      : taps.length === 2
      ? [{ a: taps[1].y - taps[0].y, b: taps[0].x - taps[1].x, c: (taps[1].y - taps[0].y) * taps[0].x + (taps[0].x - taps[1].x) * taps[0].y, sign: "<=", dashed: styleChoice === "dashed", color: checked ? "#EF4444" : "#1A1A1A" }]
      : [],
    points: checked ? targets.map((t) => ({ p: t, hollow: true, color: "#10B981", label: `(${t.x}, ${t.y})` })) : [],
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[#525252]">
        Gambarlah garis pembatas dari pertidaksamaan berikut: <b>ketuk dua titik potongnya</b> pada sumbu, lalu <b>pilih jenis garisnya</b>.
      </p>
      <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] py-2.5 text-center font-mono text-lg">
        {eqStr(line.a, line.b, line.c, SYM[sign])}
      </div>

      <CartesianCanvas
        spec={spec}
        height={290}
        interactive={!checked && taps.length < 2}
        taps={taps}
        showTapIndex
        onTap={(_, snapped) => { if (!checked && taps.length < 2) setTaps((t) => [...t, snapped]); }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#737373]">Titik: {taps.length}/2</span>
        {taps.length > 0 && !checked && (
          <button onClick={() => setTaps((t) => t.slice(0, -1))} className="flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5E5E5] px-2.5 text-xs font-medium">
            <Undo2 size={12} /> Hapus
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {([["solid", "Garis penuh"], ["dashed", "Garis putus-putus"]] as const).map(([v, label]) => (
          <button
            key={v}
            disabled={checked}
            onClick={() => setStyleChoice(v)}
            className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition active:scale-95 disabled:opacity-70 ${
              styleChoice === v ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-[#E5E5E5] bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          disabled={taps.length < 2 || !styleChoice}
          className="min-h-[48px] w-full rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-30"
        >
          Periksa Gambarku
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${
            allOk ? "border-[#10B981]/30 bg-[#ECFDF5] text-[#065F46]" : "border-[#EF4444]/30 bg-[#FEF2F2] text-[#991B1B]"
          }`}>
            {allOk ? <Check size={15} className="mt-0.5 shrink-0" /> : <X size={15} className="mt-0.5 shrink-0" />}
            <span>
              <b>{allOk ? "Benar sekali!" : "Belum tepat."}</b>{" "}
              {!pointsOk && `Titik potong yang benar adalah (${p}, 0) dan (0, ${q}). `}
              {!styleOk && `Jenis garis seharusnya ${dashedCorrect ? "PUTUS-PUTUS karena tandanya " + SYM[sign] + " (tanpa \"sama dengan\")" : "PENUH karena tandanya " + SYM[sign] + " (memuat \"sama dengan\")"}. `}
              {allOk && "Titik potong dan jenis garismu keduanya sudah tepat."}
            </span>
          </div>
          <MathSteps
            size="sm"
            text={
              `${stepsInterceptX(line.a, line.b, line.c)}\n${stepsInterceptY(line.a, line.b, line.c)}\n` +
              `> Tanda ${SYM[sign]} ${dashedCorrect ? "tidak memuat" : "memuat"} \"sama dengan\" → garis ${dashedCorrect ? "PUTUS-PUTUS" : "PENUH"}.`
            }
          />
          <button onClick={onNext} className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1A1A1A] text-sm font-bold transition active:scale-[0.98]">
            <RotateCcw size={14} /> Coba Soal Lain
          </button>
        </div>
      )}
    </div>
  );
}

/* ══ Sub-Bab 4 — uji titik bebas ══════════════════════════════════════════ */
function RegionSim() {
  const [ineq] = useState<IneqSpec>(() => ({
    ...lineFromIntercepts(ri(3, 6), ri(3, 6)),
    sign: pick<Sign>(["<=", ">="]),
  }));
  const [testPt, setTestPt] = useState<Pt | null>(null);
  const [showShade, setShowShade] = useState(false);
  const verdict = testPt ? satisfies(testPt, ineq) : null;
  const spec: CanvasSpec = {
    xRange: [-1, Math.ceil(ineq.c / ineq.a) + 2],
    yRange: [-1, Math.ceil(ineq.c / ineq.b) + 2],
    lines: [ineq],
    shadeIndices: showShade ? [0] : [],
    points: testPt ? [{ p: testPt, color: verdict ? "#10B981" : "#EF4444" }] : [],
  };
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[#525252]">
        Ketuk titik mana pun untuk mengujinya terhadap <b className="font-mono">{ineqStr(ineq)}</b>. Titik hijau berarti memenuhi, merah berarti tidak.
      </p>
      <CartesianCanvas spec={spec} height={285} interactive onTap={(_, s) => setTestPt(s)} />
      <div className="flex flex-wrap items-center gap-2">
        {testPt && (
          <span className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${verdict ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`}>
            {verdict ? <Check size={15} /> : <X size={15} />}
            ({testPt.x}, {testPt.y}) {verdict ? "memenuhi" : "tidak memenuhi"}
          </span>
        )}
        <button
          onClick={() => setShowShade((s) => !s)}
          className="ml-auto flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-[#1A1A1A] px-3.5 text-xs font-bold transition active:scale-95"
        >
          <Eye size={14} /> {showShade ? "Sembunyikan Arsiran" : "Tampilkan Arsiran"}
        </button>
      </div>
      {testPt && (
        <MathSteps size="sm" text={stepsTestPoint(ineq.a, ineq.b, ineq.c, SYM[ineq.sign], testPt.x, testPt.y).text} />
      )}
      <p className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs leading-relaxed text-[#525252]">
        Semua titik hijau berkumpul membentuk daerah penyelesaian — yaitu daerah yang BERSIH (tidak diarsir).
      </p>
    </div>
  );
}

/* ══ Sub-Bab 6 — dua kendala membentuk DHP ════════════════════════════════ */
function SystemSim() {
  const [{ l1, l2 }] = useState(() => {
    const ix = ri(2, 4), iy = ri(2, 4);
    const positiveGradient = Math.random() < 0.4;
    return {
      l1: { a: 1, b: 1, c: ix + iy, sign: "<=" } as IneqSpec,
      l2: positiveGradient
        ? ({ a: -1, b: 1, c: iy - ix, sign: "<=" } as IneqSpec)
        : ({ a: 2, b: 1, c: 2 * ix + iy, sign: "<=" } as IneqSpec),
    };
  });
  const full = useMemo(() => [l1, l2, ...NON_NEG], [l1, l2]);
  const [showDhp, setShowDhp] = useState(false);
  const [testPt, setTestPt] = useState<Pt | null>(null);
  const corners = useMemo(() => cornerPoints(full), [full]);
  const maxV = Math.max(4, ...corners.map((c) => Math.max(c.x, c.y))) + 2;
  const spec: CanvasSpec = {
    xRange: [-1, maxV], yRange: [-1, maxV],
    lines: [l1, l2],
    dhpIneqs: showDhp ? full : undefined,
    points: testPt ? [{ p: testPt, color: full.every((i) => satisfies(testPt, i)) ? "#10B981" : "#EF4444" }] : [],
  };
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[#525252]">
        Tampilkan DHP untuk melihat daerah bersih hasil irisan semua kendala, lalu ketuk titik mana pun untuk mengujinya.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-center font-mono text-xs">{ineqStr(l1)}</div>
        <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-center font-mono text-xs">{ineqStr(l2)}</div>
      </div>
      <button
        onClick={() => setShowDhp((v) => !v)}
        className={`min-h-[44px] w-full rounded-xl border-2 text-sm font-bold transition active:scale-95 ${showDhp ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#E5E5E5]"}`}
      >
        {showDhp ? "Sembunyikan DHP" : "Tampilkan DHP (arsir yang bukan penyelesaian)"}
      </button>
      <CartesianCanvas spec={spec} height={300} interactive onTap={(_, s) => setTestPt(s)} />
      {testPt && (
        <div className="space-y-1.5">
          {[l1, l2].map((i, k) => {
            const ok = satisfies(testPt, i);
            return (
              <div key={k} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs ${ok ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`}>
                {ok ? <Check size={13} /> : <X size={13} />} ({testPt.x}, {testPt.y}) pada {ineqStr(i)}
              </div>
            );
          })}
          <p className="text-xs leading-relaxed text-[#525252]">
            {full.every((i) => satisfies(testPt, i))
              ? "Semua kendala terpenuhi (termasuk x ≥ 0 dan y ≥ 0) → titik berada DI DALAM DHP."
              : "Ada kendala yang dilanggar → titik berada DI LUAR DHP."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══ Sub-Bab 7 — berburu titik pojok ══════════════════════════════════════ */
function CornerSim() {
  const [sys] = useState(() => {
    for (let i = 0; i < 40; i++) {
      const px = ri(1, 4), py = ri(1, 4);
      const lines: IneqSpec[] =
        Math.random() < 0.5
          ? [{ a: 1, b: 1, c: px + py, sign: "<=" }, { a: 1, b: 2, c: px + 2 * py, sign: "<=" }]
          : [{ a: 1, b: 1, c: px + py, sign: "<=" }, { a: -1, b: 1, c: py - px, sign: "<=" }];
      const ineqs = [...lines, ...NON_NEG];
      const corners = cornerPoints(ineqs);
      if (corners.length >= 3 && corners.every((c) => Number.isInteger(c.x) && Number.isInteger(c.y))) {
        return { ineqs, lines, corners };
      }
    }
    const l: IneqSpec = { a: 1, b: 1, c: 6, sign: "<=" };
    const ineqs = [l, ...NON_NEG];
    return { ineqs, lines: [l], corners: cornerPoints(ineqs) };
  });
  const [found, setFound] = useState<Pt[]>([]);
  const [reveal, setReveal] = useState(false);
  const shown = reveal ? sys.corners : found;
  const maxV = Math.max(...sys.corners.map((c) => Math.max(c.x, c.y))) + 2;
  const spec: CanvasSpec = {
    xRange: [-1, maxV], yRange: [-1, maxV],
    lines: sys.lines, dhpIneqs: sys.ineqs,
    points: shown.map((c) => ({ p: c, color: "#7C3AED", label: `(${c.x}, ${c.y})` })),
  };
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[#525252]">
        Daerah bersih di tengah adalah DHP dengan <b>{sys.corners.length} titik pojok</b>. Ketuk setiap sudutnya untuk menemukannya.
      </p>
      <CartesianCanvas
        spec={spec}
        height={300}
        interactive={!reveal && found.length < sys.corners.length}
        onTap={(raw) => {
          const hit = sys.corners.find((c) => Math.hypot(raw.x - c.x, raw.y - c.y) < 0.6);
          if (hit && !found.some((f) => f.x === hit.x && f.y === hit.y)) setFound((f) => [...f, hit]);
        }}
      />
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg bg-[#8B5CF6]/10 px-3 py-2 text-xs font-bold text-[#6D28D9]">
          <MapPin size={13} /> {shown.length}/{sys.corners.length} ditemukan
        </span>
        <button onClick={() => setReveal(true)} className="ml-auto flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-[#1A1A1A] px-3.5 text-xs font-bold transition active:scale-95">
          <Eye size={14} /> Tampilkan Semua
        </button>
      </div>
      {(reveal || found.length === sys.corners.length) && (
        <MathSteps
          size="sm"
          text={
            "> Seluruh titik pojok DHP ini:\n" +
            sys.corners.map((c, i) => `> Titik pojok ${i + 1}: (${neg(c.x)}, ${neg(c.y)})`).join("\n")
          }
        />
      )}
    </div>
  );
}
