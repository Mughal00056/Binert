import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

const SUGGESTIONS = [
  'headphone',
  'wireless headphones',
  'earbuds',
  'smartwatch',
  'fitness watch',
  'sneakers',
  'running shoes',
  'sunglasses',
  'keyboard',
  'mouse',
  'speaker',
  'backpack',
  'wallet'
];

export const SearchPanel: React.FC = () => {
  const {
    searchSuggestionsOpen,
    setSearchSuggestionsOpen,
    performSearch,
    visibleProducts,
    setQuickViewProduct
  } = useStore();

  const [inputVal, setInputVal] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search feedback with branded loading animation
  useEffect(() => {
    if (!inputVal.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [inputVal]);

  if (!searchSuggestionsOpen) return null;

  const trimmed = inputVal.trim().toLowerCase();

  const filteredSuggestions = trimmed
    ? SUGGESTIONS.filter((s) => s.includes(trimmed)).slice(0, 6)
    : SUGGESTIONS.slice(0, 5);

  const matchedProducts = trimmed
    ? visibleProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.category.toLowerCase().includes(trimmed)
        )
        .slice(0, 8)
    : [];

  const handleSelectSuggestion = (term: string) => {
    performSearch(term);
  };

  const handleSubmit = () => {
    if (!trimmed) return;
    performSearch(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col animate-[fadeIn_0.2s_ease-out]">
      {/* Top Search Bar */}
      <div className="p-3 sm:p-4 border-b border-purple-900/40 bg-[#13131a] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3 w-full min-w-0">
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-2.5 border-2 border-purple-800 rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-[#0a0a0f] shadow-inner focus-within:border-purple-400 transition">
            <i className="fa-solid fa-magnifying-glass text-purple-400 text-sm shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search products, brands..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 min-w-0 text-xs sm:text-base font-semibold outline-none bg-transparent text-white placeholder-purple-600 truncate"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="text-purple-400 hover:text-purple-300 p-1 cursor-pointer transition shrink-0"
              >
                <i className="fa-solid fa-circle-xmark text-base sm:text-lg" />
              </button>
            )}
            <div className="w-px h-5 sm:h-6 bg-purple-900/80 mx-0.5 sm:mx-1 shrink-0" />
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSearchSuggestionsOpen(false)}
            className="p-1.5 sm:p-2 text-purple-300 hover:text-white rounded-xl transition cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <i className="fa-solid fa-xmark text-xl sm:text-2xl" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* Loading Screen with User's Logo PNG */}
        {isSearching ? (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-[fadeIn_0.15s_ease-out]">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-[#13131a] p-1 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center overflow-hidden animate-pulse">
                <img
                  src={LOGO_URL}
                  alt="ApexStore"
                  className="w-full h-full object-cover rounded-xl"
                  draggable={false}
                />
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-purple-400/40 animate-ping pointer-events-none" />
            </div>
            <div className="text-sm font-black text-white">Searching ApexStore Products...</div>
            <p className="text-xs text-purple-400/70 mt-1">Filtering curated collections</p>
          </div>
        ) : (
          <>
            {/* Suggestions list */}
            {filteredSuggestions.length > 0 && (
              <div className="mb-6">
                <div className="text-[11px] font-black tracking-widest text-purple-400 uppercase mb-3 px-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>TRENDING SUGGESTIONS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredSuggestions.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectSuggestion(term)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#13131a]/60 hover:bg-purple-950/40 text-purple-100 hover:text-white flex items-center gap-3 cursor-pointer transition text-xs sm:text-sm font-semibold border border-purple-900/30"
                    >
                      <i className="fa-solid fa-magnifying-glass text-purple-500 text-xs" />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Products */}
            {trimmed && matchedProducts.length > 0 && (
              <div>
                <div className="text-[11px] font-black tracking-widest text-purple-400 uppercase mb-3 px-2 border-t border-purple-900/30 pt-4 flex items-center justify-between">
                  <span>MATCHING PRODUCTS ({matchedProducts.length})</span>
                  <button
                    onClick={handleSubmit}
                    className="text-purple-400 hover:text-purple-300 text-xs font-bold underline"
                  >
                    View all results
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSearchSuggestionsOpen(false);
                        setQuickViewProduct(p);
                      }}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#13131a] hover:bg-[#1a1a24] transition cursor-pointer border border-purple-900/40 hover:border-purple-500/60 shadow-md"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#0a0a0f] shrink-0 border border-purple-900/30"
                        draggable={false}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          {p.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                          {p.name}
                        </h4>
                        <span className="text-xs sm:text-sm font-black text-purple-300">
                          {formatPKR(p.price)}
                        </span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-purple-400/60 pr-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No match state with logo */}
            {trimmed && matchedProducts.length === 0 && (
              <div className="py-16 text-center text-purple-400">
                <div className="w-16 h-16 rounded-2xl bg-[#13131a] p-1 border border-purple-900/60 mx-auto mb-3 flex items-center justify-center opacity-80">
                  <img src={LOGO_URL} alt="ApexStore" className="w-full h-full object-cover rounded-xl" />
                </div>
                <p className="font-bold text-white text-sm max-w-sm mx-auto break-words">
                  No products found for <span className="text-purple-300 font-mono break-all">"{trimmed}"</span>
                </p>
                <p className="text-xs text-purple-400/70 mt-1">Try another keyword or browse our categories!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
