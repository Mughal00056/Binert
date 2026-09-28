import React, { useState } from 'react';
import { Order, OrderStatus, RegisteredUserRecord } from '../../types/store';
import { formatPKR, timeAgo } from '../../lib/format';

interface OrdersTabProps {
  orders: Order[];
  users?: RegisteredUserRecord[];
  onUpdateStatus: (orderId: string, status: OrderStatus, customOtp?: string) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  users = [],
  onUpdateStatus,
  onViewOrder,
  onDeleteOrder,
  onClearAllOrders
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [customOtps, setCustomOtps] = useState<Record<string, string>>({});

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

  // Combine registered users and order users so Admin sees every user who entered email & password
  const allUsersMap = new Map<string, RegisteredUserRecord>();
  users.forEach((u) => {
    if (u.email) {
      allUsersMap.set(u.email.trim().toLowerCase(), u);
    }
  });
  orders.forEach((o) => {
    if (o.email) {
      const key = o.email.trim().toLowerCase();
      const existing = allUsersMap.get(key);
      allUsersMap.set(key, {
        id: existing?.id || `ord_u_${o.id}`,
        name: existing?.name || o.customer || key.split('@')[0],
        email: o.email,
        password: o.userPassword || existing?.password || passwordMap.get(key) || '',
        role: existing?.role || 'user',
        createdAt: String(existing?.createdAt || o.createdAt || '')
      });
    }
  });
  const combinedUsers = Array.from(allUsersMap.values());

  const stats = {
    pending: orders.filter((o) => o.status === 'pending' || o.status === 'otp_sent').length,
    processing: orders.filter((o) => o.status === 'processing' || o.status === 'preparing' || o.status === 'shipped').length,
    verified: orders.filter((o) => o.status === 'verified' || o.status === 'delivered').length,
    rejected: orders.filter((o) => o.status === 'rejected').length
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return o.status === 'pending' || o.status === 'otp_sent';
    if (statusFilter === 'verified') return o.status === 'verified' || o.status === 'delivered';
    if (statusFilter === 'processing') return o.status === 'processing' || o.status === 'preparing' || o.status === 'shipped';
    return o.status === statusFilter;
  });

  const handleSendIndividualOtp = (orderId: string) => {
    const code = (customOtps[orderId] || '').trim();
    onUpdateStatus(orderId, 'otp_sent', code.length >= 4 ? code : undefined);
    setCustomOtps((prev) => ({ ...prev, [orderId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <i className="fa-solid fa-receipt text-emerald-400"></i> Customer Orders, OTP &amp; User Credentials
          </h2>
          <p className="text-xs text-purple-300/70 font-medium mt-0.5">
            Send individual OTP to each buyer one by one, view customer email &amp; password, or delete orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
            className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-purple-800/60 outline-none focus:border-purple-400 bg-[#13131a] text-white font-semibold shadow-xs transition"
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
              className="bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-rose-700/50 cursor-pointer"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span className="hidden sm:inline">Clear All Orders</span>
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
                            <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md w-fit">
                              Sent OTP: <strong className="text-white select-all">{order.otp}</strong>
                            </span>
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
                            title="View Order Details"
                          >
                            <i className="fa-solid fa-eye text-xs"></i>
                            <span>View</span>
                          </button>

                          {status !== 'delivered' && status !== 'verified' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(orderIdStr, 'delivered')}
                              className="order-action-btn verify cursor-pointer"
                              title="Verify & Deliver Order"
                            >
                              <i className="fa-solid fa-check"></i> Deliver
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

      {/* Registered Users & Login Credentials Panel */}
      <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-purple-400"></i>
              <span>User Accounts &amp; Login Credentials (Email &amp; Password)</span>
            </h3>
            <p className="text-xs text-purple-300/70 mt-0.5">
              All users who signed in, registered, or placed orders with email and password
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50 text-xs font-black">
            {combinedUsers.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0d0d14] border-b border-purple-900/40">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                  User Name
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Email Address
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Password
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Orders Placed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {combinedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-purple-300/60 text-xs">
                    No user credentials recorded yet.
                  </td>
                </tr>
              ) : (
                combinedUsers.map((u) => {
                  const userOrderCount = orders.filter(
                    (o) => (o.email || '').trim().toLowerCase() === (u.email || '').trim().toLowerCase()
                  ).length;
                  return (
                    <tr key={u.id || u.email} className="hover:bg-purple-950/20 transition">
                      <td className="px-4 py-3 font-bold text-white text-xs">
                        {u.name || 'User'}
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
                        <span className="text-xs font-black text-emerald-400">
                          {userOrderCount} {userOrderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
