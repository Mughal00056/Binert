import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatPKR, filterProductsByTag } from '../../utils/helpers';

export const AllProductsView: React.FC = () => {
  const {
    visibleProducts,
    allViewTitle,
    allViewFilter,
    categories,
    goHome,
    setQuickViewProduct,
    addToCart,
    cart
  } = useStore();

  const [selectedFilter, setSelectedFilter] = useState<string>(allViewFilter || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filtered = filterProductsByTag(visibleProducts, selectedFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
            <button onClick={goHome} className="hover:text-white transition cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-white">{allViewTitle || 'Catalog'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {allViewTitle || 'All Products'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
            className="bg-[#13131a] border border-purple-900/50 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-purple-400"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              selectedFilter.toLowerCase() === cat.filter.toLowerCase()
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                : 'bg-[#13131a] text-purple-300/80 hover:text-white border border-purple-900/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-[#13131a] rounded-3xl border border-purple-900/30 p-8">
          <i className="fa-solid fa-box-open text-4xl text-purple-400 mb-3 block" />
          <h3 className="text-lg font-black text-white">No Products Found</h3>
          <p className="text-xs text-purple-300/70 mt-1">Try selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
          {sorted.map((p) => {
            const inCart = cart.some((i) => i.id === p.id);
            return (
              <div
                key={p.id}
                onClick={() => setQuickViewProduct(p)}
                className="product-card-3d bg-[#13131a] rounded-2xl overflow-hidden border border-purple-900/40 shadow-lg cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-[#1a1a24]">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {p.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between min-w-0">
                  <div className="min-w-0">
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1 truncate">
                      {p.category}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2 group-hover:text-purple-300 transition break-words">
                      {p.name}
                    </h3>
                    <div className="text-sm sm:text-base font-black text-purple-300 mt-1.5 truncate">
                      {formatPKR(p.price)}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-purple-900/30 w-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p.id, e);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        inCart
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-[#1a1a24] hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-800/60'
                      }`}
                    >
                      <i className={`fa-solid ${inCart ? 'fa-check' : 'fa-cart-plus'} text-[11px]`} />
                      <span>{inCart ? 'ADDED' : 'ADD TO CART'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
