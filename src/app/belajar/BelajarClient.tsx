'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lock, CheckCircle, PlayCircle, Trophy, BookOpen, Sparkles, Star, Zap, Target, Users, ArrowRight, LogOut, Menu, X } from 'lucide-react';

interface SubbabItem {
  no: number;
  judul: string;
  terbuka: boolean;
  lulus: boolean;
  benar: number;
}

interface Props {
  siswaNama: string;
  kelasNama: string;
  kelasId: number;
  siswaId: number;
  subbabList: SubbabItem[];
}

export default function BelajarClient({ siswaNama, kelasNama, kelasId, siswaId, subbabList }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLevel = Math.max(1, ...subbabList.filter(s => s.lulus).map(s => s.no + 1), 1);
  const completedCount = subbabList.filter(s => s.lulus).length;
  const progressPercent = (completedCount / 10) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-animated opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden relative z-20 glass border-b border-white/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 glass rounded-xl hover:scale-105 transition-transform"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold gradient-text">{siswaNama}</h1>
              <p className="text-xs text-gray-600">Level {currentLevel}</p>
            </div>
          </div>
          <Link href="/peringkat" className="p-2 glass rounded-xl hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </Link>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'fixed inset-0 z-30' : 'hidden'} md:block md:relative md:z-auto`}>
          {sidebarOpen && <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>}
          
          <div className={`w-80 h-full overflow-y-auto glass border-r border-white/20 ${sidebarOpen ? 'fixed left-0 top-0 bottom-0' : ''}`}>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-black gradient-text">LINIERKu</h1>
                </div>
                {sidebarOpen && (
                  <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 glass rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Info Card */}
              <Card gradient="purple" className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{siswaNama.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">{siswaNama}</p>
                    <p className="text-purple-100 text-sm">{kelasNama}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="font-bold text-white">Level {currentLevel}</span>
                  </div>
                  <span className="text-sm text-purple-100 font-semibold">{completedCount}/10</span>
                </div>
              </Card>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-2">
                {subbabList.map((sb) => {
                  const isAccessible = sb.terbuka || sb.no === 1;
                  const Icon = sb.lulus ? CheckCircle : isAccessible ? PlayCircle : Lock;
                  
                  const gradients = [
                    'from-purple-500 to-indigo-500',
                    'from-pink-500 to-rose-500',
                    'from-blue-500 to-cyan-500',
                    'from-green-500 to-emerald-500',
                    'from-orange-500 to-amber-500',
                    'from-red-500 to-pink-500',
                    'from-indigo-500 to-purple-500',
                    'from-teal-500 to-cyan-500',
                    'from-yellow-500 to-orange-500',
                    'from-purple-600 to-pink-600'
                  ];

                  return (
                    <Link
                      key={sb.no}
                      href={isAccessible ? `/belajar/${sb.no}` : '#'}
                      onClick={(e) => !isAccessible && e.preventDefault()}
                      className={`block`}
                    >
                      <Card 
                        glass 
                        hover={isAccessible}
                        className={`p-4 ${!isAccessible ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${sb.lulus ? 'from-green-500 to-emerald-500' : gradients[sb.no - 1]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm mb-1">
                              {sb.no}. {sb.judul}
                            </p>
                            {isAccessible && !sb.lulus && sb.benar > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex gap-1">
                                  {[1, 2, 3].map(i => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i <= sb.benar ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-semibold text-gray-600">{sb.benar}/3</span>
                              </div>
                            )}
                            {sb.lulus && (
                              <div className="flex items-center gap-1 mt-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-green-600">Selesai!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Sumatif */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <Link href="/sumatif" className="block">
                  <Card 
                    gradient="orange"
                    hover={subbabList.every(s => s.lulus)}
                    className={`p-5 ${!subbabList.every(s => s.lulus) ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-white text-lg">Asesmen Sumatif</p>
                        <p className="text-orange-100 text-sm">Ujian akhir setelah 10 subbab</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-6 border-t border-white/20 space-y-2">
                <Link href="/peringkat">
                  <Card glass hover className="p-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-700">Peringkat Kelas</span>
                    </div>
                  </Card>
                </Link>
                <button
                  onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')}
                  className="w-full"
                >
                  <Card glass hover className="p-3">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-gray-700">Keluar</span>
                    </div>
                  </Card>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Card */}
            <Card glass className="mb-8 overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

              <div className="relative z-10 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black gradient-text">
                      Selamat Belajar, {siswaNama}!
                    </h2>
                    <p className="text-gray-600">Siap untuk petualangan belajar hari ini?</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Progres Belajar</span>
                    <span className="text-sm font-bold gradient-text">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Kamu telah menyelesaikan <span className="font-bold">{completedCount}</span> dari <span className="font-bold">10</span> subbab
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card glass hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Tutor Sebaya</h3>
                    <p className="text-gray-600 mb-4">
                      Butuh bantuan? Panggil tutor sebaya yang akan menghampirimu!
                    </p>
                    <Button variant="gradient" fullWidth>
                      Panggil Tutor
                    </Button>
                  </div>
                </div>
              </Card>

              <Card glass hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">Peringkat Kelas</h3>
                    <p className="text-gray-600 mb-4">
                      Lihat peringkatmu dan bersaing dengan teman-teman!
                    </p>
                    <Link href="/peringkat">
                      <Button variant="primary" fullWidth icon={<ArrowRight className="w-5 h-5" />}>
                        Lihat Peringkat
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Card */}
            <Card glass className="mt-8 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Tips Belajar</h3>
                  <p className="text-gray-700">
                    Tulis semua coretan dan langkah pengerjaanmu di buku tulis untuk pemahaman yang lebih baik. Belajar aktif lebih efektif daripada hanya membaca!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
