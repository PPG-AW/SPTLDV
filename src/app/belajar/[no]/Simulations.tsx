'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// ====== SUBBAB 1: PILAH BENTUK - Game Klasifikasi ======
export function SimulasiSubbab1() {
  const bentuk = [
    { teks: '2x + 3y ≤ 12', jenis: 'ptldv' },
    { teks: '3x + 5 = 7', jenis: 'persamaan' },
    { teks: '2x ≤ 8', jenis: 'satu' },
    { teks: 'x² + y ≥ 4', jenis: 'pangkat' },
    { teks: '4x − y > 10', jenis: 'ptldv' },
    { teks: 'x + 2y < 6', jenis: 'ptldv' },
  ];

  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [skor, setSkor] = useState<number | null>(null);

  const pilih = (idx: number, kat: string) => {
    setJawaban({ ...jawaban, [idx]: kat });
  };

  const cek = () => {
    let benar = 0;
    bentuk.forEach((b, i) => {
      if (jawaban[i] === b.jenis) benar++;
    });
    setSkor(benar);
  };

  const reset = () => {
    setJawaban({});
    setSkor(null);
  };

  return (
    <div className="space-y-4">
      <Card gradient="blue" className="p-5">
        <p className="font-bold text-lg">Game: Pilah Bentuk!</p>
        <p className="text-blue-50">Klasifikasikan setiap bentuk ke kategori yang tepat.</p>
      </Card>

      <div className="grid gap-3">
        {bentuk.map((b, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <p className="font-mono text-lg text-gray-900 mb-3">{b.teks}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'ptldv', label: 'PtLDV', color: 'bg-blue-500' },
                { id: 'persamaan', label: 'Persamaan', color: 'bg-purple-500' },
                { id: 'satu', label: '1 Variabel', color: 'bg-orange-500' },
                { id: 'pangkat', label: 'Pangkat 2', color: 'bg-red-500' },
              ].map(kat => (
                <button
                  key={kat.id}
                  onClick={() => pilih(i, kat.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    jawaban[i] === kat.id
                      ? `${kat.color} text-white scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {kat.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {skor === null ? (
        <Button onClick={cek} fullWidth size="lg" variant="yellow">
          Periksa Jawaban
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl ${skor === 6 ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
            <p className="font-bold text-lg">
              Skor: {skor}/6 {skor === 6 ? 'Sempurna!' : ''}
            </p>
          </div>
          <Button onClick={reset} variant="outline" fullWidth>
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}

// ====== SUBBAB 2: SLIDER TITIK POTONG ======
export function SimulasiSubbab2() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(12);

  const potongX = c / a;
  const potongY = c / b;

  return (
    <div className="space-y-4">
      <Card gradient="tosca" className="p-5">
        <p className="font-bold text-lg">Lab Titik Potong</p>
        <p className="text-blue-50">Geser slider untuk melihat bagaimana titik potong berubah.</p>
      </Card>

      {/* Equation Display */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#3A86EF] rounded-xl">
        <p className="text-center font-mono text-2xl text-[#3A86EF] font-bold">
          {a}x + {b}y = {c}
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {[
          { label: 'a', value: a, set: setA, min: 1, max: 9 },
          { label: 'b', value: b, set: setB, min: 1, max: 9 },
          { label: 'c', value: c, set: setC, min: 2, max: 30 },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-900">{s.label} =</span>
              <span className="font-mono font-bold text-[#3A86EF]">{s.value}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={s.value}
              onChange={(e) => s.set(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-[#3A86EF]"
            />
          </div>
        ))}
      </div>

      {/* Titik Potong Result */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl text-center">
          <p className="text-xs font-semibold uppercase opacity-80 mb-1">Potong Sumbu X</p>
          <p className="font-mono text-2xl font-bold">({potongX.toFixed(1)}, 0)</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-[#4EA8DE] to-[#7EC8E3] text-white rounded-xl text-center">
          <p className="text-xs font-semibold uppercase opacity-90 mb-1">Potong Sumbu Y</p>
          <p className="font-mono text-2xl font-bold">(0, {potongY.toFixed(1)})</p>
        </div>
      </div>
    </div>
  );
}

// ====== SUBBAB 3: KANVAS GARIS ======
export function SimulasiSubbab3() {
  const [tanda, setTanda] = useState<'<=' | '<' | '>=' | '>'>  ('<=');
  const [a] = useState(2);
  const [b] = useState(3);
  const [c] = useState(12);

  const isSolid = tanda === '<=' || tanda === '>=';

  return (
    <div className="space-y-4">
      <Card gradient="yellow" className="p-5">
        <p className="font-bold text-lg">Kanvas Garis</p>
        <p className="text-gray-900">Pilih tanda pertidaksamaan untuk melihat jenis garis.</p>
      </Card>

      {/* SVG Canvas */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <svg viewBox="0 0 400 300" className="w-full h-auto">
          {/* Grid */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          
          {/* Axes */}
          <line x1="0" y1="260" x2="400" y2="260" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="0" x2="40" y2="300" stroke="#1E293B" strokeWidth="2" />
          
          {/* Line: 2x + 3y = 12 → (6, 0) → (0, 4) */}
          {/* Map: x: 0-10 → 40-380, y: 0-8 → 260-20 (inverse) */}
          <line 
            x1={40 + (6 * 34)} 
            y1={260 - (0 * 30)} 
            x2={40 + (0 * 34)} 
            y2={260 - (4 * 30)}
            stroke="#3A86EF" 
            strokeWidth="3"
            strokeDasharray={isSolid ? "0" : "10 6"}
          />
          
          {/* Points */}
          <circle cx={40 + (6 * 34)} cy={260} r="6" fill="#3A86EF" />
          <circle cx={40} cy={260 - (4 * 30)} r="6" fill="#3A86EF" />
          
          {/* Labels */}
          <text x={40 + (6 * 34)} y="280" fill="#1E293B" fontSize="14" textAnchor="middle" fontWeight="bold">(6, 0)</text>
          <text x="10" y={260 - (4 * 30) + 5} fill="#1E293B" fontSize="14" fontWeight="bold">(0, 4)</text>
          
          {/* Equation label */}
          <text x="200" y="30" fill="#3A86EF" fontSize="18" textAnchor="middle" fontWeight="bold">
            2x + 3y {tanda === '<=' ? '≤' : tanda === '<' ? '<' : tanda === '>=' ? '≥' : '>'} 12
          </text>
        </svg>
      </div>

      {/* Sign Selection */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { val: '<=', label: '≤ (Tegas)', isSolid: true },
          { val: '<', label: '< (Putus-putus)', isSolid: false },
          { val: '>=', label: '≥ (Tegas)', isSolid: true },
          { val: '>', label: '> (Putus-putus)', isSolid: false },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setTanda(opt.val as any)}
            className={`p-4 rounded-xl border-2 font-semibold transition-all ${
              tanda === opt.val
                ? 'border-[#3A86EF] bg-blue-50 text-[#3A86EF]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-xl ${isSolid ? 'bg-blue-50 border-2 border-blue-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
        <p className="font-semibold text-gray-900">
          {isSolid ? '✓ Garis TEGAS — titik pada garis termasuk penyelesaian' : '✓ Garis PUTUS-PUTUS — titik pada garis TIDAK termasuk'}
        </p>
      </div>
    </div>
  );
}

// ====== SUBBAB 4: UJI TITIK INTERAKTIF ======
export function SimulasiSubbab4() {
  const [testX, setTestX] = useState(0);
  const [testY, setTestY] = useState(0);
  const a = 2, b = 3, c = 12;
  
  const value = a * testX + b * testY;
  const result = value <= c;

  return (
    <div className="space-y-4">
      <Card gradient="success" className="p-5">
        <p className="font-bold text-lg">Uji Titik Sandbox</p>
        <p className="text-white/80">Geser titik uji untuk melihat apakah memenuhi 2x + 3y ≤ 12.</p>
      </Card>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <svg viewBox="0 0 400 300" className="w-full h-auto touch-none">
          {/* Grid */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          
          {/* Shaded region (below line) */}
          <path 
            d={`M 40 260 L ${40 + 6*34} 260 L ${40 + 0*34} ${260 - 4*30} Z`}
            fill={result ? "#10B981" : "#EF4444"}
            opacity="0.2"
          />
          
          {/* Line */}
          <line x1={40 + 6*34} y1={260} x2={40} y2={260 - 4*30} stroke="#3A86EF" strokeWidth="3" />
          
          {/* Axes */}
          <line x1="0" y1="260" x2="400" y2="260" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="0" x2="40" y2="300" stroke="#1E293B" strokeWidth="2" />
          
          {/* Test point */}
          <circle 
            cx={40 + testX * 34} 
            cy={260 - testY * 30} 
            r="12" 
            fill={result ? "#10B981" : "#EF4444"}
            stroke="white"
            strokeWidth="3"
          />
          <text x={40 + testX * 34} y={260 - testY * 30 - 18} fill="#1E293B" fontSize="13" textAnchor="middle" fontWeight="bold">
            ({testX}, {testY})
          </text>
        </svg>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="font-bold">x =</span>
            <span className="font-mono font-bold text-[#3A86EF]">{testX}</span>
          </div>
          <input type="range" min={-1} max={8} value={testX} onChange={(e) => setTestX(parseInt(e.target.value))}
            className="w-full accent-[#3A86EF]" />
        </div>
        <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="font-bold">y =</span>
            <span className="font-mono font-bold text-[#3A86EF]">{testY}</span>
          </div>
          <input type="range" min={-1} max={6} value={testY} onChange={(e) => setTestY(parseInt(e.target.value))}
            className="w-full accent-[#3A86EF]" />
        </div>
      </div>

      {/* Result */}
      <div className={`p-5 rounded-xl border-2 ${result ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
        <p className="font-mono text-lg text-center font-bold mb-2">
          {a}({testX}) + {b}({testY}) = <span className="text-[#3A86EF]">{value}</span>
        </p>
        <p className={`text-center font-bold text-lg ${result ? 'text-emerald-700' : 'text-red-700'}`}>
          {value} ≤ {c} → {result ? '✓ BENAR — titik diarsir' : '✗ SALAH — arsir daerah seberang'}
        </p>
      </div>
    </div>
  );
}

// ====== SUBBAB 5: VISUALISASI SPtLDV ======
export function SimulasiSubbab5() {
  const [showL1, setShowL1] = useState(true);
  const [showL2, setShowL2] = useState(true);
  const [showIrisan, setShowIrisan] = useState(true);

  return (
    <div className="space-y-4">
      <Card gradient="blue" className="p-5">
        <p className="font-bold text-lg">Lab Irisan Sistem PtLDV</p>
        <p className="text-blue-50">Visualisasikan bagaimana dua pertidaksamaan beririsan.</p>
      </Card>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <svg viewBox="0 0 400 300" className="w-full h-auto">
          {/* Grid */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          
          {/* Axes */}
          <line x1="40" y1="260" x2="380" y2="260" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="260" stroke="#1E293B" strokeWidth="2" />
          
          {/* Line 1: x + y = 6 → (6,0) to (0,6) */}
          {showL1 && (
            <>
              <path d={`M ${40 + 6*34} 260 L 40 ${260 - 6*30} L 40 260 Z`} fill="#3A86EF" opacity="0.15" />
              <line x1={40 + 6*34} y1="260" x2="40" y2={260 - 6*30} stroke="#3A86EF" strokeWidth="2.5" />
            </>
          )}
          
          {/* Line 2: 2x + y = 8 → (4,0) to (0,8) */}
          {showL2 && (
            <>
              <path d={`M ${40 + 4*34} 260 L 40 ${260 - 8*30} L 40 260 Z`} fill="#4EA8DE" opacity="0.15" />
              <line x1={40 + 4*34} y1="260" x2="40" y2={260 - 8*30} stroke="#4EA8DE" strokeWidth="2.5" />
            </>
          )}
          
          {/* Intersection region */}
          {showIrisan && (
            <path 
              d={`M 40 260 L ${40 + 4*34} 260 L ${40 + 2*34} ${260 - 4*30} L 40 ${260 - 6*30} Z`}
              fill="#FFD166"
              opacity="0.5"
            />
          )}
          
          {/* Labels */}
          {showL1 && <text x="250" y="80" fill="#3A86EF" fontSize="13" fontWeight="bold">x + y ≤ 6</text>}
          {showL2 && <text x="280" y="180" fill="#4EA8DE" fontSize="13" fontWeight="bold">2x + y ≤ 8</text>}
          {showIrisan && <text x="80" y="220" fill="#FB923C" fontSize="14" fontWeight="bold">DP</text>}
        </svg>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'L1: x+y≤6', state: showL1, set: setShowL1, color: 'blue' },
          { label: 'L2: 2x+y≤8', state: showL2, set: setShowL2, color: 'tosca' },
          { label: 'Irisan (DP)', state: showIrisan, set: setShowIrisan, color: 'yellow' },
        ].map(t => (
          <button
            key={t.label}
            onClick={() => t.set(!t.state)}
            className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              t.state 
                ? t.color === 'blue' ? 'bg-blue-500 text-white border-blue-500'
                : t.color === 'tosca' ? 'bg-[#4EA8DE] text-white border-[#4EA8DE]'
                : 'bg-[#FFD166] text-gray-900 border-[#FFD166]'
                : 'bg-white text-gray-500 border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ====== SUBBAB 6: MENGGAMBAR SPtLDV ======
export function SimulasiSubbab6() {
  const [arsirL1, setArsirL1] = useState<'bawah' | 'atas' | null>(null);
  const [arsirL2, setArsirL2] = useState<'bawah' | 'atas' | null>(null);
  const [dicek, setDicek] = useState(false);

  const benar = arsirL1 === 'bawah' && arsirL2 === 'bawah';

  return (
    <div className="space-y-4">
      <Card gradient="tosca" className="p-5">
        <p className="font-bold text-lg">Lab Irisan: Tentukan Arah Arsiran</p>
        <p className="text-white/90">Sistem: x + y ≤ 6, 2x + y ≤ 8, x ≥ 0, y ≥ 0. Pilih arah arsiran tiap garis!</p>
      </Card>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <svg viewBox="0 0 400 300" className="w-full h-auto">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          <line x1="40" y1="260" x2="380" y2="260" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="260" stroke="#1E293B" strokeWidth="2" />
          
          {/* L1: x+y=6 */}
          <line x1={40 + 6*34} y1="260" x2="40" y2={260 - 6*30} stroke="#3A86EF" strokeWidth="2.5" />
          <text x="250" y="80" fill="#3A86EF" fontSize="13" fontWeight="bold">L1: x+y=6</text>
          
          {/* L2: 2x+y=8 */}
          <line x1={40 + 4*34} y1="260" x2="40" y2={260 - 8*30} stroke="#4EA8DE" strokeWidth="2.5" />
          <text x="260" y="170" fill="#4EA8DE" fontSize="13" fontWeight="bold">L2: 2x+y=8</text>
          
          {/* User's shading */}
          {arsirL1 === 'bawah' && (
            <path d={`M ${40 + 6*34} 260 L 40 ${260 - 6*30} L 40 260 Z`} fill="#3A86EF" opacity="0.2" />
          )}
          {arsirL1 === 'atas' && (
            <path d={`M ${40 + 6*34} 260 L 40 ${260 - 6*30} L 380 ${260 - 6*30} L 380 260 Z`} fill="#3A86EF" opacity="0.15" />
          )}
          {arsirL2 === 'bawah' && (
            <path d={`M ${40 + 4*34} 260 L 40 ${260 - 8*30} L 40 260 Z`} fill="#4EA8DE" opacity="0.2" />
          )}
          {arsirL2 === 'atas' && (
            <path d={`M ${40 + 4*34} 260 L 40 ${260 - 8*30} L 380 ${260 - 8*30} L 380 260 Z`} fill="#4EA8DE" opacity="0.15" />
          )}
          
          {/* Correct intersection */}
          {dicek && benar && (
            <path 
              d={`M 40 260 L ${40 + 4*34} 260 L ${40 + 2*34} ${260 - 4*30} L 40 ${260 - 6*30} Z`}
              fill="#FFD166" opacity="0.5"
            />
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
          <p className="font-bold text-[#3A86EF] mb-2">L1: x + y ≤ 6</p>
          <p className="text-sm text-gray-600 mb-2">Arsir daerah:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setArsirL1('bawah'); setDicek(false); }}
              className={`p-2 rounded-lg text-sm font-semibold ${arsirL1 === 'bawah' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
              Bawah
            </button>
            <button onClick={() => { setArsirL1('atas'); setDicek(false); }}
              className={`p-2 rounded-lg text-sm font-semibold ${arsirL1 === 'atas' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
              Atas
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-cyan-200">
          <p className="font-bold text-[#4EA8DE] mb-2">L2: 2x + y ≤ 8</p>
          <p className="text-sm text-gray-600 mb-2">Arsir daerah:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setArsirL2('bawah'); setDicek(false); }}
              className={`p-2 rounded-lg text-sm font-semibold ${arsirL2 === 'bawah' ? 'bg-[#4EA8DE] text-white' : 'bg-gray-100'}`}>
              Bawah
            </button>
            <button onClick={() => { setArsirL2('atas'); setDicek(false); }}
              className={`p-2 rounded-lg text-sm font-semibold ${arsirL2 === 'atas' ? 'bg-[#4EA8DE] text-white' : 'bg-gray-100'}`}>
              Atas
            </button>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setDicek(true)} 
        variant="yellow" 
        fullWidth 
        size="lg"
        disabled={!arsirL1 || !arsirL2}
      >
        Cek Jawabanku
      </Button>

      {dicek && (
        <div className={`p-4 rounded-xl border-2 ${benar ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
          <p className="font-bold">
            {benar ? '✓ Benar! Kedua arsiran ke bawah (karena (0,0) memenuhi).' : '✗ Belum tepat. Coba uji (0,0) ke pertidaksamaan!'}
          </p>
        </div>
      )}
    </div>
  );
}

// ====== SUBBAB 7: TITIK POJOK INTERAKTIF ======
export function SimulasiSubbab7() {
  const [pojok, setPojok] = useState<{x: number; y: number}[]>([]);
  const [dicek, setDicek] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);
  
  const jawabanBenar = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 2, y: 4 },
    { x: 0, y: 6 },
  ];

  const addPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dicek) return;
    const svg = canvasRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 400;
    const y = (e.clientY - rect.top) / rect.height * 300;
    
    // Convert to math coords
    const mx = Math.round((x - 40) / 34);
    const my = Math.round((260 - y) / 30);
    
    if (mx >= 0 && mx <= 10 && my >= 0 && my <= 8) {
      if (!pojok.some(p => p.x === mx && p.y === my)) {
        setPojok([...pojok, { x: mx, y: my }]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card gradient="blue" className="p-5">
        <p className="font-bold text-lg">Temukan Titik Pojok!</p>
        <p className="text-blue-50">Ketuk pada gambar untuk meletakkan titik pojok yang kamu temukan.</p>
      </Card>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <svg 
          ref={canvasRef}
          viewBox="0 0 400 300" 
          className="w-full h-auto cursor-crosshair touch-none"
          onClick={addPoint}
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#E5E7EB" strokeWidth="0.5" />
          ))}
          <line x1="40" y1="260" x2="380" y2="260" stroke="#1E293B" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="260" stroke="#1E293B" strokeWidth="2" />
          
          {/* Lines */}
          <line x1={40 + 6*34} y1="260" x2="40" y2={260 - 6*30} stroke="#3A86EF" strokeWidth="2.5" />
          <line x1={40 + 4*34} y1="260" x2="40" y2={260 - 8*30} stroke="#4EA8DE" strokeWidth="2.5" />
          
          {/* DP region */}
          <path 
            d={`M 40 260 L ${40 + 4*34} 260 L ${40 + 2*34} ${260 - 4*30} L 40 ${260 - 6*30} Z`}
            fill="#FFD166" opacity="0.25"
          />
          
          {/* User placed points */}
          {pojok.map((p, i) => (
            <g key={i}>
              <circle cx={40 + p.x * 34} cy={260 - p.y * 30} r="8" fill="#FB923C" stroke="white" strokeWidth="2" />
              <text x={40 + p.x * 34 + 12} y={260 - p.y * 30 - 5} fill="#FB923C" fontSize="12" fontWeight="bold">
                ({p.x},{p.y})
              </text>
            </g>
          ))}
          
          {/* Show correct points after check */}
          {dicek && jawabanBenar.map((p, i) => (
            <g key={`correct-${i}`}>
              <circle cx={40 + p.x * 34} cy={260 - p.y * 30} r="10" fill="none" stroke="#10B981" strokeWidth="3" />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
        <span className="font-semibold text-gray-700">Titik diletakkan: {pojok.length}</span>
        <button onClick={() => { setPojok([]); setDicek(false); }} className="text-sm text-[#3A86EF] font-bold">
          Reset
        </button>
      </div>

      <Button onClick={() => setDicek(true)} variant="yellow" fullWidth size="lg" disabled={pojok.length === 0}>
        Periksa Jawaban
      </Button>

      {dicek && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <p className="font-bold mb-2">Titik pojok yang benar:</p>
          <div className="flex flex-wrap gap-2">
            {jawabanBenar.map((p, i) => (
              <span key={i} className="px-3 py-1 bg-white border-2 border-[#3A86EF] rounded-full font-mono font-bold text-[#3A86EF]">
                ({p.x}, {p.y})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====== SUBBAB 8: METODE CAMPURAN STEP-BY-STEP ======
export function SimulasiSubbab8() {
  const [step, setStep] = useState(0);
  const a1 = 2, b1 = 1, c1 = 8;
  const a2 = 1, b2 = 1, c2 = 6;

  const steps = [
    {
      title: 'Persamaan yang Diberikan',
      content: (
        <div className="space-y-2 font-mono text-lg">
          <p>(1) {a1}x + {b1}y = {c1}</p>
          <p>(2) {a2}x + {b2}y = {c2}</p>
        </div>
      ),
    },
    {
      title: 'Eliminasi y: Kurangkan (1) − (2)',
      content: (
        <div className="space-y-1 font-mono">
          <p>({a1}x + {b1}y) − ({a2}x + {b2}y) = {c1} − {c2}</p>
          <div className="h-px bg-gray-300 my-2"></div>
          <p className="font-bold text-[#3A86EF] text-xl">{a1-a2}x = {c1-c2}</p>
          <p className="font-bold text-[#3A86EF] text-xl">x = {(c1-c2)/(a1-a2)}</p>
        </div>
      ),
    },
    {
      title: 'Substitusi ke Persamaan (2)',
      content: (
        <div className="space-y-1 font-mono">
          <p>{a2}({(c1-c2)/(a1-a2)}) + {b2}y = {c2}</p>
          <p>{a2 * (c1-c2)/(a1-a2)} + {b2}y = {c2}</p>
          <p>{b2}y = {c2 - a2 * (c1-c2)/(a1-a2)}</p>
          <p className="font-bold text-[#3A86EF] text-xl">y = {c2 - a2 * (c1-c2)/(a1-a2)}</p>
        </div>
      ),
    },
    {
      title: 'Titik Potong',
      content: (
        <div className="text-center">
          <div className="inline-block px-8 py-4 bg-gradient-to-br from-[#3A86EF] to-[#4EA8DE] text-white rounded-2xl">
            <p className="text-3xl font-mono font-black">
              ({(c1-c2)/(a1-a2)}, {c2 - a2 * (c1-c2)/(a1-a2)})
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card gradient="warm" className="p-5">
        <p className="font-bold text-lg">Metode Campuran — Animasi Langkah</p>
        <p className="text-white/90">Ikuti langkah eliminasi-substitusi secara bertahap.</p>
      </Card>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 h-2 rounded-full transition-all ${
              i === step ? 'bg-[#FB923C]' : i < step ? 'bg-[#FB923C]/50' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-scale-in" key={step}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FB923C] to-[#FFD166] rounded-xl flex items-center justify-center font-bold text-white">
            {step + 1}
          </div>
          <h3 className="font-bold text-xl text-gray-900">{steps[step].title}</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-5">
          {steps[step].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => setStep(Math.max(0, step - 1))} 
          variant="outline" 
          disabled={step === 0}
        >
          ← Sebelumnya
        </Button>
        <Button 
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))} 
          variant="primary"
          disabled={step === steps.length - 1}
        >
          Selanjutnya →
        </Button>
      </div>
    </div>
  );
}

// ====== SUBBAB 9: GARIS SELIDIK ======
export function SimulasiSubbab9() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(4);
  const pojok = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 2, y: 4 },
    { x: 0, y: 6 },
  ];
  
  const nilai = pojok.map(p => ({ ...p, f: m * p.x + n * p.y }));
  const maxF = Math.max(...nilai.map(v => v.f));
  const minF = Math.min(...nilai.map(v => v.f));
  const maxP = nilai.find(v => v.f === maxF)!;
  const minP = nilai.find(v => v.f === minF)!;

  return (
    <div className="space-y-4">
      <Card gradient="success" className="p-5">
        <p className="font-bold text-lg">Garis Selidik Interaktif</p>
        <p className="text-white/90">Ubah fungsi tujuan f(x,y) = mx + ny dan lihat nilai optimum berubah.</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="font-bold">m =</span>
            <span className="font-mono font-bold text-[#3A86EF]">{m}</span>
          </div>
          <input type="range" min={1} max={9} value={m} onChange={(e) => setM(parseInt(e.target.value))}
            className="w-full accent-[#3A86EF]" />
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="font-bold">n =</span>
            <span className="font-mono font-bold text-[#3A86EF]">{n}</span>
          </div>
          <input type="range" min={1} max={9} value={n} onChange={(e) => setN(parseInt(e.target.value))}
            className="w-full accent-[#3A86EF]" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#3A86EF] rounded-xl p-4">
        <p className="text-center font-mono text-xl font-bold text-[#3A86EF]">
          f(x,y) = {m}x + {n}y
        </p>
      </div>

      {/* Table of values */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#3A86EF] to-[#4EA8DE] text-white">
              <th className="px-4 py-3 text-left">Titik Pojok</th>
              <th className="px-4 py-3 text-right">f(x,y)</th>
            </tr>
          </thead>
          <tbody>
            {nilai.map((v, i) => (
              <tr key={i} className={`border-t border-gray-100 ${v.f === maxF ? 'bg-emerald-50' : v.f === minF ? 'bg-amber-50' : ''}`}>
                <td className="px-4 py-3 font-mono font-semibold">
                  ({v.x}, {v.y})
                  {v.f === maxF && <span className="ml-2 text-xs text-emerald-700 font-bold">MAKS</span>}
                  {v.f === minF && <span className="ml-2 text-xs text-amber-700 font-bold">MIN</span>}
                </td>
                <td className={`px-4 py-3 text-right font-mono font-bold ${v.f === maxF ? 'text-emerald-700' : v.f === minF ? 'text-amber-700' : 'text-gray-900'}`}>
                  {m}({v.x}) + {n}({v.y}) = {v.f}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl">
          <p className="text-xs font-bold uppercase opacity-80 mb-1">Maksimum</p>
          <p className="text-2xl font-black">{maxF}</p>
          <p className="text-sm opacity-90">di ({maxP.x}, {maxP.y})</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl">
          <p className="text-xs font-bold uppercase opacity-90 mb-1">Minimum</p>
          <p className="text-2xl font-black">{minF}</p>
          <p className="text-sm opacity-90">di ({minP.x}, {minP.y})</p>
        </div>
      </div>
    </div>
  );
}

// ====== SUBBAB 10: SUSUN MODEL SOAL CERITA ======
export function SimulasiSubbab10() {
  const [step, setStep] = useState(0);
  const soal = {
    barangA: 'roti A',
    barangB: 'roti B',
    batas1: 'Mesin I (maks 6 jam)',
    batas2: 'Mesin II (maks 8 jam)',
    koefA1: 1, koefB1: 1, c1: 6,
    koefA2: 2, koefB2: 1, c2: 8,
  };

  const steps = [
    {
      title: 'Langkah 1: Tetapkan Variabel',
      content: (
        <div className="space-y-2">
          <p>x = banyak {soal.barangA}</p>
          <p>y = banyak {soal.barangB}</p>
        </div>
      ),
    },
    {
      title: 'Langkah 2: Buat Tabel Batasan',
      content: (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 border">Sumber Daya</th>
              <th className="p-2 border">{soal.barangA}</th>
              <th className="p-2 border">{soal.barangB}</th>
              <th className="p-2 border">Maks</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border">Mesin I</td><td className="p-2 border">{soal.koefA1}</td><td className="p-2 border">{soal.koefB1}</td><td className="p-2 border">{soal.c1}</td></tr>
            <tr><td className="p-2 border">Mesin II</td><td className="p-2 border">{soal.koefA2}</td><td className="p-2 border">{soal.koefB2}</td><td className="p-2 border">{soal.c2}</td></tr>
          </tbody>
        </table>
      ),
    },
    {
      title: 'Langkah 3: Tulis Pertidaksamaan',
      content: (
        <div className="space-y-2 font-mono text-lg">
          <p>{soal.koefA1}x + {soal.koefB1}y ≤ {soal.c1}</p>
          <p>{soal.koefA2}x + {soal.koefB2}y ≤ {soal.c2}</p>
          <p className="text-[#3A86EF]">x ≥ 0, y ≥ 0</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card gradient="yellow" className="p-5">
        <p className="font-bold text-lg">Susun Model: Soal Cerita</p>
        <p className="text-gray-900">Sebuah usaha membuat {soal.barangA} dan {soal.barangB}. {soal.batas1}, {soal.batas2}.</p>
      </Card>

      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 h-2 rounded-full ${i === step ? 'bg-[#FB923C]' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-scale-in" key={step}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FB923C] to-[#FFD166] rounded-xl flex items-center justify-center font-bold text-white">
            {step + 1}
          </div>
          <h3 className="font-bold text-lg text-gray-900">{steps[step].title}</h3>
        </div>
        <div className="bg-gray-50 rounded-xl p-5">{steps[step].content}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setStep(Math.max(0, step - 1))} variant="outline" disabled={step === 0}>
          ← Sebelumnya
        </Button>
        <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} variant="primary" disabled={step === steps.length - 1}>
          Selanjutnya →
        </Button>
      </div>
    </div>
  );
}

// Export semua simulasi
export const SimulasiMap: Record<number, React.ComponentType> = {
  1: SimulasiSubbab1,
  2: SimulasiSubbab2,
  3: SimulasiSubbab3,
  4: SimulasiSubbab4,
  5: SimulasiSubbab5,
  6: SimulasiSubbab6,
  7: SimulasiSubbab7,
  8: SimulasiSubbab8,
  9: SimulasiSubbab9,
  10: SimulasiSubbab10,
};
