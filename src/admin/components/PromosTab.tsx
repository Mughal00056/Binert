import React from 'react';
import { Promo } from '../../types/store';

interface PromosTabProps {
  promos: Promo[];
  onAddPromo: () => void;
  onEditPromo: (promo: Promo, index: number) => void;
  onDeletePromo: (index: number) => void;
  onToggleActive: (index: number, active: boolean) => void;
}

export const PromosTab: React.FC<PromosTabProps> = ({
  promos,
  onAddPromo,
  onEditPromo,
  onDeletePromo,
  onToggleActive
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-tags text-amber-500"></i> Promotional Discount Codes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create coupon codes with custom discounts for marketing campaigns
          </p>
        </div>
        <button
          onClick={onAddPromo}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-amber-200"
        >
          <i className="fa-solid fa-plus"></i> Add Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <i className="fa-solid fa-tags text-4xl mb-3 text-slate-300 block"></i>
          <p className="font-bold text-slate-700">No promo codes created</p>
          <p className="text-xs text-slate-400 mt-1">Create your first discount coupon above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo, idx) => {
            const discountPercent = Math.round(promo.discount * 100);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 admin-card shadow-xs relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`status-badge ${
                        promo.active !== false ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {promo.active !== false ? 'Active' : 'Disabled'}
                    </span>
                    {promo.badge && (
                      <span className="status-badge bg-amber-100 text-amber-800">
                        {promo.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditPromo(promo, idx)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Promo"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePromo(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Promo"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>

                {/* Promo Code & Discount */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-wider">
                      {promo.code}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-600 mt-1">
                    {discountPercent}% DISCOUNT
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {promo.desc || `${discountPercent}% off total cart`}
                  </p>
                </div>

                {/* Bottom toggle switch */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Enable in Checkout</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={promo.active !== false}
                      onChange={(e) => onToggleActive(idx, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
