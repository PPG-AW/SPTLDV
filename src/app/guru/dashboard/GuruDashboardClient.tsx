'use client';

import { useState, useEffect } from 'react';
import { Users, BarChart3, Bell, AlertTriangle, Award, MessageSquare, ClipboardList, LogOut, Plus, Copy } from 'lucide-react';

interface Props {
  guruId: number;
  guruNama: string;
}

type Tab = 'kelas' | 'siswa' | 'analitik' | 'tutor' | 'stuck' | 'nilai' | 'panggilan';

interface Kelas {
  id: number;
  nama: string;
  kode: string;
  kuota_elit: number | null;
}

export default function GuruDashboardClient({ guruId, guruNama }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('kelas');
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateKelas, setShowCreateKelas] = useState(false);
  const [newKelasNama, setNewKelasNama] = useState('');

  useEffect(() => {
    loadKelas();
  }, []);

  const loadKelas = async () => {
    try {
      const res = await fetch('/api/guru/kelas');
      if (res.ok) {
        const data = await res.json();
        setKelasList(data);
      }
    } catch {}
    setLoading(false);
  };

  const createKelas = async () => {
    if (!newKelasNama.trim()) return;
    try {
      const res = await fetch('/api/guru/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newKelasNama }),
      });
      if (res.ok) {
        setNewKelasNama('');
        setShowCreateKelas(false);
        loadKelas();
      }
    } catch {}
  };

  const copyKode = (kode: string) => {
    navigator.clipboard.writeText(kode);
    alert(`Kode kelas ${kode} disalin!`);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'kelas', label: 'Kelas', icon: Users },
    { id: 'siswa', label: 'Siswa', icon: Users },
    { id: 'analitik', label: 'Analitik', icon: BarChart3 },
    { id: 'tutor', label: 'Tutor', icon: MessageSquare },
    { id: 'stuck', label: 'Perlu Perhatian', icon: AlertTriangle },
    { id: 'nilai', label: 'Nilai', icon: ClipboardList },
    { id: 'panggilan', label: 'Panggilan', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-indigo-700">LINIERKu — Dashboard Guru</h1>
              <p className="text-sm text-gray-600">Selamat datang, {guruNama}</p>
            </div>
            <button
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/guru')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
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
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'kelas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Kelola Kelas</h2>
              <button
                onClick={() => setShowCreateKelas(!showCreateKelas)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus size={16} />
                Buat Kelas Baru
              </button>
            </div>

            {showCreateKelas && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <input
                  type="text"
                  value={newKelasNama}
                  onChange={(e) => setNewKelasNama(e.target.value)}
                  placeholder="Nama kelas (contoh: XI MIPA 1)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={createKelas}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    Buat
                  </button>
                  <button
                    onClick={() => setShowCreateKelas(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kelasList.map(k => (
                <div key={k.id} className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{k.nama}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">{k.kode}</code>
                    <button
                      onClick={() => copyKode(k.kode)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Salin kode"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Kuota elit: {k.kuota_elit ? `${k.kuota_elit} siswa` : 'Default 10%'}
                  </p>
                </div>
              ))}
            </div>

            {kelasList.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <p>Belum ada kelas. Buat kelas pertama untuk memulai.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'siswa' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Daftar Siswa</h2>
            <p className="text-gray-600">Pilih kelas untuk melihat daftar siswa.</p>
          </div>
        )}

        {activeTab === 'analitik' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Analitik Kesalahan per Subbab</h2>
            <p className="text-gray-600">Statistik kesalahan siswa per subbab akan ditampilkan di sini.</p>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Tutor Sebaya</h2>
            <p className="text-gray-600">Daftar siswa yang menjadi tutor sebaya.</p>
          </div>
        )}

        {activeTab === 'stuck' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Perlu Perhatian</h2>
            <p className="text-gray-600">Siswa yang perlu bantuan tambahan akan ditampilkan di sini.</p>
          </div>
        )}

        {activeTab === 'nilai' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Nilai Sumatif</h2>
            <p className="text-gray-600">Hasil asesmen sumatif siswa (read-only).</p>
          </div>
        )}

        {activeTab === 'panggilan' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Antrean Panggilan</h2>
            <p className="text-gray-600">Panggilan dari siswa yang membutuhkan bantuan guru.</p>
          </div>
        )}
      </main>
    </div>
  );
}
