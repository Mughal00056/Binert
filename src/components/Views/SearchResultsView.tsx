import React from 'react';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/helpers';

export const SearchResultsView: React.FC = () => {
  const {
    visibleProducts,
    searchQuery,
    setSearchQuery,
    goHome,
    setQuickViewProduct,
    addToCart,
    cart
  } = useStore();

  const q = searchQuery.trim().toLowerCase();
  const results = q
    ? visibleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    : visibleProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
            <button onClick={goHome} className="hover:text-white transition cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-white">Search Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {q ? `Results for "${searchQuery}"` : 'Search Catalog'}
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">{results.length} matching products found</p>
        </div>

        <div className="relative max-w-xs w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#13131a] border border-purple-900/50 text-xs text-white outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-[#13131a] rounded-3xl border border-purple-900/30 p-8 mt-6">
          <i className="fa-solid fa-magnifying-glass text-4xl text-purple-400 mb-3 block" />
          <h3 className="text-lg font-black text-white">No Matching Products</h3>
          <p className="text-xs text-purple-300/70 mt-1">Try searching with a different keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {results.map((p) => {
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
                  />
                </div>
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">
                      {p.category}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2">{p.name}</h3>
                  </div>
                  <div className="pt-3 mt-2 border-t border-purple-900/30 flex items-center justify-between">
                    <span className="text-sm font-black text-purple-300">{formatPKR(p.price)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p.id, e);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                        inCart
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#1a1a24] hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-800/60'
                      }`}
                    >
                      {inCart ? 'Added' : '+ Add'}
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
