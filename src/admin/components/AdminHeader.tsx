import React, { useState } from 'react';
import { AdminTheme, ADMIN_THEMES } from '../theme';

interface AdminHeaderProps {
  currentTab: string;
  tabTitle: string;
  tabIcon: string;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  currentTheme: AdminTheme;
  onSelectTheme: (theme: AdminTheme) => void;
  onForceSync: () => void;
  onToggleSidebar: () => void;
  onSwitchToStorefront: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  tabTitle,
  tabIcon,
  syncStatus,
  currentTheme = 'cyber',
  onSelectTheme,
  onForceSync,
  onToggleSidebar,
  onSwitchToStorefront,
  onShowToast
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const activeThemeConfig = ADMIN_THEMES[currentTheme] || ADMIN_THEMES.cyber;

  const syncConfig = {
    synced: {
      color: 'bg-emerald-500 text-white shadow-emerald-900/30',
      icon: 'fa-cloud-arrow-up',
      text: 'Synced'
    },
    saving: {
      color: 'bg-amber-500 text-white shadow-amber-900/30',
      icon: 'fa-spinner fa-spin',
      text: 'Saving...'
    },
    offline: {
      color: 'bg-slate-500 text-white',
      icon: 'fa-wifi',
      text: 'Offline'
    },
    error: {
      color: 'bg-rose-500 text-white shadow-rose-900/30',
      icon: 'fa-triangle-exclamation',
      text: 'Sync Error'
    }
  }[syncStatus];

  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      onShowToast(`Copied ${label} to clipboard!`, 'success');
    } catch {
      onShowToast('Could not copy automatically', 'error');
    }
  };

  const storefrontUrl = `${getOrigin()}/?view=storefront`;
  const adminUrl = `${getOrigin()}/?view=admin`;

  return (
    <>
      <header className="bg-[#13131a]/95 backdrop-blur-md border-b border-purple-900/40 sticky top-0 z-30 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 gap-3">
          {/* Left: Mobile Toggle, Brand Emblem & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="lg:hidden p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0a0a0f] border border-purple-500/40 overflow-hidden shadow-md shadow-purple-900/40 flex items-center justify-center shrink-0 lg:hidden">
                <img
                  src={LOGO_URL}
                  alt="ApexStore"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hidden lg:flex items-center justify-center text-sm font-bold shadow-xs">
                <i className={`fa-solid ${tabIcon}`}></i>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  {tabTitle}
                </h1>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider hidden sm:block">
                  ApexStore Power Admin • Live Control
                </p>
              </div>
            </div>
          </div>

          {/* Right: Theme Selector, URLs, Sync Status & Storefront Switch */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher Button / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-300 transition cursor-pointer"
                title="Change Admin Panel Theme"
              >
                <i className={`fa-solid ${activeThemeConfig.icon}`}></i>
                <span className="hidden md:inline">{activeThemeConfig.name}</span>
                <i className="fa-solid fa-chevron-down text-[10px] ml-0.5 opacity-70"></i>
              </button>

              {themeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setThemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
                      Admin Theme
                    </p>
                    <div className="space-y-1">
                      {(Object.keys(ADMIN_THEMES) as AdminTheme[]).map((themeKey) => {
                        const theme = ADMIN_THEMES[themeKey];
                        const isSelected = currentTheme === themeKey;
                        return (
                          <button
                            key={themeKey}
                            onClick={() => {
                              onSelectTheme(themeKey);
                              setThemeMenuOpen(false);
                              onShowToast(`Theme changed to ${theme.name}`, 'info');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <i className={`fa-solid ${theme.icon} w-4 text-center`}></i>
                              <span>{theme.name}</span>
                            </div>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                                isSelected
                                  ? 'bg-purple-700/80 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {theme.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Direct URLs Share / Copy Button */}
            <button
              onClick={() => setUrlModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-bold text-sky-400 transition"
              title="Get Direct Separate URLs"
            >
              <i className="fa-solid fa-link text-xs"></i>
              <span className="hidden sm:inline">Direct URLs</span>
            </button>

            {/* Sync badge */}
            <div
              className={`text-xs font-black px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 transition-all duration-300 ${syncConfig.color}`}
            >
              <i className={`fa-solid ${syncConfig.icon}`}></i>
              <span className="hidden sm:inline">{syncConfig.text}</span>
            </div>

            {/* Force sync */}
            <button
              onClick={onForceSync}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-xl transition"
              title="Force Sync with Firebase"
            >
              <i className="fa-solid fa-rotate text-sm"></i>
            </button>

            {/* Storefront switch button */}
            <button
              onClick={onSwitchToStorefront}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <i className="fa-solid fa-store"></i>
              <span className="hidden sm:inline">View Storefront</span>
            </button>
          </div>
        </div>
      </header>

      {/* Direct URLs Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setUrlModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-lg">
                <i className="fa-solid fa-up-right-from-square"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Direct Application URLs</h3>
                <p className="text-xs text-slate-400">Two separate URLs for Customer Store and Power Admin</p>
              </div>
            </div>

            <div className="space-y-4 my-5">
              {/* Storefront URL Card */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-xs font-black text-white">1. Customer Storefront URL</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(storefrontUrl, 'Storefront URL')}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono break-all bg-slate-950/60 p-2 rounded-xl select-all border border-slate-800">
                  {storefrontUrl}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <i className="fa-solid fa-external-link text-[10px]"></i> Open Storefront in new tab
                  </a>
                </div>
              </div>

              {/* Admin URL Card */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black text-white">2. Power Admin Panel URL</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminUrl, 'Admin Panel URL')}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono break-all bg-slate-950/60 p-2 rounded-xl select-all border border-slate-800">
                  {adminUrl}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={adminUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <i className="fa-solid fa-external-link text-[10px]"></i> Open Admin in new tab
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setUrlModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

