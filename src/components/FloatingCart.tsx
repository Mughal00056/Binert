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
    currentView === 'home' &&
    !cartDrawerOpen &&
    !paymentModalOpen &&
    !quickViewProduct &&
    !receiptOrder;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ${
        bumping ? 'scale-105' : 'scale-100 hover:scale-[1.03]'
      }`}
    >
      <button
        onClick={() => setCartDrawerOpen(true)}
        className="flex items-center gap-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 text-white pl-3.5 pr-5 py-3 rounded-full shadow-[0_12px_36px_rgba(168,85,247,0.55)] cursor-pointer active:scale-95 transition-all border border-purple-400/40 min-w-[270px] sm:min-w-[310px]"
      >
        {/* Stacked Product Thumbnails */}
        <div className="flex items-center">
          {cart.slice(0, 3).map((item, idx) => (
            <img
              key={item.id}
              src={item.image}
              alt={item.name}
              className={`w-9 h-9 rounded-full object-cover border-2 border-white pointer-events-none shadow-sm ${
                idx > 0 ? '-ml-3.5' : ''
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
          className={`bg-white/25 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border border-white/40 shadow-inner transition-transform ${
            bumping ? 'scale-125 bg-white text-purple-900' : ''
          }`}
        >
          {cartCount}
        </div>

        {/* View Cart Text */}
        <span className="font-black text-xs sm:text-sm tracking-wider uppercase flex-1 text-center select-none">
          VIEW IN CART
        </span>

        {/* Arrow Pill */}
        <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0">
          <i className="fa-solid fa-arrow-right" />
        </div>
      </button>
    </div>
  );
};
