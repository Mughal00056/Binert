import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types/store';

interface StoreSettingsTabProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

const DEFAULT_OWNER_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

export const StoreSettingsTab: React.FC<StoreSettingsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [form, setForm] = useState<StoreSettings>({
    name: settings.name || 'ApexStore',
    owner: settings.owner || 'Anees Abid',
    ownerPhoto: settings.ownerPhoto || DEFAULT_OWNER_PHOTO,
    ownerRole: settings.ownerRole || 'Founder & Chief Executive Officer',
    ownerBio:
      settings.ownerBio ||
      'Curating flagship audio, next-gen wearables, and verified digital & physical tech gear across Pakistan with 100% authentic merchant guarantee.',
    email: settings.email || 'aneesabid0012@gmail.com',
    phone: settings.phone || '+92 300 1234567',
    city: settings.city || 'Azad Kashmir, Pakistan',
    whatsapp: settings.whatsapp || 'https://whatsapp.com/channel/0029VbApexStore',
    instagram: settings.instagram || 'https://instagram.com/apexstore.pk',
    tiktok: settings.tiktok || 'https://tiktok.com/@apexstore.pk',
    youtube: settings.youtube || 'https://youtube.com/@apexstore',
    facebook: settings.facebook || 'https://facebook.com/apexstore.pk',
    telegram: settings.telegram || 'https://t.me/apexstore',
    twitter: settings.twitter || 'https://x.com/apexstore',
    showOwnerPhoto: settings.showOwnerPhoto !== false,
    showOwnerName: settings.showOwnerName !== false,
    showEmail: settings.showEmail !== false,
    showPhone: settings.showPhone !== false,
    showCity: settings.showCity !== false,
    showWhatsapp: settings.showWhatsapp !== false,
    showInstagram: settings.showInstagram !== false,
    showTiktok: settings.showTiktok !== false,
    showYoutube: settings.showYoutube !== false,
    showFacebook: settings.showFacebook !== false,
    showTelegram: settings.showTelegram !== false,
    showTwitter: settings.showTwitter !== false
  });

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...prev,
        ...settings,
        ownerPhoto: settings.ownerPhoto || prev.ownerPhoto || DEFAULT_OWNER_PHOTO,
        showOwnerPhoto: settings.showOwnerPhoto !== false,
        showOwnerName: settings.showOwnerName !== false,
        showEmail: settings.showEmail !== false,
        showPhone: settings.showPhone !== false,
        showCity: settings.showCity !== false,
        showWhatsapp: settings.showWhatsapp !== false,
        showInstagram: settings.showInstagram !== false,
        showTiktok: settings.showTiktok !== false,
        showYoutube: settings.showYoutube !== false,
        showFacebook: settings.showFacebook !== false,
        showTelegram: settings.showTelegram !== false,
        showTwitter: settings.showTwitter !== false
      }));
    }
  }, [settings]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const next = { ...form, ownerPhoto: reader.result };
        setForm(next);
        onSaveSettings(next);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleVisibility = (key: keyof StoreSettings) => {
    const next = { ...form, [key]: form[key] === false ? true : false };
    setForm(next);
    onSaveSettings(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
  };

  const renderSwitch = (key: keyof StoreSettings, label?: string) => {
    const isOn = form[key] !== false;
    return (
      <button
        type="button"
        onClick={() => toggleVisibility(key)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition cursor-pointer ${
          isOn
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        {label ? `${label}: ` : ''}
        {isOn ? 'VISIBLE ON ABOUT' : 'HIDDEN'}
      </button>
    );
  };

  const platforms: Array<{
    field: keyof StoreSettings;
    toggle: keyof StoreSettings;
    label: string;
    icon: string;
    brandColor: string;
    placeholder: string;
  }> = [
    {
      field: 'whatsapp',
      toggle: 'showWhatsapp',
      label: 'WhatsApp Channel / Number Link',
      icon: 'fa-brands fa-whatsapp',
      brandColor: 'text-emerald-400',
      placeholder: 'https://whatsapp.com/channel/...'
    },
    {
      field: 'instagram',
      toggle: 'showInstagram',
      label: 'Instagram Profile URL',
      icon: 'fa-brands fa-instagram',
      brandColor: 'text-pink-400',
      placeholder: 'https://instagram.com/yourprofile'
    },
    {
      field: 'tiktok',
      toggle: 'showTiktok',
      label: 'TikTok Profile URL',
      icon: 'fa-brands fa-tiktok',
      brandColor: 'text-cyan-400',
      placeholder: 'https://tiktok.com/@yourprofile'
    },
    {
      field: 'youtube',
      toggle: 'showYoutube',
      label: 'YouTube Channel URL',
      icon: 'fa-brands fa-youtube',
      brandColor: 'text-red-400',
      placeholder: 'https://youtube.com/@yourchannel'
    },
    {
      field: 'facebook',
      toggle: 'showFacebook',
      label: 'Facebook Page / Profile URL',
      icon: 'fa-brands fa-facebook',
      brandColor: 'text-blue-400',
      placeholder: 'https://facebook.com/yourpage'
    },
    {
      field: 'telegram',
      toggle: 'showTelegram',
      label: 'Telegram Channel URL',
      icon: 'fa-brands fa-telegram',
      brandColor: 'text-sky-400',
      placeholder: 'https://t.me/yourchannel'
    },
    {
      field: 'twitter',
      toggle: 'showTwitter',
      label: 'X (Twitter) Profile URL',
      icon: 'fa-brands fa-x-twitter',
      brandColor: 'text-purple-300',
      placeholder: 'https://x.com/yourhandle'
    }
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#13131a] via-purple-950/60 to-[#13131a] rounded-2xl border border-purple-800/50 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-xl shadow-md">
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              About Owner, Contact &amp; Social Platforms Control
            </h2>
            <p className="text-xs text-purple-300/80">
              Customize Founder Photo, Name, Gmail, Phone &amp; all Social Media links with live ON/OFF switches for the User Panel About page.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSaveSettings(form)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-950/60 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-bolt"></i>
          <span>Save &amp; Sync Live</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dedicated WhatsApp Floating Button URL Card */}
        <div className="bg-[#13131a] rounded-2xl border border-emerald-500/40 p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-base shadow-md">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  WhatsApp Floating Button URL (Storefront Bottom-Left)
                </h3>
                <p className="text-[11px] text-purple-300/80">
                  Set the direct WhatsApp link or number opened when customers click the floating WhatsApp button
                </p>
              </div>
            </div>
            {renderSwitch('showWhatsapp', 'WhatsApp')}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={form.whatsapp || ''}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="https://whatsapp.com/channel/... or https://wa.me/923001234567"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={() => onSaveSettings(form)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save WhatsApp URL</span>
            </button>
          </div>
        </div>

        {/* 1. Owner Photo & Identity Card */}
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-id-badge text-purple-400"></i>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                1. Owner Photo, Name &amp; Bio
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {renderSwitch('showOwnerPhoto', 'Photo')}
              {renderSwitch('showOwnerName', 'Name')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#0d0d14] p-4 rounded-2xl border border-purple-900/40">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-500/50 bg-[#181326] shrink-0 shadow-lg">
              <img
                src={form.ownerPhoto || DEFAULT_OWNER_PHOTO}
                alt={form.owner}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_OWNER_PHOTO;
                }}
              />
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                Owner Profile Photo (URL or Upload Image)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={form.ownerPhoto || ''}
                  onChange={(e) => setForm({ ...form, ownerPhoto: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <label className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shrink-0 transition">
                  <i className="fa-solid fa-camera"></i>
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Store Brand Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Owner / Founder Full Name
              </label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Owner Title / Role
              </label>
              <input
                type="text"
                value={form.ownerRole || ''}
                onChange={(e) => setForm({ ...form, ownerRole: e.target.value })}
                placeholder="Founder & CEO"
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
              About Owner Bio / Mission Statement
            </label>
            <textarea
              rows={2}
              value={form.ownerBio || ''}
              onChange={(e) => setForm({ ...form, ownerBio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 2. Direct Contact Details (Gmail, Phone, City) with ON/OFF Switches */}
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-address-book text-purple-400"></i>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                2. Direct Contact Info (Gmail, Number &amp; City)
              </h3>
            </div>
            <span className="text-[11px] text-purple-400 font-bold">Toggle each ON or OFF</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gmail */}
            <div className="p-4 rounded-2xl bg-[#0d0d14] border border-purple-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white flex items-center gap-1.5">
                  <i className="fa-solid fa-envelope text-purple-400"></i>
                  <span>Official Gmail</span>
                </label>
                {renderSwitch('showEmail')}
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="owner@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Phone Number */}
            <div className="p-4 rounded-2xl bg-[#0d0d14] border border-purple-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white flex items-center gap-1.5">
                  <i className="fa-solid fa-phone text-emerald-400"></i>
                  <span>Phone / WhatsApp No.</span>
                </label>
                {renderSwitch('showPhone')}
              </div>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* City / Location */}
            <div className="p-4 rounded-2xl bg-[#0d0d14] border border-purple-900/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-fuchsia-400"></i>
                  <span>City / Location</span>
                </label>
                {renderSwitch('showCity')}
              </div>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Azad Kashmir, Pakistan"
                className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 3. All Social Platforms (WhatsApp Channel, Instagram, TikTok, YouTube, Facebook, Telegram, X) */}
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-900/40">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-share-nodes text-purple-400"></i>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  3. Social Media &amp; Community Channels (ON / OFF Switches)
                </h3>
                <p className="text-[11px] text-purple-300/70">
                  Turn any social platform ON or OFF in real-time on the Customer About Owner page
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((p) => {
              const isOn = form[p.toggle] !== false;
              return (
                <div
                  key={String(p.field)}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isOn
                      ? 'bg-[#181326] border-purple-600/50 shadow-md shadow-purple-950/30'
                      : 'bg-[#0d0d14] border-purple-950/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className={`${p.icon} ${p.brandColor} text-base`}></i>
                      <span className="text-xs font-black text-white truncate">{p.label}</span>
                    </div>
                    {renderSwitch(p.toggle)}
                  </div>
                  <input
                    type="text"
                    value={String(form[p.field] || '')}
                    onChange={(e) => setForm({ ...form, [p.field]: e.target.value })}
                    placeholder={p.placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-purple-950/60 transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Save All Owner &amp; Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
