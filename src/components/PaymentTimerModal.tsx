import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';
import confetti from 'canvas-confetti';

export const PaymentTimerModal: React.FC = () => {
  const {
    timerModalOpen,
    setTimerModalOpen,
    activeTimerOrderId,
    orders,
    currentOrder,
    verifyOrderOtp,
    deleteOrder,
    openOrdersView,
    setQuickViewProduct,
    products,
    setReceiptOrder
  } = useStore();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!timerModalOpen) return null;

  const order =
    orders.find((o) => String(o.id) === String(activeTimerOrderId)) ||
    currentOrder ||
    orders[0];
  if (!order) return null;

  const secondsLeft = order.approvalSecondsLeft ?? 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isPending = order.status === 'pending';
  const isOtpSent = order.status === 'otp_sent';
  const isProcessing =
    order.status === 'processing' ||
    order.status === 'preparing' ||
    order.status === 'shipped';
  const isRejected = order.status === 'rejected';
  const isVerifiedOrLater =
    order.status === 'verified' ||
    order.status === 'delivered';

  const handleClose = () => {
    setTimerModalOpen(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpInput.trim()) {
      setOtpError('Please enter the 6-digit confirmation OTP.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyOrderOtp(order.id, otpInput.trim());
      setIsVerifying(false);
      if (!res.success) {
        setOtpError(res.error || 'Invalid OTP code.');
      } else {
        setOtpInput('');
      }
    }, 400);
  };

  const handleQuickFillOtp = () => {
    if (order.otp) {
      setOtpInput(order.otp);
      setOtpError(null);
    }
  };

  const handleViewProduct = (productId?: number) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setQuickViewProduct(prod);
    }
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#13131a] rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl shadow-purple-950/80 my-auto flex flex-col max-h-[92vh] animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Header with prominent [X] Close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-[#13131a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${
              isVerifiedOrLater
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isRejected
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isProcessing
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : isOtpSent
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-purple-900/50 text-purple-300 border border-purple-500/40'
            }`}>
              <i className={`fa-solid ${
                isVerifiedOrLater
                  ? 'fa-circle-check'
                  : isRejected
                  ? 'fa-circle-xmark'
                  : isProcessing
                  ? 'fa-gears animate-spin'
                  : isOtpSent
                  ? 'fa-key'
                  : 'fa-hourglass-half animate-spin'
              }`} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {isVerifiedOrLater
                  ? 'Order Confirmed & Delivered'
                  : isRejected
                  ? 'Order Rejected by Admin'
                  : isProcessing
                  ? 'Order Processing in Progress'
                  : isOtpSent
                  ? 'Admin Approved • Enter OTP'
                  : 'Payment Under Review'}
              </h3>
              <p className="text-[10px] text-purple-300/80 font-mono">
                Order #{String(order.id).slice(-8)} • {formatPKR(order.total)}
              </p>
            </div>
          </div>

          {/* Explicit [X] Close Button */}
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1b152b] hover:bg-purple-900/60 text-purple-300 hover:text-white flex items-center justify-center shadow transition cursor-pointer border border-purple-800/40 shrink-0 group"
            title="Close this window (Order continues tracking in My Orders)"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Notice that user can close modal anytime */}
        <div className="bg-purple-950/40 px-4 py-2 border-b border-purple-900/30 flex items-center justify-between text-[11px] text-purple-300">
          <span className="flex items-center gap-1.5 truncate">
            <i className="fa-solid fa-circle-info text-purple-400" />
            <span>You can close this window <strong>[X]</strong> anytime. Order updates live in <strong>My Orders</strong>.</span>
          </span>
          <button
            onClick={() => {
              handleClose();
              openOrdersView();
            }}
            className="text-[10px] font-black text-purple-300 hover:text-white underline uppercase tracking-wider shrink-0 ml-2 cursor-pointer"
          >
            Orders Page →
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* STAGE 1: PENDING ADMIN APPROVAL (Timer Active) */}
          {isPending && (
            <div className="text-center py-2 space-y-4">
              {/* Circular Timer Display */}
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-950 animate-pulse" />
                <div className="absolute inset-1 rounded-full border-2 border-purple-500/40" />
                <div className="relative flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white tracking-wider">
                    {formattedTime}
                  </span>
                  <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest mt-0.5">
                    Review Timer
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-white">Merchant Review in Progress</h4>
                <p className="text-xs text-purple-300/80 max-w-sm mx-auto mt-1 leading-relaxed">
                  Admin is manually validating your transaction ID <span className="text-white font-mono font-bold">({order.transactionId})</span> and payment proof screenshot.
                </p>
              </div>

              {/* Order summary pill */}
              <div className="bg-[#181824] rounded-2xl p-3 border border-purple-900/40 text-left text-xs space-y-1.5">
                <div className="flex justify-between items-center text-purple-300/80">
                  <span>Method:</span>
                  <span className="text-white font-bold capitalize">{order.method}</span>
                </div>
                <div className="flex justify-between items-center text-purple-300/80">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400 font-black">{formatPKR(order.total)}</span>
                </div>
                <div className="flex justify-between items-center text-purple-300/80">
                  <span>Status:</span>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-extrabold uppercase text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Awaiting Merchant OTP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 1B: PROCESSING */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-purple-900/25 border border-purple-500/50 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-gears animate-spin text-base" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Order Processing in Progress
                </h4>
                <p className="text-xs text-purple-200/90 mt-0.5">
                  Admin marked your order as <strong>Processing</strong> and is preparing your items.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 1C: REJECTED */}
          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-circle-xmark text-base" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-200 uppercase tracking-wider">
                  Order Rejected by Admin
                </h4>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  Merchant declined the payment verification for this order.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2: ADMIN APPROVED — ENTER OTP */}
          {isOtpSent && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fa-solid fa-key text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    Admin Approved Your Order!
                  </p>
                  <p className="text-[11px] text-amber-200/90 mt-0.5 leading-snug">
                    The merchant verified your payment and sent a 6-digit confirmation OTP. Enter it below to complete checkout.
                  </p>
                </div>
              </div>

              {/* Demo OTP Helper Box */}
              {order.otp && (
                <div className="p-3 rounded-xl bg-[#1b152b] border border-purple-700/40 flex items-center justify-between">
                  <div className="text-xs text-purple-300">
                    <span>Admin Dispatched OTP: </span>
                    <strong className="text-white font-mono text-sm tracking-widest bg-purple-950 px-2 py-0.5 rounded border border-purple-600/40 ml-1">
                      {order.otp}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillOtp}
                    className="text-[11px] font-black text-purple-300 hover:text-white underline bg-purple-900/50 hover:bg-purple-800 px-2.5 py-1 rounded-lg border border-purple-600/30 transition cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1">
                    Enter 6-Digit OTP:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 583921"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, ''));
                      setOtpError(null);
                    }}
                    autoFocus
                    className="w-full bg-[#181824] border border-purple-800/80 rounded-2xl px-4 py-3 text-center text-xl font-mono font-black text-white outline-none focus:border-purple-400 tracking-[0.3em]"
                  />
                  {otpError && (
                    <p className="text-xs font-bold text-rose-400 mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-triangle-exclamation" /> {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check" />
                      <span>Verify OTP → Start Order Processing</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STAGE 3: ORDER VERIFIED / DELIVERED WITH PRODUCT LINK & DOWNLOAD */}
          {isVerifiedOrLater && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0e1c1b] to-[#13131a] border-2 border-emerald-500/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                    <i className="fa-solid fa-box-open text-base" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {order.deliveryInfo?.productName || 'Order Delivered — Product Package Ready! 🎉'}
                    </h4>
                    <p className="text-xs text-emerald-300 font-medium">
                      Admin has delivered your product link, license key &amp; downloadable package!
                    </p>
                  </div>
                </div>

                {order.deliveryInfo && (
                  <div className="p-3 rounded-xl bg-[#0a0a0f] border border-emerald-800/50 space-y-2 text-xs">
                    {order.deliveryInfo.productLink && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-purple-300 font-bold">Product Link:</span>
                        <a
                          href={order.deliveryInfo.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-sky-300 hover:text-white underline truncate max-w-[220px]"
                        >
                          {order.deliveryInfo.productLink}
                        </a>
                      </div>
                    )}
                    {order.deliveryInfo.licenseKey && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-purple-300 font-bold">License Key:</span>
                        <span className="font-mono font-black text-amber-300 select-all">
                          {order.deliveryInfo.licenseKey}
                        </span>
                      </div>
                    )}
                    {order.deliveryInfo.deliveryNote && (
                      <p className="text-[11px] text-purple-200/90 pt-1 border-t border-purple-900/40">
                        {order.deliveryInfo.deliveryNote}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {order.deliveryInfo?.productLink && (
                    <a
                      href={order.deliveryInfo.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-up-right-from-square" />
                      <span>Open Product Link</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      openOrdersView();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-download" />
                    <span>Download in My Orders</span>
                  </button>
                </div>
              </div>

              {/* Products in this order with Image, details, and direct URL */}
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-purple-300 mb-2">
                  Purchased Products ({order.items.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#181824] border border-purple-900/40 flex items-center justify-between gap-3 hover:border-purple-700/60 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-purple-800/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-purple-300 transition">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-purple-300/80">
                            Qty: <strong className="text-white">{item.quantity}</strong> × {formatPKR(item.price)}
                          </p>
                          {item.productUrl && (
                            <span className="text-[10px] text-purple-400 font-mono truncate block">
                              URL: {item.productUrl}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewProduct(item.productId || item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer border border-purple-700/40"
                      >
                        View Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Tracking Status Stepper */}
              <div className="p-3.5 rounded-2xl bg-[#181824] border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Live Tracking Status
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-emerald-500 text-white font-extrabold shadow-sm">
                    Delivered
                  </span>
                </div>

                {/* Progress bar steps: 3 direct stages */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Order Placed', done: true },
                    { label: 'Admin OTP Verified', done: true },
                    { label: 'Delivered', done: true }
                  ].map((st, i) => (
                    <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-[#12121d] border border-emerald-500/30">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 bg-emerald-500 text-white">
                        <i className="fa-solid fa-check" />
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-tight">
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-purple-900/40 bg-[#0d0d14] flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              handleClose();
              openOrdersView();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/60 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-box-open" />
            <span>Open My Orders</span>
          </button>

          {isVerifiedOrLater && (
            <button
              onClick={() => {
                setReceiptOrder(order);
                handleClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <i className="fa-solid fa-file-invoice" />
              <span>View Slip</span>
            </button>
          )}

          <button
            onClick={() => {
              deleteOrder(order.id);
              handleClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/50 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
            title="Delete this order"
          >
            <i className="fa-solid fa-trash-can" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleClose}
            className="py-2.5 px-3 rounded-xl bg-[#1b152b] hover:bg-[#251d3b] text-purple-300 hover:text-white border border-purple-800/40 text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            Close [X]
          </button>
        </div>

      </div>
    </div>
  );
};
