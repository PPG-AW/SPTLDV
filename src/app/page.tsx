'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, BookOpen, Trophy, Users, ArrowRight, Star, Zap, Target } from 'lucide-react';

export default function HomePage() {
  const [nama, setNama] = useState('');
  const [kodeKelas, setKodeKelas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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

      router.push('/belajar');
    } catch {
      setError('Gagal terhubung ke server');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-animated opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">LINIERKu</h1>
                <p className="text-sm text-gray-600">Belajar Matematika Jadi Seru!</p>
              </div>
            </div>
            <a href="/guru" className="px-6 py-2.5 glass rounded-xl text-gray-700 hover:text-purple-600 font-semibold transition-all hover:scale-105">
              Portal Guru
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Platform Pembelajaran Interaktif #1</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              <span className="gradient-text">Kuasai</span>
              <br />
              <span className="text-gray-900">SPtLDV dengan</span>
              <br />
              <span className="gradient-text-2">Cara Seru!</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              Belajar Sistem Pertidaksamaan Linear Dua Variabel jadi mudah dan menyenangkan dengan 10 subbab interaktif, generator soal adaptif, dan tutor sebaya yang siap membantu!
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">10 Subbab</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full">
                <Target className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-semibold text-pink-900">Soal Adaptif</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-900">Tutor Sebaya</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-4xl font-black gradient-text">10</div>
                <div className="text-sm text-gray-600 font-semibold">Subbab</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black gradient-text-2">100%</div>
                <div className="text-sm text-gray-600 font-semibold">Interaktif</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black gradient-text">24/7</div>
                <div className="text-sm text-gray-600 font-semibold">Akses</div>
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card glass className="relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-t-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Masuk Kelas</h2>
                      <p className="text-purple-100">Mulai petualangan belajarmu!</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Siapa namamu?"
                      className="w-full px-5 py-4 glass rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Kode Kelas
                    </label>
                    <input
                      type="text"
                      value={kodeKelas}
                      onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full px-5 py-4 glass rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all uppercase font-mono tracking-wider"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">Tanya kode kelas ke gurumu ya!</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <p className="text-sm text-red-900 font-semibold">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    variant="gradient"
                    fullWidth
                    size="lg"
                    loading={loading}
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Mulai Belajar
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    Gunakan nama yang sama setiap kali masuk agar progres tersimpan
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: 'Materi Lengkap',
              description: '10 subbab tersusun sistematis dengan materi yang mudah dipahami',
              gradient: 'from-purple-500 to-indigo-500'
            },
            {
              icon: Target,
              title: 'Soal Adaptif',
              description: 'Generator soal yang menyesuaikan dengan kemampuanmu',
              gradient: 'from-pink-500 to-rose-500'
            },
            {
              icon: Trophy,
              title: 'Gamifikasi',
              description: 'Dapatkan bintang dan naik level untuk motivasi belajar',
              gradient: 'from-orange-500 to-amber-500'
            }
          ].map((feature, index) => (
            <Card key={index} glass hover className="p-8">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">LINIERKu</span>
            </div>
            <p className="text-sm text-gray-600">
              Media Pembelajaran Interaktif untuk SMA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
