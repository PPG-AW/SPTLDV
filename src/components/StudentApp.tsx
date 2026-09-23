"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Hand,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  Menu,
  MonitorPlay,
  PenLine,
  Play,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { getSubbab, SUBBABS, TOTAL_SUBBAB } from "@/lib/curriculum";
import QuestionCard, { type AnswerMeta } from "./QuestionCard";
import SimulationCanvas from "./SimulationCanvas";
import SummativeView from "./SummativeView";
import MathSteps, { MathInline } from "./MathText";

export interface StudentState {
  student: {
    id: number; name: string; currentSubbab: number; completed: number[];
    streak: number; errors: number; status: string; lastActiveAt?: string | Date;
  };
  class: { id: number; name: string; code: string; locked: boolean; size: number; tutorQuota: number };
  isTutor: boolean;
  tutorBusy: boolean;
  teaching: { sessionId: number; tuteeName: string; subbab: number } | null;
  incomingRequests: { id: number; requesterName: string; subbab: number; ageSec: number }[];
  myRequest: { id: number; status: string; tutorName: string | null } | null;
  myTeacherCallOpen: boolean;
  summative: { unlocked: boolean; submitted: boolean; totalScore: number | null; scoreDetails: unknown };
}

type Section = "materi" | "video" | "contoh" | "simulasi" | "asesmen";
const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "materi", label: "Materi", icon: <BookOpen size={14} /> },
  { id: "video", label: "Video", icon: <Play size={14} /> },
  { id: "contoh", label: "Contoh", icon: <Sparkles size={14} /> },
  { id: "simulasi", label: "Simulasi", icon: <FlaskConical size={14} /> },
  { id: "asesmen", label: "Asesmen", icon: <PenLine size={14} /> },
];

