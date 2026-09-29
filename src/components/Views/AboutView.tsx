import React from 'react';
import { useStore } from '../../context/StoreContext';

const DEFAULT_OWNER_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

export const AboutView: React.FC = () => {
  const { storeInfo, goHome } = useStore();

  const socialPlatforms = [
    {
      key: 'whatsapp',
      show: storeInfo.showWhatsapp !== false,
      url: storeInfo.whatsapp,
      label: 'WhatsApp Channel',
      handle: 'Join Official Broadcast',
      icon: 'fa-brands fa-whatsapp',
      gradient: 'from-emerald-600 to-green-600',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-300'
    },
    {
      key: 'instagram',
      show: storeInfo.showInstagram !== false,
      url: storeInfo.instagram,
      label: 'Instagram',
      handle: '@apexstore.pk',
      icon: 'fa-brands fa-instagram',
      gradient: 'from-pink-600 via-purple-600 to-amber-500',
      border: 'border-pink-500/40 hover:border-pink-400',
      badgeBg: 'bg-pink-500/15 text-pink-300'
    },
    {
      key: 'tiktok',
      show: storeInfo.showTiktok !== false,
      url: storeInfo.tiktok,
      label: 'TikTok Official',
      handle: '@apexstore.pk',
      icon: 'fa-brands fa-tiktok',
      gradient: 'from-cyan-500 to-fuchsia-600',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/15 text-cyan-300'
    },
    {
      key: 'youtube',
      show: storeInfo.showYoutube !== false,
      url: storeInfo.youtube,
      label: 'YouTube Channel',
      handle: 'Reviews & Unboxings',
      icon: 'fa-brands fa-youtube',
      gradient: 'from-red-600 to-rose-600',
      border: 'border-red-500/40 hover:border-red-400',
      badgeBg: 'bg-red-500/15 text-red-300'
    },
    {
      key: 'facebook',
      show: storeInfo.showFacebook !== false,
      url: storeInfo.facebook,
      label: 'Facebook Page',
      handle: 'Community & Drops',
      icon: 'fa-brands fa-facebook',
      gradient: 'from-blue-600 to-indigo-600',
      border: 'border-blue-500/40 hover:border-blue-400',
      badgeBg: 'bg-blue-500/15 text-blue-300'
    },
    {
      key: 'telegram',
      show: storeInfo.showTelegram !== false,
      url: storeInfo.telegram,
      label: 'Telegram Channel',
      handle: 'Instant Deal Alerts',
      icon: 'fa-brands fa-telegram',
      gradient: 'from-sky-500 to-blue-600',
      border: 'border-sky-500/40 hover:border-sky-400',
      badgeBg: 'bg-sky-500/15 text-sky-300'
    },
    {
      key: 'twitter',
      show: storeInfo.showTwitter !== false,
      url: storeInfo.twitter,
      label: 'X / Twitter',
      handle: 'Official Updates',
      icon: 'fa-brands fa-x-twitter',
      gradient: 'from-purple-600 to-slate-700',
      border: 'border-purple-500/40 hover:border-purple-400',
      badgeBg: 'bg-purple-500/15 text-purple-300'
    }
  ].filter((p) => p.show && p.url && p.url.trim().length > 0);

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-[#13131a] rounded-3xl p-5 sm:p-8 shadow-2xl border border-purple-900/50 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-300 bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/50">
            <i className="fa-solid fa-crown text-amber-400" />
            Verified Founder &amp; Store Profile
          </span>
          <button
            onClick={goHome}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 bg-purple-950/40 hover:bg-purple-900/50 px-3 py-1.5 rounded-xl border border-purple-800/40 transition cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left" /> Back to Store
          </button>
        </div>

        {/* Owner Hero Profile Card */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1b1429] via-[#14111f] to-[#0d0d14] border border-purple-700/40 shadow-xl mb-6">
          {storeInfo.showOwnerPhoto !== false && (
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-purple-400/60 shadow-2xl shadow-purple-950/90 bg-[#0a0a0f]">
                <img
                  src={storeInfo.ownerPhoto || DEFAULT_OWNER_PHOTO}
                  alt={storeInfo.owner || 'Store Founder'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_OWNER_PHOTO;
                  }}
                />
              </div>
              <span
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-sm font-black shadow-lg border-2 border-[#13131a]"
                title="Verified Owner"
              >
                <i className="fa-solid fa-check" />
              </span>
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Authentic Merchant
            </div>

            {storeInfo.showOwnerName !== false && (
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {storeInfo.owner || 'Anees Abid'}
              </h2>
            )}

            <p className="text-xs sm:text-sm font-bold text-purple-300 mt-0.5">
              {storeInfo.ownerRole || 'Founder & Chief Executive Officer'} • {storeInfo.name || 'ApexStore'}
            </p>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed mt-3">
              {storeInfo.ownerBio ||
                'Welcome to ApexStore — your premier destination for flagship audio, wearables, and next-gen tech accessories with direct founder verification and instant digital & physical delivery.'}
            </p>
          </div>
        </div>

        {/* Direct Contact Information Grid (Gmail, Phone Number, Location) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          {storeInfo.showEmail !== false && storeInfo.email && (
            <a
              href={`mailto:${storeInfo.email}`}
              className="p-4 rounded-2xl bg-[#0d0d14] hover:bg-[#181326] border border-purple-900/50 hover:border-purple-500/50 transition group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <i className="fa-solid fa-envelope text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Official Gmail</p>
                <p className="text-xs sm:text-sm font-black text-white truncate mt-0.5">{storeInfo.email}</p>
              </div>
            </a>
          )}

          {storeInfo.showPhone !== false && storeInfo.phone && (
            <a
              href={`tel:${storeInfo.phone}`}
              className="p-4 rounded-2xl bg-[#0d0d14] hover:bg-[#181326] border border-purple-900/50 hover:border-emerald-500/50 transition group flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <i className="fa-solid fa-phone text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Direct Number</p>
                <p className="text-xs sm:text-sm font-black text-white truncate mt-0.5">{storeInfo.phone}</p>
              </div>
            </a>
          )}

          {storeInfo.showCity !== false && storeInfo.city && (
            <div className="p-4 rounded-2xl bg-[#0d0d14] border border-purple-900/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950/60 border border-fuchsia-700/40 text-fuchsia-300 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-location-dot text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">Headquarters</p>
                <p className="text-xs sm:text-sm font-black text-white truncate mt-0.5">{storeInfo.city}</p>
              </div>
            </div>
          )}
        </div>

        {/* Official Social Platforms & Channels */}
        {socialPlatforms.length > 0 && (
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-200 flex items-center gap-2">
                <i className="fa-solid fa-share-nodes text-purple-400" />
                <span>Connect on Official Platforms &amp; Channels</span>
              </h3>
              <span className="text-[10px] font-bold text-purple-400">
                {socialPlatforms.length} Active {socialPlatforms.length === 1 ? 'Channel' : 'Channels'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialPlatforms.map((plat) => (
                <a
                  key={plat.key}
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-[#0d0d14] hover:bg-[#171224] border transition-all group ${plat.border}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${plat.gradient} text-white flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition shrink-0`}
                    >
                      <i className={plat.icon} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-white truncate">{plat.label}</p>
                      <p className="text-[11px] text-purple-300/70 truncate">{plat.handle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${plat.badgeBg}`}>
                    <span>Open</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
