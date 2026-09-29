import React, { useState, useEffect } from 'react';
import { FeatureToggles } from '../../types';

interface FeaturesTabProps {
  featureToggles: FeatureToggles;
  onUpdateToggle: (feature: keyof FeatureToggles, enabled: boolean) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  whatsappUrl?: string;
  onSaveWhatsappUrl?: (url: string) => void;
}

interface FeatureItemConfig {
  key: keyof FeatureToggles;
  title: string;
  category: 'storefront' | 'interactive' | 'marketing' | 'system';
  description: string;
  icon: string;
  badge: string;
}

const FEATURE_LIST: FeatureItemConfig[] = [
  // Storefront UI & Navigation Menu
  {
    key: 'sideMenu',
    title: 'Navigation Side Menu Drawer (Master)',
    category: 'storefront',
    description: 'Controls the hamburger navigation menu button and slide-out side drawer in the storefront.',
    icon: 'fa-bars',
    badge: 'Menu Master'
  },
  {
    key: 'menuHome',
    title: 'Side Menu: Home Link',
    category: 'storefront',
    description: 'Shows or hides the Home navigation link inside the Storefront Side Menu drawer.',
    icon: 'fa-house',
    badge: 'Menu Item'
  },
  {
    key: 'menuOrders',
    title: 'Side Menu: My Orders & Tracking',
    category: 'storefront',
    description: 'Shows or hides the My Orders & Tracking link inside the Storefront Side Menu drawer.',
    icon: 'fa-box-open',
    badge: 'Menu Item'
  },
  {
    key: 'menuContact',
    title: 'Side Menu: Contact Us Link',
    category: 'storefront',
    description: 'Shows or hides the Contact Us link inside the Storefront Side Menu drawer.',
    icon: 'fa-envelope',
    badge: 'Menu Item'
  },
  {
    key: 'menuAbout',
    title: 'Side Menu: About Owner Link',
    category: 'storefront',
    description: 'Shows or hides the About Owner link inside the Storefront Side Menu drawer.',
    icon: 'fa-user-tie',
    badge: 'Menu Item'
  },
  {
    key: 'splash',
    title: 'Futuristic Splash Screen',
    category: 'storefront',
    description: 'Displays the cyberpunk intro animation on page first-load with audio feedback.',
    icon: 'fa-bolt',
    badge: 'Visual Experience'
  },
  {
    key: 'announcement',
    title: 'Top Announcement Bar',
    category: 'storefront',
    description: 'Shows the marquee ticker notification at the very top of the storefront.',
    icon: 'fa-bullhorn',
    badge: 'Header'
  },
  {
    key: 'banner',
    title: 'Hero Banner Section',
    category: 'storefront',
    description: 'High-impact promotional banner with call-to-action button and custom headline.',
    icon: 'fa-image',
    badge: 'Storefront'
  },
  {
    key: 'launchCountdown',
    title: 'Live Launch Countdown Drop',
    category: 'storefront',
    description: 'Real-time countdown timer bar with status badges for upcoming product drops.',
    icon: 'fa-stopwatch',
    badge: 'Drops'
  },
  {
    key: 'gallery',
    title: 'Interactive Gallery Showcase',
    category: 'storefront',
    description: 'Multi-slide image gallery displaying top campaign products and aesthetic imagery.',
    icon: 'fa-images',
    badge: 'Media'
  },
  {
    key: 'categoryChips',
    title: 'Category Filter Chips',
    category: 'storefront',
    description: 'Interactive category pills bar for quick browsing (All, Tech, Apparel, etc.).',
    icon: 'fa-tags',
    badge: 'Navigation'
  },
  {
    key: 'dynamicSections',
    title: 'Dynamic Product Sections',
    category: 'storefront',
    description: 'Custom homepage product grids (Trending, Flash Drops, New Arrivals).',
    icon: 'fa-layer-group',
    badge: 'Catalog'
  },

  // Interactive & Modals
  {
    key: 'floatingCart',
    title: 'Floating Cart Button',
    category: 'interactive',
    description: 'Quick floating badge in the bottom-right showing active cart count and price.',
    icon: 'fa-bag-shopping',
    badge: 'Cart'
  },
  {
    key: 'flyingParticles',
    title: 'Flying Cart Particles Animation',
    category: 'interactive',
    description: 'Particle burst and flying animation when user clicks "Add to Cart".',
    icon: 'fa-wand-magic-sparkles',
    badge: 'Animation'
  },
  {
    key: 'searchPanel',
    title: 'Global Search Panel',
    category: 'interactive',
    description: 'Modal search with instant keyword filtering, tags, and category search.',
    icon: 'fa-magnifying-glass',
    badge: 'Search'
  },
  {
    key: 'quickView',
    title: 'Quick View Product Modal',
    category: 'interactive',
    description: 'Fast popup to view product specs, tags, and image preview without redirect.',
    icon: 'fa-eye',
    badge: 'Modal'
  },

  // Marketing & Growth
  {
    key: 'promoCodes',
    title: 'Promo Codes & Discounts',
    category: 'marketing',
    description: 'Allow customers to apply coupon codes at checkout for instant discounts.',
    icon: 'fa-ticket',
    badge: 'Sales'
  },
  {
    key: 'notifications',
    title: 'In-App Alerts & Bell Modal',
    category: 'marketing',
    description: 'Notification center bell with live announcements, drops, and alerts.',
    icon: 'fa-bell',
    badge: 'Broadcast'
  },
  {
    key: 'reviews',
    title: 'Customer Reviews & Ratings',
    category: 'marketing',
    description: 'Star ratings and customer feedback module on products.',
    icon: 'fa-star',
    badge: 'Social Proof'
  },

  // Support & System
  {
    key: 'aiAssistant',
    title: 'AI Shopping Assistant Drawer',
    category: 'system',
    description: 'Interactive AI shopping consultant to answer questions and recommend items.',
    icon: 'fa-robot',
    badge: 'AI Smart'
  },
  {
    key: 'whatsAppFloat',
    title: 'WhatsApp Direct Chat Launcher',
    category: 'system',
    description: 'Floating button connecting customers directly to your store WhatsApp channel.',
    icon: 'fa-whatsapp',
    badge: 'Support'
  },
  {
    key: 'receiptDownload',
    title: 'Receipt / Invoice Download',
    category: 'system',
    description: 'Generates branded transaction receipts and PNG download cards for completed orders.',
    icon: 'fa-file-invoice',
    badge: 'Orders'
  },
  {
    key: 'soundEffects',
    title: 'Cyber Audio & Sound Effects',
    category: 'system',
    description: 'Play subtle audio feedback on buttons, clicks, and cart actions.',
    icon: 'fa-volume-high',
    badge: 'Audio'
  }
];

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  featureToggles,
  onUpdateToggle,
  onEnableAll,
  onDisableAll,
  whatsappUrl = '',
  onSaveWhatsappUrl
}) => {
  const [waInput, setWaInput] = useState(whatsappUrl || 'https://whatsapp.com/channel/0029Vb7r27cI7BeE38n42O1V');

  useEffect(() => {
    if (whatsappUrl) {
      setWaInput(whatsappUrl);
    }
  }, [whatsappUrl]);

  const activeCount = FEATURE_LIST.filter((f) => featureToggles[f.key] !== false).length;
  const totalCount = FEATURE_LIST.length;

  return (
    <div className="space-y-6">
      {/* Dedicated WhatsApp Floating Button URL Control Card */}
      <div className="bg-[#13131a] rounded-2xl p-4 sm:p-6 border border-emerald-500/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-lg shadow-md shrink-0">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                WhatsApp Floating Button URL (Storefront Bottom-Left)
              </h3>
              <p className="text-xs text-purple-300/80">
                Enter your WhatsApp Channel link, Group link, or Direct Chat URL (e.g. https://wa.me/923001234567)
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border self-start sm:self-auto ${
              featureToggles.whatsAppFloat !== false
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
            }`}
          >
            Floating Button: {featureToggles.whatsAppFloat !== false ? 'ACTIVE' : 'OFF'}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSaveWhatsappUrl) {
              onSaveWhatsappUrl(waInput.trim());
            }
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            value={waInput}
            onChange={(e) => setWaInput(e.target.value)}
            placeholder="https://whatsapp.com/channel/... or https://wa.me/923001234567"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-purple-800/60 focus:border-emerald-400 text-white text-xs sm:text-sm font-mono outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Save WhatsApp URL</span>
          </button>
        </form>
      </div>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#13131a] via-purple-950/80 to-[#13131a] rounded-2xl p-5 sm:p-6 text-white border border-purple-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-fuchsia-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-2">
              <i className="fa-solid fa-sliders text-purple-400"></i>
              Menu &amp; Feature Control Center
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Feature &amp; Menu ON / OFF Switches
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
              Turn the Storefront Menu or any feature ON or OFF in real-time. Changes sync immediately to all customers on Android &amp; Desktop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#0a0a0f]/90 px-4 py-2 rounded-xl border border-purple-700/40 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {activeCount} / {totalCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                Active Features
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEnableAll}
                className="px-3.5 py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-check-double"></i> Enable All
              </button>
              <button
                type="button"
                onClick={onDisableAll}
                className="px-3.5 py-2.5 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-ban"></i> Disable All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {(['storefront', 'interactive', 'marketing', 'system'] as const).map((cat) => {
        const items = FEATURE_LIST.filter((item) => item.category === cat);
        const catTitles: Record<string, { title: string; desc: string; icon: string }> = {
          storefront: {
            title: 'Storefront Menu, Layout & Sections',
            desc: 'Navigation drawer menu and visual modules rendered on the customer homepage',
            icon: 'fa-store'
          },
          interactive: {
            title: 'Interactive Experiences & Modals',
            desc: 'Popups, drawers, and dynamic UX interactions',
            icon: 'fa-wand-magic-sparkles'
          },
          marketing: {
            title: 'Promotions, Reviews & Broadcasts',
            desc: 'Customer engagement, ratings, and coupon mechanics',
            icon: 'fa-tags'
          },
          system: {
            title: 'System, AI & Communication',
            desc: 'Backend utilities, WhatsApp direct links, and AI tools',
            icon: 'fa-microchip'
          }
        };

        return (
          <div
            key={cat}
            className="bg-[#13131a] rounded-2xl p-4 sm:p-6 border border-purple-900/50 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-900/40">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-300 flex items-center justify-center text-sm font-bold">
                <i className={`fa-solid ${catTitles[cat].icon}`}></i>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">{catTitles[cat].title}</h3>
                <p className="text-xs text-purple-300/70">{catTitles[cat].desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {items.map((feat) => {
                const isEnabled = featureToggles[feat.key] !== false;
                return (
                  <div
                    key={feat.key}
                    onClick={() => onUpdateToggle(feat.key, !isEnabled)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isEnabled
                        ? 'border-purple-600/60 bg-[#181326] hover:border-purple-400 shadow-md shadow-purple-950/30'
                        : 'border-purple-950/60 bg-[#0d0d14] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm transition-colors ${
                          isEnabled
                            ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-900/40'
                            : 'bg-[#1a1a24] text-purple-400/50 border border-purple-900/40'
                        }`}
                      >
                        <i className={`fa-solid ${feat.icon}`}></i>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {feat.title}
                          </h4>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isEnabled
                                ? 'bg-purple-900/70 text-purple-200 border border-purple-600/40'
                                : 'bg-[#1a1a24] text-purple-400/60'
                            }`}
                          >
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-300/70 mt-1 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <div
                      className="shrink-0 flex flex-col items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        onClick={() => onUpdateToggle(feat.key, !isEnabled)}
                        className={`relative inline-flex h-7 w-13 items-center rounded-full border transition-all duration-200 cursor-pointer ${
                          isEnabled
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 shadow-md shadow-emerald-950/50'
                            : 'bg-[#1f1f2e] border-purple-800/50'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider ${
                          isEnabled ? 'text-emerald-400' : 'text-purple-400/50'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
