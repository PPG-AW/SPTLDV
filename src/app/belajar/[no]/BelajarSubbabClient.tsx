'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { ArrowLeft, BookOpen, Lightbulb, Settings, PenTool, HelpCircle, CheckCircle, XCircle, Star, Sparkles, Zap, Menu, X, Volume2, VolumeX, Trophy, Rocket } from 'lucide-react';
import SoalRunner from './SoalRunner';
import { SimulasiMap } from './Simulations';
import { initAudio, playSuccess, playError, playHint, playLevelUp, playTabSwitch } from '@/lib/sounds';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [prevBenar, setPrevBenar] = useState(0);

  useEffect(() => {
    initAudio();
  }, []);

  useEffect(() => {
    fetch('/api/progres')
      .then(res => res.json())
      .then(data => {
        const b = data[subbabNo]?.benar || 0;
        setBenar(b);
        setPrevBenar(b);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subbabNo]);

  // Detect when level up
  useEffect(() => {
    if (benar === 3 && prevBenar < 3 && soundOn) {
      playLevelUp();
      setTimeout(() => setShowLevelUpModal(true), 500);
    }
    setPrevBenar(benar);
  }, [benar]);

  const tabs: Array<{ id: Tab; label: string; icon: any; color: string }> = [
    { id: 'materi', label: 'Materi', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { id: 'contoh', label: 'Contoh', icon: Lightbulb, color: 'from-amber-400 to-orange-500' },
    { id: 'simulasi', label: 'Simulasi', icon: Settings, color: 'from-cyan-500 to-blue-500' },
    { id: 'asesmen', label: 'Asesmen', icon: PenTool, color: 'from-emerald-500 to-teal-500' },
  ];

  const gradientBySubbab = [
    'from-blue-500 to-blue-600',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-[#3A86EF] to-[#4EA8DE]',
    'from-indigo-500 to-blue-500',
    'from-blue-600 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-orange-500 to-red-500',
    'from-purple-500 to-indigo-500',
  ];

  const renderMateri = () => {
    return (
      <div className="space-y-5">
        {materi.split('\n').map((line, i) => {
          if (line.startsWith('## ')) {
            return (
              <div key={i} className="relative pl-5">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradientBySubbab[subbabNo - 1]} rounded-full`}></div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">{line.replace('## ', '')}</h2>
              </div>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <div key={i} className="flex items-center gap-3 mt-8 mb-2">
                <div className={`w-2 h-8 bg-gradient-to-b ${gradientBySubbab[subbabNo - 1]} rounded-full`}></div>
                <h3 className="text-xl font-bold text-gray-900">{line.replace('### ', '')}</h3>
              </div>
            );
          }
          if (line.startsWith('- **')) {
            const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
            if (match) {
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border-2 border-gray-100">
                  <div className={`w-3 h-3 bg-gradient-to-br ${gradientBySubbab[subbabNo - 1]} rounded-full mt-1.5 flex-shrink-0`}></div>
                  <div>
                    <span className="font-bold text-gray-900">{match[1]}</span>
                    {match[2] && <span className="text-gray-700">: {match[2]}</span>}
                  </div>
                </div>
              );
            }
          }
          if (line.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-3 ml-1">
                <div className={`w-2 h-2 bg-[#3A86EF] rounded-full mt-2.5 flex-shrink-0`}></div>
                <span className="text-gray-700 text-lg leading-relaxed">{line.replace('- ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('✏️')) {
            return (
              <div key={i} className="my-5 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-[#FFD166] rounded-r-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFD166] to-[#FB923C] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 mb-1">Catat di Buku Tulismu!</p>
                    <p className="text-gray-800 leading-relaxed">{line.replace('✏️ ', '')}</p>
                  </div>
                </div>
              </div>
            );
          }
          if (line.trim() === '') return <div key={i} className="h-2" />;
          return <p key={i} className="text-gray-700 mb-3 leading-relaxed text-lg">{line}</p>;
        })}
      </div>
    );
  };

  const SimulasiComponent = SimulasiMap[subbabNo];

  return (
    <div className="min-h-screen bg-mesh">
      {/* Floating decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#3A86EF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#4EA8DE] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-strong sidebar-slide
        lg:relative lg:z-auto lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-72'}
      `}>
        <div className="h-full overflow-y-auto bg-grid">
          {/* Sidebar Header */}
          <div className="p-5 border-b-2 border-gray-100 bg-gradient-to-br from-blue-50 to-white sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <Link href="/belajar" className="flex items-center gap-2">
                <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center shadow-medium">
                  <span className="text-white font-black text-lg">L</span>
                </div>
                <span className="text-xl font-black text-gradient-blue">LINIERKu</span>
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="gradient-blue rounded-xl p-4 text-white">
              <p className="font-bold text-lg mb-1">{siswaNama}</p>
              <p className="text-blue-100 text-sm mb-3">Subbab {subbabNo}: {judul}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                <span className="text-xs font-bold">Progres:</span>
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${i <= benar ? 'bg-[#FFD166]' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold">{benar}/3</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigasi Cepat</p>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  setSidebarOpen(false);
                  if (soundOn) playTabSwitch();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-soft`
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            ))}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link 
                href="/belajar"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft size={18} />
                <span className="font-semibold text-sm">Kembali ke Dashboard</span>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu size={24} className="text-gray-900" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 bg-gradient-to-r ${gradientBySubbab[subbabNo - 1]} text-white text-xs font-black rounded-full`}>
                    SUBBAB {subbabNo}
                  </span>
                </div>
                <h1 className="text-sm font-bold text-gray-900 truncate">{judul}</h1>
              </div>

              {/* Progress Stars */}
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      i <= benar 
                        ? 'bg-gradient-to-br from-[#FFD166] to-[#FB923C] text-white shadow-glow-yellow' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {i <= benar ? <CheckCircle size={16} /> : <Star size={14} />}
                  </div>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundOn(!soundOn);
                  if (!soundOn) playTabSwitch();
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title={soundOn ? 'Matikan suara' : 'Nyalakan suara'}
              >
                {soundOn ? (
                  <Volume2 size={20} className="text-[#3A86EF]" />
                ) : (
                  <VolumeX size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-[69px] z-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto no-scrollbar -mb-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { 
                    setActiveTab(tab.id);
                    if (soundOn) playTabSwitch();
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-4 transition-all ${
                    activeTab === tab.id
                      ? `border-[#3A86EF] text-[#3A86EF]`
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
        <main className="max-w-6xl mx-auto px-4 py-6">
          {activeTab === 'materi' && (
            <Card className="p-6 md:p-8 shadow-medium animate-slide-up">
              {renderMateri()}
            </Card>
          )}

          {activeTab === 'contoh' && (
            <div className="space-y-4 animate-slide-up">
              <Card gradient="blue" className="p-5">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-white" />
                  <p className="text-white text-lg font-bold">
                    Pelajari contoh soal untuk memahami materi Subbab {subbabNo}.
                  </p>
                </div>
              </Card>

              {[1, 2].map(num => (
                <Card key={num} hoverable className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${gradientBySubbab[subbabNo - 1]} p-5`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-2xl font-black text-white">{num}</span>
                      </div>
                      <h3 className="text-xl font-black text-white">Contoh Soal {num}</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-5 bg-blue-50/50 border-2 border-blue-200 rounded-xl">
                      <p className="font-bold text-[#3A86EF] mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD166]" />
                        Soal:
                      </p>
                      <p className="text-gray-700 text-lg">
                        Contoh soal untuk Subbab {subbabNo} akan ditampilkan setelah generator soal terintegrasi penuh.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                      <p className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Pembahasan:
                      </p>
                      <p className="text-gray-700">Langkah-langkah penyelesaian akan ditampilkan di sini.</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'simulasi' && (
            <div className="space-y-4 animate-slide-up">
              <Card gradient="tosca" className="p-5">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-white text-lg font-bold">Simulasi Interaktif</p>
                    <p className="text-white/80 text-sm">Eksplorasi konsep dengan mencoba berbagai nilai!</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-medium">
                {SimulasiComponent ? (
                  <SimulasiComponent />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Simulasi belum tersedia</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'asesmen' && (
            <div className="space-y-4 animate-slide-up">
              <Card gradient="success" className="p-5">
                <div className="flex items-center gap-3">
                  <PenTool className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-white text-lg font-bold">Asesmen Formatif</p>
                    <p className="text-white/80 text-sm">Kumpulkan 3 jawaban benar untuk lulus subbab ini.</p>
                  </div>
                </div>
              </Card>

              <SoalRunner 
                subbabNo={subbabNo} 
                siswaId={siswaId} 
                soundOn={soundOn}
                onBenarChange={setBenar}
              />
              
              {/* Tutor Sebaya Button */}
              <Card className="p-5 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center shadow-medium">
                    <HelpCircle className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 text-lg mb-1">Butuh Bantuan?</h4>
                    <p className="text-gray-700 mb-3">
                      Panggil tutor sebaya untuk menghampirimu secara langsung.
                    </p>
                    <Button variant="secondary" size="sm">
                      Panggil Tutor Sebaya
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Level Up Modal */}
      <Modal isOpen={showLevelUpModal} onClose={() => setShowLevelUpModal(false)} variant="success">
        <ModalHeader variant="success">
          <div className="text-center">
            <Rocket size={64} className="mx-auto mb-3 animate-float" />
            <h2 className="text-3xl font-black mb-1">Selamat!</h2>
            <p className="text-emerald-100 text-lg">Kamu telah lulus subbab ini!</p>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <StarIcon size={48} filled />
                </div>
              ))}
            </div>
            
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <p className="font-bold text-emerald-900 text-lg">
                {subbabNo < 10 ? 'Kamu bisa lanjut ke subbab berikutnya!' : 'Semua subbab telah selesai!'}
              </p>
              <p className="text-emerald-700 mt-2">
                {subbabNo < 10 ? `Subbab ${subbabNo + 1} telah terbuka.` : 'Saatnya mengambil Asesmen Sumatif!'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => {
                  setShowLevelUpModal(false);
                  if (subbabNo < 10) {
                    window.location.href = `/belajar/${subbabNo + 1}`;
                  } else {
                    window.location.href = '/belajar';
                  }
                }}
                variant="success"
                fullWidth
                size="lg"
              >
                {subbabNo < 10 ? `Lanjut ke Subbab ${subbabNo + 1}` : 'Kembali ke Dashboard'}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}

// Helper Star Icon
function StarIcon({ size = 24, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="starFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? "url(#starFill)" : "#E5E7EB"}
        stroke={filled ? "#F4B942" : "#D1D5DB"}
        strokeWidth="1"
      />
    </svg>
  );
}
