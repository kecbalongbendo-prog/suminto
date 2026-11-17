import { useEffect, useState } from 'react';
import { ApplyServiceTab } from './components/ApplyServiceTab';
import { Header } from './components/Header';
import { HomeServicesTab } from './components/HomeServicesTab';
import { LaporTab } from './components/LaporTab';
import { OfficerDashboardTab } from './components/OfficerDashboardTab';
import { TrackStatusTab } from './components/TrackStatusTab';
import {
  INITIAL_APPLICATIONS,
  INITIAL_COMPLAINTS,
  STAGE_LABELS,
} from './data/balongbendoData';
import type {
  ApplicationStage,
  ComplaintItem,
  ComplaintStatus,
  ServiceApplication,
  TabId,
} from './types';

const STORAGE_KEYS = {
  apps: 'sipelmas_balongbendo_apps_v1',
  complaints: 'sipelmas_balongbendo_complaints_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('beranda');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string>('ktp-kk');
  const [trackCode, setTrackCode] = useState<string>('BLB-2026-1042');

  const [applications, setApplications] = useState<ServiceApplication[]>(() =>
    loadFromStorage<ServiceApplication[]>(STORAGE_KEYS.apps, INITIAL_APPLICATIONS)
  );
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() =>
    loadFromStorage<ComplaintItem[]>(STORAGE_KEYS.complaints, INITIAL_COMPLAINTS)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.apps, JSON.stringify(applications));
    } catch {
      // Ignore quota errors
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(complaints));
    } catch {
      // Ignore quota errors
    }
  }, [complaints]);

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartApplication = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    setActiveTab('ajukan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateApplication = (newApp: ServiceApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setTrackCode(newApp.registrationCode);
  };

  const handleTrackCode = (code: string) => {
    setTrackCode(code);
    setActiveTab('lacak');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateApplication = (
    id: string,
    nextStage: ApplicationStage,
    officialNote: string,
    actorLabel: string
  ) => {
    const nowIso = new Date().toISOString();
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const existingHistory = [...app.stageHistory];
        const hasStage = existingHistory.some((h) => h.stage === nextStage);
        const updatedHistory = hasStage
          ? existingHistory.map((h) =>
              h.stage === nextStage
                ? { ...h, timestamp: nowIso, actor: actorLabel, note: officialNote }
                : h
            )
          : [
              ...existingHistory,
              {
                stage: nextStage,
                label: STAGE_LABELS[nextStage],
                timestamp: nowIso,
                actor: actorLabel,
                note: officialNote,
              },
            ].sort((a, b) => a.stage - b.stage);

        return {
          ...app,
          stage: nextStage,
          officialNote,
          stageHistory: updatedHistory,
        };
      })
    );
  };

  const handleCreateComplaint = (item: ComplaintItem) => {
    setComplaints((prev) => [item, ...prev]);
  };

  const handleUpdateComplaint = (
    id: string,
    status: ComplaintStatus,
    officialResponse: string
  ) => {
    const nowIso = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status, officialResponse, updatedAt: nowIso }
          : item
      )
    );
  };

  const handleResetDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    setComplaints(INITIAL_COMPLAINTS);
    setTrackCode('BLB-2026-1042');
    try {
      localStorage.removeItem(STORAGE_KEYS.apps);
      localStorage.removeItem(STORAGE_KEYS.complaints);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 pb-20 lg:pb-0">
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'beranda' && (
          <HomeServicesTab
            onStartApplication={handleStartApplication}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'ajukan' && (
          <ApplyServiceTab
            initialServiceId={preselectedServiceId}
            applications={applications}
            onCreateApplication={handleCreateApplication}
            onTrackCode={handleTrackCode}
          />
        )}

        {activeTab === 'lacak' && (
          <TrackStatusTab
            applications={applications}
            initialSearchCode={trackCode}
          />
        )}

        {activeTab === 'lapor' && (
          <LaporTab
            complaints={complaints}
            onCreateComplaint={handleCreateComplaint}
          />
        )}

        {activeTab === 'petugas' && (
          <OfficerDashboardTab
            applications={applications}
            complaints={complaints}
            onUpdateApplication={handleUpdateApplication}
            onUpdateComplaint={handleUpdateComplaint}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
          <div>
            <div className="font-display font-bold text-[#022C22]">
              SIPELMAS BALONGBENDO — Pemerintah Kecamatan Balongbendo
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Kabupaten Sidoarjo, Provinsi Jawa Timur · Jam Loket: Senin–Kamis 08.00–15.00 WIB · Jumat 08.00–14.00 WIB
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Seluruh layanan publik tidak dipungut biaya (Rp 0 / Tanpa Pungli).
          </div>
        </div>
      </footer>
    </div>
  );
}
