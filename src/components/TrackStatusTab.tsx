import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
  Lock,
  Search,
  UserCheck,
} from 'lucide-react';
import { STAGE_LABELS } from '../data/balongbendoData';
import type { ApplicationStage, ServiceApplication } from '../types';
import {
  formatDateTimeWib,
  isApplicationOverdue,
  maskNik,
  maskWhatsapp,
} from '../utils/helpers';

interface TrackStatusTabProps {
  applications: ServiceApplication[];
  initialSearchCode?: string;
}

const QUICK_SAMPLE_CODES = [
  { code: 'BLB-2026-1042', hint: 'Tahap 3 · TTD Camat' },
  { code: 'BLB-2026-1038', hint: 'Tahap 4 · Selesai' },
  { code: 'BLB-2026-1051', hint: 'Tahap 2 · Verifikasi' },
  { code: 'BLB-2026-1070', hint: 'Tahap 1 · Diterima' },
];

const STAGES: Array<{ stage: ApplicationStage; title: string; desc: string }> = [
  { stage: 1, title: 'Berkas Diterima', desc: 'Registrasi masuk ke sistem antrean kecamatan' },
  { stage: 2, title: 'Verifikasi Petugas', desc: 'Pemeriksaan kelengkapan & keabsahan berkas desa' },
  { stage: 3, title: 'Proses TTD Camat', desc: 'Penandatanganan & pengesahan pejabat berwenang' },
  { stage: 4, title: 'Selesai / Siap Diambil', desc: 'Dokumen siap diambil di loket tanpa biaya' },
];

export const TrackStatusTab: React.FC<TrackStatusTabProps> = ({
  applications,
  initialSearchCode,
}) => {
  const [query, setQuery] = useState<string>(initialSearchCode || 'BLB-2026-1042');
  const [activeCode, setActiveCode] = useState<string>(initialSearchCode || 'BLB-2026-1042');

  useEffect(() => {
    if (initialSearchCode) {
      setQuery(initialSearchCode);
      setActiveCode(initialSearchCode);
    }
  }, [initialSearchCode]);

  const foundApp = applications.find(
    (app) => app.registrationCode.toLowerCase() === activeCode.trim().toLowerCase()
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCode(query.trim());
  };

  const handleQuickTest = (code: string) => {
    setQuery(code);
    setActiveCode(code);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#022C22] tracking-tight">
            Cek Status &amp; Lacak Berkas Permohonan
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Masukkan kode registrasi yang tertera pada tiket bukti antrean Anda (contoh: <span className="font-mono font-semibold text-slate-800">BLB-2026-1042</span>).
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masukkan Kode Registrasi (mis. BLB-2026-1042)"
              aria-label="Kode Registrasi Berkas"
              className="w-full min-h-[48px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm uppercase text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] font-bold text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            Lacak Berkas
          </button>
        </form>

        {/* Quick Test Codes */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-600 mb-2.5">
            Contoh Kode Uji Cepat:
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SAMPLE_CODES.map((sample) => {
              const isSelected =
                activeCode.trim().toUpperCase() === sample.code.toUpperCase();
              return (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => handleQuickTest(sample.code)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#065F46] border-[#065F46] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono font-bold tabular-nums">{sample.code}</span>
                  <span className={isSelected ? 'text-emerald-100' : 'text-slate-500'}>
                    ({sample.hint})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Result View */}
      {!foundApp ? (
        <section className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <FileSearch className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-display text-lg font-bold text-slate-900">
            Kode Registrasi Tidak Ditemukan
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Tidak ada berkas dengan kode <span className="font-mono font-semibold">{activeCode || '-'}</span>. Periksa kembali penulisan kode atau klik salah satu Contoh Kode Uji Cepat di atas.
          </p>
        </section>
      ) : (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Header Result */}
          <div className="bg-[#022C22] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <span className="font-mono font-bold text-[#FBBF24] tabular-nums">
                  {foundApp.registrationCode}
                </span>
                <span aria-hidden="true">·</span>
                <span>Antrean {foundApp.queueNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{foundApp.counterLabel}</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mt-1">
                {foundApp.serviceName}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isApplicationOverdue(foundApp) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Melewati Estimasi SLA</span>
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                  foundApp.stage === 4
                    ? 'bg-[#FBBF24] text-[#022C22]'
                    : 'bg-emerald-800 text-white border border-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{STAGE_LABELS[foundApp.stage]}</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* UU PDP Masked Applicant Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600 pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#065F46]" />
                  <span>Identitas Pemohon</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[#065F46] font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Disensor sesuai UU PDP</span>
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Nama Pemohon</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {foundApp.applicantName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Desa Asal</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    Desa {foundApp.village}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">NIK (Disamarkan)</dt>
                  <dd className="font-mono font-semibold text-slate-800 tabular-nums mt-0.5">
                    {maskNik(foundApp.nik)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">WhatsApp (Disamarkan)</dt>
                  <dd className="font-mono font-semibold text-slate-800 tabular-nums mt-0.5">
                    {maskWhatsapp(foundApp.whatsapp)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 4-Stage Progress Stepper */}
            <div>
              <h4 className="font-display text-base font-bold text-[#022C22] mb-5">
                Progres Pemrosesan Berkas (4 Tahap)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {STAGES.map((step) => {
                  const completed = foundApp.stage >= step.stage;
                  const isCurrent = foundApp.stage === step.stage;
                  const historyItem = foundApp.stageHistory.find(
                    (h) => h.stage === step.stage
                  );

                  return (
                    <div
                      key={step.stage}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#065F46] bg-emerald-50/70'
                          : completed
                            ? 'border-emerald-200 bg-white'
                            : 'border-slate-200 bg-slate-50/60 opacity-75'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center tabular-nums ${
                              completed
                                ? 'bg-[#065F46] text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {step.stage}
                          </span>
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#065F46]" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="font-display text-sm font-bold text-slate-900">
                          {step.title}
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">
                          {step.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 text-[11px] font-mono tabular-nums">
                        {historyItem ? (
                          <div className="text-[#065F46] font-semibold">
                            {formatDateTimeWib(historyItem.timestamp)}
                          </div>
                        ) : (
                          <div className="text-slate-400">Menunggu tahap sebelumnya</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Officer Note */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Catatan Resmi Petugas Kecamatan
                </div>
                <div className="text-xs font-mono text-amber-900 tabular-nums">
                  Target SLA: {foundApp.slaText} ({formatDateTimeWib(foundApp.slaDeadlineAt)})
                </div>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                “{foundApp.officialNote}”
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
