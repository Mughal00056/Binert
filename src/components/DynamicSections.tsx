import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatPKR } from '../utils/helpers';

export const DynamicSections: React.FC = () => {
  const {
    visibleProducts,
    sections,
    globalLayout,
    activeCategory,
    openSectionAllView,
    setQuickViewProduct,
    addToCart,
    cart
  } = useStore();

  const filterProducts = (filter: string): Product[] => {
    if (!filter || filter === 'all') return visibleProducts;
    const f = filter.toLowerCase();
    switch (f) {
      case 'headphone':
        return visibleProducts.filter((p) => p.name.toLowerCase().includes('headphone') || p.category === 'Audio');
      case 'watch':
        return visibleProducts.filter((p) => p.name.toLowerCase().includes('watch') || p.category === 'Wearables');
      case 'shoe':
        return visibleProducts.filter((p) => /shoe|sneaker|loafer/i.test(p.name) || p.category === 'Footwear');
      case 'glasses':
        return visibleProducts.filter((p) => /glass|sunglass/i.test(p.name) || p.category === 'Accessories');
      case 'electronics':
        return visibleProducts.filter((p) => p.category === 'Electronics');
      case 'audio':
        return visibleProducts.filter((p) => p.category === 'Audio');
      case 'wearables':
        return visibleProducts.filter((p) => p.category === 'Wearables');
      case 'accessories':
        return visibleProducts.filter((p) => p.category === 'Accessories');
      case 'footwear':
        return visibleProducts.filter((p) => p.category === 'Footwear');
      default:
        return visibleProducts.filter(
          (p) => p.category.toLowerCase().includes(f) || p.name.toLowerCase().includes(f)
        );
    }
  };

  const renderProductCard = (p: Product, isHorizontal: boolean) => {
    const inCart = cart.some((i) => i.id === p.id);

    if (isHorizontal) {
      return (
        <div
          key={p.id}
          onClick={() => setQuickViewProduct(p)}
          className="product-card-3d min-w-[165px] max-w-[165px] sm:min-w-[185px] sm:max-w-[185px] shrink-0 bg-[#13131a] rounded-2xl overflow-hidden border border-purple-900/40 shadow-lg cursor-pointer flex flex-col justify-between group"
        >
          <div className="relative w-full aspect-video overflow-hidden bg-[#1a1a24]">
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
              }}
            />
            {p.badge && (
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md animate-pulse">
                {p.badge}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#13131a] via-transparent to-transparent opacity-60" />
          </div>

          <div className="p-3 flex flex-col flex-1 justify-between min-w-0">
            <div className="min-w-0">
              <div className="text-xs font-black text-white leading-snug mb-1 line-clamp-2 min-h-[32px] group-hover:text-purple-300 transition-colors break-words">
                {p.name}
              </div>
              <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">
                {p.category}
              </div>
              <div className="text-sm font-black text-purple-300 mb-2 truncate">
                {formatPKR(p.price)}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(p.id, e);
                }}
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold py-1.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer active:scale-90 ${
                  inCart
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/50'
                    : 'bg-[#1a1a24] text-purple-200 border-purple-800/60 hover:bg-purple-900 hover:text-white hover:border-purple-400'
                }`}
              >
                {inCart ? (
                  <>
                    <i className="fa-solid fa-check text-[10px]" /> ADDED
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus text-[10px]" /> ADD
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Vertical Card
    return (
      <div
        key={p.id}
        onClick={() => setQuickViewProduct(p)}
        className="product-card-3d bg-[#13131a] rounded-2xl overflow-hidden border border-purple-900/40 shadow-lg cursor-pointer flex flex-col justify-between group max-w-full"
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1a1a24]">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
            }}
          />
          {p.badge && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md animate-pulse">
              {p.badge}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131a] via-transparent to-transparent opacity-50" />
        </div>

        <div className="p-3.5 flex flex-col flex-1 justify-between min-w-0">
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-white leading-snug mb-1.5 line-clamp-2 min-h-[34px] group-hover:text-purple-300 transition-colors break-words">
              {p.name}
            </div>
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">
              {p.category}
            </div>
            <div className="text-base font-black text-purple-300 mb-2.5 truncate">
              {formatPKR(p.price)}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-purple-900/20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p.id, e);
              }}
              className={`inline-flex items-center gap-1.5 text-xs font-black py-2 px-4 rounded-xl border transition-all duration-200 cursor-pointer active:scale-90 ${
                inCart
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/50'
                  : 'bg-[#1a1a24] text-purple-200 border-purple-800/60 hover:bg-purple-900 hover:text-white hover:border-purple-400'
              }`}
            >
              {inCart ? (
                <>
                  <i className="fa-solid fa-check text-xs" /> ADDED
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus text-xs" /> ADD
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If a specific category is selected (not 'all')
  if (activeCategory !== 'all') {
    const filtered = filterProducts(activeCategory);
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 pb-16 section-fade-up w-full overflow-hidden">
        <div className="flex justify-between items-center px-1 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeCategory.toUpperCase()} PRODUCTS
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-purple-400">
            <i className="fa-solid fa-box-open text-5xl mb-3 text-purple-500" />
            <p className="font-bold text-white">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 w-full">
            {filtered.map((p) => renderProductCard(p, false))}
          </div>
        )}
      </div>
    );
  }

  // Multi-section home layout
  const activeSections = sections
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  if (activeSections.length === 0) {
    return (
      <div className="text-center py-20 text-purple-400">
        <i className="fa-solid fa-box-open text-5xl mb-3 text-purple-500" />
        <p className="font-bold text-white">No products available yet</p>
        <p className="text-xs text-purple-400/80 mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="pb-16 w-full overflow-hidden">
      {activeSections.map((section) => {
        const items = filterProducts(section.filter);
        if (items.length === 0) return null;

        const effectiveLayout = section.layout || globalLayout || 'horizontal';
        const isHorizontal = effectiveLayout === 'horizontal';

        return (
          <div key={section.id} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 section-fade-up w-full">
            <div className="flex justify-between items-center px-1 mb-3.5">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-500 to-fuchsia-500 rounded-full" />
                <span>{section.title}</span>
              </h2>
              <button
                type="button"
                onClick={() => openSectionAllView(section.filter, section.title)}
                className="text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>View all</span>
                <i className="fa-solid fa-arrow-right text-[10px] sm:text-[11px]" />
              </button>
            </div>

            {isHorizontal ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar max-w-full">
                {items.map((p) => renderProductCard(p, true))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-5 w-full">
                {items.map((p) => renderProductCard(p, false))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
