import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  FilePlus2,
  FileUp,
  Printer,
  SearchCheck,
  Trash2,
} from 'lucide-react';
import { SERVICES, VILLAGES } from '../data/balongbendoData';
import type { ServiceApplication } from '../types';
import {
  formatDateTimeWib,
  generateQueueNumber,
  generateRegistrationCode,
} from '../utils/helpers';
import { QrCodeSvg } from './QrCodeSvg';

interface ApplyServiceTabProps {
  initialServiceId?: string;
  applications: ServiceApplication[];
  onCreateApplication: (app: ServiceApplication) => void;
  onTrackCode: (registrationCode: string) => void;
}

export const ApplyServiceTab: React.FC<ApplyServiceTabProps> = ({
  initialServiceId,
  applications,
  onCreateApplication,
  onTrackCode,
}) => {
  const [serviceId, setServiceId] = useState<string>(initialServiceId || SERVICES[0].id);
  const [village, setVillage] = useState<string>(VILLAGES[0]);
  const [applicantName, setApplicantName] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [nikTouched, setNikTouched] = useState<boolean>(false);
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [purposeNote, setPurposeNote] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentSize, setAttachmentSize] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedTicket, setSubmittedTicket] = useState<ServiceApplication | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialServiceId && SERVICES.some((s) => s.id === initialServiceId)) {
      setServiceId(initialServiceId);
      setSubmittedTicket(null);
    }
  }, [initialServiceId]);

  const selectedService = SERVICES.find((s) => s.id === serviceId) || SERVICES[0];

  const getNikValidationMessage = (value: string): string => {
    if (!value) return 'NIK wajib diisi tepat 16 digit angka.';
    if (/[^0-9]/.test(value)) {
      return 'NIK hanya boleh berisi angka (0–9), tidak boleh mengandung huruf atau tanda baca.';
    }
    if (value.length < 16) {
      return `NIK kurang dari 16 digit (saat ini baru ${value.length} dari 16 digit).`;
    }
    if (value.length > 16) {
      return `NIK melebihi 16 digit (saat ini ${value.length} digit, harus tepat 16 digit).`;
    }
    return '';
  };

  const liveNikError = nikTouched || nik.length > 0 ? getNikValidationMessage(nik) : '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const extAllowed = /\.(pdf|jpe?g|png)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !extAllowed) {
      setFileError('Format berkas tidak didukung. Harap unggah file PDF, JPG, atau PNG.');
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError('Ukuran berkas melebihi batas maksimal 5 MB.');
      return;
    }

    const sizeStr =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setAttachmentName(file.name);
    setAttachmentSize(sizeStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNikTouched(true);

    const errors: Record<string, string> = {};
    if (!applicantName.trim() || applicantName.trim().length < 3) {
      errors.applicantName = 'Nama lengkap pemohon minimal 3 karakter.';
    }
    const nikErr = getNikValidationMessage(nik);
    if (nikErr) {
      errors.nik = nikErr;
    }
    const cleanWa = whatsapp.replace(/\s+/g, '');
    if (!/^08\d{8,12}$/.test(cleanWa) && !/^628\d{8,12}$/.test(cleanWa)) {
      errors.whatsapp = 'Masukkan nomor WhatsApp aktif yang valid (contoh: 081234567890).';
    }
    if (!purposeNote.trim() || purposeNote.trim().length < 5) {
      errors.purposeNote = 'Tuliskan ringkasan keperluan permohonan minimal 5 karakter.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const now = new Date();
    const createdAt = now.toISOString();
    const slaDeadlineAt = new Date(
      now.getTime() + selectedService.slaHours * 60 * 60 * 1000
    ).toISOString();

    const registrationCode = generateRegistrationCode(applications);
    const queueNumber = generateQueueNumber(selectedService.counterCode, applications);

    const newApp: ServiceApplication = {
      id: `app-${Date.now()}`,
      registrationCode,
      queueNumber,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      counterCode: selectedService.counterCode,
      counterLabel: selectedService.counterLabel,
      village,
      applicantName: applicantName.trim(),
      nik,
      whatsapp: cleanWa,
      attachmentName: attachmentName || 'berkas_pengantar_desa_digital.pdf',
      attachmentSize: attachmentSize || '950 KB',
      purposeNote: purposeNote.trim(),
      stage: 1,
      stageHistory: [
        {
          stage: 1,
          label: 'Berkas Diterima',
          timestamp: createdAt,
          actor: 'Sistem SIPELMAS',
          note: 'Pendaftaran daring berhasil dibuat dan masuk antrean loket.',
        },
      ],
      officialNote: `Pendaftaran diterima. Silakan tunjukkan kode ${registrationCode} beserta dokumen asli saat verifikasi di ${selectedService.counterLabel}.`,
      createdAt,
      slaDeadlineAt,
      slaText: selectedService.slaText,
      slaHours: selectedService.slaHours,
    };

    onCreateApplication(newApp);
    setSubmittedTicket(newApp);
    setCopied(false);
  };

  const handleResetNewForm = () => {
    setSubmittedTicket(null);
    setApplicantName('');
    setNik('');
    setNikTouched(false);
    setWhatsapp('');
    setPurposeNote('');
    setAttachmentName('');
    setAttachmentSize('');
    setFormErrors({});
    setFileError('');
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (submittedTicket) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="no-print bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#065F46] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-bold text-[#022C22]">
              Pendaftaran Permohonan Berhasil Dikirim
            </h2>
            <p className="text-sm text-emerald-900 mt-0.5">
              Simpan atau cetak tiket bukti antrean digital di bawah ini untuk ditunjukkan kepada petugas di {submittedTicket.counterLabel} Kantor Kecamatan Balongbendo.
            </p>
          </div>
        </div>

        {/* Printable Ticket */}
        <article className="print-ticket bg-white border border-slate-300 rounded-2xl overflow-hidden">
          <div className="bg-[#022C22] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#FBBF24] font-semibold tracking-wide">
                PEMERINTAH KABUPATEN SIDOARJO · KECAMATAN BALONGBENDO
              </div>
              <h3 className="font-display text-xl font-extrabold mt-1">
                TIKET BUKTI PENDAFTARAN &amp; ANTREAN DIGITAL
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs text-emerald-200">Nomor Antrean Loket</div>
              <div className="font-mono text-3xl font-extrabold text-[#FBBF24] tabular-nums">
                {submittedTicket.queueNumber}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="pb-4 border-b border-slate-200">
                <div className="text-xs text-slate-500">Kode Registrasi Unik</div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#022C22] tracking-tight tabular-nums mt-0.5">
                  {submittedTicket.registrationCode}
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-500 text-xs">Jenis Layanan</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {submittedTicket.serviceName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Loket Tujuan</dt>
                  <dd className="font-semibold text-[#065F46] mt-0.5">
                    {submittedTicket.counterLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Nama Pemohon</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {submittedTicket.applicantName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Desa Asal</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    Desa {submittedTicket.village}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Waktu Pendaftaran</dt>
                  <dd className="font-mono text-xs sm:text-sm text-slate-800 tabular-nums mt-0.5">
                    {formatDateTimeWib(submittedTicket.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">Estimasi Selesai ({submittedTicket.slaText})</dt>
                  <dd className="font-mono text-xs sm:text-sm font-semibold text-[#065F46] tabular-nums mt-0.5">
                    {formatDateTimeWib(submittedTicket.slaDeadlineAt)}
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Biaya Resmi: <strong className="text-[#065F46]">Rp 0 (Gratis Tanpa Pungli)</strong></span>
                <span>Berkas: {submittedTicket.attachmentName}</span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <QrCodeSvg value={submittedTicket.registrationCode} size={140} />
              <div className="font-mono text-xs font-semibold text-slate-700 mt-2.5 tabular-nums">
                {submittedTicket.registrationCode}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Pindai QR di Mesin Antrean Loket
              </div>
            </div>
          </div>
        </article>

        {/* Action Buttons */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleCopyCode(submittedTicket.registrationCode)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#065F46]" />
                  <span>Kode Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Salin Kode Registrasi</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#022C22] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FBBF24]" />
              <span>Cetak / Simpan PDF Tiket</span>
            </button>

            <button
              type="button"
              onClick={() => onTrackCode(submittedTicket.registrationCode)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <SearchCheck className="w-4 h-4" />
              <span>Lacak Status Berkas</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetNewForm}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-[#065F46] hover:bg-emerald-50 cursor-pointer"
          >
            + Ajukan Permohonan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="pb-5 border-b border-slate-200">
          <h2 className="font-display text-2xl font-bold text-[#022C22] tracking-tight">
            Formulir Pendaftaran Layanan Daring
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Lengkapi data pemohon sesuai KTP-el untuk mendapatkan nomor antrean dan kode pelacakan resmi.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {/* Jenis Layanan */}
          <div>
            <label
              htmlFor="apply-service"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Jenis Layanan Kecamatan <span className="text-red-600">*</span>
            </label>
            <select
              id="apply-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#065F46] focus:ring-2 focus:ring-[#065F46]/20"
            >
              {SERVICES.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} ({svc.counterLabel} · {svc.slaText})
                </option>
              ))}
            </select>
          </div>

          {/* Desa Asal & Nama Lengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="apply-village"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Desa Asal (20 Desa Balongbendo) <span className="text-red-600">*</span>
              </label>
              <select
                id="apply-village"
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
                htmlFor="apply-name"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Nama Lengkap Pemohon (Sesuai KTP) <span className="text-red-600">*</span>
              </label>
              <input
                id="apply-name"
                type="text"
                value={applicantName}
                onChange={(e) => {
                  setApplicantName(e.target.value);
                  if (formErrors.applicantName) {
                    setFormErrors((prev) => ({ ...prev, applicantName: '' }));
                  }
                }}
                placeholder="Contoh: Siti Aminah"
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.applicantName
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
                }`}
              />
              {formErrors.applicantName && (
                <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.applicantName}</span>
                </p>
              )}
            </div>
          </div>

          {/* NIK (Strict 16 digit numeric validation) & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="apply-nik"
                  className="block text-sm font-semibold text-slate-800"
                >
                  NIK (16 Digit Angka) <span className="text-red-600">*</span>
                </label>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    nik.length === 16 && /^\d{16}$/.test(nik)
                      ? 'text-[#065F46] font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {nik.length}/16 digit
                </span>
              </div>
              <input
                id="apply-nik"
                type="text"
                inputMode="numeric"
                value={nik}
                onChange={(e) => {
                  setNik(e.target.value.trim());
                  if (formErrors.nik) {
                    setFormErrors((prev) => ({ ...prev, nik: '' }));
                  }
                }}
                onBlur={() => setNikTouched(true)}
                placeholder="Contoh: 3515130101900001"
                aria-invalid={Boolean(formErrors.nik || liveNikError)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.nik || liveNikError
                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
                }`}
              />
              {(formErrors.nik || liveNikError) && (
                <p
                  role="alert"
                  className="mt-1.5 text-xs font-semibold text-red-600 flex items-start gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formErrors.nik || liveNikError}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="apply-wa"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Nomor WhatsApp Aktif <span className="text-red-600">*</span>
              </label>
              <input
                id="apply-wa"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (formErrors.whatsapp) {
                    setFormErrors((prev) => ({ ...prev, whatsapp: '' }));
                  }
                }}
                placeholder="Contoh: 081234567890"
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.whatsapp
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
                }`}
              />
              {formErrors.whatsapp && (
                <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.whatsapp}</span>
                </p>
              )}
            </div>
          </div>

          {/* Simulasi Unggah Berkas Pendukung */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Unggah Berkas Pendukung (PDF / JPG / PNG, Maks. 5 MB)
            </label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/70">
              {attachmentName ? (
                <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {attachmentName}
                    </div>
                    <div className="text-xs text-[#065F46] font-mono tabular-nums">
                      Siap dilampirkan · {attachmentSize}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName('');
                      setAttachmentSize('');
                    }}
                    className="min-h-[40px] min-w-[40px] rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                    aria-label="Hapus berkas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#065F46] flex items-center justify-center shrink-0">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        Pilih file surat pengantar desa / KTP / KK
                      </div>
                      <div className="text-xs text-slate-500">
                        Format PDF, JPG, atau PNG maksimal 5 MB (opsional untuk pra-registrasi)
                      </div>
                    </div>
                  </div>
                  <span className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0">
                    Pilih Berkas
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}
              {fileError && (
                <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Catatan Keperluan */}
          <div>
            <label
              htmlFor="apply-purpose"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Catatan Keperluan <span className="text-red-600">*</span>
            </label>
            <textarea
              id="apply-purpose"
              rows={3}
              value={purposeNote}
              onChange={(e) => {
                setPurposeNote(e.target.value);
                if (formErrors.purposeNote) {
                  setFormErrors((prev) => ({ ...prev, purposeNote: '' }));
                }
              }}
              placeholder="Contoh: Legalisasi SKU usaha warung sembako untuk pengajuan KUR Mikro..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                formErrors.purposeNote
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#065F46] focus:ring-[#065F46]/20'
              }`}
            />
            {formErrors.purposeNote && (
              <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formErrors.purposeNote}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Data NIK dilindungi sesuai ketentuan UU Perlindungan Data Pribadi.
            </div>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Kirim Permohonan &amp; Ambil Tiket</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar: Selected Service Requirements Summary */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <div className="text-xs font-semibold text-[#065F46]">
            Ringkasan Layanan Terpilih
          </div>
          <h3 className="font-display text-lg font-bold text-[#022C22] mt-1">
            {selectedService.name}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
            <div>
              <div className="text-slate-500">Loket Antrean</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {selectedService.counterLabel}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Biaya &amp; SLA</div>
              <div className="font-bold text-[#065F46] mt-0.5">
                Rp 0 · {selectedService.slaText}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-display text-sm font-bold text-slate-900 mb-2.5">
            Dokumen yang Perlu Disiapkan
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {selectedService.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#065F46] shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};
