'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogoIcon, HeroIllustration } from '@/components/ui/illustrations';
import { Sparkles, BookOpen, Trophy, Users, ArrowRight, Star, Zap, Target, GraduationCap, Layers, Compass } from 'lucide-react';
import { initAudio } from '@/lib/sounds';

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
    initAudio();

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
    <div className="min-h-screen bg-mesh">
      {/* Floating decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#3A86EF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-[#4EA8DE] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#FFD166] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon size={44} />
              <div>
                <h1 className="text-2xl font-black text-gradient-blue leading-tight">LINIERKu</h1>
                <p className="text-xs text-gray-600 font-semibold">Media Pembelajaran Interaktif</p>
              </div>
            </div>
            <a 
              href="/guru" 
              className="px-4 py-2 glass rounded-xl text-gray-700 hover:text-[#3A86EF] font-semibold transition-all hover:scale-105"
            >
              Portal Guru
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-gray-100">
              <Star className="w-4 h-4 text-[#FFD166] fill-[#FFD166]" />
              <span className="text-sm font-bold text-gray-700">Platform Pembelajaran Interaktif</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              <span className="text-gradient-blue">Kuasai</span>
              <br />
              <span className="text-gray-900">SPtLDV</span>
              <br />
              <span className="text-gradient-blue">dengan Seru!</span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              Belajar Sistem Pertidaksamaan Linear Dua Variabel jadi mudah dan menyenangkan dengan materi lengkap, simulasi interaktif, dan asesmen adaptif.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft">
                <BookOpen className="w-5 h-5 text-[#3A86EF]" />
                <span className="text-sm font-bold text-gray-900">10 Subbab</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft">
                <Target className="w-5 h-5 text-[#4EA8DE]" />
                <span className="text-sm font-bold text-gray-900">Simulasi</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft">
                <Users className="w-5 h-5 text-[#FFD166]" />
                <span className="text-sm font-bold text-gray-900">Tutor Sebaya</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
                <div className="text-3xl font-black text-gradient-blue">10</div>
                <div className="text-xs text-gray-600 font-bold mt-1">Subbab</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
                <div className="text-3xl font-black text-gradient-blue">100%</div>
                <div className="text-xs text-gray-600 font-bold mt-1">Interaktif</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
                <div className="text-3xl font-black text-gradient-blue">24/7</div>
                <div className="text-xs text-gray-600 font-bold mt-1">Akses</div>
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="overflow-hidden shadow-strong">
              {/* Header */}
              <div className="gradient-blue p-7 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Masuk Kelas</h2>
                      <p className="text-blue-100 text-sm">Mulai perjalanan belajarmu!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Siapa namamu?"
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#3A86EF] focus:ring-4 focus:ring-blue-100 transition-all"
                    required
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Kode Kelas</label>
                  <input
                    type="text"
                    value={kodeKelas}
                    onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#3A86EF] focus:ring-4 focus:ring-blue-100 transition-all uppercase font-mono tracking-wider"
                    required
                    style={{ fontSize: '16px' }}
                  />
                  <p className="text-xs text-gray-500 mt-2 font-semibold">Tanya kode kelas ke gurumu ya!</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                    <p className="text-sm text-red-900 font-bold">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Mulai Belajar
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Gunakan nama yang sama setiap kali masuk agar progres tersimpan
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Kenapa <span className="text-gradient-blue">LINIERKu</span>?
            </h2>
            <p className="text-gray-600 text-lg">Platform pembelajaran yang dirancang khusus untuk pemahaman maksimal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Pembelajaran Berjenjang',
                description: '10 subbab tersusun sistematis dari dasar hingga mahir, dengan progress tracking yang jelas.',
                gradient: 'from-[#3A86EF] to-[#4EA8DE]',
                bgColor: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Simulasi Interaktif',
                description: 'Eksplorasi konsep matematika melalui simulasi visual yang menarik untuk setiap subbab.',
                gradient: 'from-[#4EA8DE] to-[#7EC8E3]',
                bgColor: 'bg-cyan-50',
              },
              {
                icon: Trophy,
                title: 'Gamifikasi & Motivasi',
                description: 'Dapatkan bintang, naik level, dan bersaing sehat dengan teman-teman di leaderboard.',
                gradient: 'from-[#FFD166] to-[#FB923C]',
                bgColor: 'bg-amber-50',
              },
            ].map((feature, index) => (
              <Card key={index} hoverable className="overflow-hidden group">
                <div className={`bg-gradient-to-br ${feature.gradient} p-6`}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{feature.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <LogoIcon size={36} />
              <div>
                <p className="font-black text-gradient-blue">LINIERKu</p>
                <p className="text-xs text-gray-600">Media Pembelajaran Interaktif</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-semibold">
              Untuk Siswa SMA · Belajar jadi menyenangkan!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
