'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Tab = 'login' | 'register';

export default function GuruPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal masuk');
        setLoading(false);
        return;
      }

      router.push('/guru/dashboard');
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_lengkap: nama, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar');
        setLoading(false);
        return;
      }

      router.push('/guru/dashboard');
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Guru</h1>
          <p className="text-gray-600">LINIERKu - Media Pembelajaran Interaktif</p>
        </div>

        <Card className="shadow-strong">
          <div className="bg-gradient-to-r from-gray-900 to-black p-5 rounded-t-xl">
            <h2 className="text-xl font-bold text-white">
              {tab === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {tab === 'login' ? 'Masuk untuk mengelola kelas' : 'Buat akun untuk mulai mengajar'}
            </p>
          </div>
          <CardBody>
            {/* Tabs */}
            <div className="flex mb-6 border-b-2 border-gray-200">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-3 font-bold transition-all relative ${
                  tab === 'login'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Masuk
                {tab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 font-bold transition-all relative ${
                  tab === 'register'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Daftar
                {tab === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-full" />
                )}
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm text-red-900 font-medium">{error}</p>
                  </div>
                )}
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Masuk
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <Input
                  label="Nama Lengkap"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm text-red-900 font-medium">{error}</p>
                  </div>
                )}
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Daftar
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
              <a href="/" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                ← Kembali ke halaman siswa
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
