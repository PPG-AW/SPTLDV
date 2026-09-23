'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Play, CheckCircle, Star, Trophy, Bell, LogOut } from 'lucide-react';
import { POLL_INTERVAL, LEVEL_MIN_TUTOR_GURU } from '@/config/aturan';

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [status, setStatus] = useState('belajar');

  // Poll for notifications/status
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setStatus(data.status || 'belajar');
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const currentLevel = Math.max(1, ...subbabList.filter(s => s.lulus).map(s => s.no + 1), 1);
  const isElite = currentLevel >= LEVEL_MIN_TUTOR_GURU;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden bg-white shadow-sm p-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-indigo-600"
        >
          ☰ Menu
        </button>
        <span className="text-sm font-medium text-gray-600">
          Halo, {siswaNama.split(' ')[0]}!
        </span>
        <Link href="/peringkat" className="p-2 text-amber-500">
          <Trophy size={20} />
        </Link>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-72 bg-white md:min-h-screen shadow-md md:shadow-none`}>
        <div className="p-4 border-b bg-indigo-50">
          <h2 className="font-bold text-indigo-700">LINIERKu</h2>
          <p className="text-sm text-gray-600 mt-1">Halo, <strong>{siswaNama}</strong></p>
          <p className="text-xs text-gray-500">{kelasNama} · Level {currentLevel > 10 ? 'TUNTAS 🎓' : currentLevel}</p>
        </div>

        <nav className="p-2">
          {subbabList.map((sb) => (
            <Link
              key={sb.no}
              href={sb.terbuka ? `/belajar/${sb.no}` : '#'}
              className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                sb.terbuka
                  ? sb.lulus
                    ? 'bg-green-50 hover:bg-green-100 text-green-700'
                    : 'hover:bg-indigo-50 text-indigo-700'
                  : 'opacity-50 cursor-not-allowed text-gray-400'
              }`}
              onClick={(e) => !sb.terbuka && e.preventDefault()}
            >
              <span className="w-6 h-6 flex items-center justify-center text-sm">
                {sb.lulus ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : sb.terbuka ? (
                  <Play size={18} className="text-indigo-500" />
                ) : (
                  <Lock size={16} className="text-gray-400" />
                )}
              </span>
              <span className="flex-1 text-sm font-medium">
                {sb.no}. {sb.judul.length > 30 ? sb.judul.substring(0, 30) + '...' : sb.judul}
              </span>
              {sb.lulus && (
                <span className="flex gap-0.5">
                  {[1, 2, 3].map(i => (
                    <Star key={i} size={12} fill="gold" className="text-amber-400" />
                  ))}
                </span>
              )}
              {sb.terbuka && !sb.lulus && sb.benar > 0 && (
                <span className="text-xs text-indigo-500">{sb.benar}/3</span>
              )}
            </Link>
          ))}

          {/* Sumatif */}
          <Link
            href="/sumatif"
            className={`flex items-center gap-3 p-3 rounded-lg mb-1 mt-4 border-2 transition-colors ${
              subbabList.every(s => s.lulus)
                ? 'border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700'
                : 'border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            onClick={(e) => !subbabList.every(s => s.lulus) && e.preventDefault()}
          >
            <span className="w-6 h-6 flex items-center justify-center">
              {subbabList.every(s => s.lulus) ? <Trophy size={18} className="text-amber-500" /> : <Lock size={16} />}
            </span>
            <span className="text-sm font-bold">Asesmen Sumatif</span>
          </Link>

          <div className="border-t mt-4 pt-4">
            <Link
              href="/peringkat"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <Trophy size={18} className="text-amber-500" />
              <span className="text-sm font-medium">Peringkat Kelas</span>
            </Link>
            <button
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 w-full"
            >
              <LogOut size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Selamat Belajar, {siswaNama}! 📘
            </h1>
            <p className="text-gray-600">
              Kamu di kelas <strong>{kelasNama}</strong>. Pilih subbab di sidebar untuk mulai belajar.
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📒 <strong>Ingat!</strong> Tulis semua coretan/langkah pengerjaanmu di buku tulis!
              </p>
            </div>
          </div>

          {/* Tutor Sebaya Button */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <button className="w-full py-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2">
              🙋 Panggil Tutor Sebaya
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Tutor akan menghampiri mejamu secara langsung
            </p>
          </div>

          {/* Tutor Guru Button (only for elite) */}
          {isElite && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <button className="w-full py-3 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">
                👩‍🏫 Panggil Guru
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Kamu anggota kelompok elit — guru akan menghampirimu
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
