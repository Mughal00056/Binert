import React from 'react';
import { useStore } from '../context/StoreContext';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const SideMenu: React.FC = () => {
  const {
    sideMenuOpen,
    setSideMenuOpen,
    goHome,
    setCurrentView,
    setAiModalOpen,
    setNotificationModalOpen,
    setAdminModalOpen,
    unreadNotificationCount,
    storeInfo,
    orders,
    currentUser,
    openSignIn,
    openSignUp,
    logout,
    setReceiptOrder,
    openOrdersView,
    featureToggles
  } = useStore();

  if (!sideMenuOpen || featureToggles.sideMenu === false) return null;

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity animate-[fadeIn_0.2s_ease-out]"
        onClick={() => setSideMenuOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[88vw] bg-[#13131a] z-50 shadow-2xl shadow-purple-950/60 flex flex-col border-r border-purple-900/30 animate-[slideRight_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-gradient-to-r from-purple-950/50 via-purple-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] text-white flex items-center justify-center shadow border border-purple-500/40 overflow-hidden">
              <img
                src={LOGO_URL}
                alt="ApexStore Logo"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
            <div>
              <p className="text-base font-black text-white">ApexStore</p>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Premium Menu</p>
            </div>
          </div>
          <button
            onClick={() => setSideMenuOpen(false)}
            className="text-purple-400 hover:text-purple-300 p-2 rounded-xl transition cursor-pointer"
            aria-label="Close menu"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* User Account Quick Section */}
        <div className="p-3.5 bg-[#0d071b] border-b border-purple-900/40">
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-[#161622] border border-purple-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-purple-300/70 truncate">{currentUser.email}</p>
                  <span
                    className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest ${
                      currentUser.role === 'admin' || currentUser.verified
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    ●{' '}
                    {currentUser.role === 'admin'
                      ? 'Founder & Admin'
                      : currentUser.verified
                      ? 'Verified Member'
                      : 'Unverified • Pending OTP'}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-purple-950 flex items-center justify-between text-xs">
                {userOrders.length > 0 && (
                  <button
                    onClick={() => {
                      setReceiptOrder(userOrders[userOrders.length - 1]);
                      setSideMenuOpen(false);
                    }}
                    className="text-[10px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
                  >
                    View Last Order
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setSideMenuOpen(false);
                  }}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 ml-auto flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-[9px]" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-purple-900/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-white">Join ApexStore</p>
                <p className="text-[10px] text-purple-300/80">Sign in to track orders & perks</p>
              </div>
              <button
                onClick={() => {
                  setSideMenuOpen(false);
                  openSignIn();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {featureToggles.menuHome !== false && (
            <button
              onClick={() => {
                goHome();
                setSideMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-house w-5 text-center text-purple-400" />
              <span>Home</span>
            </button>
          )}

          {featureToggles.menuOrders !== false && (
            <button
              onClick={openOrdersView}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-box-open w-5 text-center text-purple-400" />
              <span>My Orders &amp; Tracking</span>
              {userOrders.length > 0 && (
                <span className="ml-auto bg-purple-900/80 text-purple-200 text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center border border-purple-700/40">
                  {userOrders.length}
                </span>
              )}
            </button>
          )}

          {featureToggles.aiAssistant !== false && (
            <button
              onClick={() => {
                setAiModalOpen(true);
                setSideMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-extrabold bg-gradient-to-r from-purple-950/60 to-purple-900/40 text-purple-200 hover:text-white transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-wand-magic-sparkles w-5 text-center text-purple-300 animate-pulse" />
              <span>AI Assistant</span>
            </button>
          )}

          {featureToggles.notifications !== false && (
            <button
              onClick={() => {
                setNotificationModalOpen(true);
                setSideMenuOpen(false);
              }}
              className="w-full relative flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-regular fa-bell w-5 text-center text-purple-400" />
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="ml-auto bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center shadow-md animate-[notifBadgePulse_1.8s_ease-in-out_infinite]">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {featureToggles.promoCodes !== false && (
            <button
              onClick={() => {
                setCurrentView('promo');
                setSideMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-tags w-5 text-center text-purple-400" />
              <span>Promo Codes</span>
            </button>
          )}

          {featureToggles.menuContact !== false && (
            <button
              onClick={() => {
                setCurrentView('contact');
                setSideMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-envelope w-5 text-center text-purple-400" />
              <span>Contact Us</span>
            </button>
          )}

          {featureToggles.menuAbout !== false && (
            <button
              onClick={() => {
                setCurrentView('about');
                setSideMenuOpen(false);
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-purple-100 hover:bg-purple-900/30 hover:text-purple-300 transition text-left cursor-pointer border-b border-purple-950/40"
            >
              <i className="fa-solid fa-circle-info w-5 text-center text-purple-400" />
              <span>About Owner</span>
            </button>
          )}

          {featureToggles.whatsAppFloat !== false && (
            <a
              href={storeInfo.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-green-400 hover:bg-green-950/20 transition text-left border-b border-purple-950/40"
            >
              <i className="fa-brands fa-whatsapp w-5 text-center text-green-400 text-lg" />
              <span>WhatsApp Channel</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              setSideMenuOpen(false);
              window.dispatchEvent(new CustomEvent('apex_switch_mode', { detail: 'admin' }));
            }}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-black text-purple-200 hover:bg-purple-900/40 hover:text-white transition text-left cursor-pointer"
          >
            <i className="fa-solid fa-sliders w-5 text-center text-purple-400" />
            <span>Admin Panel</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-600/40 text-[9px] font-black uppercase text-purple-200">
              Open
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 text-center bg-[#0a0a0f]">
          <p className="text-[11px] text-purple-400/80 font-medium">© 2026 ApexStore Inc. All rights reserved.</p>
        </div>
      </aside>
    </>
  );
};
