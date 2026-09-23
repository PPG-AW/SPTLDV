import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Presentation } from "lucide-react";
import { getSessionIdentity } from "@/lib/auth";
import AuthForm from "@/components/auth-forms";

export default async function DaftarGuru() {
  const identity = await getSessionIdentity();
  if (identity?.type === "teacher") redirect("/guru/dashboard");
  if (identity?.type === "student") redirect("/belajar");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(700px_circle_at_50%_-10%,rgba(139,92,246,0.2),transparent_55%)]" />
      <div className="relative w-full max-w-md">
        <Link href="/guru" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 transition hover:text-white">
          <ArrowLeft size={13} /> Masuk Guru
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0A0A0A]">
            <Presentation size={20} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Portal Guru</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Daftar Guru</h1>
            <p className="text-xs text-white/45">Setelah masuk, buat rombel & kode kelas unikmu.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white p-5 sm:p-7">
          <AuthForm role="teacher" mode="register" />
        </div>
      </div>
    </div>
  );
}
