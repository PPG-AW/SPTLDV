import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getSessionIdentity } from "@/lib/auth";
import AuthForm from "@/components/auth-forms";

export default async function DaftarSiswa() {
  const identity = await getSessionIdentity();
  if (identity?.type === "student") redirect("/belajar");
  if (identity?.type === "teacher") redirect("/guru/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-5">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(700px_circle_at_0%_100%,rgba(139,92,246,0.08),transparent_55%),radial-gradient(600px_circle_at_100%_0%,rgba(59,130,246,0.09),transparent_55%)]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3A3A3] transition hover:text-[#1A1A1A]">
          <ArrowLeft size={13} /> Kembali
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white">
            <GraduationCap size={20} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#A3A3A3]">Portal Siswa</p>
            <h1 className="font-display text-2xl font-bold tracking-tight">Daftar ke Rombel</h1>
          </div>
        </div>
        <div className="rounded-3xl border-2 border-[#1A1A1A] bg-white p-5 shadow-[6px_6px_0_#E5E5E5] sm:p-7">
          <AuthForm role="student" mode="register" />
          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#A3A3A3]">
            Mintalah <b>kode kelas</b> kepada gurumu sebelum mendaftar. Satu nama hanya bisa dipakai satu kali per rombel.
          </p>
        </div>
      </div>
    </div>
  );
}
