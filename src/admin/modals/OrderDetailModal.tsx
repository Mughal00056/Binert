import React from 'react';
import { Order } from '../../types/store';
import { formatPKR } from '../../lib/format';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus?: (status: Order['status']) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  onClose,
  onUpdateStatus
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i className="fa-solid fa-receipt"></i>
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Order #{order.id}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</p>
                <span className={`status-pill ${order.status} mt-1`}>
                  {order.status === 'processing' && <span className="processing-spinner mr-1"></span>}
                  {order.status}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Amount</p>
                <p className="text-base font-black text-indigo-600 mt-0.5">{formatPKR(order.total)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer Name</p>
                <p className="text-xs font-black text-slate-800 mt-1">{order.customer || 'Guest Customer'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-black text-slate-800 mt-1">{order.method || 'Standard Checkout'}</p>
              </div>
              {order.email && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-xs font-bold text-slate-700 truncate mt-1">{order.email}</p>
                </div>
              )}
              {order.phone && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{order.phone}</p>
                </div>
              )}
            </div>

            {order.address && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Shipping Address</p>
                <p className="text-xs font-semibold text-slate-700">{order.address}</p>
              </div>
            )}

            {order.transactionId && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Transaction Ref / ID</p>
                <p className="text-xs font-mono font-bold text-slate-800">{order.transactionId}</p>
              </div>
            )}

            {order.proofUrl && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Payment Proof URL</p>
                <a
                  href={order.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 underline break-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  {order.proofUrl}
                </a>
              </div>
            )}

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover bg-white"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                          <i className="fa-solid fa-box text-sm"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Qty: {item.quantity} × {formatPKR(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {formatPKR((item.quantity || 1) * item.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">No item breakdown recorded</p>
                )}
              </div>
            </div>

            {order.otp && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Dispatched Customer OTP</p>
                  <p className="text-sm font-mono font-black text-white tracking-widest mt-0.5">{order.otp}</p>
                </div>
                <i className="fa-solid fa-key text-amber-400 text-lg"></i>
              </div>
            )}

            {onUpdateStatus && (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-black uppercase text-indigo-700 mb-2">Update Order Status</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('pending')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('otp_sent')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'otp_sent' ? 'bg-amber-500 text-black border-amber-400' : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    <i className="fa-solid fa-key mr-1"></i> Approve &amp; Send OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('processing')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'processing' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('verified')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'verified' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('delivered')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'delivered' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    <i className="fa-solid fa-check-double mr-1"></i> Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('rejected')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'rejected' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 text-right">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
