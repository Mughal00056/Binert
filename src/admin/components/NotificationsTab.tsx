import React, { useState } from 'react';
import { NotificationItem, Order, RegisteredUserRecord } from '../../types/store';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  users?: RegisteredUserRecord[];
  orders?: Order[];
  onSendNotification: (notif: Omit<NotificationItem, 'id' | 'time'>) => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

const ICONS = [
  'fa-bell',
  'fa-bolt',
  'fa-fire',
  'fa-gift',
  'fa-tag',
  'fa-truck-fast',
  'fa-key',
  'fa-box-open',
  'fa-circle-check',
  'fa-triangle-exclamation',
  'fa-crown'
];

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  users = [],
  orders = [],
  onSendNotification,
  onDeleteNotification,
  onClearAllNotifications
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('order');
  const [icon, setIcon] = useState('fa-bell');
  const [recipientMode, setRecipientMode] = useState<'single' | 'all'>('single');
  const [targetEmail, setTargetEmail] = useState('');
  const [customOtp, setCustomOtp] = useState('');

  // Collect all unique customer emails from registered users and orders
  const knownEmails = Array.from(
    new Set(
      [
        ...users.map((u) => (u.email || '').trim().toLowerCase()),
        ...orders.map((o) => (o.email || '').trim().toLowerCase())
      ].filter(Boolean)
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    const finalEmail = recipientMode === 'single' && targetEmail.trim() ? targetEmail.trim().toLowerCase() : undefined;

    onSendNotification({
      title: title.trim(),
      desc: customOtp.trim() ? `${desc.trim()} (OTP: ${customOtp.trim()})` : desc.trim(),
      type,
      icon,
      active: true,
      targetEmail: finalEmail,
      otp: customOtp.trim() || undefined
    });
    setTitle('');
    setDesc('');
    setCustomOtp('');
  };

  const typeBadge = (t: NotificationItem['type']) => {
    switch (t) {
      case 'promo':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/50';
      case 'order':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
      case 'info':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/50';
      case 'alert':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/50';
      default:
        return 'bg-purple-950/60 text-purple-200 border-purple-800/50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Compose & Target User Form */}
      <div className="lg:col-span-5">
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-900/40">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <h3 className="text-base font-black text-white">Send Per-User or Broadcast Alert</h3>
              <p className="text-xs text-purple-300/70">
                Send private notification/OTP to a single user or broadcast to everyone
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                1. Choose Recipient Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientMode('single')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition flex items-center justify-center gap-2 cursor-pointer ${
                    recipientMode === 'single'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-400 shadow-md'
                      : 'bg-[#0d0d14] text-purple-300 border-purple-900/50 hover:border-purple-700'
                  }`}
                >
                  <i className="fa-solid fa-user-lock"></i>
                  <span>Single User (Private)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('all')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition flex items-center justify-center gap-2 cursor-pointer ${
                    recipientMode === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-400 shadow-md'
                      : 'bg-[#0d0d14] text-purple-300 border-purple-900/50 hover:border-purple-700'
                  }`}
                >
                  <i className="fa-solid fa-users"></i>
                  <span>All Users (Broadcast)</span>
                </button>
              </div>
            </div>

            {recipientMode === 'single' && (
              <div className="p-3.5 rounded-2xl bg-[#0d0d14] border border-purple-800/50 space-y-2.5">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Select or Type Customer Email (Private to this User Only)
                </label>
                {knownEmails.length > 0 && (
                  <select
                    value={knownEmails.includes(targetEmail.toLowerCase()) ? targetEmail.toLowerCase() : ''}
                    onChange={(e) => {
                      if (e.target.value) setTargetEmail(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">— Quick Pick Registered Customer —</option>
                    {knownEmails.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="email"
                  required={recipientMode === 'single'}
                  placeholder="Enter customer email (e.g. customer@gmail.com)"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#13131a] text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Notification Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Order Approved / Exclusive Flash Code"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Message / Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write notification message, product link, or instructions..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                  Alert Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationItem['type'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="order">Order / OTP Update</option>
                  <option value="promo">Promo / Discount</option>
                  <option value="info">Store Info</option>
                  <option value="alert">Urgent Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Optional 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 482910 (optional)"
                  value={customOtp}
                  onChange={(e) => setCustomOtp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-500/40 bg-[#0d0d14] text-amber-300 font-mono text-xs font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm transition cursor-pointer ${
                      icon === ic
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-[#0d0d14] text-purple-300 border-purple-900/50 hover:bg-purple-950/60'
                    }`}
                  >
                    <i className={`fa-solid ${ic}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition shadow-lg shadow-purple-950/60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>
                {recipientMode === 'single'
                  ? `Send Private Notification to ${targetEmail || 'User'}`
                  : 'Broadcast Notification to All Users'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Right: Sent Notifications List */}
      <div className="lg:col-span-7">
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-900/40">
            <div>
              <h3 className="text-base font-black text-white">
                Dispatched Notifications ({notifications.length})
              </h3>
              <p className="text-xs text-purple-300/70">
                Per-user OTP &amp; delivery notifications are strictly private to their target email
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAllNotifications}
                className="text-xs text-rose-400 hover:text-rose-300 font-black px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/40 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-purple-400/50">
              <i className="fa-regular fa-bell-slash text-3xl mb-2 block"></i>
              <p className="text-sm font-bold">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-purple-900/40 bg-[#0d0d14] hover:border-purple-700/60 transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeBadge(
                        n.type
                      )}`}
                    >
                      <i className={`fa-solid ${n.icon || 'fa-bell'}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-white text-xs sm:text-sm">{n.title}</h4>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${typeBadge(
                            n.type
                          )}`}
                        >
                          {n.type}
                        </span>
                        {n.targetEmail ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                            <i className="fa-solid fa-user-shield text-[9px]"></i>
                            <span>Private: {n.targetEmail}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                            Broadcast: All Users
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-200/80 mt-1 break-words">{n.desc}</p>
                      {n.otp && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-black">
                          <i className="fa-solid fa-key text-[10px]"></i>
                          <span>OTP: {n.otp}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-purple-400/60 mt-1 block">
                        {new Date(n.time).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteNotification(n.id)}
                    className="text-purple-400/60 hover:text-rose-400 p-1.5 cursor-pointer shrink-0"
                    title="Delete Notification"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
