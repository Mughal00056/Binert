import React from 'react';
import { FeatureToggles } from '../../types';

interface FeaturesTabProps {
  featureToggles: FeatureToggles;
  onUpdateToggle: (feature: keyof FeatureToggles, enabled: boolean) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
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
  // Storefront UI
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
  onDisableAll
}) => {
  const activeCount = Object.values(featureToggles).filter(Boolean).length;
  const totalCount = Object.keys(featureToggles).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <i className="fa-solid fa-sliders text-indigo-400"></i>
              Feature Control Center
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Feature Enable / Disable Switches
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Turn any feature ON or OFF in real-time. Changes are instantly synchronized across the live storefront and saved to Firebase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-2xl font-black text-emerald-400">{activeCount} / {totalCount}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">Active Features</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEnableAll}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check-double"></i> Enable All
              </button>
              <button
                onClick={onDisableAll}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/30 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-ban"></i> Disable All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {(['storefront', 'interactive', 'marketing', 'system'] as const).map((cat) => {
        const items = FEATURE_LIST.filter(item => item.category === cat);
        const catTitles: Record<string, { title: string; desc: string; icon: string }> = {
          storefront: {
            title: 'Storefront Layout & Sections',
            desc: 'Visual modules rendered on the customer homepage',
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
          <div key={cat} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                <i className={`fa-solid ${catTitles[cat].icon}`}></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{catTitles[cat].title}</h3>
                <p className="text-xs text-slate-500">{catTitles[cat].desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((feat) => {
                const isEnabled = !!featureToggles[feat.key];
                return (
                  <div
                    key={feat.key}
                    className={`p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                      isEnabled
                        ? 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/60'
                        : 'border-slate-200 bg-slate-50/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm transition-colors ${
                          isEnabled
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <i className={`fa-solid ${feat.icon}`}></i>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {feat.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isEnabled
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <div className="shrink-0 pt-0.5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isEnabled}
                          onChange={(e) => onUpdateToggle(feat.key, e.target.checked)}
                        />
                        <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                      </label>
                      <div className="text-center mt-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isEnabled ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
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
