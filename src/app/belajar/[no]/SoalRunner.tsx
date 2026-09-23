'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { CheckCircle, XCircle, Lightbulb, Target, Award, Zap, Rocket } from 'lucide-react';
import { playSuccess, playError, playHint, playLevelUp } from '@/lib/sounds';

interface SoalRunnerProps {
  subbabNo: number;
  siswaId: number;
  soundOn?: boolean;
  onBenarChange?: (benar: number) => void;
}

interface Question {
  tampilan: string;
  tipe: 'pilihan' | 'isian' | 'interaktif';
  opsi?: string[];
  hint: string[];
}

interface Progress {
  benar: number;
  lulus: boolean;
}

export default function SoalRunner({ subbabNo, siswaId, soundOn = true, onBenarChange }: SoalRunnerProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<Progress>({ benar: 0, lulus: false });
  const [jawaban, setJawaban] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pembahasan, setPembahasan] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [showLulusModal, setShowLulusModal] = useState(false);
  const [prevBenar, setPrevBenar] = useState(0);

  useEffect(() => {
    loadQuestion();
  }, [subbabNo, attempt]);

  // Play sound when level up
  useEffect(() => {
    if (progress.benar === 3 && prevBenar < 3) {
      if (soundOn) {
        playLevelUp();
        setTimeout(() => setShowLulusModal(true), 400);
      }
    }
    setPrevBenar(progress.benar);
    if (onBenarChange) onBenarChange(progress.benar);
  }, [progress.benar]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/formatif?subbab=${subbabNo}&attempt=${attempt}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!question) return;

    setSubmitting(true);
    try {
      const jawabanValue = question.tipe === 'pilihan' ? String(selectedOption) : jawaban;
      
      const res = await fetch('/api/formatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subbab_no: subbabNo,
          attempt,
          jawaban: jawabanValue,
          hint_terpakai: hintLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCorrect(data.correct);
        setShowResult(true);

        // Play sound
        if (data.correct) {
          if (soundOn) playSuccess();
        } else {
          if (soundOn) playError();
        }
        
        if (data.pembahasan) {
          setPembahasan(data.pembahasan);
        }

        if (data.correct) {
          const newBenar = progress.benar + 1;
          setProgress({
            benar: newBenar,
            lulus: newBenar >= 3,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    setAttempt(prev => prev + 1);
    setShowResult(false);
    setJawaban('');
    setSelectedOption(null);
    setHintLevel(0);
    setPembahasan([]);
  };

  const handleHint = () => {
    if (question && hintLevel < question.hint.length) {
      if (soundOn) playHint();
      setHintLevel(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-medium">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#3A86EF] to-[#4EA8DE] rounded-2xl flex items-center justify-center mb-4 animate-pulse-soft">
            <Target className="text-white" size={32} />
          </div>
          <p className="text-gray-900 font-bold text-lg">Memuat soal...</p>
          <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card className="shadow-medium">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <XCircle className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">Gagal Memuat Soal</p>
          <Button onClick={loadQuestion}>Coba Lagi</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <Card className="shadow-medium overflow-hidden">
        <div className="gradient-blue p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <div>
                <span className="text-sm font-bold text-white/90">Progres Asesmen</span>
                <p className="text-xs text-white/70">Kumpulkan 3 jawaban benar untuk lulus</p>
              </div>
            </div>
            <span className="text-3xl font-black text-white">{progress.benar}/3</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all ${
                  i <= progress.benar ? 'bg-[#FFD166] shadow-glow-yellow' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="shadow-medium overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center font-black text-white">
                {attempt}
              </div>
              <h3 className="font-bold text-gray-900">Soal</h3>
            </div>
            {!showResult && hintLevel < question.hint.length && (
              <Button variant="yellow" size="sm" onClick={handleHint}>
                <Lightbulb size={16} className="mr-1" />
                Hint {hintLevel + 1}
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          {/* Question Text */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#3A86EF]/20 rounded-2xl mb-5">
            <p className="text-gray-900 font-semibold leading-relaxed text-lg">{question.tampilan}</p>
          </div>

          {/* Hints */}
          {hintLevel > 0 && (
            <div className="mb-5 space-y-2">
              {question.hint.slice(0, hintLevel).map((hint, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-[#FFD166] rounded-r-xl">
                  <p className="text-gray-900">
                    <span className="font-bold flex items-center gap-2 mb-1">
                      <Lightbulb size={16} className="text-[#FFD166]" />
                      Hint {i + 1}:
                    </span>
                    <span className="text-gray-800">{hint}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Answer Input */}
          {!showResult && (
            <div className="space-y-4">
              {question.tipe === 'pilihan' && question.opsi ? (
                <div className="space-y-2">
                  {question.opsi.map((opsi, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        selectedOption === i
                          ? 'border-[#3A86EF] bg-blue-50 shadow-soft'
                          : 'border-gray-200 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOption === i ? 'border-[#3A86EF] bg-[#3A86EF]' : 'border-gray-300'
                        }`}>
                          {selectedOption === i && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-gray-900 font-medium">{opsi}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Jawabanmu:</label>
                  <input
                    type="text"
                    value={jawaban}
                    onChange={(e) => setJawaban(e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#3A86EF] focus:ring-4 focus:ring-blue-100 transition-all text-lg"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                fullWidth 
                loading={submitting} 
                disabled={!jawaban && selectedOption === null} 
                size="lg"
              >
                Periksa Jawaban
              </Button>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border-2 ${
                isCorrect
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <XCircle className="text-white" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-black text-xl mb-1 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                      {isCorrect ? 'Benar! Hebat!' : 'Belum Tepat'}
                    </p>
                    <p className={`text-sm ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isCorrect
                        ? `Jawabanmu tepat. Lanjutkan ke soal berikutnya!`
                        : 'Perhatikan pembahasan berikut untuk memahami konsepnya.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pembahasan */}
              {!isCorrect && pembahasan.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#3A86EF]/20 rounded-2xl">
                  <p className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap size={20} className="text-[#FFD166]" />
                    Pembahasan:
                  </p>
                  <div className="space-y-2">
                    {pembahasan.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-gradient-to-br from-[#3A86EF] to-[#4EA8DE] text-white rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-gray-800 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleNextQuestion} fullWidth size="lg">
                {isCorrect ? 'Soal Berikutnya' : 'Coba Lagi'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Lulus Subbab Modal */}
      <Modal isOpen={showLulusModal} onClose={() => setShowLulusModal(false)} variant="achievement">
        <ModalHeader variant="achievement">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-3 animate-float">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-1">Luar Biasa!</h2>
            <p className="text-white/90 text-lg">Kamu lulus subbab ini!</p>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-scale-in" style={{ animationDelay: `${i * 0.15}s` }}>
                  <svg width={56} height={56} viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id={`star-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD166" />
                        <stop offset="100%" stopColor="#FB923C" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill={`url(#star-${i})`}
                      stroke="#F4B942"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#FFD166] rounded-xl p-5">
              <p className="font-black text-gray-900 text-lg mb-2">
                {subbabNo < 10 ? 'Subbab Berikutnya Telah Terbuka!' : 'Semua Subbab Telah Selesai!'}
              </p>
              <p className="text-gray-700">
                {subbabNo < 10 
                  ? `Lanjutkan ke Subbab ${subbabNo + 1} untuk terus belajar.`
                  : 'Saatnya mengambil Asesmen Sumatif!'}
              </p>
            </div>

            <Button
              onClick={() => {
                setShowLulusModal(false);
                if (subbabNo < 10) {
                  window.location.href = `/belajar/${subbabNo + 1}`;
                } else {
                  window.location.href = '/sumatif';
                }
              }}
              variant="yellow"
              fullWidth
              size="lg"
            >
              {subbabNo < 10 ? `Lanjut ke Subbab ${subbabNo + 1}` : 'Ambil Asesmen Sumatif'}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
