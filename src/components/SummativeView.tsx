"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Check,
  ChevronRight,
  ClipboardList,
  Loader2,
  Lock,
  RotateCcw,
  Send,
  Undo2,
} from "lucide-react";
import CartesianCanvas from "./CartesianCanvas";
import { lineFromPoints, type IneqSpec, type Pt } from "@/lib/geometry";
import type { CanvasSpec } from "@/lib/templates";
import {
  CONSTRAINT_BANK,
  SUMATIVE,
  SUMATIVE_CORNERS,
  VARIABLE_OPTIONS,
  type SumativeAnswer1,
} from "@/lib/summative";
import { parseNum } from "@/lib/templates";

interface ScoreDetail {
  key: string; label: string; earned: number; max: number;
}
interface Props {
  unlocked: boolean;
  onSubmitted: () => void;
}

export default function SummativeView({ unlocked, onSubmitted }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState<{ totalScore: number; details: ScoreDetail[] } | null>(null);
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [variablesChoice, setVariablesChoice] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [graphTaps, setGraphTaps] = useState<Pt[]>([]);
  const [cornerTaps, setCornerTaps] = useState<Pt[]>([]);
  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/summative", { cache: "no-store" });
        const data = await res.json();
        if (data?.submitted) {
          setSubmitted({ totalScore: data.totalScore, details: data.scoreDetails ?? [] });
        }
      } catch { /* abaikan */ }
      setLoading(false);
    })();
  }, []);

  // garis hasil gambar siswa (pasangan ketukan)
  const drawnLines = useMemo(() => {
    const lines: IneqSpec[] = [];
    const mk = (p1?: Pt, p2?: Pt) => {
      if (!p1 || !p2) return null;
      const l = lineFromPoints(p1, p2);
      return l ? ({ ...l, sign: "<=", color: "#1A1A1A" } as IneqSpec) : null;
    };
    const l1 = mk(graphTaps[0], graphTaps[1]);
    const l2 = mk(graphTaps[2], graphTaps[3]);
    if (l1) lines.push(l1);
    if (l2) lines.push(l2);
    return lines;
  }, [graphTaps]);

  const graphSpec: CanvasSpec = {
    xRange: [0, 12], yRange: [0, 12],
    lines: drawnLines,
  };
  const cornerSpec: CanvasSpec = {
    xRange: [0, 12], yRange: [0, 12],
    lines: drawnLines,
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#D9D9D9] bg-white px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F5F5]"><Lock size={26} className="text-[#A3A3A3]" /></span>
        <div>
          <p className="text-lg font-bold">Asesmen Sumatif Masih Terkunci</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#737373]">
            Tuntaskan seluruh 10 sub-bab dengan mastery learning untuk membuka asesmen akhir (2 soal, penilaian per langkah).
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin text-[#A3A3A3]" /></div>;

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white">
          <div className="bg-[#1A1A1A] px-6 py-8 text-center text-white">
            <Award size={30} className="mx-auto text-[#F59E0B]" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-white/50">Nilai Sumatif Kamu</p>
            <p className="mt-1 font-mono text-6xl font-bold tracking-tight">{submitted.totalScore}</p>
            <p className="text-xs text-white/60">dari 100 · penilaian per langkah</p>
          </div>
          <div className="space-y-3 p-5">
            {submitted.details.map((d) => (
              <div key={d.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[#404040]">{d.label}</span>
                  <span className="font-mono text-xs font-bold text-[#1A1A1A]">{d.earned}/{d.max}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${d.earned >= d.max * 0.8 ? "bg-[#10B981]" : d.earned >= d.max * 0.5 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`}
                    style={{ width: `${(d.earned / d.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setSubmitted(null);
                setVariablesChoice(null); setConstraints([]); setGraphTaps([]); setCornerTaps([]); setVals({});
              }}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] text-sm font-semibold transition active:scale-[0.98]"
            >
              <RotateCcw size={15} /> Perbaiki & Kirim Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleConstraint = (id: string) =>
    setConstraints((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const missing: string[] = [];
  if (!variablesChoice) missing.push("Pemisalan variabel");
  if (constraints.length < 2) missing.push("Pilih kendala (minimal 2)");
  if (graphTaps.length < 4) missing.push(`Gambar garis (${graphTaps.length}/4 titik)`);
  if (cornerTaps.length < SUMATIVE_CORNERS.length) missing.push(`Titik pojok (${cornerTaps.length}/${SUMATIVE_CORNERS.length})`);
  const numKeys = ["maxValue", "maxX", "maxY", "minValue", "minX", "minY"];
  if (numKeys.some((k) => !Number.isFinite(parseNum(vals[k])))) missing.push("Nilai optimum (Soal 2)");

  const submit = async () => {
    if (missing.length > 0) {
      setErrMsg(`Lengkapi dulu: ${missing.join(", ")}.`);
      return;
    }
    setErrMsg(null);
    setSending(true);
    const soal1: SumativeAnswer1 = {
      variablesChoice: variablesChoice!,
      constraints,
      graphPoints: graphTaps,
      corners: cornerTaps,
    };
    const soal2 = {
      maxValue: parseNum(vals.maxValue), maxX: parseNum(vals.maxX), maxY: parseNum(vals.maxY),
      minValue: parseNum(vals.minValue), minX: parseNum(vals.minX), minY: parseNum(vals.minY),
    };
    try {
      const res = await fetch("/api/summative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal1, soal2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? "Gagal mengirim jawaban.");
      } else {
        setSubmitted({ totalScore: data.totalScore, details: data.scoreDetails });
        onSubmitted();
      }
    } finally {
      setSending(false);
    }
  };

  const num = (key: string, label: string) => (
    <label key={key} className="block">
      <span className="mb-1 block text-[11px] font-semibold text-[#737373]">{label}</span>
      <input
        inputMode="decimal"
        value={vals[key] ?? ""}
        onChange={(e) => setVals((v) => ({ ...v, [key]: e.target.value }))}
        className="h-11 w-full rounded-xl border border-[#E5E5E5] px-3 font-mono text-sm outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
        placeholder="…"
      />
    </label>
  );

  return (
    <div className="space-y-4">
      {/* Cerita */}
      <div className="rounded-2xl border-2 border-[#1A1A1A] bg-white p-5 shadow-[4px_4px_0_#E5E5E5]">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-[#F59E0B]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A3A3A3]">Soal Sumatif · Model Masalah</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A] sm:text-[15px]">{SUMATIVE.story}</p>
        <div className="mt-3 grid gap-1.5 text-[13px] sm:grid-cols-2">
          <div className="rounded-xl bg-[#F8F8F8] px-3 py-2 font-mono">Bahan: 2 ons (singkong), 1 ons (pisang), ≤ 12 ons</div>
          <div className="rounded-xl bg-[#F8F8F8] px-3 py-2 font-mono">Kapasitas total ≤ 8 kemasan</div>
        </div>
      </div>

      {/* SOAL 1 */}
      <StepCard n="1.A" title="Pemisalan Variabel" weight={15}>
        <p className="text-sm text-[#525252]">Tentukan pemisalan variabel yang tepat.</p>
        <div className="mt-2 grid gap-2">
          {VARIABLE_OPTIONS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariablesChoice(v.id)}
              className={`min-h-[48px] rounded-xl border px-4 py-2.5 text-left text-[13px] leading-snug transition active:scale-[0.99] ${
                variablesChoice === v.id ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#1D4ED8] shadow-[0_0_0_1px_#3B82F6]" : "border-[#E5E5E5] hover:border-[#C9C9C9]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </StepCard>

      <StepCard n="1.B" title="Menyusun Kendala" weight={20}>
        <p className="text-sm text-[#525252]">Pilih SEMUA kendala yang tepat untuk model masalah ini.</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONSTRAINT_BANK.map((k) => {
            const on = constraints.includes(k.id);
            return (
              <button
                key={k.id}
                onClick={() => toggleConstraint(k.id)}
                className={`min-h-[48px] rounded-xl border px-3 font-mono text-[13px] transition active:scale-95 ${
                  on ? "border-[#3B82F6] bg-[#3B82F6] text-white" : "border-[#E5E5E5] hover:border-[#C9C9C9]"
                }`}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </StepCard>

      <StepCard n="1.C" title="Menggambar Grafik" weight={20}
        hint="Ketuk 4 titik: titik ke-1 & 2 = dua titik potong garis kendala bahan; titik ke-3 & 4 = dua titik potong garis kapasitas. Garismu digambar otomatis.">
        <CartesianCanvas
          spec={graphSpec}
          height={300}
          interactive={graphTaps.length < 4}
          taps={graphTaps}
          showTapIndex
          onTap={(_, snapped) => setGraphTaps((t) => (t.length < 4 ? [...t, snapped] : t))}
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-[#737373]">Titik: {graphTaps.length}/4</span>
          {graphTaps.length > 0 && (
            <button onClick={() => setGraphTaps((t) => t.slice(0, -1))} className="flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5E5E5] px-2.5 text-xs font-medium text-[#525252]">
              <Undo2 size={12} /> Hapus terakhir
            </button>
          )}
        </div>
      </StepCard>

      <StepCard n="1.D" title="Menentukan Titik Pojok" weight={20}
        hint={`Dengan garis yang kamu gambar, ketuk ${SUMATIVE_CORNERS.length} titik pojok DHP (termasuk titik potong dengan sumbu).`}>
        <CartesianCanvas
          spec={cornerSpec}
          height={300}
          interactive={cornerTaps.length < SUMATIVE_CORNERS.length}
          taps={cornerTaps}
          tapColor="#7C3AED"
          showTapIndex
          onTap={(_, snapped) => setCornerTaps((t) => (t.length < SUMATIVE_CORNERS.length ? [...t, snapped] : t))}
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-[#737373]">Titik pojok: {cornerTaps.length}/{SUMATIVE_CORNERS.length}</span>
          {cornerTaps.length > 0 && (
            <button onClick={() => setCornerTaps((t) => t.slice(0, -1))} className="flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5E5E5] px-2.5 text-xs font-medium text-[#525252]">
              <Undo2 size={12} /> Hapus terakhir
            </button>
          )}
        </div>
      </StepCard>

      {/* SOAL 2 */}
      <StepCard n="2" title="Nilai Maksimum & Minimum Fungsi Tujuan" weight={25}
        hint={`Fungsi tujuan keuntungan: f(x, y) = ${SUMATIVE.objectiveFa}x + ${SUMATIVE.objectiveFb}y (ribu rupiah). Evaluasi di semua titik pojokmu.`}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {num("maxValue", "Nilai maksimum")}
          {num("maxX", "… dicapai di x")}
          {num("maxY", "… di y")}
          {num("minValue", "Nilai minimum")}
          {num("minX", "… dicapai di x")}
          {num("minY", "… di y")}
        </div>
      </StepCard>

      {errMsg && (
        <p className="rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{errMsg}</p>
      )}

      <button
        onClick={submit}
        disabled={sending}
        className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1A1A1A] text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
        {sending ? "Menilai…" : "Kirim Jawaban Sumatif"}
      </button>
      <p className="pb-4 text-center text-[11px] text-[#A3A3A3]">
        Penilaian per langkah (partial scoring): variabel 15% · kendala 20% · grafik 20% · titik pojok 20% · optimum 25%
      </p>
    </div>
  );
}

function StepCard({
  n, title, weight, hint, children,
}: {
  n: string; title: string; weight: number; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="rounded-lg bg-[#1A1A1A] px-2 py-1 font-mono text-[11px] font-bold text-white">{n}</span>
        <h3 className="flex-1 text-[15px] font-bold tracking-tight">{title}</h3>
        <span className="rounded-full bg-[#F5F5F5] px-2.5 py-1 font-mono text-[10px] font-bold text-[#737373]">{weight}%</span>
      </div>
      {hint && (
        <p className="mt-2 rounded-lg bg-[#EFF6FF] px-3 py-2 text-xs leading-relaxed text-[#1E40AF]">{hint}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
