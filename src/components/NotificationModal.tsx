import React from 'react';
import { useStore } from '../context/StoreContext';
import { timeAgo } from '../utils/helpers';

export const NotificationModal: React.FC = () => {
  const {
    notificationModalOpen,
    setNotificationModalOpen,
    notifications,
    readNotificationIds,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    openOrdersView
  } = useStore();

  if (!notificationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#13131a] rounded-3xl w-full max-w-md max-h-[82vh] flex flex-col overflow-hidden border border-purple-900/40 shadow-2xl shadow-purple-950/60 animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/70 via-purple-900/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40">
              <i className="fa-regular fa-bell text-sm" />
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">Notifications</h3>
              <p className="text-[10px] font-bold text-purple-400 tracking-wider">
                {unreadNotificationCount > 0
                  ? `${unreadNotificationCount} new update${unreadNotificationCount > 1 ? 's' : ''}`
                  : 'No new updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="bg-purple-950 hover:bg-purple-900 text-purple-300 text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer border border-purple-800/40"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotificationModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-300 flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-purple-950/40 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-purple-400">
              <i className="fa-regular fa-bell-slash text-5xl mb-3 text-purple-600 block" />
              <p className="font-bold text-white text-sm">No notifications yet</p>
              <p className="text-xs text-purple-400/80 mt-1">We'll alert you when special drops or promos arrive.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !readNotificationIds.includes(n.id);

              let iconBg = 'bg-purple-950 text-purple-300';
              if (n.type === 'promo') iconBg = 'bg-gradient-to-br from-purple-800 to-fuchsia-700 text-white';
              if (n.type === 'order') iconBg = 'bg-gradient-to-br from-indigo-900 to-purple-800 text-white';
              if (n.type === 'alert') iconBg = 'bg-gradient-to-br from-red-900 to-purple-800 text-white';

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.type === 'order') {
                      setNotificationModalOpen(false);
                      openOrdersView();
                    }
                  }}
                  className={`p-3.5 rounded-2xl flex gap-3 transition cursor-pointer relative ${
                    isUnread ? 'bg-purple-950/30 hover:bg-purple-950/50' : 'hover:bg-[#1a1a24]'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} shadow-sm`}>
                    <i className={`fa-solid ${n.icon || 'fa-bell'} text-sm`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-white leading-tight mb-1">{n.title}</h4>
                    <p className="text-xs text-purple-300/80 font-medium leading-relaxed mb-1.5">{n.desc}</p>
                    <span className="text-[10px] text-purple-400/70 font-bold flex items-center gap-1">
                      <i className="fa-regular fa-clock text-[9px]" /> {timeAgo(n.time)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
