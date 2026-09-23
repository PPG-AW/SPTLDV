"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ClipboardList,
  Eye,
  GraduationCap,
  Loader2,
  Lock,
  LockOpen,
  LogOut,
  MonitorPlay,
  Plus,
  Presentation,
  Radio,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { getSubbab, TOTAL_SUBBAB } from "@/lib/curriculum";
import { generateQuestion, type Question } from "@/lib/templates";
import CartesianCanvas from "./CartesianCanvas";

// ── tipe data telemetri ──────────────────────────────────────────────────────
interface StudentRow {
  id: number; name: string; currentSubbab: number; completed: number[];
  streak: number; errors: number; status: string; isTutor: boolean; tutorBusy: boolean;
  lastActiveAt: string; totalAttempts: number; totalWrong: number; accuracy: number | null;
  summativeScore: number | null;
  summativeDetails: { key: string; label: string; earned: number; max: number }[] | null;
}
interface Telemetry {
  class: { id: number; classCode: string; className: string; isLocked: boolean };
  students: StudentRow[];
  misconception: { subbab: number; errorCount: number; uniqueStudents: number; attempts: number; common: { detail: string; count: number }[] }[];
  tutors: { id: number; name: string; status: string }[];
  calls: { id: number; tutorName: string; message: string; ageSec: number }[];
  distribution: { subbab: number; active: number; completed: number }[];
}
interface ClassInfo {
  id: number; classCode: string; className: string; isLocked: boolean; studentCount: number;
}

type Tab = "telemetri" | "miskonsepsi" | "tutor" | "panggilan" | "nilai";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "telemetri", label: "Telemetri Kelas", icon: <Radio size={15} /> },
  { id: "miskonsepsi", label: "Miskonsepsi", icon: <BarChart3 size={15} /> },
  { id: "tutor", label: "Tutor Sebaya", icon: <Users size={15} /> },
  { id: "panggilan", label: "Panggilan", icon: <MonitorPlay size={15} /> },
  { id: "nilai", label: "Nilai Sumatif", icon: <ClipboardList size={15} /> },
];

