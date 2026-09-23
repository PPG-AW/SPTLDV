'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { DURASI_SUMATIF_MENIT } from '@/config/aturan';

interface Props {
  siswaId: number;
  siswaNama: string;
  kelasId: number;
}

export default function SumatifClient({ siswaId, siswaNama, kelasId }: Props) {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURASI_SUMATIF_MENIT * 60);
  const [finished, setFinished] = useState(false);

  const startSumatif = async () => {
    setStarted(true);
    // Start timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    setFinished(true);
    // Submit to server
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Asesmen Sumatif Selesai!</h1>
          <p className="text-gray-600 mb-6">
            Terima kasih, {siswaNama}. Nilai akan segera ditampilkan oleh Bapak/Ibu Guru.
          </p>
          <Link
            href="/belajar"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Asesmen Sumatif</h1>
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Petunjuk:</strong>
              </p>
              <ul className="text-sm text-blue-700 list-disc ml-4 mt-2 space-y-1">
                <li>Asesmen terdiri dari 2 soal berkelanjutan</li>
                <li>Waktu: {DURASI_SUMATIF_MENIT} menit</li>
                <li>Soal 1: Model matematika → grafik → titik pojok</li>
                <li>Soal 2: Nilai maksimum & minimum</li>
                <li>Tulis semua proses di buku tulis!</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ☑️ Saya akan menuliskan semua proses pengerjaan di buku tulis
              </p>
            </div>
          </div>
          <button
            onClick={startSumatif}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Mulai Asesmen
          </button>
          <Link
            href="/belajar"
            className="block text-center mt-3 text-sm text-gray-500 hover:text-indigo-600"
          >
            ← Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/belajar" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">Asesmen Sumatif</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg">
            <Clock size={16} />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            📒 Tulis semua coretan/langkah pengerjaanmu di buku tulis!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Soal 1 (Bobot 60)</h2>
          <p className="text-gray-700 mb-4">
            Soal cerita akan ditampilkan di sini (dari generator). Siswa menginput: model matematika, sketsa grafik, dan titik pojok.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            [Area input soal akan diintegrasikan dengan generator]
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Soal 2 (Bobot 40)</h2>
          <p className="text-gray-700 mb-4">
            Melanjutkan Soal 1: tentukan nilai maksimum + titiknya dan nilai minimum + titiknya.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            [Area input soal akan diintegrasikan dengan generator]
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-yellow-800">
              ☑️ Saya sudah menuliskan proses lengkap di buku tulis
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Kumpulkan Jawaban
        </button>
      </main>
    </div>
  );
}
