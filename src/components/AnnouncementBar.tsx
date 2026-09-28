import React from 'react';
import { useStore } from '../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { announcement, applyPromoCode, setCartDrawerOpen } = useStore();

  const handleApplyPromo = (code: string) => {
    applyPromoCode(code);
    setTimeout(() => {
      setCartDrawerOpen(true);
    }, 250);
  };

  const renderContent = () => (
    <div className="flex items-center shrink-0">
      <div className="promo-image-ring shrink-0 mx-2">
        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80"
          alt="Offer Thumbnail"
          className="promo-img w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-purple-400 pointer-events-none"
          draggable={false}
        />
      </div>

      <span className="bg-gradient-to-r from-purple-700 to-purple-500 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider promo-tag-pulse flex items-center">
        <i className="fa-solid fa-bolt mr-1 promo-bolt" /> SPECIAL OFFER
      </span>

      <span className="text-purple-300 promo-text-slide hidden sm:inline ml-2 text-xs">
        {announcement.specialText}
        <button
          onClick={() => handleApplyPromo(announcement.promoCode)}
          className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-mono font-bold px-2 py-0.5 rounded transition ml-1 border border-purple-500/40 text-[11px] cursor-pointer"
        >
          {announcement.promoCode}
        </button>
      </span>

      <span className="text-purple-500/40 mx-2">|</span>

      <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-purple-300 px-2">
        <i className="fa-solid fa-truck-fast text-purple-400" />
        <span>{announcement.shipping}</span>
      </span>

      <span className="text-purple-500/40 mx-2">|</span>

      <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-purple-300 px-2">
        <i className="fa-solid fa-gem text-purple-400" />
        <span>{announcement.newArrivals}</span>
      </span>

      <span className="text-purple-500/40 mx-2">|</span>

      <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-purple-300 px-2">
        <i className="fa-solid fa-shield-halved text-purple-400" />
        <span>100% Genuine &amp; Insured Delivery</span>
      </span>

      <span className="text-purple-500/40 mx-2">|</span>
    </div>
  );

  return (
    <div className="bg-black text-white text-xs py-2 px-4 shadow-sm border-b border-purple-900/40 overflow-hidden select-none">
      <div className="marquee-track items-center">
        {renderContent()}
        {renderContent()}
      </div>
    </div>
  );
};
