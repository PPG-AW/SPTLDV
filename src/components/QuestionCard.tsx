"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";
import CartesianCanvas, { vibrate } from "./CartesianCanvas";
import { generateQuestion, parseNum, type Question } from "@/lib/templates";
import type { Pt } from "@/lib/geometry";

export interface AnswerMeta {
  templateId: string;
  hintLevel: number;
  durationSeconds: number;
  note?: string;
}

interface Props {
  subbab: number;
  onAnswer: (isCorrect: boolean, meta: AnswerMeta) => void;
  review?: boolean;
}

export default function QuestionCard({ subbab, onAnswer, review }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [phase, setPhase] = useState<"answering" | "wrong" | "correct">("answering");
  const [mcSel, setMcSel] = useState<string | null>(null);
  const [graphSel, setGraphSel] = useState<number | null>(null);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [taps, setTaps] = useState<Pt[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startRef = useRef<number>(Date.now());
  const hintMaxRef = useRef(0);
  const avoidRef = useRef<string | undefined>(undefined);

  const newQuestion = () => {
    const q = generateQuestion(subbab, avoidRef.current);
    avoidRef.current = q.templateId;
    setQuestion(q);
    setPhase("answering");
    setMcSel(null);
    setGraphSel(null);
    setFills({});
    setTaps([]);
    setFeedback(null);
    startRef.current = Date.now();
  };

  useEffect(() => {
    hintMaxRef.current = 0;
    setHintLevel(0);
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subbab, review]);

  const useHint = () => {
    const next = Math.min(hintLevel + 1, 3);
    setHintLevel(next);
    hintMaxRef.current = Math.max(hintMaxRef.current, next);
  };

  const ready = useMemo(() => {
    if (!question) return false;
    switch (question.kind) {
      case "mc": return mcSel !== null;
      case "graph": return graphSel !== null;
      case "fill":
        return (question.fillFields ?? []).every((f) => Number.isFinite(parseNum(fills[f.key])));
      case "points": return taps.length >= (question.needPoints ?? 1);
      case "region-tap": return taps.length >= 1;
    }
  }, [question, mcSel, graphSel, fills, taps]);

  const submit = () => {
    if (!question || !ready) return;
    const answer =
      question.kind === "mc" ? mcSel :
      question.kind === "graph" ? graphSel :
      question.kind === "fill" ? fills :
      taps;
    const res = question.check(answer);
    const durationSeconds = Math.min(Math.round((Date.now() - startRef.current) / 1000), 3600);
    onAnswer(res.ok, {
      templateId: question.templateId,
      hintLevel: hintMaxRef.current,
      durationSeconds,
      note: res.ok ? undefined : res.note,
    });
    if (res.ok) {
      vibrate([25, 50, 25]);
      setPhase("correct");
      setFeedback(null);
    } else {
      vibrate(50);
      setPhase("wrong");
      setFeedback(res.note ?? "Belum tepat. Coba lagi — gunakan petunjuk bila perlu.");
    }
  };

  if (!question) return <div className="h-64 animate-pulse rounded-2xl border border-[#E5E5E5] bg-white" />;

  const canTapMore = question.kind === "points"
    ? taps.length < (question.needPoints ?? 1)
    : question.kind === "region-tap";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      {/* header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${phase === "correct" ? "bg-[#10B981]/10 text-[#059669]" : "bg-[#1A1A1A] text-white"}`}>
            {question.templateId}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {review ? "Latihan Ulang" : "Asesmen Formatif"}
          </span>
        </div>
        <button
          onClick={useHint}
          disabled={hintLevel >= 3 || phase === "correct"}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 text-xs font-semibold text-[#B45309] transition active:scale-95 disabled:opacity-40"
        >
          <Lightbulb size={14} />
          Petunjuk {hintLevel === 0 ? "H1" : hintLevel < 3 ? `H${hintLevel + 1}` : "Habis"}
        </button>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {/* prompt & math */}
        <p className="text-sm leading-relaxed text-[#1A1A1A] sm:text-[15px]">{question.prompt}</p>
        {question.math && (
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3 text-center font-mono text-[15px] font-medium tracking-wide text-[#1A1A1A] sm:text-lg">
            {question.math}
          </div>
        )}

        {/* hints */}
        {hintLevel > 0 && (
          <div className="space-y-2">
            {question.hints.slice(0, hintLevel).map((h, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#92400E]">
                <HelpCircle size={15} className="mt-0.5 shrink-0" />
                <span><b className="font-semibold">H{i + 1}.</b> {h}</span>
              </div>
            ))}
          </div>
        )}

        {/* canvas utama */}
        {question.canvas && question.kind !== "graph" && (
          <CartesianCanvas
            spec={question.canvas}
            height={question.kind === "points" || question.kind === "region-tap" ? 300 : 240}
            interactive={canTapMore && phase !== "correct"}
            taps={taps}
            showTapIndex={question.kind === "points"}
            targets={question.kind === "points" ? [] : []}
            revealTargets={false}
            onTap={(_, snapped) => {
              if (phase === "correct") return;
              if (question.kind === "region-tap") setTaps([snapped]);
              else if (question.kind === "points" && taps.length < (question.needPoints ?? 1)) {
                setTaps((t) => [...t, snapped]);
              }
            }}
          />
        )}

        {/* pilihan ganda */}
        {question.kind === "mc" && (
          <div className="grid gap-2">
            {(question.mcOptions ?? []).map((o) => {
              const sel = mcSel === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => { setMcSel(o.id); setPhase("answering"); setFeedback(null); }}
                  className={`min-h-[48px] rounded-xl border px-4 py-3 text-left font-mono text-[13px] leading-snug transition active:scale-[0.99] sm:text-sm ${
                    sel
                      ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#1D4ED8] shadow-[0_0_0_1px_#3B82F6]"
                      : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#C9C9C9]"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {/* isian */}
        {question.kind === "fill" && (
          <div className={`grid gap-2 ${(question.fillFields ?? []).length > 1 ? "sm:grid-cols-2" : ""}`}>
            {(question.fillFields ?? []).map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#737373]">{f.label}</span>
                <input
                  inputMode="decimal"
                  value={fills[f.key] ?? ""}
                  onChange={(e) => {
                    setFills((v) => ({ ...v, [f.key]: e.target.value }));
                    setPhase("answering"); setFeedback(null);
                  }}
                  placeholder="…"
                  className="h-12 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 font-mono text-base text-[#1A1A1A] outline-none transition focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                />
              </label>
            ))}
          </div>
        )}

        {/* pilihan grafik */}
        {question.kind === "graph" && (
          <div className="grid grid-cols-2 gap-2.5">
            {(question.graphOptions ?? []).map((spec, i) => {
              const sel = graphSel === i;
              return (
                <button
                  key={i}
                  onClick={() => { setGraphSel(i); setPhase("answering"); setFeedback(null); }}
                  className={`overflow-hidden rounded-xl border-2 p-1 transition active:scale-[0.99] ${
                    sel ? "border-[#3B82F6] shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" : "border-[#E5E5E5] hover:border-[#C9C9C9]"
                  }`}
                >
                  <CartesianCanvas spec={spec} mini height={140} caption={`Opsi ${String.fromCharCode(65 + i)}`} />
                  <div className={`py-1 text-center text-xs font-bold ${sel ? "text-[#1D4ED8]" : "text-[#737373]"}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ketukan aktif */}
        {(question.kind === "points" || question.kind === "region-tap") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#737373]">
              {question.kind === "points"
                ? `Titik terpilih: ${taps.length}/${question.needPoints}`
                : taps.length ? `Titik uji: (${taps[0].x}, ${taps[0].y})` : "Ketuk satu titik pada grafik"}
            </span>
            {taps.length > 0 && phase !== "correct" && (
              <button
                onClick={() => setTaps((t) => t.slice(0, -1))}
                className="flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5E5E5] px-2.5 text-xs font-medium text-[#525252] transition hover:bg-[#F5F5F5]"
              >
                <Undo2 size={13} /> Hapus terakhir
              </button>
            )}
          </div>
        )}

        {/* feedback salah */}
        {phase === "wrong" && feedback && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] px-3.5 py-3 text-[13px] leading-relaxed text-[#991B1B]">
            <X size={15} className="mt-0.5 shrink-0" />
            <span>{feedback} <span className="font-semibold">Streak kembali ke 0 — coba lagi!</span></span>
          </div>
        )}

        {/* pembahasan */}
        {phase === "correct" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-[#10B981]/30 bg-[#ECFDF5] px-3.5 py-3 text-[13px] leading-relaxed text-[#065F46]">
              <Check size={15} className="mt-0.5 shrink-0" />
              <span><b className="font-semibold">Benar!</b> {question.explain}</span>
            </div>
          </div>
        )}

        {/* aksi */}
        <div className="flex gap-2 pt-1">
          {phase !== "correct" ? (
            <button
              onClick={submit}
              disabled={!ready}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-30"
            >
              Periksa Jawaban <ChevronRight size={16} />
            </button>
          ) : (
            <>
              <div className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 text-sm font-semibold text-white">
                <Check size={16} /> Jawaban Tepat
              </div>
              <button
                onClick={() => { hintMaxRef.current = hintLevel; newQuestion(); setHintLevel(0); }}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] bg-white px-5 text-sm font-semibold text-[#1A1A1A] transition active:scale-[0.98]"
              >
                <RotateCcw size={15} /> Soal Berikutnya
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
