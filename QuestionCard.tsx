"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, HelpCircle, Lightbulb, Undo2, X } from "lucide-react";
import CartesianCanvas, { vibrate } from "./CartesianCanvas";
import MathSteps from "./MathText";
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

const isStepText = (s: string) => s.includes("\n") || s.includes("frac(");

export default function QuestionCard({ subbab, onAnswer, review }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [phase, setPhase] = useState<"answering" | "done">("answering");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [mcSel, setMcSel] = useState<string | null>(null);
  const [graphSel, setGraphSel] = useState<number | null>(null);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [taps, setTaps] = useState<Pt[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const startRef = useRef<number>(Date.now());
  const hintMaxRef = useRef(0);
  const avoidRef = useRef<string | undefined>(undefined);

  const newQuestion = () => {
    const q = generateQuestion(subbab, avoidRef.current);
    avoidRef.current = q.templateId;
    setQuestion(q);
    setPhase("answering");
    setWasCorrect(false);
    setMcSel(null);
    setGraphSel(null);
    setFills({});
    setTaps([]);
    setNote(null);
    setHintLevel(0);
    hintMaxRef.current = 0;
    startRef.current = Date.now();
  };

  useEffect(() => {
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
      case "fill": return (question.fillFields ?? []).every((f) => Number.isFinite(parseNum(fills[f.key])));
      case "points": return taps.length >= (question.needPoints ?? 1);
      case "region-tap": return taps.length >= 1;
    }
  }, [question, mcSel, graphSel, fills, taps]);

  const submit = () => {
    if (!question || !ready || phase === "done") return;
    const answer =
      question.kind === "mc" ? mcSel :
      question.kind === "graph" ? graphSel :
      question.kind === "fill" ? fills : taps;
    const res = question.check(answer);
    onAnswer(res.ok, {
      templateId: question.templateId,
      hintLevel: hintMaxRef.current,
      durationSeconds: Math.min(Math.round((Date.now() - startRef.current) / 1000), 3600),
      note: res.ok ? undefined : res.note,
    });
    vibrate(res.ok ? [25, 45, 25] : 50);
    setWasCorrect(res.ok);
    setNote(res.ok ? null : res.note ?? null);
    setPhase("done");
  };

  if (!question) return <div className="h-64 animate-pulse rounded-2xl border border-[#E5E5E5] bg-white" />;

  const locked = phase === "done";
  const canTapMore = !locked && (question.kind === "region-tap" || taps.length < (question.needPoints ?? 1));

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
            locked ? (wasCorrect ? "bg-[#10B981] text-white" : "bg-[#EF4444] text-white") : "bg-[#1A1A1A] text-white"
          }`}>
            {question.templateId}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {review ? "Latihan Ulang" : "Asesmen Formatif"}
          </span>
        </div>
        <button
          onClick={useHint}
          disabled={hintLevel >= 3 || locked}
          className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 text-xs font-semibold text-[#B45309] transition active:scale-95 disabled:opacity-40"
        >
          <Lightbulb size={14} />
          {hintLevel === 0 ? "Petunjuk H1" : hintLevel < 3 ? `Petunjuk H${hintLevel + 1}` : "Petunjuk habis"}
        </button>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm leading-relaxed text-[#1A1A1A] sm:text-[15px]">{question.prompt}</p>

        {question.math && (
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3 text-center font-mono text-[15px] font-medium tracking-wide text-[#1A1A1A] sm:text-lg">
            {question.math}
          </div>
        )}

        {hintLevel > 0 && (
          <div className="space-y-2">
            {question.hints.slice(0, hintLevel).map((h, i) => (
              <div key={i} className="rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-3.5 py-3">
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                  <HelpCircle size={12} /> Petunjuk H{i + 1}
                </p>
                {isStepText(h)
                  ? <MathSteps text={h} tone="plain" size="sm" />
                  : <p className="text-[13px] leading-relaxed text-[#92400E]">{h}</p>}
              </div>
            ))}
          </div>
        )}

        {question.canvas && question.kind !== "graph" && (
          <CartesianCanvas
            spec={question.canvas}
            height={question.kind === "points" || question.kind === "region-tap" ? 300 : 250}
            interactive={canTapMore}
            taps={taps}
            showTapIndex={question.kind === "points"}
            onTap={(_, snapped) => {
              if (locked) return;
              if (question.kind === "region-tap") setTaps([snapped]);
              else if (question.kind === "points" && taps.length < (question.needPoints ?? 1)) {
                setTaps((t) => [...t, snapped]);
              }
            }}
          />
        )}

        {question.kind === "mc" && (
          <div className="grid gap-2">
            {(question.mcOptions ?? []).map((o) => {
              const sel = mcSel === o.id;
              return (
                <button
                  key={o.id}
                  disabled={locked}
                  onClick={() => setMcSel(o.id)}
                  className={`min-h-[48px] rounded-xl border px-4 py-3 text-left font-mono text-[13px] leading-snug transition active:scale-[0.99] disabled:opacity-60 sm:text-sm ${
                    sel ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#1D4ED8] shadow-[0_0_0_1px_#3B82F6]" : "border-[#E5E5E5] bg-white hover:border-[#C9C9C9]"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {question.kind === "fill" && (
          <div className={`grid gap-2 ${(question.fillFields ?? []).length > 1 ? "sm:grid-cols-2" : ""}`}>
            {(question.fillFields ?? []).map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#737373]">{f.label}</span>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={locked}
                  value={fills[f.key] ?? ""}
                  onChange={(e) => setFills((v) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder="ketik jawaban, mis. -3"
                  className="h-12 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 font-mono text-base text-[#1A1A1A] outline-none transition placeholder:text-[#C9C9C9] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] disabled:bg-[#FAFAFA]"
                />
              </label>
            ))}
          </div>
        )}

        {question.kind === "graph" && (
          <div className="grid grid-cols-2 gap-2.5">
            {(question.graphOptions ?? []).map((spec, i) => {
              const sel = graphSel === i;
              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => setGraphSel(i)}
                  className={`overflow-hidden rounded-xl border-2 p-1 transition active:scale-[0.99] disabled:opacity-70 ${
                    sel ? "border-[#3B82F6] shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" : "border-[#E5E5E5] hover:border-[#C9C9C9]"
                  }`}
                >
                  <CartesianCanvas spec={spec} mini height={150} />
                  <div className={`py-1 text-center text-xs font-bold ${sel ? "text-[#1D4ED8]" : "text-[#737373]"}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {(question.kind === "points" || question.kind === "region-tap") && !locked && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#737373]">
              {question.kind === "points"
                ? `Titik terpilih: ${taps.length}/${question.needPoints}`
                : taps.length ? `Titik uji: (${taps[0].x}, ${taps[0].y})` : "Ketuk satu titik pada grafik"}
            </span>
            {taps.length > 0 && (
              <button
                onClick={() => setTaps((t) => t.slice(0, -1))}
                className="flex min-h-[32px] items-center gap-1 rounded-lg border border-[#E5E5E5] px-2.5 text-xs font-medium text-[#525252] transition hover:bg-[#F5F5F5]"
              >
                <Undo2 size={13} /> Hapus terakhir
              </button>
            )}
          </div>
        )}

        {/* ── Hasil + PEMBAHASAN LENGKAP (benar maupun salah) ── */}
        {locked && (
          <div className="space-y-3">
            <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${
              wasCorrect ? "border-[#10B981]/30 bg-[#ECFDF5] text-[#065F46]" : "border-[#EF4444]/30 bg-[#FEF2F2] text-[#991B1B]"
            }`}>
              {wasCorrect ? <Check size={15} className="mt-0.5 shrink-0" /> : <X size={15} className="mt-0.5 shrink-0" />}
              <span>
                <b className="font-bold">{wasCorrect ? "Jawabanmu benar. " : "Jawabanmu belum tepat. "}</b>
                {wasCorrect
                  ? "Pelajari kembali pembahasan di bawah agar semakin mantap."
                  : `${note ? note + " " : ""}Pelajari pembahasan lengkapnya, lalu lanjut ke soal berikutnya.`}
              </span>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-3.5 sm:p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">
                Pembahasan Lengkap
              </p>
              {question.explainSteps && <MathSteps text={question.explainSteps} size="sm" />}
              <p className="mt-2.5 rounded-lg bg-[#F0FDF7] px-3 py-2.5 text-[13px] font-medium leading-relaxed text-[#065F46]">
                Kesimpulan: {question.explain}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!locked ? (
            <button
              onClick={submit}
              disabled={!ready}
              className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-30"
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              onClick={newQuestion}
              className={`flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition active:scale-[0.98] ${
                wasCorrect ? "bg-[#10B981]" : "bg-[#1A1A1A]"
              }`}
            >
              Lanjut ke Soal Berikutnya <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
