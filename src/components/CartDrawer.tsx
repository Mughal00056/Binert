import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';

export const CartDrawer: React.FC = () => {
  const {
    cartDrawerOpen,
    setCartDrawerOpen,
    cart,
    cartCount,
    cartSubtotal,
    appliedDiscount,
    discountAmount,
    cartTotal,
    updateCartQty,
    applyPromoCode,
    startCheckout
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const ok = applyPromoCode(couponInput);
    if (ok) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#13131a] border border-purple-900/40 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-purple-950/70 z-10 animate-[slideUpFade_0.35s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center border border-purple-500/30 text-purple-300">
              <i className="fa-solid fa-cart-shopping" />
            </div>
            <h2 className="text-lg font-black text-white">Your Cart</h2>
            <span className="bg-purple-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={() => setCartDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-purple-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Close cart"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-purple-950/60">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-purple-400">
              <i className="fa-solid fa-cart-arrow-down text-5xl mb-3 text-purple-600 block" />
              <p className="font-bold text-white text-base">Your cart is empty</p>
              <p className="text-xs text-purple-400/80 mt-1">Explore our collections and add your favorites!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#1a1a24] shrink-0 border border-purple-900/40"
                  draggable={false}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mb-1">
                    {item.name}
                  </h4>
                  <div className="text-xs font-black text-purple-300">
                    {formatPKR(item.price)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-black text-xs flex items-center justify-center border border-purple-800/40 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-xs font-black text-white min-w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-black text-xs flex items-center justify-center border border-purple-800/40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateCartQty(item.id, -item.quantity)}
                  className="w-8 h-8 rounded-full bg-purple-950/40 hover:bg-red-950/60 text-purple-400 hover:text-red-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Remove item"
                >
                  <i className="fa-regular fa-trash-can text-sm" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-purple-900/40 bg-[#13131a]">
            {/* Totals */}
            <div className="space-y-1.5 mb-4 text-xs font-bold">
              <div className="flex justify-between text-purple-300/80">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span className="text-white font-black">{formatPKR(cartSubtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span className="uppercase tracking-wider">
                    Discount ({Math.round(appliedDiscount * 100)}%)
                  </span>
                  <span className="font-black">-{formatPKR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-purple-900/40">
                <span className="text-sm uppercase tracking-wider text-purple-300 font-extrabold">
                  Total
                </span>
                <span className="text-2xl font-black text-purple-300">
                  {formatPKR(cartTotal)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="flex-1 text-xs uppercase font-mono px-3.5 py-2.5 rounded-xl border border-purple-900/60 outline-none focus:border-purple-400 bg-[#0a0a0f] text-white"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={startCheckout}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(168,85,247,0.5)] transition active:scale-[0.98] cursor-pointer"
            >
              <i className="fa-solid fa-play text-xs" />
              <span>PROCEED TO CHECKOUT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
