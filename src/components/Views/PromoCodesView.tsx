import React from 'react';
import { useStore } from '../../context/StoreContext';
import { copyToClipboard } from '../../utils/helpers';

export const PromoCodesView: React.FC = () => {
  const { promoCodes, goHome, applyPromoCode, showToast } = useStore();

  const activePromos = promoCodes.filter((p) => p.active);

  const handleCopyAndApply = async (code: string) => {
    await copyToClipboard(code);
    applyPromoCode(code);
    showToast(`Promo code ${code} copied & applied!`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="pb-6 border-b border-purple-900/40">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
          <button onClick={goHome} className="hover:text-white transition cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-white">Promo Codes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <i className="fa-solid fa-ticket text-purple-400" />
          <span>Active Vouchers &amp; Discounts</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {activePromos.map((promo) => (
          <div
            key={promo.code}
            className="p-5 rounded-3xl bg-[#13131a] border border-purple-800/50 flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-4 min-w-0">
              {promo.image ? (
                <img
                  src={promo.image}
                  alt={promo.code}
                  className="w-16 h-16 rounded-2xl object-cover border border-purple-600/50 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300 text-xl font-black shrink-0">
                  {promo.discount}%
                </div>
              )}
              <div className="min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-600 text-white">
                  Save {promo.discount}%
                </span>
                <h3 className="text-base font-black font-mono text-white mt-1 truncate">{promo.code}</h3>
                <p className="text-xs text-purple-300/80 truncate">{promo.desc}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyAndApply(promo.code)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
