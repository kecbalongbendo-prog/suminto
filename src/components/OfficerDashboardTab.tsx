import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  RotateCcw,
  Save,
  Shield,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import {
  SERVICES,
  VILLAGES,
} from '../data/balongbendoData';
import type {
  ApplicationStage,
  ComplaintItem,
  ComplaintStatus,
  OfficerRole,
  ServiceApplication,
} from '../types';
import {
  formatDateTimeWib,
  getOverdueHours,
  isApplicationOverdue,
} from '../utils/helpers';

interface OfficerDashboardTabProps {
  applications: ServiceApplication[];
  complaints: ComplaintItem[];
  onUpdateApplication: (
    id: string,
    nextStage: ApplicationStage,
    officialNote: string,
    actorLabel: string
  ) => void;
  onUpdateComplaint: (
    id: string,
    status: ComplaintStatus,
    officialResponse: string
  ) => void;
  onResetDemoData: () => void;
}

export const OfficerDashboardTab: React.FC<OfficerDashboardTabProps> = ({
  applications,
  complaints,
  onUpdateApplication,
  onUpdateComplaint,
  onResetDemoData,
}) => {
  const [role, setRole] = useState<OfficerRole>('petugas');
  const [villageFilter, setVillageFilter] = useState<string>('Semua');
  const [serviceFilter, setServiceFilter] = useState<string>('Semua');
  const [stageFilter, setStageFilter] = useState<'Semua' | ApplicationStage>('Semua');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string>('');
  const [savedAppToast, setSavedAppToast] = useState<string>('');

  const [editingComplaintId, setEditingComplaintId] = useState<string | null>(null);
  const [draftComplaintStatus, setDraftComplaintStatus] =
    useState<ComplaintStatus>('Ditindaklanjuti');
  const [draftComplaintResponse, setDraftComplaintResponse] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // KPI computations
  const kpis = useMemo(() => {
    const total = applications.length;
    const completed = applications.filter((a) => a.stage === 4).length;
    const processing = total - completed;
    const overdueCount = applications.filter((a) => isApplicationOverdue(a)).length;

    const avgSlaDays =
      total > 0
        ? (
            applications.reduce((sum, a) => sum + Math.max(0.5, a.slaHours / 24), 0) /
            total
          ).toFixed(1)
        : '0.0';

    return {
      total,
      processing,
      completed,
      overdueCount,
      avgSlaDays,
      totalComplaints: complaints.length,
    };
  }, [applications, complaints]);

  // Filtered queue list
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const okVillage = villageFilter === 'Semua' || app.village === villageFilter;
      const okService = serviceFilter === 'Semua' || app.serviceId === serviceFilter;
      const okStage = stageFilter === 'Semua' || app.stage === stageFilter;
      return okVillage && okService && okStage;
    });
  }, [applications, villageFilter, serviceFilter, stageFilter]);

  // Analytics per Village (Top 8 active villages + highlight highest)
  const villageDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      counts.set(app.village, (counts.get(app.village) || 0) + 1);
    }
    const entries = Array.from(counts.entries())
      .map(([village, count]) => ({ village, count }))
      .sort((a, b) => b.count - a.count);
    const maxCount = Math.max(1, ...entries.map((e) => e.count));
    return { entries, maxCount };
  }, [applications]);

  // Analytics per Service Category
  const categoryDistribution = useMemo(() => {
    const categories = [
      'Kependudukan',
      'Perizinan & UMKM',
      'Pertanahan & Waris',
      'Bansos & SKTM',
    ] as const;
    const items = categories.map((cat) => {
      const count = applications.filter((a) => a.category === cat).length;
      return { category: cat, count };
    });
    const maxCount = Math.max(1, ...items.map((i) => i.count));
    return { items, maxCount };
  }, [applications]);

  // Dynamic Smart Insights for Camat
  const smartInsights = useMemo(() => {
    const topVillages = villageDistribution.entries.slice(0, 2);
    const topVillageLabel =
      topVillages.length >= 2
        ? `Desa ${topVillages[0].village} (${topVillages[0].count} berkas) & Desa ${topVillages[1].village} (${topVillages[1].count} berkas)`
        : topVillages[0]
          ? `Desa ${topVillages[0].village} (${topVillages[0].count} berkas)`
          : 'Kemangsen & Seduri';

    const umkmCount = applications.filter(
      (a) => a.category === 'Perizinan & UMKM'
    ).length;
    const umkmPct =
      applications.length > 0
        ? Math.round((umkmCount / applications.length) * 100)
        : 0;

    const waitingTtdCount = applications.filter((a) => a.stage === 3).length;
    const highPriorityLapor = complaints.filter(
      (c) => c.urgency === 'Prioritas Tinggi' && c.status !== 'Selesai'
    ).length;

    return {
      topVillageLabel,
      umkmPct,
      waitingTtdCount,
      highPriorityLapor,
      recommendedVillage: topVillages[0]?.village || 'Kemangsen',
    };
  }, [villageDistribution, applications, complaints]);

  const startEditNote = (app: ServiceApplication) => {
    setEditingNoteId(app.id);
    setDraftNote(app.officialNote);
  };

  const handleSaveStageAndNote = (app: ServiceApplication, nextStage: ApplicationStage) => {
    const actor =
      role === 'camat' ? 'Camat Balongbendo' : 'Petugas Loket / Verifikator';
    const noteToSave =
      editingNoteId === app.id ? draftNote.trim() || app.officialNote : app.officialNote;
    onUpdateApplication(app.id, nextStage, noteToSave, actor);
    setEditingNoteId(null);
    setSavedAppToast(app.registrationCode);
    setTimeout(() => setSavedAppToast(''), 2500);
  };

  const openComplaintEditor = (item: ComplaintItem) => {
    setEditingComplaintId(item.id);
    setDraftComplaintStatus(item.status);
    setDraftComplaintResponse(item.officialResponse);
  };

  const handleSaveComplaint = (id: string) => {
    onUpdateComplaint(
      id,
      draftComplaintStatus,
      draftComplaintResponse.trim() || 'Sedang ditindaklanjuti oleh tim Kecamatan.'
    );
    setEditingComplaintId(null);
  };

  return (
    <div className="space-y-8">
      {/* Role Switcher & Workspace Header */}
      <section className="bg-[#022C22] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="text-xs font-semibold text-[#FBBF24]">
            Mode Simulasi Internal Instansi
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold mt-1">
            {role === 'camat'
              ? 'Dashboard Eksekutif & Persetujuan Camat Balongbendo'
              : 'Panel Operasional Petugas Loket & Verifikator'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/85 mt-1">
            Setiap perubahan tahap berkas, catatan petugas, dan tanggapan LAPOR! langsung tersinkronisasi ke halaman warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            className="inline-flex p-1 rounded-xl bg-emerald-950 border border-emerald-800"
            role="group"
            aria-label="Pilih Peran Simulasi"
          >
            <button
              type="button"
              onClick={() => setRole('petugas')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                role === 'petugas'
                  ? 'bg-[#FBBF24] text-[#022C22] font-bold'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>Petugas Loket / Verifikator</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('camat')}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                role === 'camat'
                  ? 'bg-[#FBBF24] text-[#022C22] font-bold'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Camat / Pimpinan</span>
            </button>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[40px] px-3 py-2 rounded-lg border border-emerald-700 text-emerald-100 hover:bg-emerald-900 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              title="Kembalikan data contoh awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs">
              <span>Reset ke data awal?</span>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                }}
                className="px-2 py-1 rounded bg-[#FBBF24] text-[#022C22] font-bold cursor-pointer"
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded bg-emerald-800 text-white cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </section>

      {/* KPI Summary Strip */}
      <section aria-label="Ringkasan KPI Pelayanan" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Total Permohonan</div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#022C22] tabular-nums mt-1">
            {kpis.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">Berkas terdaftar</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Sedang Diproses</div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums mt-1">
            {kpis.processing}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {kpis.overdueCount > 0 ? (
              <span className="text-red-600 font-semibold">
                {kpis.overdueCount} berkas SLA Alert
              </span>
            ) : (
              'Semua sesuai target SLA'
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Selesai / Siap Diambil</div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#065F46] tabular-nums mt-1">
            {kpis.completed}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sudah disahkan Camat</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Rata-rata SLA</div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
            {kpis.avgSlaDays}{' '}
            <span className="text-sm font-semibold text-slate-600">Hari</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Target rata-rata layanan</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500">Pengaduan LAPOR!</div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#022C22] tabular-nums mt-1">
            {kpis.totalComplaints}
          </div>
          <div className="text-xs text-slate-500 mt-1">Aspirasi warga tercatat</div>
        </div>
      </section>

      {/* Camat Executive Analytics & Smart Insights (Top placement when role === 'camat') */}
      <section
        className={`space-y-6 ${role === 'camat' ? 'order-first' : ''}`}
        aria-labelledby="analytics-camat-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Village Distribution */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="analytics-camat-heading"
                  className="font-display text-lg font-bold text-[#022C22] flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5 text-[#065F46]" />
                  <span>Distribusi Permohonan per Desa</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pemetaan volume permohonan di wilayah Kecamatan Balongbendo (menyoroti desa dengan volume tertinggi).
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#065F46] tabular-nums">
                {villageDistribution.entries.length} Desa Aktif
              </span>
            </div>

            <div className="space-y-3">
              {villageDistribution.entries.map((item, idx) => {
                const widthPct = Math.max(
                  10,
                  Math.round((item.count / villageDistribution.maxCount) * 100)
                );
                const isTop = idx < 2;
                return (
                  <div key={item.village} className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-800">
                        Desa {item.village}
                        {isTop && (
                          <span className="ml-2 text-[11px] font-bold text-amber-700">
                            · Volume Tinggi
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {item.count} berkas
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isTop ? 'bg-[#065F46]' : 'bg-emerald-600/65'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Category Distribution + Smart Insight Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-[#022C22] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#065F46]" />
                <span>Distribusi Kategori Layanan</span>
              </h3>

              <div className="space-y-3">
                {categoryDistribution.items.map((item) => {
                  const pct =
                    applications.length > 0
                      ? Math.round((item.count / applications.length) * 100)
                      : 0;
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-slate-800">
                          {item.category}
                        </span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FBBF24] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(
                              6,
                              Math.round(
                                (item.count / categoryDistribution.maxCount) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Insight & Rekomendasi Operasional Otomatis */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-display text-base font-bold">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Smart Insight &amp; Rekomendasi Operasional</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-amber-950/90 leading-relaxed">
                <li>
                  <strong>Analisis Jam Sibuk Loket:</strong> Puncak kunjungan warga terjadi pada pukul{' '}
                  <span className="font-mono font-bold">08.30–10.30 WIB</span>. Disarankan mengaktifkan 2 petugas paralel di Loket 1 pada rentang waktu tersebut.
                </li>
                <li>
                  <strong>Tren UMKM &amp; Perizinan ({smartInsights.umkmPct}%):</strong> Permohonan SKU dan NIB/OSS Jalur Express meningkat signifikan dari pelaku usaha mikro; siapkan stok formulir cepat di Loket 2.
                </li>
                <li>
                  <strong>Rekomendasi Jemput Bola ke Desa:</strong> Volume tertinggi berasal dari{' '}
                  <strong>{smartInsights.topVillageLabel}</strong>. Usulan jadwal layanan keliling ke Balai Desa{' '}
                  <strong>{smartInsights.recommendedVillage}</strong> pada hari Rabu pukul 09.00–12.00 WIB.
                </li>
                <li>
                  <strong>Agenda Pimpinan:</strong> Terdapat{' '}
                  <strong className="tabular-nums">{smartInsights.waitingTtdCount} berkas</strong> menunggu TTD Camat dan{' '}
                  <strong className="tabular-nums">{smartInsights.highPriorityLapor} aduan</strong> berstatus Prioritas Tinggi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Queue & Application Management Table */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#022C22] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#065F46]" />
                <span>Manajemen Antrean &amp; Berkas Masuk</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Ubah tahap pemrosesan (1 → 2 → 3 → 4) dan perbarui catatan resmi petugas secara langsung.
              </p>
            </div>

            {savedAppToast && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#065F46]">
                <Check className="w-4 h-4" />
                <span>Status {savedAppToast} diperbarui &amp; tersinkron!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              aria-label="Filter berdasarkan desa"
              className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#065F46]"
            >
              <option value="Semua">Semua Desa (20 Desa)</option>
              {VILLAGES.map((v) => (
                <option key={v} value={v}>
                  Desa {v}
                </option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              aria-label="Filter berdasarkan layanan"
              className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#065F46]"
            >
              <option value="Semua">Semua Jenis Layanan</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(
                  e.target.value === 'Semua'
                    ? 'Semua'
                    : (Number(e.target.value) as ApplicationStage)
                )
              }
              aria-label="Filter berdasarkan tahap"
              className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#065F46]"
            >
              <option value="Semua">Semua Tahap (1–4)</option>
              <option value="1">1. Berkas Diterima</option>
              <option value="2">2. Verifikasi Petugas</option>
              <option value="3">3. Proses TTD Camat</option>
              <option value="4">4. Selesai / Siap Diambil</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-4 whitespace-nowrap">Kode &amp; Antrean</th>
                <th className="py-3.5 px-4">Pemohon &amp; Desa</th>
                <th className="py-3.5 px-4">Layanan &amp; SLA</th>
                <th className="py-3.5 px-4">Tahap &amp; Aksi Cepat</th>
                <th className="py-3.5 px-4 min-w-[260px]">Catatan Petugas (Real-Time)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Tidak ada permohonan yang cocok dengan filter dipilih.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const overdue = isApplicationOverdue(app);
                  const overdueHrs = overdue ? getOverdueHours(app) : 0;
                  const isEditing = editingNoteId === app.id;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#022C22] tabular-nums">
                          {app.registrationCode}
                        </div>
                        <div className="text-xs font-mono text-slate-600 mt-0.5 tabular-nums">
                          Antrean {app.queueNumber} · {app.counterLabel}
                        </div>
                        {overdue && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>SLA Alert (+{overdueHrs}j)</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {app.applicantName}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Desa {app.village}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-1 tabular-nums">
                          Masuk: {formatDateTimeWib(app.createdAt)}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 max-w-xs">
                          {app.serviceName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          SLA: {app.slaText}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <select
                            value={app.stage}
                            onChange={(e) =>
                              handleSaveStageAndNote(
                                app,
                                Number(e.target.value) as ApplicationStage
                              )
                            }
                            aria-label={`Ubah tahap untuk ${app.registrationCode}`}
                            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none focus:border-[#065F46] cursor-pointer ${
                              app.stage === 4
                                ? 'bg-emerald-50 border-emerald-300 text-[#065F46]'
                                : app.stage === 3
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          >
                            <option value={1}>1. Berkas Diterima</option>
                            <option value={2}>2. Verifikasi Petugas</option>
                            <option value={3}>3. Proses TTD Camat</option>
                            <option value={4}>4. Selesai / Siap Diambil</option>
                          </select>

                          {app.stage < 4 && (
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveStageAndNote(
                                    app,
                                    (app.stage + 1) as ApplicationStage
                                  )
                                }
                                className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#065F46] hover:bg-[#022C22] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" />
                                <span>
                                  {app.stage === 3 && role === 'camat'
                                    ? 'Sahkan & TTD Camat'
                                    : `Lanjut Tahap ${app.stage + 1}`}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={draftNote}
                              onChange={(e) => setDraftNote(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#065F46]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveStageAndNote(app, app.stage)}
                                className="px-2.5 py-1 rounded bg-[#065F46] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>Simpan</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {app.officialNote}
                            </p>
                            <button
                              type="button"
                              onClick={() => startEditNote(app)}
                              className="text-xs font-semibold text-[#065F46] hover:underline cursor-pointer"
                            >
                              Ubah Catatan Petugas
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Panel Manajemen LAPOR! */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#022C22]">
            Panel Tindak Lanjut Pengaduan Warga (LAPOR!)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Perbarui status penanganan dan tulis tanggapan resmi yang tampil di papan transparansi warga.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {complaints.map((item) => {
            const isEditing = editingComplaintId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#022C22] tabular-nums">
                      {item.ticketCode}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-700">
                      Desa {item.village}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{item.category}</span>
                    {item.urgency === 'Prioritas Tinggi' && (
                      <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-bold">
                        Prioritas Tinggi
                      </span>
                    )}
                  </div>
                  <div className="font-display text-base font-bold text-slate-900">
                    {item.title}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">{item.chronology}</p>
                </div>

                <div className="lg:w-[420px] shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Status Penanganan
                        </label>
                        <select
                          value={draftComplaintStatus}
                          onChange={(e) =>
                            setDraftComplaintStatus(e.target.value as ComplaintStatus)
                          }
                          className="w-full min-h-[38px] px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                        >
                          <option value="Diterima Admin">Diterima Admin</option>
                          <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tanggapan Resmi Kecamatan
                        </label>
                        <textarea
                          rows={2}
                          value={draftComplaintResponse}
                          onChange={(e) => setDraftComplaintResponse(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveComplaint(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#065F46] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Tanggapan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingComplaintId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#065F46]">
                          Status: {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => openComplaintEditor(item)}
                          className="text-xs font-semibold text-[#065F46] hover:underline cursor-pointer"
                        >
                          Tindak Lanjuti / Balas
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {item.officialResponse}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
