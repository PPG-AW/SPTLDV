'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Lightbulb, Target, Award } from 'lucide-react';

interface SoalRunnerProps {
  subbabNo: number;
  siswaId: number;
  onAnswerSubmitted?: (correct: boolean) => void;
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

export default function SoalRunner({ subbabNo, siswaId, onAnswerSubmitted }: SoalRunnerProps) {
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

  useEffect(() => {
    loadQuestion();
  }, [subbabNo, attempt]);

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
        
        if (data.pembahasan) {
          setPembahasan(data.pembahasan);
        }

        if (data.correct) {
          setProgress(prev => ({
            benar: prev.benar + 1,
            lulus: prev.benar + 1 >= 3,
          }));
          onAnswerSubmitted?.(true);
        } else {
          onAnswerSubmitted?.(false);
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
      setHintLevel(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Target className="text-white" size={32} />
            </div>
            <p className="text-gray-900 font-bold text-lg">Memuat soal...</p>
            <p className="text-gray-600 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-2">Gagal Memuat Soal</p>
            <p className="text-gray-600 text-sm mb-4">Silakan coba lagi</p>
            <Button onClick={loadQuestion}>
              Coba Lagi
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 shadow-soft">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">Progres Asesmen</span>
                <p className="text-xs text-gray-600">Kumpulkan 3 jawaban benar untuk lulus</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{progress.benar}/3</span>
          </div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all ${
                  i <= progress.benar ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-soft' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          {progress.lulus && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-center gap-3">
                <Award className="text-green-600" size={24} />
                <p className="text-gray-900 font-bold">
                  Selamat! Kamu telah lulus subbab ini.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Question Card */}
      <Card className="shadow-medium">
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {attempt}
              </div>
              Soal
            </h3>
            {!showResult && hintLevel < question.hint.length && (
              <Button variant="ghost" size="sm" onClick={handleHint}>
                <Lightbulb size={16} className="mr-1" />
                Hint {hintLevel + 1}
              </Button>
            )}
          </div>
        </div>
        <CardBody>
          {/* Question Text */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl mb-5">
            <p className="text-gray-900 font-medium leading-relaxed">{question.tampilan}</p>
          </div>

          {/* Hints */}
          {hintLevel > 0 && (
            <div className="mb-5 space-y-3">
              {question.hint.slice(0, hintLevel).map((hint, i) => (
                <div key={i} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-r-xl">
                  <p className="text-gray-900">
                    <span className="font-bold flex items-center gap-2 mb-1">
                      <Lightbulb size={16} className="text-yellow-600" />
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
                          ? 'border-gray-900 bg-gradient-to-r from-gray-50 to-white shadow-soft'
                          : 'border-gray-300 hover:border-gray-500 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOption === i ? 'border-gray-900 bg-gray-900' : 'border-gray-400'
                        }`}>
                          {selectedOption === i && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-900 font-medium">{opsi}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Jawabanmu:
                  </label>
                  <input
                    type="text"
                    value={jawaban}
                    onChange={(e) => setJawaban(e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 focus:shadow-soft transition-all"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              )}

              <Button onClick={handleSubmit} fullWidth loading={submitting} disabled={!jawaban && selectedOption === null} size="lg">
                Periksa Jawaban
              </Button>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-400'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={28} />
                  )}
                  <div className="flex-1">
                    <p className={`font-bold text-lg mb-1 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                      {isCorrect ? 'Benar!' : 'Belum Tepat'}
                    </p>
                    <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect
                        ? 'Jawabanmu benar. Lanjutkan ke soal berikutnya.'
                        : 'Coba perhatikan pembahasan berikut untuk memahami konsepnya.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pembahasan */}
              {!isCorrect && pembahasan.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
                  <p className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb size={20} className="text-blue-600" />
                    Pembahasan:
                  </p>
                  <div className="space-y-2">
                    {pembahasan.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-gray-800 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <Button onClick={handleNextQuestion} fullWidth size="lg">
                {isCorrect ? 'Soal Berikutnya' : 'Coba Lagi'}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
