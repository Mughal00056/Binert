import React, { useState } from 'react';
import { TranscriptSettings } from '../../types/store';
import confetti from 'canvas-confetti';

interface ReceiptTabProps {
  settings: TranscriptSettings;
  onSaveSettings: (settings: TranscriptSettings) => void;
  onResetSettings: () => void;
}

export const ReceiptTab: React.FC<ReceiptTabProps> = ({
  settings,
  onSaveSettings,
  onResetSettings
}) => {
  const [form, setForm] = useState<TranscriptSettings>({ ...settings });

  const handleChange = (field: keyof TranscriptSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch {}
  };

  const handleTestPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-scroll text-purple-600"></i> Verification Receipt & Transcript
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Customize the official order confirmation transcript presented to shoppers after checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-indigo-600"></i> Customize Content
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Receipt Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Payment Receipt"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Receipt Subtitle
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Order Confirmation Transcript"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Congratulatory Note
              </label>
              <input
                type="text"
                value={form.thanks}
                onChange={(e) => handleChange('thanks', e.target.value)}
                placeholder="Thank you for your order! 🎉"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Footer Explanatory Note
              </label>
              <textarea
                rows={2}
                value={form.footer}
                onChange={(e) => handleChange('footer', e.target.value)}
                placeholder="Your payment has been verified..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Verified Badge Text
                </label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  placeholder="Verified"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-bold focus:border-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Watermark Label
                </label>
                <input
                  type="text"
                  value={form.watermark}
                  onChange={(e) => handleChange('watermark', e.target.value)}
                  placeholder="ApexStore Receipt"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50/70 rounded-xl border border-purple-200/70">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.allowDownload}
                  onChange={(e) => handleChange('allowDownload', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="flex-1">
                <p className="text-xs font-black text-purple-900">Allow Customer Download</p>
                <p className="text-[10px] text-purple-600 font-semibold">
                  Customers can save this receipt as an image or PDF
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Save Receipt Settings</span>
              </button>
              <button
                type="button"
                onClick={onResetSettings}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-sm transition"
                title="Reset to defaults"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-eye text-emerald-600"></i> Interactive Receipt Card
              </h3>
              {form.allowDownload && (
                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                >
                  <i className="fa-solid fa-download"></i> Download Simulation
                </button>
              )}
            </div>

            {/* Receipt Container */}
            <div className="transcript-preview shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg text-white font-black shadow-inner">
                    <i className="fa-solid fa-bag-shopping"></i>
                  </div>
                  <div>
                    <div className="text-base font-black tracking-tight">ApexStore</div>
                    <div className="text-[9px] tracking-[2.5px] opacity-75 font-black uppercase">
                      PREMIUM SHOPPING
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow">
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  <span>{form.badge || 'Verified'}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center my-4">
                <div className="tp-header">{form.title || 'Payment Receipt'}</div>
                <div className="tp-sub">{form.subtitle || 'Order Confirmation Transcript'}</div>
              </div>

              {/* Order data mock */}
              <div className="space-y-1 mb-4">
                <div className="transcript-row">
                  <span>Order Reference</span>
                  <span className="font-mono">#APX-78291</span>
                </div>
                <div className="transcript-row">
                  <span>Date & Time</span>
                  <span>28 Sep 2026, 02:45 PM</span>
                </div>
                <div className="transcript-row">
                  <span>Payment Gateway</span>
                  <span>EasyPaisa Verified</span>
                </div>
                <div className="transcript-row">
                  <span>Paid Total</span>
                  <span className="font-black text-sm">Rs. 55,997</span>
                </div>
              </div>

              {/* Thanks & Footer */}
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <div className="text-xs font-black mb-1">{form.thanks || 'Thank you for your order! 🎉'}</div>
                <div className="text-[10px] opacity-85 leading-relaxed whitespace-pre-line">
                  {form.footer || 'Your payment has been verified successfully. Please keep this receipt.'}
                </div>
              </div>

              {/* Watermark */}
              <div className="text-right text-[8px] opacity-60 mt-3 font-mono tracking-widest uppercase">
                {form.watermark || 'ApexStore Official Receipt'}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
            <i className="fa-solid fa-circle-info text-indigo-500 mr-1.5"></i>
            Customers see this dynamic card modal upon completing payment on your store.
          </div>
        </div>
      </div>
    </div>
  );
};
