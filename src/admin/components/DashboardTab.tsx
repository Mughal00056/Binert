import React from 'react';
import { StoreState, Order } from '../../types/store';
import { formatPKR, timeAgo } from '../../lib/format';
import { TabKey } from './AdminSidebar';

interface DashboardTabProps {
  state: StoreState;
  onNavigate: (tab: TabKey) => void;
  onOpenProductModal: () => void;
  onViewOrder: (order: Order) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  state,
  onNavigate,
  onOpenProductModal,
  onViewOrder
}) => {
  const pendingOrders = state.orders.filter(
    (o) => o.status === 'pending' || o.status === 'otp_sent'
  );
  const totalRevenue = state.orders
    .filter((o) => o.status === 'verified' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const recentOrders = state.orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <div
          onClick={() => onNavigate('products')}
          className="admin-card bg-white rounded-2xl p-5 border border-slate-200 cursor-pointer hover:border-indigo-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-box text-xl"></i>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.products.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Total Products</p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="admin-card bg-white rounded-2xl p-5 border border-slate-200 cursor-pointer hover:border-amber-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-clock text-xl"></i>
            </div>
            {pendingOrders.length > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                Action required
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingOrders.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Pending Orders</p>
        </div>

        {/* Verified Revenue */}
        <div
          onClick={() => onNavigate('orders')}
          className="admin-card bg-white rounded-2xl p-5 border border-slate-200 cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-coins text-xl"></i>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatPKR(totalRevenue)}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Total Revenue</p>
        </div>

        {/* Sent Notifications */}
        <div
          onClick={() => onNavigate('notifications')}
          className="admin-card bg-white rounded-2xl p-5 border border-slate-200 cursor-pointer hover:border-rose-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <i className="fa-solid fa-bell text-xl"></i>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Sent
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.notifications.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Broadcasts</p>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenProductModal}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 transition"
            >
              <i className="fa-solid fa-plus-circle text-2xl"></i>
              <span className="text-xs font-bold">Add Product</span>
            </button>

            <button
              onClick={() => onNavigate('notifications')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
            >
              <i className="fa-solid fa-paper-plane text-2xl"></i>
              <span className="text-xs font-bold">Send Notification</span>
            </button>

            <button
              onClick={() => onNavigate('transcript')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition"
            >
              <i className="fa-solid fa-scroll text-2xl"></i>
              <span className="text-xs font-bold">Edit Receipt</span>
            </button>

            <button
              onClick={() => onNavigate('orders')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
            >
              <i className="fa-solid fa-receipt text-2xl"></i>
              <span className="text-xs font-bold">Manage Orders</span>
            </button>
          </div>

          {/* Additional secondary quick links */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('launchpool')}
              className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-rocket text-rose-500"></i> Launch Countdown
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-layer-group text-purple-500"></i> Sections Reorder
            </button>
            <button
              onClick={() => onNavigate('layout')}
              className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-table-columns text-indigo-500"></i> Layout Customizer
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i> Recent Orders
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all ({state.orders.length})
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <i className="fa-solid fa-receipt text-3xl mb-2 text-slate-300"></i>
                <p className="text-xs font-bold">No orders recorded yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onViewOrder(order)}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition border border-slate-100"
                >
                  <span className={`status-pill ${order.status}`}>
                    {order.status === 'processing' && (
                      <span className="processing-spinner mr-1"></span>
                    )}
                    {order.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">#{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">
                      {order.customer || 'Guest'} · {order.method || 'Checkout'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-indigo-600">{formatPKR(order.total)}</p>
                    {order.createdAt && (
                      <p className="text-[9px] text-slate-400">{timeAgo(order.createdAt)}</p>
                    )}
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
