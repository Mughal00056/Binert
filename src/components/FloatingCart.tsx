import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const FloatingCart: React.FC = () => {
  const {
    cart,
    cartCount,
    setCartDrawerOpen,
    currentView,
    cartDrawerOpen,
    paymentModalOpen,
    quickViewProduct,
    receiptOrder
  } = useStore();

  const [bumping, setBumping] = useState(false);

  // Trigger smooth, refined bounce whenever item is added
  useEffect(() => {
    if (cartCount === 0) return;
    setBumping(true);
    const timer = setTimeout(() => setBumping(false), 500);
    return () => clearTimeout(timer);
  }, [cartCount]);

  const isVisible =
    cart.length > 0 &&
    (currentView === 'home' || currentView === 'all' || currentView === 'search') &&
    !cartDrawerOpen &&
    !paymentModalOpen &&
    !quickViewProduct &&
    !receiptOrder;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex justify-center px-16 sm:px-6 pointer-events-none">
      <button
        type="button"
        onClick={() => setCartDrawerOpen(true)}
        className={`pointer-events-auto flex items-center justify-between gap-2 sm:gap-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 text-white pl-2.5 pr-3.5 py-2.5 sm:pl-3.5 sm:pr-5 sm:py-3 rounded-full shadow-[0_12px_36px_rgba(168,85,247,0.55)] cursor-pointer active:scale-95 transition-all duration-300 border border-purple-400/40 w-full max-w-[240px] sm:max-w-[310px] ${
          bumping ? 'scale-[1.03]' : 'scale-100 hover:scale-[1.02]'
        }`}
      >
        {/* Stacked Product Thumbnails */}
        <div className="flex items-center shrink-0">
          {cart.slice(0, 3).map((item, idx) => (
            <img
              key={item.id}
              src={item.image}
              alt={item.name}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white pointer-events-none shadow-sm ${
                idx > 0 ? '-ml-2.5 sm:-ml-3.5' : ''
              }`}
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120';
              }}
            />
          ))}
        </div>

        {/* Dynamic Item Count Badge */}
        <div
          className={`bg-white/25 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[11px] sm:text-xs border border-white/40 shadow-inner shrink-0 transition-transform ${
            bumping ? 'scale-110 bg-white text-purple-900' : ''
          }`}
        >
          {cartCount}
        </div>

        {/* View Cart Text */}
        <span className="font-black text-[11px] sm:text-sm tracking-wider uppercase flex-1 text-center truncate select-none">
          VIEW CART
        </span>

        {/* Arrow Pill */}
        <div className="bg-white/20 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs shrink-0">
          <i className="fa-solid fa-arrow-right" />
        </div>
      </button>
    </div>
  );
};
