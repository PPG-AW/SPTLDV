'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { LEADERBOARD_TOP, POLL_INTERVAL } from '@/config/aturan';

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
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/belajar" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-indigo-700">Peringkat Kelas</h1>
            <p className="text-xs text-gray-500">{kelasNama}</p>
          </div>
          <Trophy className="text-amber-500" size={24} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* My Position Card */}
        <div className="bg-indigo-600 text-white rounded-xl p-4 mb-6 shadow-lg">
          <p className="text-sm opacity-80">Posisimu</p>
          <p className="text-2xl font-bold">#{myRank} dari {totalSiswa} siswa</p>
          <p className="text-sm mt-1 opacity-80">{siswaNama}</p>
        </div>

        {/* Top 10 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
            <h2 className="font-semibold text-gray-800">🏆 10 Teratas</h2>
          </div>
          <div className="divide-y">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-4 ${
                  entry.rank <= 3 ? 'bg-amber-50' : ''
                }`}
              >
                <span className="w-8 text-center font-bold text-gray-500">
                  {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{entry.nama}</p>
                  <p className="text-xs text-gray-500">Level {entry.level}</p>
                </div>
                <span className="text-xs text-gray-400">{entry.level_time}</span>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Belum ada data peringkat.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
