'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, CheckCircle, FileText, AlertCircle } from 'lucide-react';
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
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-strong">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-t-xl text-white text-center">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Asesmen Selesai</h1>
          </div>
          <CardBody>
            <div className="text-center">
              <p className="text-gray-700 mb-6">
                Terima kasih, <span className="font-bold">{siswaNama}</span>. Jawabanmu telah dikumpulkan dan akan segera dinilai.
              </p>
              <Link href="/belajar">
                <Button fullWidth size="lg">Kembali ke Dashboard</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="shadow-strong">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-t-xl text-white">
              <h1 className="text-3xl font-bold mb-3">Asesmen Sumatif</h1>
              <p className="text-gray-300 text-lg">Ujian akhir untuk mengukur pemahamanmu terhadap materi SPtLDV</p>
            </div>
            <CardBody>
              {/* Instructions */}
              <div className="space-y-5 mb-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Petunjuk Pengerjaan:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span className="text-gray-700">Asesmen terdiri dari 2 soal berkelanjutan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span className="text-gray-700">Waktu pengerjaan: {DURASI_SUMATIF_MENIT} menit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span className="text-gray-700">Soal 1: Model matematika, grafik, dan titik pojok</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <span className="text-gray-700">Soal 2: Nilai maksimum dan minimum</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                      <span className="text-gray-700">Wajib menuliskan semua proses di buku tulis</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 mb-2">Penting:</p>
                      <p className="text-gray-800">
                        Tulis semua langkah pengerjaan di buku tulis dengan rapi dan lengkap. Ini akan digunakan untuk verifikasi jawaban.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={startSumatif} fullWidth size="lg">
                  Mulai Asesmen
                </Button>
                <Link href="/belajar" className="flex-1">
                  <Button variant="outline" fullWidth size="lg">
                    Kembali
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900 sticky top-0 z-10 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/belajar" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={22} className="text-gray-900" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-xl text-gray-900">Asesmen Sumatif</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-medium">
            <Clock size={18} />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Warning */}
          <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-r-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <p className="text-gray-900">
                <span className="font-bold">Ingat:</span> Tulis semua coretan dan langkah pengerjaanmu di buku tulis!
              </p>
            </div>
          </div>

          {/* Question 1 */}
          <Card className="shadow-medium">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Soal 1 (Bobot 60)</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Model & Grafik</span>
              </div>
            </div>
            <CardBody>
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
                  <p className="text-gray-700">
                    Soal cerita akan ditampilkan di sini. Siswa menginput model matematika, sketsa grafik, dan titik pojok.
                  </p>
                </div>
                <div className="p-5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Area input soal akan diintegrasikan dengan generator</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Question 2 */}
          <Card className="shadow-medium">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Soal 2 (Bobot 40)</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Nilai Optimum</span>
              </div>
            </div>
            <CardBody>
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
                  <p className="text-gray-700">
                    Melanjutkan Soal 1: tentukan nilai maksimum dan minimum beserta titiknya.
                  </p>
                </div>
                <div className="p-5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Area input soal akan diintegrasikan dengan generator</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Declaration */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardBody>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-5 h-5 text-green-600 rounded border-2 border-gray-300 focus:ring-green-500" />
                <span className="text-gray-800">
                  Saya menyatakan sudah menuliskan semua proses pengerjaan di buku tulis dengan rapi dan lengkap
                </span>
              </label>
            </CardBody>
          </Card>

          {/* Submit */}
          <Button onClick={handleSubmit} fullWidth size="lg">
            Kumpulkan Jawaban
          </Button>
        </div>
      </main>
    </div>
  );
}
