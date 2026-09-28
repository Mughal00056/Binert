import React, { useState } from 'react';
import { NotificationItem } from '../../types/store';
import { timeAgo } from '../../lib/format';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  onSendNotification: (notif: Omit<NotificationItem, 'id' | 'time'>) => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

const NOTIF_ICONS = [
  'fa-bell',
  'fa-tag',
  'fa-box',
  'fa-circle-check',
  'fa-gift',
  'fa-truck-fast',
  'fa-star',
  'fa-gem',
  'fa-fire',
  'fa-crown',
  'fa-bolt',
  'fa-heart'
];

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  onSendNotification,
  onDeleteNotification,
  onClearAllNotifications
}) => {
  const [type, setType] = useState<NotificationItem['type']>('order');
  const [icon, setIcon] = useState('fa-bell');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    onSendNotification({
      type,
      icon,
      title: title.trim(),
      desc: desc.trim(),
      active: true,
      sender: 'Admin'
    });

    setTitle('');
    setDesc('');
  };

  const handleTemplate = (tmpl: 'flash' | 'new' | 'shipping' | 'maintenance') => {
    const templates = {
      flash: {
        type: 'promo' as const,
        icon: 'fa-bolt',
        title: '🔥 Flash Sale — 50% OFF',
        desc: 'Hurry! Today only. Grab your favorites at half price before the countdown ends!'
      },
      new: {
        type: 'info' as const,
        icon: 'fa-gem',
        title: '✨ New Arrivals Just Dropped',
        desc: 'Fresh flagship products added to our collection. Be the first to explore and buy!'
      },
      shipping: {
        type: 'order' as const,
        icon: 'fa-truck-fast',
        title: '🚚 Free Nationwide Shipping',
        desc: 'Enjoy free delivery on all orders over Rs. 5,000 across Pakistan — no promo code needed!'
      },
      maintenance: {
        type: 'alert' as const,
        icon: 'fa-triangle-exclamation',
        title: '⚠️ Scheduled Catalog Sync',
        desc: 'Our catalog is undergoing a brief maintenance update. All orders are active.'
      }
    };
    const t = templates[tmpl];
    setType(t.type);
    setIcon(t.icon);
    setTitle(t.title);
    setDesc(t.desc);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-bell text-rose-500"></i> Push Broadcast Center
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Send live push notifications and banner announcements to all active shoppers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Composer Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-paper-plane text-indigo-600"></i> Compose Notification
          </h3>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Notification Category
              </label>
              <div className="notif-type-picker">
                <button
                  type="button"
                  onClick={() => setType('promo')}
                  className={`notif-type-btn promo ${type === 'promo' ? 'selected' : ''}`}
                >
                  <i className="fa-solid fa-tag"></i> Promo
                </button>
                <button
                  type="button"
                  onClick={() => setType('order')}
                  className={`notif-type-btn order ${type === 'order' ? 'selected' : ''}`}
                >
                  <i className="fa-solid fa-box"></i> Order
                </button>
                <button
                  type="button"
                  onClick={() => setType('info')}
                  className={`notif-type-btn info ${type === 'info' ? 'selected' : ''}`}
                >
                  <i className="fa-solid fa-circle-info"></i> Info
                </button>
                <button
                  type="button"
                  onClick={() => setType('alert')}
                  className={`notif-type-btn alert ${type === 'alert' ? 'selected' : ''}`}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i> Alert
                </button>
              </div>
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Badge Icon
              </label>
              <div className="icon-picker">
                {NOTIF_ICONS.map((ic) => (
                  <div
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`icon-option ${icon === ic ? 'selected' : ''}`}
                  >
                    <i className={`fa-solid ${ic}`}></i>
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Headline Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Drop — 50% OFF ANC Headphones"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition font-bold"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Notification Message *
              </label>
              <textarea
                rows={3}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Write the message that will pop up on customer screens..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-indigo-600 transition"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                Quick Preset Templates
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplate('flash')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200/50"
                >
                  🔥 Flash Sale
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplate('new')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition border border-emerald-200/50"
                >
                  ✨ New Drop
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplate('shipping')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition border border-blue-200/50"
                >
                  🚚 Free Delivery
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplate('maintenance')}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 transition border border-rose-200/50"
                >
                  ⚠️ Catalog Notice
                </button>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Live Customer Preview
              </p>
              <div className="notification-list-item shadow-2xs">
                <div className={`notif-icon-badge ${type}`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black text-slate-900 mb-0.5 truncate">
                    {title || 'Flash Notification Headline'}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 leading-snug line-clamp-2">
                    {desc || 'Your custom announcement message will display here in real time.'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                    <i className="fa-regular fa-clock text-[9px]"></i> Just now
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Broadcast to Users</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDesc('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-sm transition"
                title="Reset Composer"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </form>
        </div>

        {/* Sent History Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i> Sent History
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {notifications.length} sent
              </span>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllNotifications}
                  className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[620px]">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fa-solid fa-inbox text-4xl mb-2 text-slate-300"></i>
                <p className="text-sm font-bold text-slate-600">No broadcasts recorded</p>
                <p className="text-xs text-slate-400 mt-1">Compose your first alert above</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="notification-list-item group relative">
                  <div className={`notif-icon-badge ${item.type}`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-black text-slate-800 truncate">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => onDeleteNotification(item.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 opacity-60 hover:opacity-100 transition"
                        title="Delete"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 leading-snug line-clamp-2 mt-0.5">
                      {item.desc}
                    </p>
                    <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                      <i className="fa-regular fa-clock text-[9px]"></i> {timeAgo(item.time)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
