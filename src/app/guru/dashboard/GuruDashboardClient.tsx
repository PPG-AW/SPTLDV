'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, BarChart3, Bell, AlertTriangle, Award, MessageSquare, ClipboardList, LogOut, Plus, Copy, TrendingUp } from 'lucide-react';

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
    alert(`Kode kelas ${kode} telah disalin!`);
  };

  const tabs = [
    { id: 'kelas' as Tab, label: 'Kelas', icon: Users },
    { id: 'siswa' as Tab, label: 'Siswa', icon: Users },
    { id: 'analitik' as Tab, label: 'Analitik', icon: BarChart3 },
    { id: 'tutor' as Tab, label: 'Tutor', icon: MessageSquare },
    { id: 'stuck' as Tab, label: 'Perlu Perhatian', icon: AlertTriangle },
    { id: 'nilai' as Tab, label: 'Nilai', icon: ClipboardList },
    { id: 'panggilan' as Tab, label: 'Panggilan', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-medium">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
                <p className="text-sm text-gray-600">Selamat datang, {guruNama}</p>
              </div>
            </div>
            <button
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/guru')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 shadow-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto -mb-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap border-b-3 transition-all ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'kelas' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kelola Kelas</h2>
                <p className="text-gray-600 mt-1">Buat dan kelola kelas untuk pembelajaran</p>
              </div>
              <Button onClick={() => setShowCreateKelas(!showCreateKelas)}>
                <Plus size={18} className="mr-2" />
                Buat Kelas
              </Button>
            </div>

            {/* Create Form */}
            {showCreateKelas && (
              <Card className="shadow-medium">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b-2 border-gray-200">
                  <h3 className="font-bold text-gray-900">Buat Kelas Baru</h3>
                </div>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Nama Kelas
                      </label>
                      <input
                        type="text"
                        value={newKelasNama}
                        onChange={(e) => setNewKelasNama(e.target.value)}
                        placeholder="Contoh: XI MIPA 1"
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 focus:shadow-soft transition-all"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={createKelas}>
                        Buat Kelas
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateKelas(false)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Kelas List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kelasList.map(k => (
                <Card key={k.id} hoverable className="shadow-soft">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b-2 border-gray-200">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Kelas</span>
                  </div>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{k.nama}</h3>
                        <p className="text-sm text-gray-600">
                          Kuota elit: {k.kuota_elit ? `${k.kuota_elit} siswa` : 'Default 10%'}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-600 uppercase">Kode Kelas</span>
                          <button
                            onClick={() => copyKode(k.kode)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Salin kode"
                          >
                            <Copy size={16} className="text-gray-700" />
                          </button>
                        </div>
                        <code className="text-2xl font-mono font-bold text-gray-900">{k.kode}</code>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {kelasList.length === 0 && !loading && (
              <Card className="shadow-soft">
                <CardBody>
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-medium">
                      <Users className="text-white" size={40} />
                    </div>
                    <p className="text-gray-900 font-bold text-xl mb-2">Belum Ada Kelas</p>
                    <p className="text-gray-600 mb-6">Buat kelas pertama untuk memulai pembelajaran</p>
                    <Button onClick={() => setShowCreateKelas(true)}>
                      <Plus size={18} className="mr-2" />
                      Buat Kelas Pertama
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {activeTab !== 'kelas' && (
          <Card className="shadow-medium">
            <CardBody>
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-medium">
                  {activeTab === 'siswa' && <Users className="text-white" size={40} />}
                  {activeTab === 'analitik' && <BarChart3 className="text-white" size={40} />}
                  {activeTab === 'tutor' && <MessageSquare className="text-white" size={40} />}
                  {activeTab === 'stuck' && <AlertTriangle className="text-white" size={40} />}
                  {activeTab === 'nilai' && <ClipboardList className="text-white" size={40} />}
                  {activeTab === 'panggilan' && <Bell className="text-white" size={40} />}
                </div>
                <p className="text-gray-900 font-bold text-xl mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </p>
                <p className="text-gray-600">Fitur ini akan segera tersedia</p>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