export default function TeacherApp({
  teacherName,
  initialClasses,
}: {
  teacherName: string;
  initialClasses: ClassInfo[];
}) {
  const [classes, setClasses] = useState<ClassInfo[]>(initialClasses);
  const [activeId, setActiveId] = useState<number | null>(initialClasses[0]?.id ?? null);
  const [tele, setTele] = useState<Telemetry | null>(null);
  const [tab, setTab] = useState<Tab>("telemetri");
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [caseQuestion, setCaseQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dismissedCalls, setDismissedCalls] = useState<number[]>([]);

  const active = classes.find((c) => c.id === activeId) ?? null;

  const loadClasses = useCallback(async () => {
    const res = await fetch("/api/classes", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setClasses(data.classes);
      setActiveId((prev) => prev ?? data.classes[0]?.id ?? null);
    }
  }, []);

  const loadTelemetry = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/guru/telemetry?classId=${activeId}`, { cache: "no-store" });
      if (res.ok) setTele(await res.json());
    } catch { /* abaikan */ }
  }, [activeId]);

  useEffect(() => { void loadClasses(); }, [loadClasses]);
  useEffect(() => {
    void loadTelemetry();
    const t = setInterval(loadTelemetry, 4000);
    return () => clearInterval(t);
  }, [loadTelemetry]);

  const createClass = async () => {
    setBusy(true);
    setCreateErr(null);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: newName, classCode: newCode }),
      });
      const data = await res.json();
      if (!res.ok) setCreateErr(data.error ?? "Gagal membuat rombel.");
      else {
        setNewName(""); setNewCode("");
        await loadClasses();
        setActiveId(data.class.id);
      }
    } finally { setBusy(false); }
  };

  const toggleLock = async () => {
    if (!active || !tele) return;
    setBusy(true);
    try {
      await fetch(`/api/classes/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !tele.class.isLocked }),
      });
      await loadTelemetry();
    } finally { setBusy(false); }
  };

  const deleteClass = async () => {
    if (!active) return;
    setBusy(true);
    try {
      await fetch(`/api/classes/${active.id}`, { method: "DELETE" });
      setConfirmDelete(false);
      setActiveId(null);
      setTele(null);
      await loadClasses();
    } finally { setBusy(false); }
  };

  const resolveCall = async (callId: number) => {
    await fetch("/api/guru/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId }),
    });
    await loadTelemetry();
  };

  const maxErrors = useMemo(
    () => Math.max(1, ...(tele?.misconception.map((m) => m.errorCount) ?? [1])),
    [tele]
  );
  const worst = useMemo(() => {
    const m = tele?.misconception.filter((x) => x.errorCount > 0) ?? [];
    return m.sort((a, b) => b.errorCount - a.errorCount)[0] ?? null;
  }, [tele]);

  const macetCount = tele?.students.filter((s) => s.status === "MACET").length ?? 0;
  const onlineCount = tele?.students.filter(
    (s) => Date.now() - new Date(s.lastActiveAt).getTime() < 60_000
  ).length ?? 0;

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A]">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E5E5] bg-[#0F0F0F] text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0F0F0F]">
            <GraduationCap size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-bold tracking-tight">SPtLDV<span className="text-[#3B82F6]">.guru</span></p>
            <p className="text-[10px] text-white/50">Dashboard Kendali Kelas</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/80 sm:block">{teacherName}</span>
            <button
              onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/guru"; }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/60 transition hover:bg-white/10"
              aria-label="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl gap-5 px-3 py-4 sm:px-5 sm:py-6 lg:flex">
        {/* kolom kiri: rombel */}
        <aside className="mb-5 w-full shrink-0 space-y-3 lg:mb-0 lg:w-72">
          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">Rombel Saya</p>
            <div className="space-y-1.5">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    activeId === c.id ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#E5E5E5] hover:border-[#C9C9C9]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{c.className}</p>
                    <p className={`font-mono text-[11px] ${activeId === c.id ? "text-white/60" : "text-[#A3A3A3]"}`}>{c.classCode}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeId === c.id ? "bg-white/15" : "bg-[#F5F5F5] text-[#737373]"}`}>
                    {c.studentCount}
                  </span>
                </button>
              ))}
              {classes.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#D9D9D9] px-3 py-4 text-center text-xs text-[#A3A3A3]">
                  Belum ada rombel. Buat yang pertama!
                </p>
              )}
            </div>
            {active && (
              <button onClick={() => setConfirmDelete(true)} className="mt-2.5 flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#EF4444]/30 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]">
                <Trash2 size={13} /> Hapus Rombel Ini
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">Buat Rombel</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama rombel (mis. X-A)"
              className="mb-2 h-11 w-full rounded-xl border border-[#E5E5E5] px-3.5 text-sm outline-none focus:border-[#1A1A1A]"
            />
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="Kode unik (mis. MTK-XA-2024)"
              className="h-11 w-full rounded-xl border border-[#E5E5E5] px-3.5 font-mono text-sm uppercase outline-none focus:border-[#1A1A1A]"
            />
            {createErr && <p className="mt-2 text-xs text-[#DC2626]">{createErr}</p>}
            <button
              onClick={createClass}
              disabled={busy || !newName || !newCode}
              className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
            >
              <Plus size={15} /> Buat Rombel
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-[#A3A3A3]">
              Bagikan kode ke siswa — mereka mendaftar dengan nama + kata sandi + kode ini.
            </p>
          </div>
        </aside>

        {/* area utama */}
        <main className="min-w-0 flex-1 space-y-4">
          {!active ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-20 text-center">
              <Presentation size={30} className="text-[#C9C9C9]" />
              <p className="text-sm text-[#737373]">Buat rombel untuk mulai memantau kelas.</p>
            </div>
          ) : (
            <>
              {/* MASTER TOGGLE + ringkasan */}
              <div className={`overflow-hidden rounded-2xl border-2 transition ${tele?.class.isLocked ? "border-[#EF4444] bg-[#1A1A1A] text-white" : "border-[#1A1A1A] bg-white"}`}>
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tele?.class.isLocked ? "bg-[#EF4444] text-white" : "bg-[#1A1A1A] text-white"}`}>
                    {tele?.class.isLocked ? <Lock size={20} /> : <LockOpen size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold tracking-tight sm:text-lg">
                      {tele?.class.isLocked ? "LAYAR SISWA SEDANG TERKUNCI" : "Mode Diskusi Pleno"}
                    </p>
                    <p className={`text-xs ${tele?.class.isLocked ? "text-white/60" : "text-[#737373]"}`}>
                      {tele?.class.isLocked
                        ? "Seluruh HP siswa menampilkan layar kunci diskusi pleno."
                        : "Satu tombol untuk mengalihkan perhatian seluruh kelas ke proyektor."}
                    </p>
                  </div>
                  <button
                    onClick={toggleLock}
                    disabled={busy || !tele}
                    className={`min-h-[52px] rounded-xl px-5 text-sm font-black tracking-wide transition active:scale-95 disabled:opacity-50 sm:px-7 ${
                      tele?.class.isLocked
                        ? "bg-white text-[#1A1A1A]"
                        : "bg-[#EF4444] text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)]"
                    }`}
                  >
                    {tele?.class.isLocked ? "BUKA LAYAR — LANJUT BELAJAR" : "KUNCI LAYAR SISWA"}
                  </button>
                </div>
                <div className={`grid grid-cols-3 divide-x text-center sm:grid-cols-4 ${tele?.class.isLocked ? "divide-white/10 border-t border-white/10" : "divide-[#F0F0F0] border-t border-[#F0F0F0]"}`}>
                  <Stat label="Siswa Aktif" value={`${onlineCount}/${active.studentCount}`} dark={tele?.class.isLocked} />
                  <Stat label="Status MACET" value={String(macetCount)} accent={macetCount > 0 ? "#EF4444" : undefined} dark={tele?.class.isLocked} />
                  <Stat label="Tutor Aktif" value={String(tele?.tutors.length ?? 0)} dark={tele?.class.isLocked} />
                  <Stat label="Sumatif Masuk" value={String(tele?.students.filter((s) => s.summativeScore !== null).length ?? 0)} dark={tele?.class.isLocked} />
                </div>
              </div>

              {/* tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-bold transition ${
                      tab === t.id ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#C9C9C9]"
                    }`}
                  >
                    {t.icon} {t.label}
                    {t.id === "panggilan" && (tele?.calls.length ?? 0) > 0 && (
                      <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-black text-white">
                        {tele!.calls.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {!tele ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-[#A3A3A3]" /></div>
              ) : tab === "telemetri" ? (
                <TelemetryView tele={tele} />
              ) : tab === "miskonsepsi" ? (
                <div className="space-y-3">
                  {worst && (
                    <div className="rounded-2xl border-2 border-[#F59E0B] bg-[#FFFBEB] p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <AlertTriangle size={20} className="text-[#D97706]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">Kasus Prioritas: Sub-Bab {worst.subbab} — {getSubbab(worst.subbab).title}</p>
                          <p className="text-xs text-[#92400E]">{worst.errorCount} kesalahan dari {worst.uniqueStudents} siswa. Cocok dibedah di pleno!</p>
                        </div>
                        <button
                          onClick={() => { setCaseQuestion(generateQuestion(worst.subbab)); setShowAnswer(false); }}
                          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#F59E0B] px-4 text-xs font-black text-white transition active:scale-95"
                        >
                          <Eye size={14} /> PROYEKSIKAN KASUS
                        </button>
                      </div>
                    </div>
                  )}
                  {caseQuestion && <CaseCard q={caseQuestion} showAnswer={showAnswer} onToggle={() => setShowAnswer((s) => !s)} />}
                  <div className="space-y-2.5">
                    {tele.misconception.filter((m) => m.errorCount > 0 || m.attempts > 0).map((m) => (
                      <div key={m.subbab} className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] font-mono text-xs font-bold">{m.subbab}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{getSubbab(m.subbab).title}</p>
                            <p className="text-[11px] text-[#A3A3A3]">{m.errorCount} salah / {m.attempts} percobaan · {m.uniqueStudents} siswa</p>
                          </div>
                          <div className="w-32 sm:w-44">
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#F0F0F0]">
                              <div className="h-full rounded-full bg-[#EF4444]" style={{ width: `${(m.errorCount / maxErrors) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                        {m.common.length > 0 && (
                          <div className="mt-2.5 space-y-1.5 border-t border-[#F5F5F5] pt-2.5">
                            {m.common.map((c, i) => (
                              <p key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[#737373]">
                                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444]" />
                                <span>{c.detail} <span className="font-bold text-[#1A1A1A]">×{c.count}</span></span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {tele.misconception.every((m) => m.errorCount === 0) && (
                      <p className="rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-10 text-center text-sm text-[#A3A3A3]">
                        Belum ada data kesalahan — analitik muncul saat siswa mulai menjawab soal.
                      </p>
                    )}
                  </div>
                </div>
              ) : tab === "tutor" ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {tele.tutors.length === 0 && (
                    <p className="col-span-full rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-10 text-center text-sm text-[#A3A3A3]">
                      Tutor Sebaya muncul otomatis: 25% siswa dengan progres tercepat & tertinggi (minimal sudah menuntaskan 1 sub-bab).
                    </p>
                  )}
                  {tele.tutors.map((t) => {
                    const st = tele.students.find((s) => s.id === t.id);
                    return (
                      <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-[#8B5CF6]/30 bg-white p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6] text-sm font-black text-white">
                          {t.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{t.name}</p>
                          <p className="text-[11px] text-[#A3A3A3]">
                            Sub-bab {st?.currentSubbab} · {st?.completed.length}/10 tuntas
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${t.status === "SIBUK" ? "bg-[#F5F5F5] text-[#737373]" : "bg-[#10B981]/10 text-[#059669]"}`}>
                          {t.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : tab === "panggilan" ? (
                <div className="space-y-2.5">
                  {tele.calls.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-10 text-center text-sm text-[#A3A3A3]">
                      Belum ada panggilan dari Tutor Sebaya. (Fitur “Panggil Guru” khusus untuk tutor.)
                    </p>
                  )}
                  {tele.calls.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#3B82F6] bg-[#EFF6FF] p-4">
                      <MonitorPlay size={18} className="text-[#2563EB]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1E40AF]">{c.tutorName} (Tutor) memanggil Anda</p>
                        <p className="text-xs text-[#3B82F6]">{c.message} · {c.ageSec} detik lalu</p>
                      </div>
                      <button onClick={() => resolveCall(c.id)} className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white transition active:scale-95">
                        <Check size={14} /> Telah Dihampiri
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* nilai sumatif */
                <div className="space-y-2">
                  {tele.students.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-[#D9D9D9] bg-white px-6 py-10 text-center text-sm text-[#A3A3A3]">Belum ada siswa di rombel ini.</p>
                  )}
                  {tele.students.map((s) => (
                    <div key={s.id} className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
                      <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F5] text-xs font-black">{s.name.slice(0, 1).toUpperCase()}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{s.name}</p>
                          <p className="text-[11px] text-[#A3A3A3]">
                            {s.summativeScore !== null ? "Sumatif terkirim" : `Progres ${s.completed.length}/10 sub-bab`}
                          </p>
                        </div>
                        <span className={`font-mono text-xl font-black ${s.summativeScore === null ? "text-[#D9D9D9]" : s.summativeScore >= 75 ? "text-[#059669]" : s.summativeScore >= 50 ? "text-[#D97706]" : "text-[#DC2626]"}`}>
                          {s.summativeScore ?? "—"}
                        </span>
                      </button>
                      {expanded === s.id && s.summativeDetails && (
                        <div className="space-y-2 border-t border-[#F0F0F0] px-4 py-3">
                          {s.summativeDetails.map((d) => (
                            <div key={d.key} className="flex items-center gap-3">
                              <span className="w-40 truncate text-xs text-[#737373]">{d.label}</span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F0F0]">
                                <div className="h-full rounded-full bg-[#1A1A1A]" style={{ width: `${(d.earned / d.max) * 100}%` }} />
                              </div>
                              <span className="w-12 text-right font-mono text-xs font-bold">{d.earned}/{d.max}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {expanded === s.id && !s.summativeDetails && (
                        <p className="border-t border-[#F0F0F0] px-4 py-3 text-xs text-[#A3A3A3]">Siswa belum mengerjakan asesmen sumatif.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ══ POP-UP: panggilan dari Tutor Sebaya ══ */}
      {(() => {
        const call = tele?.calls.find((c) => !dismissedCalls.includes(c.id));
        if (!call) return null;
        return (
          <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="bg-[#2563EB] px-6 py-7 text-center text-white">
                <span className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                  <MonitorPlay size={28} />
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-ping rounded-full bg-[#FBBF24]" />
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-[#FBBF24]" />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Panggilan Masuk</p>
                <p className="mt-2 text-xl font-bold leading-tight">{call.tutorName} memanggil Anda</p>
                <p className="mt-1 text-xs text-white/80">{call.message} · {call.ageSec} detik lalu</p>
              </div>
              <div className="space-y-2 p-5">
                <button
                  onClick={() => resolveCall(call.id)}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-bold text-white transition active:scale-[0.98]"
                >
                  <Check size={17} /> Sudah Saya Hampiri
                </button>
                <button
                  onClick={() => setDismissedCalls((d) => [...d, call.id])}
                  className="min-h-[44px] w-full rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#525252]"
                >
                  Tunda Sebentar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* modal hapus */}
      {confirmDelete && active && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <AlertTriangle size={28} className="mx-auto text-[#DC2626]" />
            <p className="mt-3 text-base font-bold">Hapus rombel “{active.className}”?</p>
            <p className="mt-1 text-xs text-[#737373]">Seluruh data siswa, log, dan nilai di rombel ini ikut terhapus permanen.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmDelete(false)} className="min-h-[44px] rounded-xl border border-[#E5E5E5] text-sm font-semibold">Batal</button>
              <button onClick={deleteClass} disabled={busy} className="min-h-[44px] rounded-xl bg-[#DC2626] text-sm font-bold text-white disabled:opacity-50">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent, dark }: { label: string; value: string; accent?: string; dark?: boolean }) {
  return (
    <div className="px-2 py-3">
      <p className="font-mono text-xl font-black tracking-tight sm:text-2xl" style={{ color: accent ?? (dark ? "#fff" : "#1A1A1A") }}>{value}</p>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? "text-white/50" : "text-[#A3A3A3]"}`}>{label}</p>
    </div>
  );
}

// ── Tampilan telemetri: grid siswa × sub-bab ────────────────────────────────
function TelemetryView({ tele }: { tele: Telemetry }) {
  const maxDist = Math.max(1, ...tele.distribution.map((d) => d.active + d.completed));
  return (
    <div className="space-y-4">
      {/* sebaran */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A3A3]">Sebaran Siswa per Sub-Bab (Live)</p>
        <div className="flex h-28 items-end gap-1.5 sm:gap-2.5">
          {tele.distribution.map((d) => (
            <div key={d.subbab} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${Math.max(6, ((d.active + d.completed) / maxDist) * 84)}px` }}>
                <div className="w-full bg-[#10B981]" style={{ height: d.active + d.completed > 0 ? `${(d.completed / (d.active + d.completed)) * 100}%` : "0%" }} />
                <div className="w-full bg-[#3B82F6]" style={{ height: d.active + d.completed > 0 ? `${(d.active / (d.active + d.completed)) * 100}%` : "0%" }} />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#A3A3A3]">{d.subbab}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-4 text-[10px] font-semibold text-[#737373]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#10B981]" /> Tuntas</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#3B82F6]" /> Sedang aktif</span>
        </div>
      </div>

      {/* grid siswa */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#F0F0F0] text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">
                <th className="py-2.5 pl-4 pr-2">Siswa</th>
                {Array.from({ length: TOTAL_SUBBAB }, (_, i) => (
                  <th key={i} className="px-1 py-2.5 text-center font-mono">{i + 1}</th>
                ))}
                <th className="px-2 py-2.5 text-center">Akurasi</th>
                <th className="py-2.5 pl-2 pr-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {tele.students.length === 0 && (
                <tr><td colSpan={13} className="px-4 py-10 text-center text-sm text-[#A3A3A3]">
                  Belum ada siswa. Bagikan kode <b className="font-mono">{tele.class.classCode}</b> ke kelasmu!
                </td></tr>
              )}
              {tele.students.map((s) => (
                <tr key={s.id} className="border-b border-[#F7F7F7] last:border-0">
                  <td className="py-2 pl-4 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="max-w-[130px] truncate text-[13px] font-bold">{s.name}</p>
                      {s.isTutor && (
                        <span className="rounded bg-[#8B5CF6]/10 px-1.5 py-0.5 text-[9px] font-black text-[#6D28D9]">
                          TUTOR{s.tutorBusy ? "·SIBUK" : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: TOTAL_SUBBAB }, (_, i) => {
                    const n = i + 1;
                    const done = s.completed.includes(n);
                    const isCur = n === s.currentSubbab && !done;
                    const macet = isCur && s.status === "MACET";
                    return (
                      <td key={n} className="px-1 py-2">
                        <div
                          className={`mx-auto h-6 w-6 rounded-md border transition ${
                            done ? "border-[#10B981] bg-[#10B981]"
                            : macet ? "macet-blink border-[#EF4444] bg-[#EF4444]"
                            : isCur ? "border-[#3B82F6] bg-[#3B82F6]/15 ring-2 ring-[#3B82F6]/40"
                            : "border-[#E5E5E5] bg-[#FAFAFA]"
                          }`}
                          title={done ? `Sub-bab ${n} tuntas` : macet ? `MACET di sub-bab ${n}` : isCur ? `Aktif di sub-bab ${n}` : `Sub-bab ${n} belum dibuka`}
                        >
                          {done && <Check size={12} className="mx-auto mt-[5px] text-white" strokeWidth={3.5} />}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-mono text-xs font-bold text-[#525252]">
                    {s.accuracy === null ? "—" : `${s.accuracy}%`}
                  </td>
                  <td className="py-2 pl-2 pr-4 text-center">
                    {s.status === "MACET" ? (
                      <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-[#EF4444] px-2 py-1 text-[9px] font-black text-white">
                        <AlertTriangle size={10} /> MACET
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#10B981]/10 px-2 py-1 text-[9px] font-black text-[#059669]">AKTIF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Kartu proyeksi kasus untuk pleno ────────────────────────────────────────
function CaseCard({ q, showAnswer, onToggle }: { q: Question; showAnswer: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#1A1A1A] bg-white shadow-[4px_4px_0_#E5E5E5]">
      <div className="flex items-center gap-2 bg-[#1A1A1A] px-4 py-2.5">
        <Presentation size={14} className="text-[#F59E0B]" />
        <p className="text-xs font-bold text-white">Kasus Pleno · Sub-Bab {q.subbab} · Template {q.templateId}</p>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <p className="text-sm font-medium leading-relaxed sm:text-base">{q.prompt}</p>
        {q.math && (
          <div className="rounded-xl bg-[#FAFAFA] px-4 py-3 text-center font-mono text-base sm:text-lg">{q.math}</div>
        )}
        {q.canvas && q.kind !== "graph" && <CartesianCanvas spec={q.canvas} height={260} />}
        {q.kind === "graph" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(q.graphOptions ?? []).map((spec, i) => (
              <div key={i} className="rounded-lg border border-[#E5E5E5] p-1">
                <CartesianCanvas spec={spec} mini height={120} />
                <p className="py-1 text-center text-xs font-bold text-[#737373]">{String.fromCharCode(65 + i)}</p>
              </div>
            ))}
          </div>
        )}
        {q.mcOptions && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {q.mcOptions.map((o) => (
              <div key={o.id} className="rounded-lg border border-[#E5E5E5] px-3 py-2 font-mono text-xs">{o.label}</div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {q.hints.map((h, i) => (
            <span key={i} className="rounded-lg bg-[#FFFBEB] px-2.5 py-1.5 text-[11px] text-[#92400E]"><b>H{i + 1}</b> {h}</span>
          ))}
        </div>
        <button onClick={onToggle} className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 text-xs font-bold text-white transition active:scale-95">
          <Eye size={14} /> {showAnswer ? "Sembunyikan Pembahasan" : "Tampilkan Pembahasan"}
        </button>
        {showAnswer && (
          <p className="rounded-xl border border-[#10B981]/30 bg-[#ECFDF5] px-4 py-3 text-sm leading-relaxed text-[#065F46]">
            {q.explain}
          </p>
        )}
      </div>
    </div>
  );
}
