import React from 'react';
import { useStore } from '../context/StoreContext';
import { timeAgo } from '../utils/helpers';

export const NotificationModal: React.FC = () => {
  const {
    notificationModalOpen,
    setNotificationModalOpen,
    notifications,
    readNotificationIds,
    markNotificationRead,
    markAllNotificationsRead,
    openOrdersView,
    showToast,
    currentUser
  } = useStore();

  if (!notificationModalOpen) return null;

  const extractOtpFromNotification = (n: { otp?: string; desc: string }): string | null => {
    if (n.otp && n.otp.trim().length >= 4) return n.otp.trim();
    const match = n.desc.match(/\b(\d{6})\b/);
    return match ? match[1] : null;
  };

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`, 'success');
    } catch {
      showToast('Copied!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#13131a] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl shadow-purple-950/80 border border-purple-900/50 animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-bell text-purple-400 animate-bounce" />
              <span>Notifications &amp; OTP Inbox</span>
            </h3>
            {currentUser && (
              <p className="text-[10px] text-purple-300/70 mt-0.5">
                Showing alerts for <span className="text-purple-200 font-bold">{currentUser.email}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-extrabold text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setNotificationModalOpen(false)}
              className="text-purple-400 hover:text-purple-200 transition cursor-pointer"
              aria-label="Close notifications"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5 my-4 overflow-y-auto pr-1 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-purple-300/50">
              <i className="fa-regular fa-bell-slash text-3xl mb-2 block" />
              <p className="text-sm font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readNotificationIds.includes(n.id);
              const detectedOtp = extractOtpFromNotification(n);
              const iconBg =
                n.type === 'promo'
                  ? 'bg-purple-900/50 text-purple-300'
                  : n.type === 'order'
                  ? 'bg-emerald-950/60 text-emerald-400'
                  : n.type === 'alert'
                  ? 'bg-red-950/60 text-red-400'
                  : 'bg-purple-950/60 text-purple-300';

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition flex flex-col gap-2.5 cursor-pointer ${
                    isRead
                      ? 'bg-[#0a0a0f]/70 border-purple-950/40 opacity-80'
                      : 'bg-[#1a1428] border-purple-700/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <i className={`fa-solid ${n.icon || 'fa-bell'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-black text-white truncate">{n.title}</p>
                        <span className="text-[10px] font-semibold text-purple-400/70 shrink-0">
                          {timeAgo(n.time)}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed break-words">{n.desc}</p>
                    </div>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-2" />}
                  </div>

                  {/* Highlighted OTP Box if notification contains an OTP */}
                  {detectedOtp && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-amber-500/10 border border-amber-400/50 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
                          Your Verification OTP Code
                        </span>
                        <span className="text-base sm:text-lg font-mono font-black tracking-[0.25em] text-white">
                          {detectedOtp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(detectedOtp, 'OTP Code', e)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase cursor-pointer"
                        >
                          <i className="fa-solid fa-copy mr-1" /> Copy OTP
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotificationModalOpen(false);
                            openOrdersView();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase cursor-pointer"
                        >
                          Enter OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Product Delivery Package Box if notification contains deliveryInfo */}
                  {n.deliveryInfo && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                          <i className="fa-solid fa-box-open" />
                          <span>Delivered: {n.deliveryInfo.productName}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {n.deliveryInfo.productLink && (
                          <a
                            href={n.deliveryInfo.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase flex items-center gap-1"
                          >
                            <i className="fa-solid fa-up-right-from-square" /> Product Link
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotificationModalOpen(false);
                            openOrdersView();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-download" /> Open &amp; Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => setNotificationModalOpen(false)}
          className="w-full py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-bold text-xs transition cursor-pointer border border-purple-800/40"
        >
          Close
        </button>
      </div>
    </div>
  );
};
