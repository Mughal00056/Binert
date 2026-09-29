import React, { useState } from 'react';
import { Order, OrderStatus, RegisteredUserRecord } from '../../types/store';
import { formatPKR, timeAgo } from '../../lib/format';

interface OrdersTabProps {
  orders: Order[];
  users?: RegisteredUserRecord[];
  deletedUserEmails?: string[];
  mode?: 'all' | 'orders' | 'users';
  onUpdateStatus: (orderId: string, status: OrderStatus, customOtp?: string) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
  onAddUser?: (userData: { name: string; email: string; password: string }) => void;
  onBlockUser?: (emailOrId: string) => void;
  onDeleteUser?: (emailOrId: string) => void;
  onDeleteAllBlockedUsers?: () => void;
  onClearAllUsers?: () => void;
  onSendUserOtp?: (email: string, customOtp?: string) => void;
  onToggleUserVerified?: (email: string, verified: boolean) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  users = [],
  deletedUserEmails = [],
  mode = 'orders',
  onUpdateStatus,
  onViewOrder,
  onDeleteOrder,
  onClearAllOrders,
  onAddUser,
  onBlockUser,
  onDeleteUser,
  onDeleteAllBlockedUsers,
  onClearAllUsers,
  onSendUserOtp,
  onToggleUserVerified
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [userSubTab, setUserSubTab] = useState<'active' | 'blocked'>('active');
  const [customOtps, setCustomOtps] = useState<Record<string, string>>({});
  const [userCustomOtps, setUserCustomOtps] = useState<Record<string, string>>({});
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Read blocked emails and permanently deleted emails
  let localBlockedEmails: string[] = [];
  let permDeletedEmails: string[] = [];
  try {
    const raw = localStorage.getItem('apex_deleted_user_emails');
    if (raw) localBlockedEmails = JSON.parse(raw);
    const permRaw = localStorage.getItem('apex_permanently_deleted_users');
    if (permRaw) permDeletedEmails = JSON.parse(permRaw);
  } catch {}

  const permDeletedSet = new Set(
    permDeletedEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
  );

  const blockedSet = new Set(
    [...deletedUserEmails, ...localBlockedEmails]
      .map((e) => e.trim().toLowerCase())
      .filter((e) => Boolean(e) && !permDeletedSet.has(e))
  );

  // Build lookup of email -> password from users & orders
  const passwordMap = new Map<string, string>();
  users.forEach((u) => {
    if (u.email && u.password) {
      passwordMap.set(u.email.trim().toLowerCase(), u.password);
    }
  });
  orders.forEach((o) => {
    if (o.email && o.userPassword) {
      passwordMap.set(o.email.trim().toLowerCase(), o.userPassword);
    }
  });

  // Build Active Users map and Blocked Users map separately (never mixed together)
  const activeUsersMap = new Map<string, RegisteredUserRecord>();
  const blockedUsersMap = new Map<string, RegisteredUserRecord>();

  users.forEach((u) => {
    if (!u.email) return;
    const key = u.email.trim().toLowerCase();
    if (permDeletedSet.has(key)) return;

    const isBlocked = Boolean(u.blocked || blockedSet.has(key));
    if (isBlocked) {
      blockedUsersMap.set(key, { ...u, blocked: true });
    } else {
      activeUsersMap.set(key, { ...u, blocked: false });
    }
  });

  orders.forEach((o) => {
    if (!o.email) return;
    const key = o.email.trim().toLowerCase();
    if (permDeletedSet.has(key)) return;

    const isBlocked = blockedSet.has(key);
    if (isBlocked) {
      if (!blockedUsersMap.has(key)) {
        blockedUsersMap.set(key, {
          id: `ord_u_${o.id}`,
          name: o.customer || key.split('@')[0],
          email: o.email,
          password: o.userPassword || passwordMap.get(key) || '123456',
          role: 'user',
          blocked: true,
          createdAt: String(o.createdAt || '')
        });
      }
    } else if (!activeUsersMap.has(key)) {
      activeUsersMap.set(key, {
        id: `ord_u_${o.id}`,
        name: o.customer || key.split('@')[0],
        email: o.email,
        password: o.userPassword || passwordMap.get(key) || '',
        role: 'user',
        blocked: false,
        createdAt: String(o.createdAt || '')
      });
    }
  });

