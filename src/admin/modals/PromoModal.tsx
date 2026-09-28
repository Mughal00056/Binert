import React, { useState, useEffect } from 'react';
import { Promo } from '../../types/store';

interface PromoModalProps {
  isOpen: boolean;
  promo: Promo | null;
  editIndex: number | null;
  onClose: () => void;
  onSave: (promoData: Promo, index: number | null) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  promo,
  editIndex,
  onClose,
  onSave
}) => {
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [desc, setDesc] = useState('');
  const [badge, setBadge] = useState('HOT');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (promo) {
      setCode(promo.code);
      setDiscountPercent(String(Math.round(promo.discount * 100)));
      setDesc(promo.desc || '');
      setBadge(promo.badge || 'HOT');
      setActive(promo.active !== false);
    } else {
      setCode('');
      setDiscountPercent('20');
      setDesc('');
      setBadge('HOT');
      setActive(true);
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    const parsedDisc = (parseFloat(discountPercent) || 20) / 100;

    onSave(
      {
        code: cleanCode,
        discount: parsedDisc,
        desc: desc.trim() || `${discountPercent}% OFF Entire Order`,
        badge,
        badgeType: badge.toLowerCase(),
        active
      },
      editIndex
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              {promo ? 'Edit Promo Code' : 'Create Promo Code'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono uppercase font-black focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono font-bold focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. 20% OFF your entire checkout"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Badge Tag
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-amber-500 transition font-bold"
                >
                  <option value="HOT">HOT</option>
                  <option value="NEW">NEW</option>
                  <option value="PROMO">PROMO</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div>
                  <p className="text-xs font-black text-amber-900">Active Status</p>
                  <p className="text-[10px] text-amber-700">Customers can apply this promo code</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-amber-200"
              >
                <i className="fa-solid fa-floppy-disk mr-2"></i> Save Promo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