export default function StudentApp({ initial }: { initial: StudentState }) {
  const [st, setSt] = useState<StudentState>(initial);
  const [sel, setSel] = useState<number>(initial.student.currentSubbab);
  const [view, setView] = useState<"learn" | "sumatif">("learn");
  const [section, setSection] = useState<Section>("materi");
  const [drawer, setDrawer] = useState(false);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(initial.student.completed.length >= TOTAL_SUBBAB);
  const [busy, setBusy] = useState(false);
  const [requestPopup, setRequestPopup] = useState(false);
  const [teacherCalled, setTeacherCalled] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me/state", { cache: "no-store" });
      if (!res.ok) return;
      setSt(await res.json());
    } catch { /* abaikan */ }
  }, []);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [refresh]);

  // pop-up status permintaan muncul otomatis saat ada permintaan berjalan
  useEffect(() => {
    if (st.myRequest) setRequestPopup(true);
    else setRequestPopup(false);
  }, [st.myRequest?.id, st.myRequest?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const postTutor = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      await refresh();
      return data as { ok?: boolean; reason?: string; error?: string };
    } finally {
      setBusy(false);
    }
  };

  const [allBusyMsg, setAllBusyMsg] = useState(false);
  const requestTutor = async () => {
    const d = await postTutor({ action: "request", subbab: st.student.currentSubbab });
    if (d?.ok) setRequestPopup(true);
    else if (d?.reason === "ALL_BUSY") setAllBusyMsg(true);
  };

  const handleAnswer = async (isCorrect: boolean, meta: AnswerMeta) => {
    try {
      const res = await fetch("/api/progress/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subbab: sel, templateId: meta.templateId, isCorrect,
          hintLevel: meta.hintLevel, durationSeconds: meta.durationSeconds,
          errorDetail: meta.note ?? null,
        }),
      });
      const data = await res.json();
      if (data?.student) setSt((prev) => ({ ...prev, student: { ...prev.student, ...data.student } }));
      if (data?.justCompleted) {
        setCelebrate(sel);
        if (data.allDone) setAllDone(true);
      }
    } catch { /* abaikan */ }
  };

  const content = getSubbab(sel);
  const completed = new Set(st.student.completed);
  const isReview = completed.has(sel) && sel !== st.student.currentSubbab;
  const lockedSubbab = !completed.has(sel) && sel > st.student.currentSubbab;

  const pickSubbab = (id: number) => {
    setSel(id); setView("learn"); setSection("materi"); setDrawer(false);
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#F0F0F0] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">Peta Belajar</p>
        <p className="mt-0.5 text-sm font-semibold">{st.student.completed.length}/{TOTAL_SUBBAB} Sub-Bab Tuntas</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0F0F0]">
          <div className="h-full rounded-full bg-[#1A1A1A] transition-all duration-500"
            style={{ width: `${(st.student.completed.length / TOTAL_SUBBAB) * 100}%` }} />
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
        {SUBBABS.map((sb) => {
          const done = completed.has(sb.id);
          const active = sb.id === st.student.currentSubbab && !done;
          const isLocked = !done && sb.id > st.student.currentSubbab;
          const macet = active && st.student.status === "MACET";
          const selected = view === "learn" && sel === sb.id;
          return (
            <button key={sb.id} onClick={() => pickSubbab(sb.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition active:scale-[0.99] ${
                selected ? "border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-[3px_3px_0_#C9C9C9]"
                : isLocked ? "border-transparent text-[#B0B0B0] hover:bg-[#F5F5F5]"
                : macet ? "border-[#EF4444]/40 bg-[#FEF2F2] text-[#991B1B]"
                : done ? "border-transparent hover:bg-[#F0FAF5]"
                : "border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#1D4ED8]"
              }`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                selected ? "bg-white/15" : done ? "bg-[#10B981]/15 text-[#059669]"
                : isLocked ? "bg-[#F0F0F0]" : macet ? "bg-[#EF4444]/15 text-[#DC2626]" : "bg-[#3B82F6]/15"
              }`}>
                {done ? <Check size={13} /> : isLocked ? <Lock size={12} /> : sb.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-tight">{sb.title}</span>
                <span className={`block text-[10px] ${selected ? "text-white/60" : "text-[#A3A3A3]"}`}>{sb.focus}</span>
              </span>
              {macet && <AlertTriangle size={14} className="shrink-0 animate-pulse text-[#EF4444]" />}
            </button>
          );
        })}
        <button onClick={() => { setView("sumatif"); setDrawer(false); }}
          className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition ${
            view === "sumatif" ? "border-[#F59E0B] bg-[#F59E0B] text-white"
            : allDone ? "border-[#F59E0B]/50 bg-[#FFFBEB] text-[#92400E]" : "border-transparent text-[#B0B0B0]"
          }`}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${view === "sumatif" ? "bg-white/20" : allDone ? "bg-[#F59E0B]/15" : "bg-[#F0F0F0]"}`}>
            {allDone ? <Award size={14} /> : <Lock size={12} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold leading-tight">Asesmen Sumatif</span>
            <span className={`block text-[10px] ${view === "sumatif" ? "text-white/70" : "text-[#A3A3A3]"}`}>
              {allDone ? "Terbuka — 2 soal" : "Tuntaskan 10 sub-bab"}
            </span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2.5 px-3 sm:px-5">
          <button onClick={() => setDrawer(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E5E5] lg:hidden" aria-label="Buka peta belajar">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A1A] text-white"><GraduationCap size={16} /></span>
            <div className="leading-tight">
              <p className="text-[13px] font-bold tracking-tight">SPtLDV<span className="text-[#3B82F6]">.belajar</span></p>
              <p className="text-[10px] font-medium text-[#A3A3A3]">Kelas X · Fase E</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {st.isTutor && (
              <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold sm:flex ${st.tutorBusy ? "border-[#E5E5E5] bg-[#F5F5F5] text-[#737373]" : "border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#6D28D9]"}`}>
                <Users size={12} /> Tutor: {st.tutorBusy ? "SIBUK" : "TERSEDIA"}
              </span>
            )}
            <span className="hidden items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#525252] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> {st.class.name}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#1A1A1A] px-3 py-1.5 text-[11px] font-semibold text-white">
              <UserRound size={12} /> <span className="max-w-[90px] truncate">{st.student.name}</span>
            </span>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/"; }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#737373] transition hover:bg-[#F5F5F5]" aria-label="Keluar">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-5 px-3 py-4 sm:px-5 sm:py-6">
        <aside className="sticky top-[72px] hidden h-[calc(100vh-96px)] w-64 shrink-0 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white lg:block">
          {Sidebar}
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-hidden rounded-t-3xl border-t border-[#E5E5E5] bg-white">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="text-xs font-bold text-[#737373]">PILIH SUB-BAB</span>
                <button onClick={() => setDrawer(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5]"><X size={16} /></button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">{Sidebar}</div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 space-y-4">
          {view === "sumatif" ? (
            <SummativeView unlocked={allDone || st.summative.unlocked} onSubmitted={refresh} />
          ) : (
            <>
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1A1A] font-mono text-base font-bold text-white">
                    {String(sel).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold tracking-tight sm:text-xl">{content.title}</h1>
                    <p className="text-xs text-[#737373]">{content.focus}</p>
                  </div>
                  {isReview && <span className="rounded-full bg-[#10B981]/10 px-3 py-1.5 text-[11px] font-bold text-[#059669]">MODE REVIEW</span>}
                  {sel === st.student.currentSubbab && st.student.status === "MACET" && (
                    <span className="flex animate-pulse items-center gap-1.5 rounded-full bg-[#EF4444]/10 px-3 py-1.5 text-[11px] font-bold text-[#DC2626]">
                      <AlertTriangle size={12} /> STATUS: MACET
                    </span>
                  )}
                </div>
                {!lockedSubbab && (
                  <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
                    {SECTIONS.map((s) => (
                      <button key={s.id} onClick={() => setSection(s.id)}
                        className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold transition active:scale-95 ${
                          section === s.id ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#E5E5E5] bg-white text-[#737373]"
                        }`}>
                        {s.icon} {s.label}
                        {s.id === "asesmen" && sel === st.student.currentSubbab && !isReview && (
                          <span className="flex gap-0.5 pl-1">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < st.student.streak ? "bg-[#10B981]" : section === s.id ? "bg-white/30" : "bg-[#D9D9D9]"}`} />
                            ))}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {lockedSubbab ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-14 text-center">
                  <Lock size={28} className="text-[#C9C9C9]" />
                  <p className="max-w-xs text-sm font-medium text-[#737373]">
                    Sub-bab ini masih terkunci. Tuntaskan dahulu Sub-Bab {st.student.currentSubbab} dengan 3 jawaban benar beruntun.
                  </p>
                  <button onClick={() => pickSubbab(st.student.currentSubbab)} className="mt-1 flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1A1A1A] px-5 text-sm font-semibold text-white active:scale-95">
                    Ke Sub-Bab {st.student.currentSubbab} <ArrowRight size={15} />
                  </button>
                </div>
              ) : section === "materi" ? (
                <MateriView subbabId={sel} />
              ) : section === "video" ? (
                <VideoView query={content.videoQuery} />
              ) : section === "contoh" ? (
                <ContohView subbabId={sel} />
              ) : section === "simulasi" ? (
                content.simulation ? <SimulationCanvas kind={content.simulation} /> : (
                  <div className="rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-12 text-center text-sm text-[#737373]">
                    Sub-bab ini tidak memiliki simulasi khusus. Simulasi tersedia pada Sub-Bab 3, 4, 6, dan 7.
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {!isReview && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3">
                      <ListChecks size={16} className="text-[#737373]" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">Target: 3 jawaban benar beruntun untuk naik sub-bab</p>
                        <p className="text-[11px] text-[#A3A3A3]">Bila salah, hitungan kembali ke nol dan soal otomatis berganti.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                            i < st.student.streak ? "border-[#10B981] bg-[#10B981] text-white" : "border-[#E5E5E5] text-[#C9C9C9]"
                          }`}>
                            {i < st.student.streak ? <Check size={12} /> : i + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <QuestionCard key={`${sel}-${isReview}`} subbab={sel} review={isReview} onAnswer={handleAnswer} />

                  {!isReview && st.student.errors >= 2 && !st.myRequest && (
                    <div className="rounded-2xl border-2 border-[#8B5CF6]/60 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6] text-white"><Users size={17} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#4C1D95]">Kamu keliru {st.student.errors} kali berturut-turut</p>
                          <p className="text-xs text-[#7C6AAE]">Tutor sebaya siap membimbingmu langsung di mejamu.</p>
                        </div>
                        <button disabled={busy} onClick={requestTutor}
                          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 text-sm font-bold text-white transition active:scale-95 disabled:opacity-60">
                          {busy ? <Loader2 size={15} className="animate-spin" /> : <Hand size={15} />} Minta Bantuan Tutor Sebaya
                        </button>
                      </div>
                    </div>
                  )}

                  {st.isTutor && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3">
                      <CircleHelp size={16} className="text-[#737373]" />
                      <p className="flex-1 text-xs text-[#737373]">
                        Sebagai Tutor Sebaya, kamu dapat memanggil guru bila memerlukan konfirmasi materi.
                      </p>
                      <button disabled={busy || st.myTeacherCallOpen}
                        onClick={() => postTutor({ action: "call-teacher" }).then(() => setTeacherCalled(true))}
                        className="flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-[#1A1A1A] px-4 text-xs font-bold transition active:scale-95 disabled:opacity-50">
                        <MonitorPlay size={14} /> {st.myTeacherCallOpen ? "Guru Sudah Dipanggil" : "Panggil Guru"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ══ POP-UP: permintaan bantuan masuk (memblokir tutor) ══ */}
      {st.isTutor && !st.tutorBusy && st.incomingRequests.length > 0 && !st.teaching && (
        <Modal>
          <div className="bg-[#8B5CF6] px-6 py-7 text-center text-white">
            <span className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Hand size={28} />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-ping rounded-full bg-[#FBBF24]" />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-[#FBBF24]" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Panggilan Tutor Sebaya</p>
            <p className="mt-2 text-xl font-bold leading-tight">
              {st.incomingRequests[0].requesterName} membutuhkan bantuanmu
            </p>
            <p className="mt-1 text-xs text-white/75">
              Sub-Bab {st.incomingRequests[0].subbab}: {getSubbab(st.incomingRequests[0].subbab).title}
            </p>
          </div>
          <div className="space-y-3 p-5">
            <p className="rounded-xl bg-[#F5F3FF] px-3.5 py-3 text-[13px] leading-relaxed text-[#5B21B6]">
              Hampiri mejanya dan bimbing dengan cara bertanya, bukan langsung memberi jawaban. Kamu belum dapat melanjutkan belajar sebelum sesi ini selesai.
            </p>
            <button disabled={busy} onClick={() => postTutor({ action: "accept", sessionId: st.incomingRequests[0].id })}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Users size={17} />} Terima & Bantu Sekarang
            </button>
          </div>
        </Modal>
      )}

      {/* ══ POP-UP: sedang mengajar (memblokir sampai selesai) ══ */}
      {st.teaching && (
        <Modal>
          <div className="bg-[#6D28D9] px-6 py-7 text-center text-white">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"><Users size={28} /></span>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Sesi Tutor Sebaya Berlangsung</p>
            <p className="mt-2 text-xl font-bold leading-tight">Kamu sedang membantu {st.teaching.tuteeName}</p>
            <p className="mt-1 text-xs text-white/75">
              Sub-Bab {st.teaching.subbab}: {getSubbab(st.teaching.subbab).title}
            </p>
          </div>
          <div className="space-y-3 p-5">
            <p className="rounded-xl bg-[#F5F3FF] px-3.5 py-3 text-[13px] leading-relaxed text-[#5B21B6]">
              Selama sesi berlangsung kamu tidak dapat mengerjakan soal. Tekan tombol di bawah setelah temanmu benar-benar paham.
            </p>
            <button disabled={busy} onClick={() => postTutor({ action: "complete", sessionId: st.teaching!.sessionId })}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />} Selesai Mengajar
            </button>
          </div>
        </Modal>
      )}

      {/* ══ POP-UP: status permintaanku ══ */}
      {requestPopup && st.myRequest && (
        <Modal onClose={() => setRequestPopup(false)}>
          <div className={`px-6 py-7 text-center text-white ${st.myRequest.status === "ACTIVE" ? "bg-[#10B981]" : "bg-[#1A1A1A]"}`}>
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              {st.myRequest.status === "ACTIVE" ? <Users size={28} /> : <Loader2 size={28} className="animate-spin" />}
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
              {st.myRequest.status === "ACTIVE" ? "Bantuan Dalam Perjalanan" : "Mencari Tutor Sebaya"}
            </p>
            <p className="mt-2 text-xl font-bold leading-tight">
              {st.myRequest.status === "ACTIVE"
                ? `${st.myRequest.tutorName ?? "Tutormu"} akan membantumu`
                : "Permintaanmu sedang dikirim"}
            </p>
            <p className="mt-1 text-xs text-white/75">
              {st.myRequest.status === "ACTIVE"
                ? "Siapkan buku catatan dan tunggu di mejamu."
                : "Duduk tenang di mejamu, tutor yang tersedia sedang diberi tahu."}
            </p>
          </div>
          <div className="space-y-2 p-5">
            {st.myRequest.status === "REQUESTED" && (
              <button onClick={() => postTutor({ action: "cancel" }).then(() => setRequestPopup(false))}
                className="min-h-[44px] w-full rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#525252]">
                Batalkan Permintaan
              </button>
            )}
            <button onClick={() => setRequestPopup(false)}
              className="min-h-[48px] w-full rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98]">
              Tutup & Lanjut Mencoba
            </button>
          </div>
        </Modal>
      )}

      {/* ══ POP-UP: semua tutor sibuk ══ */}
      {allBusyMsg && (
        <Modal onClose={() => setAllBusyMsg(false)}>
          <div className="bg-[#F59E0B] px-6 py-7 text-center text-white">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"><Users size={28} /></span>
            <p className="mt-1 text-xl font-bold leading-tight">Semua tutor sedang membantu</p>
            <p className="mt-1 text-xs text-white/85">Coba lagi beberapa saat, atau baca ulang materinya sambil menunggu.</p>
          </div>
          <div className="p-5">
            <button onClick={() => setAllBusyMsg(false)} className="min-h-[48px] w-full rounded-xl bg-[#1A1A1A] text-sm font-bold text-white">Mengerti</button>
          </div>
        </Modal>
      )}

      {/* ══ POP-UP: panggilan guru terkirim ══ */}
      {teacherCalled && (
        <Modal onClose={() => setTeacherCalled(false)}>
          <div className="bg-[#1A1A1A] px-6 py-7 text-center text-white">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10"><MonitorPlay size={28} /></span>
            <p className="mt-1 text-xl font-bold leading-tight">Panggilan terkirim ke guru</p>
            <p className="mt-1 text-xs text-white/70">Guru akan menghampiri mejamu. Tetap di tempat, ya.</p>
          </div>
          <div className="p-5">
            <button onClick={() => setTeacherCalled(false)} className="min-h-[48px] w-full rounded-xl bg-[#1A1A1A] text-sm font-bold text-white">Tutup</button>
          </div>
        </Modal>
      )}

      {/* ══ POP-UP: sub-bab tuntas ══ */}
      {celebrate !== null && (
        <Modal>
          <div className="bg-[#1A1A1A] px-6 py-8 text-center text-white">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]"><Award size={26} /></span>
            <p className="text-lg font-bold tracking-tight">Sub-Bab {celebrate} Tuntas</p>
            <p className="mt-1 text-xs text-white/60">Tiga jawaban benar beruntun — penguasaanmu terbukti.</p>
          </div>
          <div className="space-y-2.5 p-5">
            {allDone ? (
              <>
                <p className="text-center text-sm text-[#525252]">Seluruh 10 sub-bab selesai. Asesmen Sumatif kini terbuka.</p>
                <button onClick={() => { setCelebrate(null); setView("sumatif"); }}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] text-sm font-bold text-white">
                  Buka Asesmen Sumatif <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { const n = Math.min(celebrate + 1, TOTAL_SUBBAB); setCelebrate(null); pickSubbab(n); }}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white">
                  Lanjut Sub-Bab {Math.min(celebrate + 1, TOTAL_SUBBAB)} <ChevronRight size={16} />
                </button>
                <button onClick={() => setCelebrate(null)} className="min-h-[44px] w-full rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#525252]">
                  Tetap di sini dulu
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ══ TEACHER FOCUS LOCK ══ */}
      {st.class.locked && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center text-white">
          <div className="focus-pulse mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-white/20 bg-white/5">
            <MonitorPlay size={44} className="text-[#F59E0B]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#F59E0B]">Sesi Konfirmasi Guru</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Saatnya Diskusi Kelas</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Letakkan HP-mu di atas meja menghadap ke bawah. Perhatikan penjelasan Guru di layar proyektor depan.
          </p>
          <div className="mt-10 flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#EF4444]" />
            <span className="text-xs font-medium tracking-wide text-white/60">Layar dikunci oleh Guru</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      {onClose && <div className="absolute inset-0" onClick={onClose} />}
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#E5E5E5] bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

// ─── Materi ──────────────────────────────────────────────────────────────────
function MateriView({ subbabId }: { subbabId: number }) {
  const c = getSubbab(subbabId);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3 text-xs leading-relaxed text-[#92400E]">
        <b>Catat di buku tulismu.</b> Tulis ulang definisi, langkah pengerjaan, dan contoh perhitungannya agar lebih melekat.
      </div>
      {c.materi.map((m, i) => (
        <article key={i} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] font-mono text-xs font-bold text-[#737373]">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold tracking-tight">{m.title}</h3>
              <p className="mt-2 text-sm leading-[1.75] text-[#404040]">{m.body}</p>

              {m.list && (
                <ol className="mt-3 space-y-2">
                  {m.list.map((item, j) => (
                    <li key={j} className="flex gap-2.5 rounded-lg bg-[#FAFAFA] px-3 py-2.5 text-[13px] leading-relaxed text-[#404040]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1A1A1A] text-[10px] font-bold text-white">{j + 1}</span>
                      <span className="min-w-0 flex-1"><MathInline text={item} /></span>
                    </li>
                  ))}
                </ol>
              )}

              {m.steps && <div className="mt-3"><MathSteps text={m.steps} /></div>}

              {m.math && (
                <div className="mt-3 space-y-1.5">
                  {m.math.map((line, j) => (
                    <div key={j} className="rounded-xl border border-[#ECECEC] bg-[#FAFAFA] px-3.5 py-2.5 font-mono text-[13px] text-[#1A1A1A]">
                      <MathInline text={line} />
                    </div>
                  ))}
                </div>
              )}

              {m.tip && (
                <div className="mt-3 rounded-xl border border-[#3B82F6]/25 bg-[#EFF6FF] px-3.5 py-2.5 text-xs leading-relaxed text-[#1E40AF]">
                  <b>Tips:</b> <MathInline text={m.tip} />
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── Video ───────────────────────────────────────────────────────────────────
function VideoView({ query }: { query: string }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <a href={url} target="_blank" rel="noreferrer" className="group relative block aspect-video bg-[#0A0A0A]">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,#3B82F6_0,transparent_50%),radial-gradient(circle_at_75%_80%,#8B5CF6_0,transparent_45%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/30 transition group-hover:scale-110 group-hover:bg-[#EF4444]">
            <Play size={26} className="ml-1" fill="currentColor" />
          </span>
          <p className="text-sm font-semibold">Tonton video pembelajaran</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/60">Slot video guru <ExternalLink size={11} /></p>
        </div>
      </a>
      <div className="flex items-center gap-3 px-4 py-3">
        <MonitorPlay size={16} className="text-[#737373]" />
        <p className="flex-1 truncate text-xs text-[#737373]">Topik: “{query}”</p>
        <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-bold text-[#1D4ED8]">Buka YouTube</a>
      </div>
    </div>
  );
}

// ─── Contoh soal bertahap ────────────────────────────────────────────────────
function ContohView({ subbabId }: { subbabId: number }) {
  const c = getSubbab(subbabId);
  const [shown, setShown] = useState(0);
  const total = c.contoh.stages.length;

  return (
    <div className="space-y-3">
      <article className="rounded-2xl border-2 border-[#1A1A1A] bg-white p-4 shadow-[4px_4px_0_#E5E5E5] sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">Contoh Soal</p>
        <p className="mt-2 text-sm leading-relaxed sm:text-[15px]">{c.contoh.soal}</p>
        {c.contoh.math && (
          <div className="mt-3 rounded-xl border border-[#ECECEC] bg-[#FAFAFA] px-3.5 py-2.5 font-mono text-sm">
            {c.contoh.math.join("   ;   ")}
          </div>
        )}
      </article>

      {shown === 0 ? (
        <button onClick={() => setShown(1)}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98]">
          Mulai Pembahasan Bertahap <ChevronRight size={16} />
        </button>
      ) : (
        <>
          {c.contoh.stages.slice(0, shown).map((s, i) => (
            <article key={i} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3B82F6] text-[11px] font-bold text-white">{i + 1}</span>
                <h4 className="text-[14px] font-bold tracking-tight">{s.label}</h4>
              </div>
              <p className="mt-2.5 text-sm leading-[1.75] text-[#404040]">{s.explain}</p>
              {s.steps && <div className="mt-3"><MathSteps text={s.steps} /></div>}
            </article>
          ))}

          {shown < total ? (
            <button onClick={() => setShown((v) => v + 1)}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98]">
              Langkah Berikutnya ({shown}/{total}) <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#10B981]/30 bg-[#ECFDF5] px-4 py-3.5 text-[13px] font-medium leading-relaxed text-[#065F46]">
              <Check size={16} className="mt-0.5 shrink-0" />
              <span><b>Jawaban akhir:</b> {c.contoh.jawaban}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
