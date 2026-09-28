import React, { useState, useEffect } from 'react';
import { AnnouncementSettings } from '../../types/store';

interface AnnouncementsTabProps {
  settings?: AnnouncementSettings;
  onSaveSettings: (settings: AnnouncementSettings) => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [form, setForm] = useState<AnnouncementSettings>({
    offerText: 'FLASH SALE: GET UP TO 30% OFF ON PREMIUM AUDIO GEAR',
    offerCode: 'APEX30',
    offerDiscount: 30,
    marqueeShipping: 'Free Delivery Nationwide on Orders Over Rs. 5,000',
    marqueeNewArrivals: 'New Autumn Collection 2026 Dropped Today',
    marqueeReviews: 'Over 5,000+ Happy Customers with 4.9 Star Rating'
  });

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-rose-500"></i> Storefront Banners & Announcements
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure top ticker marquee text, promotional flash offers, and discount banners
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Marquee Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i> Marquee Ticker Highlights
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-truck-fast text-emerald-500"></i> Delivery Ticker
              </label>
              <input
                type="text"
                value={form.marqueeShipping}
                onChange={(e) => setForm({ ...form, marqueeShipping: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-gem text-purple-500"></i> Collection / Drop Ticker
              </label>
              <input
                type="text"
                value={form.marqueeNewArrivals}
                onChange={(e) => setForm({ ...form, marqueeNewArrivals: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-star text-amber-400"></i> Social Proof / Reviews Ticker
              </label>
              <input
                type="text"
                value={form.marqueeReviews}
                onChange={(e) => setForm({ ...form, marqueeReviews: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Special Flash Banner Offer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-tags text-rose-500"></i> Special Flash Offer Bar
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Flash Banner Headline
              </label>
              <input
                type="text"
                value={form.offerText}
                onChange={(e) => setForm({ ...form, offerText: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-bold transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Attached Promo Code
                </label>
                <input
                  type="text"
                  value={form.offerCode}
                  onChange={(e) => setForm({ ...form, offerCode: e.target.value.toUpperCase() })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono uppercase font-black focus:border-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.offerDiscount}
                  onChange={(e) => setForm({ ...form, offerDiscount: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 mt-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1">
                Storefront Banner Preview
              </p>
              <p className="text-xs font-black text-slate-900">
                {form.offerText} — USE CODE{' '}
                <span className="font-mono text-rose-600 underline">{form.offerCode}</span> FOR{' '}
                {form.offerDiscount}% OFF!
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Save All Announcement Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
