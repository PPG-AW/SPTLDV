'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Trophy, Medal, Crown, Star, Sparkles, TrendingUp } from 'lucide-react';
import { POLL_INTERVAL } from '@/config/aturan';

interface Props {
  siswaId: number;
  siswaNama: string;
  kelasId: number;
  kelasNama: string;
}

interface LeaderboardEntry {
  rank: number;
  nama: string;
  level: number;
  level_time: string;
}

export default function PeringkatClient({ siswaId, siswaNama, kelasId, kelasNama }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number>(0);
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setEntries(data.top || []);
          setMyRank(data.myRank || 0);
          setTotalSiswa(data.total || 0);
        }
      } catch {}
      setLoading(false);
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
      </div>
    );
    if (rank === 2) return (
      <div className="w-20 h-20 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-3xl flex items-center justify-center shadow-2xl">
        <Medal className="w-12 h-12 text-white" />
      </div>
    );
    if (rank === 3) return (
      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
        <Medal className="w-12 h-12 text-white" />
      </div>
    );
    return (
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
        <span className="text-3xl font-black text-white">#{rank}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-animated opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/belajar" className="p-2 glass rounded-xl hover:scale-105 transition-transform">
              <ArrowLeft size={24} className="text-gray-900" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-black gradient-text">Peringkat Kelas</h1>
              <p className="text-sm text-gray-600 font-semibold">{kelasNama}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* My Position Card */}
        <Card glass className="mb-8 overflow-hidden relative">
          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative z-10 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Posisimu</p>
                </div>
                <p className="text-7xl font-black text-white mb-2">#{myRank}</p>
                <p className="text-xl text-white/80 font-semibold">dari {totalSiswa} siswa</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-2 font-semibold">Nama</p>
                <p className="text-2xl font-black text-white">{siswaNama}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold text-white">Terus Semangat!</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card glass className="overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Top 10 Teratas</h2>
                <p className="text-yellow-100 font-semibold">Siswa dengan progres terbaik</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.rank} glass hover className="p-5">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0">
                      {getRankBadge(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-2xl truncate mb-1">{entry.nama}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-black text-white">L</span>
                          </div>
                          <span className="font-bold text-gray-700">Level {entry.level}</span>
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <span className="text-sm text-gray-600 font-semibold">{entry.level_time}</span>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-7 h-7 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {entries.length === 0 && !loading && (
                <Card glass className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg animate-float">
                    <Trophy className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Belum Ada Data</h3>
                  <p className="text-gray-600 text-lg">Peringkat akan muncul setelah siswa mulai belajar</p>
                </Card>
              )}
            </div>
          </div>
        </Card>

        {/* Motivational Card */}
        <Card gradient="purple" className="mt-8 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-2xl mb-2">Terus Semangat!</h3>
              <p className="text-purple-100 text-lg">
                Setiap langkah kecil membawa kamu lebih dekat ke kesuksesan. Keep learning!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
