"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";

interface Props {
  role: "student" | "teacher";
  mode: "login" | "register";
}

export default function AuthForm({ role, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [classCode, setClassCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const action = `${mode}-${role}`;
  const isStudent = role === "student";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, classCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        return;
      }
      router.push(isStudent ? "/belajar" : "/guru/dashboard");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#1A1A1A] outline-none transition placeholder:text-[#C9C9C9] focus:border-[#1A1A1A] focus:shadow-[0_0_0_3px_rgba(26,26,26,0.08)]";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#525252]">
          {isStudent ? "Nama Lengkap / Panggilan" : "Nama Guru"}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isStudent ? "mis. Andi Pratama" : "mis. Pak Budi Santoso"}
          className={inputCls}
          autoComplete="username"
          required
        />
      </div>
      {isStudent && (
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#525252]">Kode Kelas</label>
          <input
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="mis. MTK-XA-2024"
            className={`${inputCls} font-mono uppercase tracking-widest`}
            required
          />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#525252]">Kata Sandi</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Minimal 4 karakter" : "Kata sandi kamu"}
            className={`${inputCls} pr-12`}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#525252]"
            aria-label={showPw ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {error && (
        <p className="rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] px-3.5 py-2.5 text-xs leading-relaxed text-[#991B1B]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] text-sm font-bold text-white shadow-[4px_4px_0_#C9C9C9] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#C9C9C9] disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={17} className="animate-spin" />
        ) : mode === "login" ? (
          <LogIn size={16} />
        ) : (
          <UserPlus size={16} />
        )}
        {mode === "login"
          ? isStudent ? "Masuk & Mulai Belajar" : "Masuk Dashboard Guru"
          : isStudent ? "Daftar & Masuk Kelas" : "Daftar sebagai Guru"}
      </button>
    </form>
  );
}
