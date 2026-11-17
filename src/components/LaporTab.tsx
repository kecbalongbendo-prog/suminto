import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { COMPLAINT_CATEGORIES, VILLAGES } from '../data/balongbendoData';
import type {
  ComplaintCategory,
  ComplaintItem,
  ComplaintStatus,
} from '../types';
import {
  detectUrgency,
  formatDateTimeWib,
  generateComplaintCode,
} from '../utils/helpers';

interface LaporTabProps {
  complaints: ComplaintItem[];
  onCreateComplaint: (item: ComplaintItem) => void;
}

export const LaporTab: React.FC<LaporTabProps> = ({
  complaints,
  onCreateComplaint,
}) => {
  const [reporterName, setReporterName] = useState('');
  const [village, setVillage] = useState(VILLAGES[0]);
  const [category, setCategory] = useState<ComplaintCategory>(COMPLAINT_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [chronology, setChronology] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdCode, setCreatedCode] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<'Semua' | ComplaintStatus>('Semua');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | ComplaintCategory>('Semua');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const okStatus = statusFilter === 'Semua' || item.status === statusFilter;
      const okCat = categoryFilter === 'Semua' || item.category === categoryFilter;
      return okStatus && okCat;
    });
  }, [complaints, statusFilter, categoryFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!reporterName.trim() || reporterName.trim().length < 2) {
      errs.reporterName = 'Nama pelapor wajib diisi.';
    }
    if (!title.trim() || title.trim().length < 8) {
      errs.title = 'Judul laporan minimal 8 karakter agar mudah ditindaklanjuti.';
    }
    if (!chronology.trim() || chronology.trim().length < 15) {
      errs.chronology = 'Uraikan kronologi kejadian dan lokasi spesifik minimal 15 karakter.';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nowIso = new Date().toISOString();
    const ticketCode = generateComplaintCode(complaints);
    const urgency = detectUrgency(category, title, chronology);

    const newItem: ComplaintItem = {
      id: `lpr-${Date.now()}`,
      ticketCode,
      reporterName: reporterName.trim(),
      village,
      category,
      title: title.trim(),
      chronology: chronology.trim(),
      status: 'Diterima Admin',
      urgency,
      officialResponse:
        urgency === 'Prioritas Tinggi'
          ? 'Laporan otomatis masuk antrean prioritas tinggi dan diteruskan ke Kasi terkait untuk verifikasi lapangan.'
          : 'Laporan telah diterima admin SIPELMAS Kecamatan Balongbendo dan dijadwalkan untuk peninjauan.',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    onCreateComplaint(newItem);
    setCreatedCode(ticketCode);
    setReporterName('');
    setTitle('');
    setChronology('');
    setErrors({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Complaint Submission Form */}
      <section className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="font-display text-xl font-bold text-[#022C22]">
            LAPOR! Aspirasi &amp; Aduan Warga
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Sampaikan keluhan infrastruktur, PJU padam, saluran air, ketertiban, atau kualitas layanan di 20 desa.
          </p>
        </div>

        {createdCode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#065F46] shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-950">
              <div className="font-bold">Laporan Berhasil Diterbitkan!</div>
              <div className="mt-0.5">
                Nomor tiket aduan Anda:{' '}
                <span className="font-mono font-bold text-[#065F46]">{createdCode}</span>.
                Pantau tanggapan resmi pada papan transparansi di samping.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="lapor-name"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Nama Pelapor <span className="text-red-600">*</span>
            </label>
            <input
              id="lapor-name"
              type="text"
              value={reporterName}
              onChange={(e) => {
                setReporterName(e.target.value);
                if (errors.reporterName) setErrors((p) => ({ ...p, reporterName: '' }));
              }}
              placeholder="Contoh: Agus Setiawan"
              className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.reporterName
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
              }`}
            />
            {errors.reporterName && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.reporterName}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="lapor-village"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Desa Lokasi Kejadian <span className="text-red-600">*</span>
              </label>
              <select
                id="lapor-village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              >
                {VILLAGES.map((v) => (
                  <option key={v} value={v}>
                    Desa {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="lapor-category"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Kategori Aduan <span className="text-red-600">*</span>
              </label>
              <select
                id="lapor-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {(category === 'Penerangan Jalan Umum (PJU)' ||
                category === 'Saluran Air / Lingkungan') && (
                <p className="mt-1.5 text-xs text-amber-800 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Kategori ini otomatis ditandai Prioritas Tinggi.</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="lapor-title"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Judul Laporan <span className="text-red-600">*</span>
            </label>
            <input
              id="lapor-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: '' }));
              }}
              placeholder="Contoh: Lampu PJU padam di jalan poros dusun"
              className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lapor-chronology"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Kronologi &amp; Detail Lokasi <span className="text-red-600">*</span>
            </label>
            <textarea
              id="lapor-chronology"
              rows={4}
              value={chronology}
              onChange={(e) => {
                setChronology(e.target.value);
                if (errors.chronology) setErrors((p) => ({ ...p, chronology: '' }));
              }}
              placeholder="Jelaskan patokan lokasi (RT/RW, dusun, nama jalan) dan kondisi terkini..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.chronology
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
              }`}
            />
            {errors.chronology && (
              <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.chronology}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Laporan Warga</span>
          </button>
        </form>
      </section>

      {/* Right: Papan Transparansi Aspirasi Publik */}
      <section className="lg:col-span-7 space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-[#022C22]">
                Papan Transparansi Aspirasi Publik
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Menampilkan {filteredComplaints.length} dari {complaints.length} laporan warga secara terbuka.
              </p>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'Semua' | ComplaintCategory)
              }
              aria-label="Filter kategori aduan"
              className="min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#065F46]"
            >
              <option value="Semua">Semua Kategori</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status aduan">
            {(['Semua', 'Diterima Admin', 'Ditindaklanjuti', 'Selesai'] as const).map(
              (st) => {
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#065F46] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Complaint Cards List */}
        {filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <MessageSquarePlus className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              Belum ada laporan warga untuk filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-mono font-bold text-[#022C22] tabular-nums">
                      {item.ticketCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Desa {item.village}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.urgency === 'Prioritas Tinggi' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Prioritas Tinggi</span>
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-50 border-emerald-200 text-[#065F46]'
                          : item.status === 'Ditindaklanjuti'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status === 'Selesai' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{item.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {item.chronology}
                  </p>
                  <div className="text-xs text-slate-500 mt-2">
                    Pelapor: <span className="font-medium text-slate-700">{item.reporterName}</span>{' '}
                    · <span className="font-mono tabular-nums">{formatDateTimeWib(item.createdAt)}</span>
                  </div>
                </div>

                {/* Tanggapan Resmi Kecamatan */}
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-1">
                  <div className="text-xs font-bold text-[#065F46]">
                    Tanggapan Resmi Pemerintah Kecamatan Balongbendo
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {item.officialResponse}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
