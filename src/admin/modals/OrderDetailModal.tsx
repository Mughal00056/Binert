import React, { useState } from 'react';
import { Order } from '../../types/store';
import { formatPKR } from '../../lib/format';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  userPassword?: string;
  onClose: () => void;
  onUpdateStatus?: (status: Order['status'], customOtp?: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  userPassword,
  onClose,
  onUpdateStatus,
  onDeleteOrder
}) => {
  const [customOtp, setCustomOtp] = useState('');

  if (!isOpen || !order) return null;

  const displayPassword = order.userPassword || userPassword || '—';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-[#13131a] border border-purple-800/50 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 relative animate-in fade-in zoom-in-95 duration-200 text-white">
          <div className="p-5 border-b border-purple-900/40 flex items-center justify-between bg-[#0d0d14]">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-700/50 text-purple-300 flex items-center justify-center font-bold">
                <i className="fa-solid fa-receipt"></i>
              </span>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Order #{String(order.id).slice(-8)}
                </h3>
                <p className="text-[11px] text-purple-300/70 font-mono">
                  Full ID: #{order.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white p-2 rounded-xl transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Status</p>
                <span className={`status-pill ${order.status} mt-1`}>
                  {order.status === 'processing' && <span className="processing-spinner mr-1"></span>}
                  {order.status}
                </span>
              </div>
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Total Amount</p>
                <p className="text-base font-black text-emerald-400 mt-0.5">{formatPKR(order.total)}</p>
              </div>
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Customer Name</p>
                <p className="text-xs font-black text-white mt-1">{order.customer || 'Customer'}</p>
              </div>
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-black text-white mt-1 uppercase">{order.method || 'Standard'}</p>
              </div>
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">User Email</p>
                <p className="text-xs font-mono font-bold text-purple-200 truncate mt-1 select-all">
                  {order.email || '—'}
                </p>
              </div>
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">User Password</p>
                <p className="text-xs font-mono font-black text-white truncate mt-1 select-all">
                  {displayPassword}
                </p>
              </div>
            </div>

            {order.phone && (
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Sender Phone / Account</p>
                <p className="text-xs font-mono font-bold text-white mt-1 select-all">{order.phone}</p>
              </div>
            )}

            {order.transactionId && (
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1">Transaction Ref / ID</p>
                <p className="text-xs font-mono font-bold text-white select-all">{order.transactionId}</p>
              </div>
            )}

            {order.proofUrl && (
              <div className="p-3 bg-[#0d0d14] border border-purple-900/40 rounded-xl">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1">Payment Proof URL</p>
                <a
                  href={order.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-purple-300 hover:text-white underline break-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  {order.proofUrl}
                </a>
              </div>
            )}

            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-2">Order Items</p>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-[#0d0d14] rounded-xl border border-purple-900/40">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover bg-black"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400">
                          <i className="fa-solid fa-box text-sm"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-purple-300/80 font-semibold">
                          Qty: {item.quantity} × {formatPKR(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        {formatPKR((item.quantity || 1) * item.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-400/60 py-3 text-center">No item breakdown recorded</p>
                )}
              </div>
            </div>

            {/* Individual OTP Dispatcher for this specific user */}
            {onUpdateStatus && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-key"></i>
                      <span>Send Individual OTP to This User</span>
                    </p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Target Buyer: <strong className="text-white font-mono">{order.email || order.customer}</strong>
                    </p>
                  </div>
                  {order.otp && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-500/50 font-mono text-xs font-black text-white">
                      Active OTP: {order.otp}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP (or leave blank for auto)"
                    value={customOtp}
                    onChange={(e) => setCustomOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-xs font-mono font-bold p-2.5 rounded-xl bg-[#0a0a0f] border border-amber-500/50 text-white outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus('otp_sent', customOtp.trim().length >= 4 ? customOtp.trim() : undefined);
                      setCustomOtp('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Send OTP</span>
                  </button>
                </div>
              </div>
            )}

            {onUpdateStatus && (
              <div className="p-3.5 bg-[#0d0d14] rounded-xl border border-purple-900/40">
                <p className="text-[10px] font-black uppercase text-purple-300 mb-2.5">Update Order Status</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('pending')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'pending'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#13131a] text-amber-300 border-amber-500/40 hover:bg-amber-950/50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('processing')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'processing'
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-[#13131a] text-purple-300 border-purple-500/40 hover:bg-purple-950/50'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('verified')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'verified'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[#13131a] text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/50'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('delivered')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'delivered'
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    <i className="fa-solid fa-check-double mr-1"></i> Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('rejected')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      order.status === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-[#13131a] text-rose-300 border-rose-500/40 hover:bg-rose-950/50'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-purple-900/40 bg-[#0d0d14] flex items-center justify-between">
            {onDeleteOrder ? (
              <button
                type="button"
                onClick={() => onDeleteOrder(String(order.id))}
                className="bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Delete Order</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="bg-[#1b152b] hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-700/50 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
