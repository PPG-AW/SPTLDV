import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  GraduationCap,
  Lock,
  MonitorPlay,
  MoveRight,
  Target,
  Users,
} from "lucide-react";
import { getSessionIdentity } from "@/lib/auth";
import AuthForm from "@/components/auth-forms";
import HeroArt from "@/components/HeroArt";

const TICKER = [
  "ax + by ≤ c", "Daerah Penyelesaian", "Titik Pojok", "Fungsi Tujuan",
  "Mastery × 3", "Tutor Sebaya", "Focus Lock", "f(x,y) = 5x + 3y",
  "Eliminasi", "Uji Titik (0,0)", "SPtLDV Fase E",
];

export default async function Landing() {
  const identity = await getSessionIdentity();
  if (identity?.type === "student") redirect("/belajar");
  if (identity?.type === "teacher") redirect("/guru/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* ── Panel kiri: gelap, editorial ── */}
      <section className="relative flex min-h-[52vh] flex-col justify-between overflow-hidden bg-[#0A0A0A] p-6 text-white sm:p-10 lg:h-full lg:w-[55%]">
        <div className="absolute inset-0 opacity-80">
          <HeroArt dark />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0A0A0A]">
              <GraduationCap size={18} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold tracking-tight">SPtLDV<span className="text-[#3B82F6]">.belajar</span></p>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">Matematika · Fase E</p>
            </div>
          </div>
          <Link
            href="/guru"
            className="group flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/50 hover:text-white"
          >
            Masuk Guru <ArrowUpRight size={13} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="relative z-10 mt-14 max-w-xl lg:mt-0">
          <p className="font-mono text-[11px] tracking-[0.3em] text-[#3B82F6]">TEAM-ASSISTED INDIVIDUALIZATION</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Kuasai SPtLDV.
            <br />
            <span className="text-white/40">Baris demi baris.</span>
            <br />
            <span className="text-[#3B82F6]">Teman demi teman.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
            10 sub-bab berjenjang dari pengenalan pertidaksamaan hingga nilai optimum —
            dengan mastery learning, petunjuk bertingkat, tutor sebaya yang siaga,
            dan guru yang memegang kendali penuh kelas.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[
              { icon: <Target size={13} />, label: "3 Benar Beruntun = Naik" },
              { icon: <Brain size={13} />, label: "Petunjuk H1–H3" },
              { icon: <Users size={13} />, label: "Tutor Sebaya Fluid 25%" },
              { icon: <Lock size={13} />, label: "Teacher Focus Lock" },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/75">
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* ticker */}
        <div className="relative z-10 mt-10 overflow-hidden border-t border-white/10 pt-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-8">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-8 whitespace-nowrap font-mono text-xs text-white/35">
                {t} <span className="text-[#3B82F6]">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Panel kanan: kartu login ── */}
      <section className="relative flex flex-1 items-center justify-center p-5 sm:p-10 lg:h-full">
        <div className="pointer-events-none absolute inset-0 opacity-[0.5] [background:radial-gradient(600px_circle_at_100%_0%,rgba(59,130,246,0.09),transparent_60%)]" />
        <div className="relative w-full max-w-md">
          <div className="mb-6 flex items-end justify-between lg:mb-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A3A3A3]">Portal Siswa</p>
              <h2 className="font-display mt-1 text-2xl font-bold tracking-tight">Masuk ke Kelasmu</h2>
            </div>
            <span className="float-y flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5E5E5] bg-white shadow-[3px_3px_0_#E5E5E5]">
              <MonitorPlay size={20} className="text-[#3B82F6]" />
            </span>
          </div>

          <div className="rounded-3xl border-2 border-[#1A1A1A] bg-white p-5 shadow-[6px_6px_0_#E5E5E5] sm:p-7">
            <AuthForm role="student" mode="login" />
            <div className="mt-5 border-t border-dashed border-[#E5E5E5] pt-4 text-center">
              <p className="text-xs text-[#737373]">
                Baru bergabung ke rombel ini?{" "}
                <Link href="/daftar" className="font-bold text-[#1A1A1A] underline decoration-[#3B82F6] decoration-2 underline-offset-4 hover:text-[#3B82F6]">
                  Daftar Siswa
                </Link>
              </p>
            </div>
          </div>

          <Link
            href="/guru"
            className="group mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#A3A3A3] transition hover:text-[#1A1A1A]"
          >
            Kamu guru? Kelola kelas dari sini
            <ArrowRight size={13} className="transition group-hover:translate-x-1" />
          </Link>

          <div className="mt-8 grid grid-cols-3 gap-2 text-center">
            {[
              { n: "10", l: "Sub-Bab Terstruktur" },
              { n: "30", l: "Template Soal" },
              { n: "∞", l: "Soal Ter-generate" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-[#E5E5E5] bg-white px-2 py-3.5">
                <p className="font-display text-xl font-bold tracking-tight">{s.n}</p>
                <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#A3A3A3]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
