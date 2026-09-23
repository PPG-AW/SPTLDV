'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'login' | 'newPassword' | 'confirmPassword' | 'verifyPassword' | 'success';

export default function HomePage() {
  const [step, setStep] = useState<Step>('login');
  const [nama, setNama] = useState('');
  const [kodeKelas, setKodeKelas] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: nama.trim(), kode_kelas: kodeKelas.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan');
        setLoading(false);
        return;
      }

      if (data.isNew) {
        setDisplayName(data.displayName);
        setKelasNama(data.kelasNama);
        setStep('newPassword');
      } else {
        setDisplayName(data.displayName);
        setKelasNama(data.kelasNama);
        setStep('verifyPassword');
      }
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) {
      setError('Password minimal 4 karakter');
      return;
    }
    setStep('confirmPassword');
  };

  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPass) {
      setError('Password tidak cocok, coba lagi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          kode_kelas: kodeKelas.trim().toUpperCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal membuat akun');
        setLoading(false);
        return;
      }
      setStep('success');
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          kode_kelas: kodeKelas.trim().toUpperCase(),
          password,
          verify: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password belum tepat, coba ingat-ingat lagi ya');
        setLoading(false);
        return;
      }
      setStep('success');
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700">LINIERKu</h1>
          <p className="text-gray-600 mt-2">Media Pembelajaran Interaktif SPtLDV</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Step: Login */}
          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Masuk</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Kelas</label>
                  <input
                    type="text"
                    value={kodeKelas}
                    onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base uppercase tracking-wider"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanya kode kelas ke gurumu</p>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Memproses...' : 'Masuk / Mulai'}
                </button>
              </div>
              <div className="mt-4 text-center">
                <a href="/guru" className="text-sm text-gray-500 hover:text-indigo-600">
                  Masuk sebagai Guru →
                </a>
              </div>
            </form>
          )}

          {/* Step: Create Password (new student) */}
          {step === 'newPassword' && (
            <form onSubmit={handleCreatePassword}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">✏️ Buat Password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Halo <strong>{displayName}</strong>! Buat password untuk akunmu di <strong>{kelasNama}</strong>.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (min. 4 karakter)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    required
                    minLength={4}
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Lanjut
                </button>
              </div>
            </form>
          )}

          {/* Step: Confirm Password */}
          {step === 'confirmPassword' && (
            <form onSubmit={handleConfirmPassword}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">🔒 Konfirmasi Password</h2>
              <p className="text-sm text-gray-600 mb-4">Ketik ulang password yang sama.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ketik Ulang Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Membuat akun...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          )}

          {/* Step: Verify Password (returning student) */}
          {step === 'verifyPassword' && (
            <form onSubmit={handleVerifyPassword}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">🔑 Masukkan Password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Selamat datang kembali, <strong>{displayName}</strong>!
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Memverifikasi...' : 'Masuk'}
                </button>
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500">Lupa password? Minta guru mereset password-mu.</p>
                  <button
                    type="button"
                    onClick={() => { setStep('login'); setPassword(''); setError(''); }}
                    className="text-xs text-gray-500 hover:text-indigo-600"
                  >
                    Ini bukan akunmu? ← Kembali
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Halo, {displayName}!
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Kamu masuk di kelas <strong>{kelasNama}</strong>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
                <p className="text-sm text-yellow-800">
                  📝 <strong>Catat baik-baik!</strong> Nama + password ini yang kau pakai untuk melanjutkan progresmu, di perangkat mana pun.
                </p>
              </div>
              <button
                onClick={() => router.push('/belajar')}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Mulai Belajar →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
