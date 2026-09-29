import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const Header: React.FC = () => {
  const {
    goHome,
    setSideMenuOpen,
    setSearchSuggestionsOpen,
    setNotificationModalOpen,
    setCartDrawerOpen,
    setAdminModalOpen,
    unreadNotificationCount,
    cartCount,
    orders,
    currentUser,
    openSignIn,
    openSignUp,
    logout,
    setReceiptOrder,
    openOrdersView,
    featureToggles
  } = useStore();

  const [cartBump, setCartBump] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subtle smooth indicator for cart changes (silenced, no violent rotation/bounce)
  useEffect(() => {
    if (cartCount === 0) return;
    setCartBump(true);
    const timer = setTimeout(() => setCartBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  let localMyOrderIdsSet = new Set<string>();
  try {
    const rawLocalMy = localStorage.getItem('apex_my_local_order_ids');
    if (rawLocalMy) {
      const parsedMy: string[] = JSON.parse(rawLocalMy);
      if (Array.isArray(parsedMy)) {
        localMyOrderIdsSet = new Set(parsedMy.map((id) => String(id).trim()));
      }
    }
  } catch {}

  const userOrders = orders.filter((o) => {
    const idStr = String(o.id).trim();
    if (localMyOrderIdsSet.has(idStr)) return true;
    if (currentUser && currentUser.email) {
      return (o.email || '').trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    }
    return false;
  });

  return (
    <header className="bg-[#13131a]/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-purple-950/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left: Menu & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {featureToggles.sideMenu !== false && (
              <button
                onClick={() => setSideMenuOpen(true)}
                className="relative p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer"
                aria-label="Open navigation menu"
              >
                <i className="fa-solid fa-bars text-xl" />
                {featureToggles.notifications !== false && unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-md shadow-purple-500/50" />
                )}
              </button>
            )}

            <button
              onClick={goHome}
              className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#13131a] text-white flex items-center justify-center shadow-lg shadow-purple-900/50 overflow-hidden border border-purple-500/40 group-hover:border-purple-400 transition">
                <img
                  src={LOGO_URL}
                  alt="ApexStore Logo"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Apex<span className="text-purple-400">Store</span>
                </span>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search */}
            {featureToggles.searchPanel !== false && (
              <button
                onClick={() => setSearchSuggestionsOpen(true)}
                className="p-2 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer"
                aria-label="Search catalog"
              >
                <i className="fa-solid fa-magnifying-glass text-lg sm:text-xl" />
              </button>
            )}

            {/* Orders */}
            <button
              onClick={openOrdersView}
              className="relative p-2 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              aria-label="View orders"
              title="My Orders & Tracking"
            >
              <i className="fa-solid fa-box-open text-lg sm:text-xl" />
              {userOrders.length > 0 && (
                <span className="hidden sm:inline-block text-[11px] font-black text-purple-200">
                  Orders ({userOrders.length})
                </span>
              )}
            </button>

            {/* Notifications */}
            {featureToggles.notifications !== false && (
              <button
                onClick={() => setNotificationModalOpen(true)}
                className="relative p-2 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer"
                aria-label="View notifications"
              >
                <i className="fa-regular fa-bell text-lg sm:text-xl" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-purple-500 text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Direct Admin Panel Button */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('apex_switch_mode', { detail: 'admin' }));
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 hover:text-white border border-purple-700/50 hover:border-purple-400 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm"
              title="Open Admin Panel"
            >
              <i className="fa-solid fa-sliders text-purple-400 text-xs" />
              <span className="hidden md:inline">Admin</span>
            </button>

            {/* User Auth: Sign In / Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                /* Logged In Pill */
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 hover:border-purple-500 transition cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-black text-white max-w-[100px] truncate leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider leading-none ${
                        currentUser.role === 'admin' || currentUser.verified
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {currentUser.role === 'admin'
                        ? 'Founder'
                        : currentUser.verified
                        ? 'Verified'
                        : 'Unverified'}
                    </span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[10px] text-purple-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                /* Guest Sign In Button */
                <button
                  onClick={openSignIn}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-purple-800/40 hover:from-purple-800 hover:to-purple-700 text-purple-100 border border-purple-600/50 hover:border-purple-400 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm active:scale-95"
                >
                  <i className="fa-regular fa-user text-purple-300 text-xs" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#13131a] border border-purple-900/60 shadow-2xl shadow-purple-950/90 py-2 z-50 animate-[slideUpFade_0.2s_cubic-bezier(0.22,1,0.36,1)]">
                  {/* User Profile Info Header */}
                  <div className="px-4 py-3 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-purple-300/70 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-ping ${
                          currentUser.role === 'admin' || currentUser.verified
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          currentUser.role === 'admin' || currentUser.verified
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {currentUser.role === 'admin'
                          ? 'Store Administrator'
                          : currentUser.verified
                          ? 'Verified Member'
                          : 'Unverified • Pending Admin OTP'}
                      </span>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="py-1">
                    {/* Orders count */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openOrdersView();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-purple-200 hover:bg-purple-900/30 hover:text-white flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-box text-purple-400 text-xs" />
                        <span>My Orders</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-black">
                        {userOrders.length}
                      </span>
                    </button>

                    {/* Admin Switch */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        window.dispatchEvent(new CustomEvent('apex_switch_mode', { detail: 'admin' }));
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-purple-900/30 hover:text-amber-200 flex items-center gap-2 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-crown text-amber-400 text-xs" />
                      <span>Open Admin Panel</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 flex items-center gap-2 transition cursor-pointer border-t border-purple-950/60 mt-1"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart with smooth, silent micro-update */}
            <button
              id="headerCartBtn"
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer"
              aria-label="View cart"
            >
              <i className="fa-solid fa-cart-shopping text-lg sm:text-xl" />
              <span
                className={`absolute top-1 right-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
                  cartBump ? 'scale-110 shadow-purple-500/80' : 'scale-100'
                }`}
              >
                {cartCount}
              </span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
