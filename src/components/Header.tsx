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
    <header className="bg-[#13131a]/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-purple-950/20 sticky top-0 z-40 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-15 sm:h-20 gap-1.5 sm:gap-3 w-full min-w-0">
          
          {/* Left: Menu & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            {featureToggles.sideMenu !== false && (
              <button
                onClick={() => setSideMenuOpen(true)}
                className="relative p-1.5 sm:p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer shrink-0"
                aria-label="Open navigation menu"
              >
                <i className="fa-solid fa-bars text-lg sm:text-xl" />
                {featureToggles.notifications !== false && unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 shadow-md shadow-purple-500/50" />
                )}
              </button>
            )}

            <button
              onClick={goHome}
              className="flex items-center gap-2 text-left min-w-0 cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#13131a] text-white flex items-center justify-center shadow-lg shadow-purple-900/50 overflow-hidden border border-purple-500/40 group-hover:border-purple-400 transition shrink-0">
                <img
                  src={LOGO_URL}
                  alt="ApexStore Logo"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-2xl font-black tracking-tight text-white block truncate">
                  Apex<span className="text-purple-400">Store</span>
                </span>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search */}
            {featureToggles.searchPanel !== false && (
              <button
                onClick={() => setSearchSuggestionsOpen(true)}
                className="p-1.5 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer shrink-0"
                aria-label="Search catalog"
              >
                <i className="fa-solid fa-magnifying-glass text-base sm:text-xl" />
              </button>
            )}

            {/* Orders */}
            <button
              onClick={openOrdersView}
              className="relative p-1.5 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
              aria-label="View orders"
              title="My Orders & Tracking"
            >
              <i className="fa-solid fa-box-open text-base sm:text-xl" />
              {userOrders.length > 0 && (
                <span className="hidden md:inline-block text-[11px] font-black text-purple-200">
                  Orders ({userOrders.length})
                </span>
              )}
            </button>

            {/* Notifications */}
            {featureToggles.notifications !== false && (
              <button
                onClick={() => setNotificationModalOpen(true)}
                className="relative p-1.5 sm:p-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-xl transition cursor-pointer shrink-0"
                aria-label="View notifications"
              >
                <i className="fa-regular fa-bell text-base sm:text-xl" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-purple-500 text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth: Sign In / Account Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              {currentUser ? (
                /* Logged In Pill */
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 hover:border-purple-500 transition cursor-pointer text-left"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-black text-white max-w-[90px] truncate leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider leading-none ${
                        currentUser.verified
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {currentUser.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-[9px] sm:text-[10px] text-purple-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                /* Guest Sign In Button */
                <button
                  onClick={openSignIn}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-900/60 to-purple-800/40 hover:from-purple-800 hover:to-purple-700 text-purple-100 border border-purple-600/50 hover:border-purple-400 text-[11px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <i className="fa-regular fa-user text-purple-300 text-xs" />
                  <span className="hidden xs:inline sm:inline">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#13131a] border border-purple-900/60 shadow-2xl shadow-purple-950/90 py-2 z-50 animate-[slideUpFade_0.2s_cubic-bezier(0.22,1,0.36,1)]">
                  {/* User Profile Info Header */}
                  <div className="px-4 py-3 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow shrink-0">
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
                          currentUser.verified
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          currentUser.verified
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {currentUser.verified
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

            {/* Cart Button - Always visible inside screen on mobile & desktop */}
            <button
              id="headerCartBtn"
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 text-purple-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/40 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="View cart"
            >
              <i className="fa-solid fa-cart-shopping text-base sm:text-xl" />
              <span
                className={`absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[10px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
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
