export type TabId = 'beranda' | 'ajukan' | 'lacak' | 'lapor' | 'petugas';

export type ServiceCategory =
  | 'Kependudukan'
  | 'Perizinan & UMKM'
  | 'Pertanahan & Waris'
  | 'Bansos & SKTM';

export type CounterCode = 'A' | 'B';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  counterCode: CounterCode;
  counterLabel: string;
  slaText: string;
  slaHours: number;
  isExpress?: boolean;
  shortDesc: string;
  requirements: string[];
  legalNote: string;
}

export type ApplicationStage = 1 | 2 | 3 | 4;

export interface StageHistoryEntry {
  stage: ApplicationStage;
  label: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface ServiceApplication {
  id: string;
  registrationCode: string;
  queueNumber: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  counterCode: CounterCode;
  counterLabel: string;
  village: string;
  applicantName: string;
  nik: string;
  whatsapp: string;
  attachmentName: string;
  attachmentSize: string;
  purposeNote: string;
  stage: ApplicationStage;
  stageHistory: StageHistoryEntry[];
  officialNote: string;
  createdAt: string;
  slaDeadlineAt: string;
  slaText: string;
  slaHours: number;
}

export type ComplaintCategory =
  | 'Infrastruktur & Jalan'
  | 'Penerangan Jalan Umum (PJU)'
  | 'Saluran Air / Lingkungan'
  | 'Ketertiban Umum'
  | 'Pelayanan Publik';

export type ComplaintStatus = 'Diterima Admin' | 'Ditindaklanjuti' | 'Selesai';

export type UrgencyLevel = 'Prioritas Tinggi' | 'Normal';

export interface ComplaintItem {
  id: string;
  ticketCode: string;
  reporterName: string;
  village: string;
  category: ComplaintCategory;
  title: string;
  chronology: string;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  officialResponse: string;
  createdAt: string;
  updatedAt: string;
}

export type OfficerRole = 'petugas' | 'camat';
