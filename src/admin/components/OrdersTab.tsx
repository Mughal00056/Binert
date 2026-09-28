import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/store';
import { formatPKR, timeAgo } from '../../lib/format';

interface OrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onUpdateStatus,
  onViewOrder,
  onDeleteOrder,
  onClearAllOrders
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

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

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-receipt text-emerald-500"></i> Customer Orders & Payments
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verify payment slips, update processing stages, or issue verification receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
            className="text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 bg-white font-semibold shadow-xs transition"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="processing">Processing ({stats.processing})</option>
            <option value="verified">Verified ({stats.verified})</option>
            <option value="rejected">Rejected ({stats.rejected})</option>
          </select>

          {orders.length > 0 && (
            <button
              onClick={onClearAllOrders}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-rose-200"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('pending')}
          className={`bg-amber-50/80 rounded-2xl p-4 border border-amber-200 cursor-pointer transition hover:shadow-xs ${
            statusFilter === 'pending' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Pending</p>
            <i className="fa-solid fa-clock text-amber-500 text-xs"></i>
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">{stats.pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter('processing')}
          className={`bg-blue-50/80 rounded-2xl p-4 border border-blue-200 cursor-pointer transition hover:shadow-xs ${
            statusFilter === 'processing' ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Processing</p>
            <i className="fa-solid fa-spinner text-blue-500 text-xs"></i>
          </div>
          <p className="text-xl font-black text-blue-900 mt-1">{stats.processing}</p>
        </div>

        <div
          onClick={() => setStatusFilter('verified')}
          className={`bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 cursor-pointer transition hover:shadow-xs ${
            statusFilter === 'verified' ? 'ring-2 ring-emerald-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Verified</p>
            <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
          </div>
          <p className="text-xl font-black text-emerald-900 mt-1">{stats.verified}</p>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`bg-rose-50/80 rounded-2xl p-4 border border-rose-200 cursor-pointer transition hover:shadow-xs ${
            statusFilter === 'rejected' ? 'ring-2 ring-rose-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Rejected</p>
            <i className="fa-solid fa-circle-xmark text-rose-500 text-xs"></i>
          </div>
          <p className="text-xl font-black text-rose-900 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Order ID
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden sm:table-cell">
                  Method
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    <i className="fa-solid fa-receipt text-4xl mb-3 text-slate-300 block"></i>
                    <p className="font-bold text-slate-700">No orders found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Orders placed on your storefront will arrive here instantly.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = order.status || 'pending';
                  return (
                    <tr key={order.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-slate-800 font-mono">
                          #{order.id}
                        </span>
                        {order.createdAt && (
                          <span className="block text-[10px] text-slate-400">
                            {timeAgo(order.createdAt)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {order.customer || 'Guest Customer'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {order.email || order.phone || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-slate-900">
                          {formatPKR(order.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {order.method || 'Standard'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
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
                          {order.otp && (
                            <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                              OTP: {order.otp}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onViewOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-950/50 rounded-lg transition cursor-pointer"
                            title="View details"
                          >
                            <i className="fa-solid fa-eye text-xs"></i>
                          </button>

                          {status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'otp_sent')}
                                className="order-action-btn otp"
                                title="Approve Payment & Send 6-Digit OTP to Customer"
                              >
                                <i className="fa-solid fa-key"></i> Send OTP
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'processing')}
                                className="order-action-btn processing"
                                title="Move to processing"
                              >
                                <i className="fa-solid fa-spinner"></i> Process
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'verified')}
                                className="order-action-btn verify"
                                title="Verify and approve"
                              >
                                <i className="fa-solid fa-check"></i> Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'rejected')}
                                className="order-action-btn reject"
                                title="Reject order"
                              >
                                <i className="fa-solid fa-xmark"></i> Reject
                              </button>
                            </>
                          )}

                          {status === 'otp_sent' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'otp_sent')}
                                className="order-action-btn processing"
                                title="Resend new OTP"
                              >
                                <i className="fa-solid fa-rotate"></i> Resend OTP
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'delivered')}
                                className="order-action-btn verify"
                                title="Confirm & Deliver Order"
                              >
                                <i className="fa-solid fa-check-double"></i> Deliver
                              </button>
                            </>
                          )}

                          {status === 'processing' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'otp_sent')}
                                className="order-action-btn otp"
                                title="Send 6-Digit OTP"
                              >
                                <i className="fa-solid fa-key"></i> Send OTP
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'verified')}
                                className="order-action-btn verify"
                                title="Mark verified"
                              >
                                <i className="fa-solid fa-check"></i> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(String(order.id), 'rejected')}
                                className="order-action-btn reject"
                                title="Reject order"
                              >
                                <i className="fa-solid fa-xmark"></i> Reject
                              </button>
                            </>
                          )}

                          {(status === 'verified' || status === 'delivered') && (
                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 px-1">
                              <i className="fa-solid fa-check-double"></i> Approved
                            </span>
                          )}

                          {status === 'rejected' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(String(order.id), 'pending')}
                              className="order-action-btn processing"
                              title="Reopen order"
                            >
                              <i className="fa-solid fa-rotate-left"></i> Reopen
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteOrder(String(order.id))}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Delete record"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
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
    </div>
  );
};
