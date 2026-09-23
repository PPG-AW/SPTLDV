'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Lightbulb, Settings, PenTool, HelpCircle, CheckCircle, XCircle, Star, Sparkles, Zap, Trophy } from 'lucide-react';
import SoalRunner from './SoalRunner';

interface Props {
  subbabNo: number;
  judul: string;
  materi: string;
  videoUrl: string | null;
  siswaId: number;
  siswaNama: string;
  kelasId: number;
}

type Tab = 'materi' | 'contoh' | 'simulasi' | 'asesmen';

export default function BelajarSubbabClient({ subbabNo, judul, materi, videoUrl, siswaId, siswaNama, kelasId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('materi');
  const [benar, setBenar] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/progres')
      .then(res => res.json())
      .then(data => {
        setBenar(data[subbabNo]?.benar || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subbabNo]);

  const tabs = [
    { id: 'materi' as Tab, label: 'Materi', icon: BookOpen, gradient: 'from-purple-500 to-indigo-500' },
    { id: 'contoh' as Tab, label: 'Contoh Soal', icon: Lightbulb, gradient: 'from-yellow-500 to-orange-500' },
    { id: 'simulasi' as Tab, label: 'Simulasi', icon: Settings, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'asesmen' as Tab, label: 'Asesmen', icon: PenTool, gradient: 'from-green-500 to-emerald-500' },
  ];

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

  const renderMateri = () => {
    return (
      <div className="space-y-6">
        {materi.split('\n').map((line, i) => {
          if (line.startsWith('## ')) {
            return (
              <div key={i} className="relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradients[subbabNo - 1]} rounded-full`}></div>
                <div className="pl-6 py-2">
                  <h2 className="text-3xl font-black text-gray-900">{line.replace('## ', '')}</h2>
                </div>
              </div>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <div key={i} className="flex items-center gap-3 mt-8">
                <div className={`w-2 h-8 bg-gradient-to-b ${gradients[subbabNo - 1]} rounded-full`}></div>
                <h3 className="text-2xl font-bold text-gray-900">{line.replace('### ', '')}</h3>
              </div>
            );
          }
          if (line.startsWith('- **')) {
            const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
            if (match) {
              return (
                <Card key={i} glass className="p-4 ml-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 bg-gradient-to-br ${gradients[subbabNo - 1]} rounded-full mt-1.5 flex-shrink-0`}></div>
                    <div>
                      <span className="font-bold text-gray-900">{match[1]}</span>
                      {match[2] && <span className="text-gray-700">: {match[2]}</span>}
                    </div>
                  </div>
                </Card>
              );
            }
          }
          if (line.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-3 ml-2">
                <div className={`w-2 h-2 bg-gradient-to-br ${gradients[subbabNo - 1]} rounded-full mt-2.5 flex-shrink-0`}></div>
                <span className="text-gray-700 text-lg">{line.replace('- ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('✏️')) {
            return (
              <Card key={i} gradient="orange" className="p-6 my-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white text-lg mb-2">Catat di Buku Tulismu!</p>
                    <p className="text-orange-50 text-lg leading-relaxed">{line.replace('✏️ ', '')}</p>
                  </div>
                </div>
              </Card>
            );
          }
          if (line.trim() === '') {
            return <div key={i} className="h-3" />;
          }
          return <p key={i} className="text-gray-700 mb-4 leading-relaxed text-lg">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-animated opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/belajar" className="p-2 glass rounded-xl hover:scale-105 transition-transform">
              <ArrowLeft size={24} className="text-gray-900" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`px-3 py-1 bg-gradient-to-r ${gradients[subbabNo - 1]} rounded-full`}>
                  <span className="text-xs font-black text-white">SUBBAB {subbabNo}</span>
                </div>
              </div>
              <h1 className="text-xl font-black text-gray-900">{judul}</h1>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                    i <= benar ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i <= benar ? <CheckCircle size={20} /> : i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-2 py-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                    : 'glass text-gray-700 hover:scale-105'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'materi' && (
          <Card glass className="p-8">
            {renderMateri()}
          </Card>
        )}

        {activeTab === 'contoh' && (
          <div className="space-y-6">
            <Card gradient="yellow" className="p-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-white" />
                <p className="text-white text-lg font-semibold">
                  Pelajari contoh soal berikut untuk memahami cara menyelesaikan soal-soal di subbab ini!
                </p>
              </div>
            </Card>

            {[1, 2].map(num => (
              <Card key={num} glass hover className="overflow-hidden">
                <div className={`bg-gradient-to-r ${gradients[subbabNo - 1]} p-6`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{num}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">Contoh Soal {num}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <Card className="p-5 bg-gray-50">
                    <p className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Soal:
                    </p>
                    <p className="text-gray-700 text-lg">
                      Contoh soal untuk Subbab {subbabNo} akan ditampilkan di sini.
                    </p>
                  </Card>

                  <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                    <p className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Pembahasan:
                    </p>
                    <p className="text-gray-700 text-lg">
                      Langkah-langkah penyelesaian akan ditampilkan di sini.
                    </p>
                  </Card>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'simulasi' && (
          <div className="space-y-6">
            <Card gradient="blue" className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-white" />
                <p className="text-white text-lg font-semibold">
                  Eksplorasi konsep melalui simulasi visual yang interaktif!
                </p>
              </div>
            </Card>

            <Card glass className="p-12 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg animate-float">
                <Settings className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Simulasi Interaktif</h3>
              <p className="text-gray-600 mb-6">Fitur simulasi untuk Subbab {subbabNo} akan segera tersedia</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold">
                <Sparkles className="w-5 h-5" />
                Coming Soon
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'asesmen' && (
          <div className="space-y-6">
            <SoalRunner subbabNo={subbabNo} siswaId={siswaId} />
            
            {/* Tutor Sebaya Button */}
            <Card gradient="purple" className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-white text-2xl mb-2">Butuh Bantuan?</h4>
                  <p className="text-purple-100 mb-4 text-lg">
                    Panggil tutor sebaya yang akan menghampirimu secara langsung di kelas!
                  </p>
                  <Button variant="secondary" size="lg">
                    Panggil Tutor Sebaya
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
