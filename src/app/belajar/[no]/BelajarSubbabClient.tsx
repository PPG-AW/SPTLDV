'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Video, Lightbulb, BarChart, PenTool } from 'lucide-react';

interface Props {
  subbabNo: number;
  judul: string;
  materi: string;
  videoUrl: string | null;
  siswaId: number;
  siswaNama: string;
  kelasId: number;
}

type Tab = 'materi' | 'video' | 'contoh' | 'simulasi' | 'asesmen';

export default function BelajarSubbabClient({ subbabNo, judul, materi, videoUrl, siswaId, siswaNama, kelasId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('materi');
  const [benar, setBenar] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current progress
    fetch('/api/progres')
      .then(res => res.json())
      .then(data => {
        setBenar(data[subbabNo]?.benar || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subbabNo]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'materi', label: 'Materi', icon: BookOpen },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'contoh', label: 'Contoh Soal', icon: Lightbulb },
    { id: 'simulasi', label: 'Simulasi', icon: BarChart },
    { id: 'asesmen', label: 'Asesmen', icon: PenTool },
  ];

  const isVideoPlaceholder = !videoUrl || videoUrl.includes('VIDEO_ID');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/belajar" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Subbab {subbabNo}</p>
              <h1 className="text-sm font-semibold text-gray-800">{judul}</h1>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i <= benar ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  ✓
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            📒 Tulis semua coretan/langkah pengerjaanmu di buku tulis!
          </p>
        </div>

        {activeTab === 'materi' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="prose prose-sm max-w-none">
              {materi.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-gray-800 mb-3">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-gray-700 mb-2 mt-4">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- **')) {
                  const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                  if (match) {
                    return (
                      <li key={i} className="ml-4 mb-1">
                        <strong>{match[1]}</strong>: {match[2]}
                      </li>
                    );
                  }
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('✏️')) {
                  return (
                    <div key={i} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3 rounded">
                      <p className="text-sm text-yellow-800">{line}</p>
                    </div>
                  );
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                return <p key={i} className="text-gray-700 mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {isVideoPlaceholder ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-gray-600">Video menyusul — silakan pelajari materi dan contoh soal dulu.</p>
              </div>
            ) : (
              <div className="aspect-video">
                <iframe
                  src={videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'contoh' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Contoh Soal Subbab {subbabNo}</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="font-medium text-gray-800 mb-2">Contoh 1</p>
                <p className="text-gray-600 text-sm">Contoh soal akan ditampilkan di sini setelah generator soal aktif.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium text-gray-800 mb-2">Contoh 2</p>
                <p className="text-gray-600 text-sm">Contoh soal akan ditampilkan di sini setelah generator soal aktif.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulasi' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Simulasi Interaktif</h3>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-gray-600">Simulasi interaktif untuk Subbab {subbabNo} akan segera tersedia.</p>
            </div>
          </div>
        )}

        {activeTab === 'asesmen' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Asesmen Formatif</h3>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Kumpulkan <strong>3 jawaban benar</strong> untuk lulus subbab ini.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      i <= benar ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    ✓
                  </div>
                ))}
              </div>
              <button
                onClick={() => alert('Generator soal akan diintegrasikan di sini')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Mulai Asesmen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