  // Include any remaining blocked emails from blockedSet into blockedUsersMap
  blockedSet.forEach((em) => {
    if (!permDeletedSet.has(em) && !blockedUsersMap.has(em)) {
      blockedUsersMap.set(em, {
        id: `blk_${em}`,
        name: em.split('@')[0],
        email: em,
        password: passwordMap.get(em) || '123456',
        role: 'user',
        blocked: true,
        createdAt: new Date().toISOString()
      });
    }
  });

  const activeUsers = Array.from(activeUsersMap.values());
  const blockedUsers = Array.from(blockedUsersMap.values());

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !onAddUser) return;
    onAddUser({
      name: newUserName.trim() || newUserEmail.trim().split('@')[0],
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || '123456'
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setUserSubTab('active');
  };

  const stats = {
    pending: orders.filter((o) => o.status === 'pending' || o.status === 'otp_sent').length,
    processing: orders.filter(
      (o) => o.status === 'processing' || o.status === 'preparing' || o.status === 'shipped'
    ).length,
    verified: orders.filter((o) => o.status === 'verified' || o.status === 'delivered').length,
    rejected: orders.filter((o) => o.status === 'rejected').length
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return o.status === 'pending' || o.status === 'otp_sent';
    if (statusFilter === 'verified') return o.status === 'verified' || o.status === 'delivered';
    if (statusFilter === 'processing')
      return o.status === 'processing' || o.status === 'preparing' || o.status === 'shipped';
    return o.status === statusFilter;
  });

  const handleSendIndividualOtp = (orderId: string) => {
    const code = (customOtps[orderId] || '').trim();
    onUpdateStatus(orderId, 'otp_sent', code.length >= 4 ? code : undefined);
    setCustomOtps((prev) => ({ ...prev, [orderId]: '' }));
  };

  return (
    <div className="space-y-6">
      {mode !== 'users' && (
        <>
          {/* Top Filter and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <i className="fa-solid fa-receipt text-emerald-400"></i> Customer Orders, OTP &amp; Delivery Control
              </h2>
              <p className="text-xs text-purple-300/70 font-medium mt-0.5">
                Send individual OTP to each buyer, deliver product links &amp; receipts, or manage order status
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-purple-800/60 outline-none focus:border-purple-400 bg-[#13131a] text-white font-semibold shadow-xs transition"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="pending">Pending / OTP ({stats.pending})</option>
                <option value="processing">Processing ({stats.processing})</option>
                <option value="verified">Verified / Delivered ({stats.verified})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>

              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllOrders}
                  className="bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-rose-700/50 cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Quick Stat Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setStatusFilter('pending')}
              className={`bg-[#13131a] rounded-2xl p-4 border border-amber-500/40 cursor-pointer transition hover:border-amber-400 ${
                statusFilter === 'pending' ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Pending / OTP</p>
                <i className="fa-solid fa-clock text-amber-400 text-xs"></i>
              </div>
              <p className="text-xl font-black text-white mt-1">{stats.pending}</p>
            </div>

            <div
              onClick={() => setStatusFilter('processing')}
              className={`bg-[#13131a] rounded-2xl p-4 border border-purple-500/40 cursor-pointer transition hover:border-purple-400 ${
                statusFilter === 'processing' ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Processing</p>
                <i className="fa-solid fa-spinner text-purple-400 text-xs"></i>
              </div>
              <p className="text-xl font-black text-white mt-1">{stats.processing}</p>
            </div>

            <div
              onClick={() => setStatusFilter('verified')}
              className={`bg-[#13131a] rounded-2xl p-4 border border-emerald-500/40 cursor-pointer transition hover:border-emerald-400 ${
                statusFilter === 'verified' ? 'ring-2 ring-emerald-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Verified / Delivered</p>
                <i className="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
              </div>
              <p className="text-xl font-black text-white mt-1">{stats.verified}</p>
            </div>

            <div
              onClick={() => setStatusFilter('rejected')}
              className={`bg-[#13131a] rounded-2xl p-4 border border-rose-500/40 cursor-pointer transition hover:border-rose-400 ${
                statusFilter === 'rejected' ? 'ring-2 ring-rose-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Rejected</p>
                <i className="fa-solid fa-circle-xmark text-rose-400 text-xs"></i>
              </div>
              <p className="text-xl font-black text-white mt-1">{stats.rejected}</p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0d0d14] border-b border-purple-900/40">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Customer (Email &amp; Password)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Amount &amp; Method
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Individual OTP Control
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-purple-300/60">
                        <i className="fa-solid fa-receipt text-4xl mb-3 text-purple-500/40 block"></i>
                        <p className="font-bold text-white">No orders found</p>
                        <p className="text-xs text-purple-300/60 mt-1">
                          Orders placed by signed-in users on your storefront will appear here immediately.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = order.status || 'pending';
                      const orderIdStr = String(order.id);
                      const emailLower = (order.email || '').trim().toLowerCase();
                      const userPass = order.userPassword || passwordMap.get(emailLower) || '—';

                      return (
                        <tr key={orderIdStr} className="hover:bg-purple-950/20 transition">
                          <td className="px-4 py-3.5 align-top">
                            <span className="text-xs font-black text-white font-mono">
                              #{orderIdStr.slice(-8)}
                            </span>
                            {order.createdAt && (
                              <span className="block text-[10px] text-purple-400/80 mt-0.5">
                                {timeAgo(order.createdAt)}
                              </span>
                            )}
                          </td>

                          {/* Customer Email & Password */}
                          <td className="px-4 py-3.5 align-top">
                            <p className="text-xs font-black text-white truncate">
                              {order.customer || 'Customer'}
                            </p>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-200">
                                <i className="fa-regular fa-envelope text-purple-400 text-[10px]"></i>
                                <span className="select-all">{order.email || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md w-fit">
                                <i className="fa-solid fa-key text-amber-400 text-[10px]"></i>
                                <span>Pass:</span>
                                <strong className="text-white select-all">{userPass}</strong>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 align-top">
                            <span className="text-xs font-black text-emerald-400 block">
                              {formatPKR(order.total)}
                            </span>
                            <span className="inline-block mt-1 text-[10px] font-bold text-purple-200 bg-purple-950/80 border border-purple-700/40 px-2 py-0.5 rounded-md uppercase">
                              {order.method || 'Standard'}
                            </span>
                            {order.transactionId && (
                              <span className="block text-[10px] font-mono text-purple-400 mt-0.5">
                                TRX: {order.transactionId}
                              </span>
                            )}
                          </td>

                          {/* Per-Order Individual OTP Control */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="flex flex-col gap-1.5 max-w-[195px]">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="6-digit or Auto"
                                  value={customOtps[orderIdStr] || ''}
                                  onChange={(e) =>
                                    setCustomOtps((prev) => ({
                                      ...prev,
                                      [orderIdStr]: e.target.value.replace(/\D/g, '')
                                    }))
                                  }
                                  className="w-24 text-[11px] font-mono font-bold px-2 py-1.5 rounded-lg bg-[#0a0a0f] border border-amber-500/40 text-white outline-none focus:border-amber-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendIndividualOtp(orderIdStr)}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                                  title={`Send OTP only to ${order.email || 'this user'}`}
                                >
                                  <i className="fa-solid fa-paper-plane"></i>
                                  <span>Send OTP</span>
                                </button>
                              </div>
                              {order.otp ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md w-fit">
                                    Sent OTP: <strong className="text-white select-all">{order.otp}</strong>
                                  </span>
                                  {order.otpVerified && (
                                    <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md w-fit">
                                      ✓ OTP Verified → Processing
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-purple-400/70">
                                  Sends only to this buyer
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 align-top">
                            <span className={`status-pill ${status}`}>
                              {status === 'processing' && <span className="processing-spinner mr-1"></span>}
                              {status === 'pending' && <i className="fa-solid fa-clock mr-1"></i>}
                              {status === 'otp_sent' && <i className="fa-solid fa-key mr-1"></i>}
                              {(status === 'verified' || status === 'delivered') && (
                                <i className="fa-solid fa-circle-check mr-1"></i>
                              )}
                              {status === 'rejected' && <i className="fa-solid fa-circle-xmark mr-1"></i>}
                              {status === 'otp_sent' ? 'OTP Sent' : status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onViewOrder(order)}
                                className="px-2.5 py-1.5 text-xs font-bold text-purple-200 bg-[#1b152b] hover:bg-purple-800 border border-purple-700/50 rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="Open Delivery Console & Send Product Link / Download"
                              >
                                <i className="fa-solid fa-box-open text-emerald-400 text-xs"></i>
                                <span>Deliver / Link</span>
                              </button>

                              {status !== 'processing' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(orderIdStr, 'processing')}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-600/50 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                  title="Mark Order as Processing"
                                >
                                  <i className="fa-solid fa-gears text-xs"></i>
                                  <span>Processing</span>
                                </button>
                              )}

                              {status !== 'delivered' && status !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(orderIdStr, 'delivered')}
                                  className="order-action-btn verify cursor-pointer"
                                  title="Instant Deliver with Product Link & Download Package"
                                >
                                  <i className="fa-solid fa-check"></i> Quick Deliver
                                </button>
                              )}

                              {status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(orderIdStr, 'rejected')}
                                  className="order-action-btn reject cursor-pointer"
                                  title="Reject Order"
                                >
                                  <i className="fa-solid fa-xmark"></i> Reject
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteOrder(orderIdStr)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                title="Delete Order Permanently"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* USER ACCOUNTS PANEL (Separate Active Users & Blocked Users Tabs)  */}
      {/* ================================================================= */}
      {mode !== 'orders' && (
        <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <i className="fa-solid fa-user-shield text-purple-400"></i>
                <span>User Accounts, OTP Verification &amp; Access Control</span>
              </h3>
              <p className="text-xs text-purple-300/70 mt-0.5">
                Switch between Active Users (to send OTP or Block) and Blocked Users (to Unblock or Delete permanently)
              </p>
            </div>

            {/* Separate Sub-Tabs for Active Users vs Blocked Users */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-xl bg-[#0d0d14] p-1 border border-purple-800/50">
                <button
                  type="button"
                  onClick={() => setUserSubTab('active')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    userSubTab === 'active'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-users text-[11px]"></i>
                  <span>Active Users ({activeUsers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserSubTab('blocked')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    userSubTab === 'blocked'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                      : 'text-rose-300/80 hover:text-rose-200'
                  }`}
                >
                  <i className="fa-solid fa-ban text-[11px]"></i>
                  <span>Blocked Users ({blockedUsers.length})</span>
                </button>
              </div>

              {userSubTab === 'active' && activeUsers.length > 0 && onClearAllUsers && (
                <button
                  type="button"
                  onClick={onClearAllUsers}
                  className="px-3 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-600 text-amber-300 hover:text-black border border-amber-600/50 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-ban text-xs"></i>
                  <span>Block All Active</span>
                </button>
              )}

              {userSubTab === 'blocked' && blockedUsers.length > 0 && onDeleteAllBlockedUsers && (
                <button
                  type="button"
                  onClick={onDeleteAllBlockedUsers}
                  className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                  <span>Delete All Blocked</span>
                </button>
              )}
            </div>
          </div>

          {/* Add User Form in Admin (shown in Active Users tab) */}
          {userSubTab === 'active' && onAddUser && (
            <form
              onSubmit={handleCreateUser}
              className="p-4 bg-[#0f0f17] border-b border-purple-900/40 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
            >
              <input
                type="text"
                placeholder="User Name (e.g. Ali Khan)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#13131a] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400"
              />
              <input
                type="email"
                required
                placeholder="User Email (required)"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#13131a] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400"
              />
              <input
                type="text"
                placeholder="Password (e.g. 123456)"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#13131a] border border-purple-800/60 text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Add User</span>
              </button>
            </form>
          )}

          {/* SUB-TAB 1: ACTIVE USERS (Only shows Block User action, never Delete & Block together) */}
          {userSubTab === 'active' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0d0d14] border-b border-purple-900/40">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      User Name &amp; Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Email Address
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Password
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Account OTP Verification
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300 text-right">
                      Block Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {activeUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-purple-300/60 text-xs">
                        No active users found.
                      </td>
                    </tr>
                  ) : (
                    activeUsers.map((u) => {
                      const userOrderCount = orders.filter(
                        (o) => (o.email || '').trim().toLowerCase() === (u.email || '').trim().toLowerCase()
                      ).length;
                      const isUserVerified = Boolean(u.verified || u.role === 'admin');
                      return (
                        <tr key={u.id || u.email} className="hover:bg-purple-950/20 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-xs">{u.name || 'User'}</div>
                            <div className="mt-1">
                              {isUserVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase">
                                  <i className="fa-solid fa-circle-check text-[8px]" />
                                  Verified Account
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase animate-pulse">
                                  <i className="fa-solid fa-hourglass-half text-[8px]" />
                                  Unverified (Locked)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-purple-200 select-all">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-black text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2.5 py-1 rounded-lg select-all">
                              {u.password || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              {u.verificationOtp && (
                                <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md w-fit">
                                  Sent OTP: <strong className="text-white select-all">{u.verificationOtp}</strong>
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {onSendUserOtp && (
                                  <>
                                    <input
                                      type="text"
                                      maxLength={6}
                                      placeholder="6-digit / Auto"
                                      value={userCustomOtps[u.email] || ''}
                                      onChange={(e) =>
                                        setUserCustomOtps((prev) => ({
                                          ...prev,
                                          [u.email]: e.target.value.replace(/\D/g, '')
                                        }))
                                      }
                                      className="w-24 px-2 py-1 rounded-lg bg-[#0d0d14] border border-amber-500/40 text-[11px] font-mono text-white placeholder-purple-400/50 outline-none focus:border-amber-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const custom = (userCustomOtps[u.email] || '').trim();
                                        onSendUserOtp(u.email, custom.length >= 4 ? custom : undefined);
                                        setUserCustomOtps((prev) => ({ ...prev, [u.email]: '' }));
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm"
                                    >
                                      <i className="fa-solid fa-key text-[9px]" />
                                      <span>{u.verificationOtp ? 'Resend OTP' : 'Send OTP'}</span>
                                    </button>
                                  </>
                                )}
                                {onToggleUserVerified && u.role !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => onToggleUserVerified(u.email, !isUserVerified)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                                      isUserVerified
                                        ? 'bg-purple-950/60 hover:bg-amber-950/60 text-purple-300 hover:text-amber-300 border-purple-700/50'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50'
                                    }`}
                                  >
                                    {isUserVerified ? 'Require OTP' : '✓ Verify Direct'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-emerald-400">
                              {userOrderCount} {userOrderCount === 1 ? 'order' : 'orders'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {(onBlockUser || onDeleteUser) && (
                              <button
                                type="button"
                                onClick={() =>
                                  onBlockUser
                                    ? onBlockUser(u.email || u.id)
                                    : onDeleteUser && onDeleteUser(u.email || u.id)
                                }
                                className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-600/50 text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5"
                                title={`Block user ${u.email}`}
                              >
                                <i className="fa-solid fa-ban text-xs"></i>
                                <span>Block User</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* SUB-TAB 2: BLOCKED USERS (Allows Admin to Delete or Unblock any Blocked User) */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0d0d14] border-b border-purple-900/40">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Blocked User
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Blocked Email Address
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Password
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-rose-300 text-right">
                      Manage / Delete Blocked User
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {blockedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-purple-300/60 text-xs">
                        No blocked users right now.
                      </td>
                    </tr>
                  ) : (
                    blockedUsers.map((bu) => (
                      <tr key={bu.id || bu.email} className="hover:bg-rose-950/20 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white text-xs">{bu.name || bu.email.split('@')[0]}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-rose-200 select-all">
                          {bu.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-black text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2.5 py-1 rounded-lg select-all">
                            {bu.password || passwordMap.get(bu.email.toLowerCase()) || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-600/50 text-rose-300 text-[10px] font-black uppercase">
                            <i className="fa-solid fa-lock text-[9px]"></i>
                            <span>Blocked</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {onAddUser && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAddUser({
                                    name: bu.name || bu.email.split('@')[0],
                                    email: bu.email,
                                    password: bu.password || passwordMap.get(bu.email.toLowerCase()) || '123456'
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-600/50 text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5"
                                title="Unblock & Restore to Active Users"
                              >
                                <i className="fa-solid fa-unlock text-xs"></i>
                                <span>Unblock</span>
                              </button>
                            )}
                            {onDeleteUser && (
                              <button
                                type="button"
                                onClick={() => onDeleteUser(bu.email || bu.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/50 text-xs font-black transition cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-rose-950/50"
                                title={`Permanently delete blocked user ${bu.email}`}
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                                <span>Delete User</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
