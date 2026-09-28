import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, cart } = useStore();

  if (!quickViewProduct) return null;

  const inCart = cart.some((i) => i.id === quickViewProduct.id);

  const handleClose = () => {
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#13131a] rounded-3xl overflow-hidden border border-purple-900/50 shadow-2xl shadow-purple-950/80 my-auto flex flex-col max-h-[92vh] animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-purple-900/40 bg-[#161622] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Product Overview
            </span>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1a1a24] hover:bg-purple-900/60 text-purple-300 hover:text-white flex items-center justify-center shadow transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Container */}
            <div className="bg-[#1a1a24] rounded-2xl p-4 sm:p-6 flex items-center justify-center relative overflow-hidden group">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="rounded-xl max-h-56 sm:max-h-64 object-cover shadow-lg pointer-events-none group-hover:scale-105 transition-transform duration-300"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                }}
              />
              {quickViewProduct.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md">
                  {quickViewProduct.badge}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">
                  {quickViewProduct.category}
                </span>
                <h2 className="text-base sm:text-lg font-black text-white mb-3 leading-snug break-words">
                  {quickViewProduct.name}
                </h2>

                <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed mb-4 break-words">
                  {quickViewProduct.description || 'Engineered with pinnacle luxury craftsmanship, precision acoustics, and premium durability.'}
                </p>

                {/* Authenticity Badge */}
                <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/40 text-[11px] text-purple-200">
                  <i className="fa-solid fa-certificate text-purple-400" />
                  <span className="font-semibold">100% Guaranteed Authentic • Insured Nationwide Delivery</span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-900/30">
                <div className="text-xl sm:text-2xl font-black text-purple-300 mb-4 flex items-baseline gap-2">
                  <span>{formatPKR(quickViewProduct.price)}</span>
                  {quickViewProduct.oldPrice && (
                    <span className="text-xs text-purple-400/60 line-through font-normal">
                      {formatPKR(quickViewProduct.oldPrice)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    addToCart(quickViewProduct.id, e);
                  }}
                  className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-[0.98] ${
                    inCart
                      ? 'bg-purple-600 text-white'
                      : 'bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white shadow-purple-900/50'
                  }`}
                >
                  <i className={`fa-solid ${inCart ? 'fa-check' : 'fa-cart-plus'}`} />
                  <span>{inCart ? 'ADDED TO CART' : 'ADD TO CART'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
