import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Presentation } from "lucide-react";
import { getSessionIdentity } from "@/lib/auth";
import AuthForm from "@/components/auth-forms";

export default async function MasukGuru() {
  const identity = await getSessionIdentity();
  if (identity?.type === "teacher") redirect("/guru/dashboard");
  if (identity?.type === "student") redirect("/belajar");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(700px_circle_at_50%_-10%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 transition hover:text-white">
          <ArrowLeft size={13} /> Ke Portal Siswa
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0A0A0A]">
            <Presentation size={20} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Portal Guru</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Masuk Dashboard</h1>
            <p className="text-xs text-white/45">Telemetri kelas · Focus Lock · Analitik miskonsepsi</p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white p-5 sm:p-7">
          <AuthForm role="teacher" mode="login" />
          <div className="mt-5 border-t border-dashed border-[#E5E5E5] pt-4 text-center">
            <p className="text-xs text-[#737373]">
              Belum punya akun guru?{" "}
              <Link href="/guru/daftar" className="font-bold text-[#1A1A1A] underline decoration-[#3B82F6] decoration-2 underline-offset-4 hover:text-[#3B82F6]">
                Daftar Guru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
