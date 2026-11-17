import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Info,
  Search,
  X,
  Zap,
} from 'lucide-react';
import { SERVICES, SERVICE_CATEGORIES } from '../data/balongbendoData';
import type { ServiceCategory, ServiceItem, TabId } from '../types';

interface HomeServicesTabProps {
  onStartApplication: (serviceId: string) => void;
  onNavigateTab: (tab: TabId) => void;
}

const FLOW_STEPS = [
  { num: '01', title: 'Cek Syarat', desc: 'Pilih layanan & pastikan dokumen desa lengkap' },
  { num: '02', title: 'Daftar Online & Dapat Tiket', desc: 'Isi formulir & simpan kode antrean loket' },
  { num: '03', title: 'Verifikasi & TTD Camat', desc: 'Berkas diperiksa petugas & disahkan Camat' },
  { num: '04', title: 'Ambil Dokumen', desc: 'Dokumen siap diambil di loket tanpa biaya' },
];

export const HomeServicesTab: React.FC<HomeServicesTabProps> = ({
  onStartApplication,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ServiceCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalService, setModalService] = useState<ServiceItem | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SERVICES.filter((svc) => {
      const matchCategory =
        selectedCategory === 'Semua' || svc.category === selectedCategory;
      const matchQuery =
        !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q) ||
        svc.shortDesc.toLowerCase().includes(q) ||
        svc.counterLabel.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="rounded-2xl overflow-hidden bg-[#022C22] border border-emerald-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                Pemerintah Kabupaten Sidoarjo · Provinsi Jawa Timur
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight text-balance">
                Pelayanan Terpadu Kecamatan Balongbendo
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
                “Pelayanan Publik Cepat, Transparan &amp; Tanpa Pungli - Melayani 20 Desa dengan Sepenuh Hati.”
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('ajukan')}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] font-bold text-sm sm:text-base transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>Ajukan Permohonan Sekarang</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('lacak')}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#FBBF24]" />
                  <span>Lacak Berkas</span>
                </button>
              </div>
            </div>

            {/* 4-Step Flow Summary */}
            <div className="pt-6 border-t border-emerald-800/80">
              <div className="text-xs font-semibold text-emerald-200 mb-3">
                Alur Layanan 4 Langkah
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {FLOW_STEPS.map((step) => (
                  <div
                    key={step.num}
                    className="rounded-xl bg-emerald-950/70 border border-emerald-800/80 p-3.5"
                  >
                    <div className="font-mono text-xs font-bold text-[#FBBF24] tabular-nums">
                      Langkah {step.num}
                    </div>
                    <div className="font-display text-sm font-bold text-white mt-1">
                      {step.title}
                    </div>
                    <div className="text-xs text-emerald-100/80 mt-1 leading-snug">
                      {step.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-[#065F46]">
            {!heroImgError ? (
              <img
                src="/src/assets/images/kantor_kecamatan_balongbendo_1794888321808.jpg"
                alt="Gedung Kantor Pelayanan Terpadu Kecamatan Balongbendo Kabupaten Sidoarjo"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgError(true)}
                className="w-full h-full object-cover lg:absolute lg:inset-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-emerald-100">
                <Building2 className="w-12 h-12 text-[#FBBF24] mb-3" />
                <div className="font-display font-bold text-lg text-white">
                  Kantor Pelayanan Terpadu
                </div>
                <div className="text-sm text-emerald-100/80 mt-1">
                  Kecamatan Balongbendo · Kab. Sidoarjo
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#022C22]/90 via-[#022C22]/30 to-transparent lg:bg-gradient-to-r lg:from-[#022C22]/75 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-[#022C22]/90 backdrop-blur-sm border border-emerald-700/70 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-[#FBBF24] font-semibold">
                    Zona Integritas Wilayah Bebas Korupsi
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    Seluruh 8 Layanan Kecamatan Gratis (Rp 0)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-xl font-extrabold text-[#FBBF24] tabular-nums">
                    20
                  </div>
                  <div className="text-[11px] text-emerald-100">Desa Terlayani</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog of 8 Main Services */}
      <section aria-labelledby="katalog-layanan-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2
              id="katalog-layanan-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-[#022C22] tracking-tight"
            >
              Katalog 8 Layanan Utama Kecamatan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Periksa persyaratan terlebih dahulu sebelum datang ke loket atau ajukan pendaftaran antrean secara daring.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan (SKU, KTP, Waris, SKTM)..."
              aria-label="Cari layanan kecamatan"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            />
          </div>
        </div>

        {/* Category Filter Segmented Buttons */}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter Kategori Layanan"
        >
          {SERVICE_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#065F46] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-slate-900">
              Layanan tidak ditemukan
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Tidak ada layanan yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="mt-4 min-h-[44px] px-4 py-2 rounded-lg bg-[#065F46] text-white text-sm font-semibold hover:bg-[#022C22] cursor-pointer"
            >
              Tampilkan Semua Layanan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {filteredServices.map((svc) => (
              <article
                key={svc.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-5 hover:border-emerald-700/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{svc.category}</span>
                    <span className="font-mono font-semibold text-[#065F46]">
                      {svc.counterLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#022C22] leading-snug">
                    {svc.name}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {svc.shortDesc}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Biaya Resmi</span>
                      <span className="font-bold text-[#065F46] tabular-nums">
                        Rp 0 (Gratis)
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Estimasi SLA</span>
                      <span
                        className={`font-semibold tabular-nums text-right ${
                          svc.isExpress ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {svc.isExpress ? (
                          <span className="inline-flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            {svc.slaText}
                          </span>
                        ) : (
                          svc.slaText
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalService(svc)}
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Info className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Lihat Syarat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartApplication(svc.id)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Ajukan</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal Rincian Persyaratan */}
      {modalService && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
          onClick={() => setModalService(null)}
        >
          <div
            className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-[#022C22] text-white flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#FBBF24] font-semibold">
                  {modalService.category} · {modalService.counterLabel}
                </div>
                <h3
                  id="modal-service-title"
                  className="font-display text-lg sm:text-xl font-bold mt-1"
                >
                  {modalService.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalService(null)}
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 rounded-xl flex items-center justify-center text-emerald-100 hover:bg-emerald-800 hover:text-white cursor-pointer"
                aria-label="Tutup rincian persyaratan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
                <div>
                  <div className="text-[11px] text-slate-500">Biaya Layanan</div>
                  <div className="text-sm font-bold text-[#065F46] mt-0.5">
                    Rp 0 (Gratis)
                  </div>
                </div>
                <div className="border-x border-slate-200 px-2">
                  <div className="text-[11px] text-slate-500">Estimasi Waktu</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                    {modalService.slaText}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Loket Tujuan</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {modalService.counterLabel}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#065F46]" />
                  <span>Dokumen Persyaratan Wajib</span>
                </h4>
                <ul className="space-y-2.5">
                  {modalService.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#065F46] shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{modalService.legalNote}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalService(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = modalService.id;
                  setModalService(null);
                  onStartApplication(id);
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] text-sm font-bold cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Ajukan Layanan Ini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
