import React, { useState } from 'react';
import { StoreState, Product } from '../../types/store';
import { formatPKR, filterProductsByTag } from '../../lib/format';

interface StorePreviewModalProps {
  isOpen: boolean;
  state: StoreState;
  onClose: () => void;
}

export const StorePreviewModal: React.FC<StorePreviewModalProps> = ({
  isOpen,
  state,
  onClose
}) => {
  const [cart, setCart] = useState<Array<{ product: Product; qty: number }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const activeSections = state.sections
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  const launchRemaining = Math.max(0, state.launchConfig.secondsLeft || 0);
  const launchM = Math.floor(launchRemaining / 60);
  const launchS = launchRemaining % 60;
  const launchTimeFormatted = `${String(launchM).padStart(2, '0')}:${String(launchS).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

        <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full z-10 relative flex flex-col max-h-[92vh] border border-slate-700/30">
          {/* Storefront Mock Topbar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">{state.storeSettings?.name || 'ApexStore'}</p>
                <p className="text-[10px] text-indigo-400 font-semibold">Storefront Live Preview</p>
              </div>
            </div>

            {/* Cart & Close */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-slate-200">
                <i className="fa-solid fa-cart-shopping text-indigo-400"></i>
                <span>{totalCartCount} items</span>
                <span className="text-indigo-400 font-black">({formatPKR(totalCartAmount)})</span>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          {/* Marquee Banner */}
          {state.announcementSettings && (
            <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white text-[11px] font-black py-2 px-4 text-center tracking-wide overflow-hidden flex items-center justify-center gap-4">
              <span>{state.announcementSettings.marqueeShipping}</span>
              <span className="hidden sm:inline opacity-50">·</span>
              <span className="hidden sm:inline">
                {state.announcementSettings.offerText} (CODE: {state.announcementSettings.offerCode})
              </span>
            </div>
          )}

          {/* Main Storefront Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-8 flex-1">
            {/* Launch Countdown Banner (if public) */}
            {state.launchConfig.mode === 'public' && (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-5 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl animate-pulse">
                    <i className="fa-solid fa-rocket"></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
                      LIVE LAUNCH COUNTDOWN
                    </span>
                    <h4 className="text-sm sm:text-base font-black tracking-tight mt-1">
                      Next Flagship Product Dropping In:
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-black/50 border border-white/10 rounded-2xl px-5 py-2.5 text-center shadow-inner">
                    <p className="font-mono text-2xl sm:text-3xl font-black text-rose-400 tracking-wider">
                      {launchTimeFormatted}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hero Banner */}
            {state.bannerImage && (
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md aspect-21/9 max-h-72">
                <img
                  src={state.bannerImage}
                  alt="Storefront Hero"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                    Featured Collection
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    Next-Gen Tech & Premium Lifestyle
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mt-1 hidden sm:block">
                    Experience unmatched acoustics, titanium smartwear, and high-performance design.
                  </p>
                </div>
              </div>
            )}

            {/* Sections */}
            {activeSections.map((sec) => {
              const matched = filterProductsByTag(state.products, sec.filter).filter(
                (p) => p.public !== false
              );
              const effectiveLayout = sec.layout || state.globalLayout;

              return (
                <div key={sec.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-5 bg-indigo-600 rounded-full"></span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {sec.title}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400">
                        ({matched.length})
                      </span>
                    </div>
                  </div>

                  {matched.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No published products in this section yet.
                    </p>
                  ) : effectiveLayout === 'horizontal' ? (
                    /* Horizontal Scroll */
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
                      {matched.map((p) => (
                        <div
                          key={p.id}
                          className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div className="relative rounded-xl overflow-hidden aspect-square mb-2 bg-slate-100">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.badge && (
                              <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                            <p className="text-xs font-black text-indigo-600 mt-1">
                              {formatPKR(p.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            className="mt-3 w-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-cart-plus"></i> Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : effectiveLayout === 'compact' ? (
                    /* Compact Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {matched.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs hover:shadow-xs transition"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full aspect-square rounded-lg object-cover mb-1.5 bg-slate-100"
                          />
                          <p className="text-[11px] font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[11px] font-black text-indigo-600 mt-0.5">
                            {formatPKR(p.price)}
                          </p>
                          <button
                            onClick={() => addToCart(p)}
                            className="w-full mt-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : effectiveLayout === 'featured' ? (
                    /* Featured List */
                    <div className="space-y-3">
                      {matched.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-24 h-24 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-center sm:text-left">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {p.category}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-1">{p.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {p.description}
                            </p>
                            <p className="text-sm font-black text-indigo-600 mt-1">
                              {formatPKR(p.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-100 shrink-0"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Default Vertical Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {matched.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div className="relative rounded-xl overflow-hidden aspect-square mb-2 bg-slate-100">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.badge && (
                              <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-xs font-black text-indigo-600">
                                {formatPKR(p.price)}
                              </span>
                              {p.oldPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  {formatPKR(p.oldPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            className="mt-3 w-full bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-cart-plus"></i> Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by ApexStore Engine</span>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-700 transition"
            >
              Back to Power Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
