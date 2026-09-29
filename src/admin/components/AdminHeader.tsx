import React, { useState } from 'react';
import { AdminTheme } from '../theme';
import { FeatureToggles } from '../../types';

interface AdminHeaderProps {
  currentTab: string;
  tabTitle: string;
  tabIcon: string;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  currentTheme?: AdminTheme;
  onSelectTheme?: (theme: AdminTheme) => void;
  featureToggles?: FeatureToggles;
  onUpdateFeatureToggle?: (key: keyof FeatureToggles, enabled: boolean) => void;
  onUpdateToggle?: (key: keyof FeatureToggles, enabled: boolean) => void;
  onOpenFeaturesTab?: () => void;
  onForceSync: () => void;
  onToggleSidebar: () => void;
  onSwitchToStorefront: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

const QUICK_FEATURES: Array<{ key: keyof FeatureToggles; label: string; icon: string }> = [
  { key: 'sideMenu', label: 'Side Menu Drawer (Master)', icon: 'fa-bars' },
  { key: 'menuHome', label: 'Menu: Home Link', icon: 'fa-house' },
  { key: 'menuOrders', label: 'Menu: My Orders & Tracking', icon: 'fa-box-open' },
  { key: 'menuContact', label: 'Menu: Contact Us', icon: 'fa-envelope' },
  { key: 'menuAbout', label: 'Menu: About Owner', icon: 'fa-user-tie' },
  { key: 'aiAssistant', label: 'Menu & Store: AI Assistant', icon: 'fa-wand-magic-sparkles' },
  { key: 'notifications', label: 'Menu & Header: Notifications', icon: 'fa-bell' },
  { key: 'promoCodes', label: 'Menu & Store: Promo Codes', icon: 'fa-ticket' },
  { key: 'whatsAppFloat', label: 'Menu & Float: WhatsApp', icon: 'fa-whatsapp' },
  { key: 'splash', label: '3D Splash Screen', icon: 'fa-bolt' },
  { key: 'announcement', label: 'Top Announcement Bar', icon: 'fa-bullhorn' },
  { key: 'banner', label: 'Hero Banner', icon: 'fa-image' },
  { key: 'launchCountdown', label: 'Launch Countdown', icon: 'fa-stopwatch' },
  { key: 'gallery', label: 'Gallery Showcase', icon: 'fa-images' },
  { key: 'categoryChips', label: 'Category Filter Chips', icon: 'fa-tags' },
  { key: 'dynamicSections', label: 'Product Sections', icon: 'fa-layer-group' },
  { key: 'searchPanel', label: 'Global Search Panel', icon: 'fa-magnifying-glass' },
  { key: 'floatingCart', label: 'Floating Cart Pill', icon: 'fa-cart-shopping' },
  { key: 'flyingParticles', label: 'Flying Cart Animation', icon: 'fa-sparkles' },
  { key: 'quickView', label: 'Product Quick View', icon: 'fa-eye' },
  { key: 'reviews', label: 'Customer Reviews', icon: 'fa-star' },
  { key: 'receiptDownload', label: 'Receipt Slip Download', icon: 'fa-file-arrow-down' },
  { key: 'soundEffects', label: 'UI Sound Effects', icon: 'fa-volume-high' }
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  tabTitle,
  tabIcon,
  syncStatus,
  featureToggles,
  onUpdateFeatureToggle,
  onUpdateToggle,
  onOpenFeaturesTab,
  onForceSync,
  onToggleSidebar,
  onSwitchToStorefront,
  onShowToast
}) => {
  const handleToggleFeature = onUpdateFeatureToggle || onUpdateToggle;
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const syncConfig = {
    synced: {
      color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      icon: 'fa-cloud-arrow-up text-emerald-400',
      text: 'Synced'
    },
    saving: {
      color: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      icon: 'fa-spinner fa-spin text-amber-400',
      text: 'Saving...'
    },
    offline: {
      color: 'bg-purple-950/80 text-purple-300 border border-purple-700/40',
      icon: 'fa-wifi text-purple-400',
      text: 'Local Sync'
    },
    error: {
      color: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      icon: 'fa-triangle-exclamation text-rose-400',
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
      <header className="bg-[#13131a]/95 backdrop-blur-md border-b border-purple-900/40 sticky top-0 z-30 shadow-lg shadow-purple-950/30">
        <div className="flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6 gap-2">
          {/* Left: Mobile Toggle, Brand Emblem & Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2.5 text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/50 rounded-xl transition cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-bars text-base sm:text-lg"></i>
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0a0a0f] border border-purple-500/40 overflow-hidden shadow-md shadow-purple-900/40 flex items-center justify-center shrink-0 lg:hidden">
                <img
                  src={LOGO_URL}
                  alt="ApexStore"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 hidden lg:flex items-center justify-center text-sm font-bold shadow-md">
                <i className={`fa-solid ${tabIcon}`}></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black text-white tracking-tight leading-tight truncate">
                  {tabTitle}
                </h1>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider hidden sm:block truncate">
                  ApexStore Power Admin • Storefront Theme
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Feature ON/OFF Menu, URLs, Sync Status & Storefront Switch */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Feature ON/OFF Toggle Menu */}
            {featureToggles && handleToggleFeature && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFeatureMenuOpen(!featureMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/60 text-xs font-black text-purple-200 transition cursor-pointer"
                  title="Quick Menu: Feature ON/OFF Toggles"
                >
                  <i className="fa-solid fa-toggle-on text-emerald-400 text-sm"></i>
                  <span className="hidden md:inline">Feature Menu</span>
                  <i className="fa-solid fa-chevron-down text-[9px] opacity-75"></i>
                </button>

                {featureMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setFeatureMenuOpen(false)}
                    />
                    <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] max-w-xs rounded-2xl bg-[#13131a] border border-purple-800/70 shadow-2xl shadow-purple-950/90 p-3 z-50">
                      <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-purple-900/50">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-white">
                            Feature ON / OFF Menu
                          </p>
                          <p className="text-[10px] text-purple-300/70">
                            Instant live storefront switches
                          </p>
                        </div>
                        {onOpenFeaturesTab && (
                          <button
                            type="button"
                            onClick={() => {
                              setFeatureMenuOpen(false);
                              onOpenFeaturesTab();
                            }}
                            className="text-[10px] font-black text-purple-300 hover:text-white underline cursor-pointer"
                          >
                            All Switches
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                        {QUICK_FEATURES.map((item) => {
                          const isOn = featureToggles[item.key] !== false;
                          return (
                            <div
                              key={item.key}
                              onClick={() => handleToggleFeature(item.key, !isOn)}
                              className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-purple-950/50 transition cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <i className={`fa-solid ${item.icon} w-4 text-center text-xs ${isOn ? 'text-purple-400' : 'text-purple-400/40'}`}></i>
                                <span className={`text-xs font-bold truncate ${isOn ? 'text-white' : 'text-purple-300/50'}`}>
                                  {item.label}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  isOn
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                                }`}
                              >
                                {isOn ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Direct URLs Share / Copy Button */}
            <button
              type="button"
              onClick={() => setUrlModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-purple-700/50 bg-[#181326] hover:bg-purple-900/50 text-xs font-bold text-purple-200 transition cursor-pointer"
              title="Get Direct Separate URLs"
            >
              <i className="fa-solid fa-link text-purple-400 text-xs"></i>
              <span className="hidden xl:inline">Direct URLs</span>
            </button>

            {/* Sync badge */}
            <div
              className={`text-[11px] font-black px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 ${syncConfig.color}`}
            >
              <i className={`fa-solid ${syncConfig.icon}`}></i>
              <span className="hidden md:inline">{syncConfig.text}</span>
            </div>

            {/* Force sync */}
            <button
              type="button"
              onClick={onForceSync}
              className="p-2 text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 rounded-xl transition cursor-pointer"
              title="Force Sync with Storefront & Firebase"
            >
              <i className="fa-solid fa-rotate text-xs sm:text-sm"></i>
            </button>

            {/* Storefront switch button */}
            <button
              type="button"
              onClick={onSwitchToStorefront}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black px-3 sm:px-3.5 py-2 rounded-xl transition shadow-md shadow-purple-950/60 border border-purple-400/30 cursor-pointer"
            >
              <i className="fa-solid fa-store text-xs"></i>
              <span className="hidden sm:inline">Storefront</span>
            </button>
          </div>
        </div>
      </header>

      {/* Direct URLs Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13131a] border border-purple-800/60 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl shadow-purple-950/90 relative">
            <button
              type="button"
              onClick={() => setUrlModalOpen(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white p-2 rounded-xl bg-purple-950/50 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-lg">
                <i className="fa-solid fa-up-right-from-square"></i>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Direct Application URLs</h3>
                <p className="text-xs text-purple-300/70">Separate URLs for Customer Storefront and Admin Panel</p>
              </div>
            </div>

            <div className="space-y-4 my-5">
              {/* Storefront URL Card */}
              <div className="bg-[#0d0d14] rounded-2xl p-4 border border-purple-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-xs font-black text-white">1. Customer Storefront URL</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(storefrontUrl, 'Storefront URL')}
                    className="text-[11px] font-bold text-purple-300 hover:text-white flex items-center gap-1 bg-purple-900/40 px-2.5 py-1 rounded-lg border border-purple-600/40 cursor-pointer"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-purple-200 font-mono break-all bg-[#13131a] p-2.5 rounded-xl select-all border border-purple-900/40">
                  {storefrontUrl}
                </p>
              </div>

              {/* Admin URL Card */}
              <div className="bg-[#0d0d14] rounded-2xl p-4 border border-purple-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black text-white">2. Power Admin Panel URL</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adminUrl, 'Admin Panel URL')}
                    className="text-[11px] font-bold text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-600/40 cursor-pointer"
                  >
                    <i className="fa-solid fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-purple-200 font-mono break-all bg-[#13131a] p-2.5 rounded-xl select-all border border-purple-900/40">
                  {adminUrl}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUrlModalOpen(false)}
                className="px-5 py-2.5 bg-purple-950/80 hover:bg-purple-900 text-white border border-purple-700/50 rounded-xl text-xs font-bold transition cursor-pointer"
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

