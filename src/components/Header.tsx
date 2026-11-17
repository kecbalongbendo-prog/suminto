import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  FilePlus2,
  Home,
  MapPin,
  MessageSquareWarning,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import type { TabId } from '../types';
import { getWibCounterStatus } from '../utils/helpers';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const NAV_ITEMS: Array<{
  id: TabId;
  label: string;
  mobileLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'beranda', label: 'Beranda & Layanan', mobileLabel: 'Beranda', icon: Home },
  { id: 'ajukan', label: 'Ajukan Permohonan', mobileLabel: 'Ajukan', icon: FilePlus2 },
  { id: 'lacak', label: 'Cek Status / Lacak', mobileLabel: 'Lacak', icon: SearchCheck },
  { id: 'lapor', label: 'Pengaduan Warga (LAPOR!)', mobileLabel: 'LAPOR!', icon: MessageSquareWarning },
  { id: 'petugas', label: 'Panel Petugas & Analytics', mobileLabel: 'Petugas', icon: BarChart3 },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const wib = getWibCounterStatus(now);

  return (
    <>
      <div className="no-print bg-[#022C22] text-emerald-50 border-b border-emerald-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-100/90 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" aria-hidden="true" />
            <span className="truncate">
              Kantor Kecamatan Balongbendo, Jl. Raya Balongbendo No. 1, Kab. Sidoarjo, Jawa Timur
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-emerald-100/90 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" aria-hidden="true" />
              <span>
                {wib.dayLabel}, {wib.timeWib}
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold tracking-tight ${
                wib.isOpen
                  ? 'bg-emerald-700 text-white border border-emerald-500/60'
                  : 'bg-amber-950/90 text-[#FBBF24] border border-amber-500/50'
              }`}
              title={wib.subText}
            >
              <span>{wib.badgeText}</span>
            </span>
          </div>
        </div>
      </div>

      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            <button
              type="button"
              onClick={() => onSelectTab('beranda')}
              className="flex items-center gap-3 text-left min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] rounded-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-[#065F46] text-[#FBBF24] flex items-center justify-center shrink-0 border border-[#022C22]">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#022C22] whitespace-nowrap truncate">
                  SIPELMAS BALONGBENDO
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 whitespace-nowrap truncate">
                  Pemerintah Kecamatan Balongbendo · Kab. Sidoarjo
                </div>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi Utama">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46] ${
                      isActive
                        ? 'bg-[#065F46] text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#022C22]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#FBBF24]' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden sm:flex lg:hidden items-center shrink-0">
              <button
                type="button"
                onClick={() => onSelectTab('ajukan')}
                className="px-4 py-2.5 rounded-lg bg-[#FBBF24] hover:bg-amber-400 text-[#022C22] text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Ajukan Layanan
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav
        className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
        aria-label="Navigasi Seluler"
      >
        <div className="grid grid-cols-5 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 min-h-[44px] px-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#065F46] bg-emerald-50/70'
                    : 'text-slate-600 hover:text-[#022C22]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#065F46] stroke-[2.25]' : 'text-slate-500'
                  }`}
                />
                <span className="text-[11px] font-semibold leading-none truncate max-w-full">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
