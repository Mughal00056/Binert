import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

interface FrontAdSlide {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  highlight: string;
  description: string;
  promoCode?: string;
  categoryTarget?: string;
  imageUrl: string;
  ctaText: string;
  ctaAction: 'promo' | 'category' | 'scroll';
}

const FRONT_ADS: FrontAdSlide[] = [
  {
    id: 1,
    badge: '🔥 SPONSORED FRONT AD',
    badgeColor: 'from-amber-500 to-rose-600',
    title: 'SUMMER TECH FEST',
    highlight: 'UP TO 40% OFF',
    description: 'Sony WH-1000XM5, Bose QuietComfort Ultra & Apple AirPods Max with insured nationwide delivery.',
    categoryTarget: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'SHOP AUDIO TECH',
    ctaAction: 'category'
  },
  {
    id: 2,
    badge: '⚡ FLASH PROMO AD',
    badgeColor: 'from-purple-600 to-fuchsia-600',
    title: 'EXCLUSIVE PROMO CODE',
    highlight: 'FLAT 20% OFF',
    description: 'Use coupon code APEX20 on checkout with EasyPaisa, JazzCash, or Bank Transfer for instant savings.',
    promoCode: 'APEX20',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'APPLY APEX20 (20% OFF)',
    ctaAction: 'promo'
  },
  {
    id: 3,
    badge: '👑 LUXURY DROP',
    badgeColor: 'from-emerald-500 to-cyan-600',
    title: 'TITANIUM WEARABLES',
    highlight: 'FLAGSHIP SERIES',
    description: 'Apple Watch Ultra 2 & Garmin Fenix 7 Pro Sapphire. Built for the rugged extreme with instant GPS.',
    categoryTarget: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'EXPLORE WEARABLES',
    ctaAction: 'category'
  }
];

export const BannerSection: React.FC = () => {
  const { bannerImage, applyPromoCode, setCartDrawerOpen, openSectionAllView } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play front ads carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FRONT_ADS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = FRONT_ADS[currentSlide];

  const handleCta = (ad: FrontAdSlide) => {
    if (ad.ctaAction === 'promo' && ad.promoCode) {
      applyPromoCode(ad.promoCode);
      setCartDrawerOpen(true);
    } else if (ad.ctaAction === 'category' && ad.categoryTarget) {
      openSectionAllView(ad.categoryTarget, `${ad.categoryTarget} Collection`);
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative bg-black border-b border-purple-900/40 w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Front Ad Hero Container */}
      <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px] w-full flex items-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage || slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover pointer-events-none transition-all duration-700 ease-out scale-105"
            draggable={false}
          />
          {/* Multi-directional Dark Vignette Overlay for Crisp Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/60 z-10" />
        </div>

        {/* Content Box */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Front Ad Badge & Tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${slide.badgeColor} shadow-md`}>
                {slide.badge}
              </span>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest hidden xs:inline">
                Verified Apex Promotion
              </span>
            </div>

            {/* Ad Heading */}
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-1 drop-shadow-md">
              {slide.title}{' '}
              <span className="bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent block sm:inline">
                {slide.highlight}
              </span>
            </h2>

            {/* Ad Description */}
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed mb-4 max-w-md line-clamp-2 drop-shadow">
              {slide.description}
            </p>

            {/* Front Ad Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCta(slide)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-900/60 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{slide.ctaText}</span>
                <i className="fa-solid fa-arrow-right text-[11px]" />
              </button>

              {slide.promoCode && (
                <button
                  type="button"
                  onClick={() => {
                    applyPromoCode(slide.promoCode!);
                    setCartDrawerOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-purple-500/40 text-purple-200 font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Click to apply promo code"
                >
                  <i className="fa-solid fa-ticket text-amber-300 text-xs" />
                  <span>CODE: <strong className="text-white">{slide.promoCode}</strong></span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Prev / Next Controls */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + FRONT_ADS.length) % FRONT_ADS.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-purple-900/80 text-purple-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-purple-800/40 transition cursor-pointer"
          aria-label="Previous Front Ad"
        >
          <i className="fa-solid fa-chevron-left text-xs" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % FRONT_ADS.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-purple-900/80 text-purple-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-purple-800/40 transition cursor-pointer"
          aria-label="Next Front Ad"
        >
          <i className="fa-solid fa-chevron-right text-xs" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {FRONT_ADS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? 'w-6 bg-gradient-to-r from-purple-400 to-fuchsia-400'
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Jump to ad slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
