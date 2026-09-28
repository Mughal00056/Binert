import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types/store';

interface StoreSettingsTabProps {
  settings?: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const StoreSettingsTab: React.FC<StoreSettingsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [form, setForm] = useState<StoreSettings>({
    name: 'ApexStore',
    owner: 'Anees Abid',
    email: 'ownerofapexstore@gmail.com',
    phone: '+92 345 5724552',
    city: 'Rawalpindi / Islamabad',
    whatsapp: 'https://whatsapp.com/channel/apexstore'
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
          <i className="fa-solid fa-gear text-indigo-600"></i> Store Identity & General Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure branding, owner details, contact credentials, and customer support channels
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Brand / Store Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Store Owner Full Name
            </label>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Official Support Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Customer Care Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Headquarters / Operating City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              WhatsApp Channel / Chat Link
            </label>
            <input
              type="url"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-mono text-xs transition"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Save Store Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
};
