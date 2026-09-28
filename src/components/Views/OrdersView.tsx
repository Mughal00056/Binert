import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatPKR } from '../../utils/helpers';
import { Order, OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const {
    orders,
    currentUser,
    openSignIn,
    goHome,
    setReceiptOrder,
    setQuickViewProduct,
    products,
    verifyOrderOtp,
    deleteOrder,
    setActiveTimerOrderId,
    setTimerModalOpen
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<number, string>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Strict privacy: Only show orders when user is logged in with email & password, and ONLY their own orders
  const userOrders = orders.filter((o) => {
    if (!currentUser || !currentUser.email) {
      return false;
    }
    const orderEmail = (o.email || '').trim().toLowerCase();
    const myEmail = currentUser.email.trim().toLowerCase();
    if (!orderEmail || orderEmail !== myEmail) {
      return false;
    }
    if (searchOrderId.trim()) {
      const match =
        String(o.id).includes(searchOrderId.trim()) ||
        (o.transactionId || '').toLowerCase().includes(searchOrderId.trim().toLowerCase());
      if (!match) return false;
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        return o.status === 'pending' || o.status === 'otp_sent';
      }
      if (filterStatus === 'processing') {
        return o.status === 'processing' || o.status === 'preparing' || o.status === 'shipped';
      }
      if (filterStatus === 'delivered') {
        return o.status === 'delivered' || o.status === 'verified';
      }
      return o.status === filterStatus;
    }
    return true;
  });

  const handleOtpChange = (orderId: number, val: string) => {
    setOtpInputs((prev) => ({ ...prev, [orderId]: val.replace(/\D/g, '') }));
    setOtpErrors((prev) => ({ ...prev, [orderId]: '' }));
  };

  const handleConfirmOtp = (orderId: number) => {
    const code = (otpInputs[orderId] || '').trim();
    if (!code) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: 'Please enter the 6-digit OTP.' }));
      return;
    }

    setVerifyingId(orderId);
    setTimeout(() => {
      const res = verifyOrderOtp(orderId, code);
      setVerifyingId(null);
      if (!res.success) {
        setOtpErrors((prev) => ({ ...prev, [orderId]: res.error || 'Invalid OTP code.' }));
      } else {
        setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
      }
    }, 400);
  };

  const handleAutoFillOtp = (order: Order) => {
    if (order.otp) {
      handleOtpChange(order.id, order.otp);
    }
  };

  const handleViewProduct = (productId?: number) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setQuickViewProduct(prod);
    }
  };

  const handleOpenTimerModal = (orderId: number) => {
    setActiveTimerOrderId(orderId);
    setTimerModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
            <button onClick={goHome} className="hover:text-white transition cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-white">My Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <i className="fa-solid fa-box-open text-purple-400" />
            <span>Order Tracking &amp; History</span>
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Real-time merchant verification timers, OTP confirmations, and courier tracking.
          </p>
        </div>

        {!currentUser ? (
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 flex items-center gap-3">
            <div className="text-xs text-purple-300">
              <span className="font-bold text-white block">Guest Mode</span>
              <span className="text-[11px] text-purple-300/80">Sign in to save orders permanently</span>
            </div>
            <button
              onClick={openSignIn}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#13131a] border border-purple-800/50 text-xs font-mono text-purple-300">
              Signed in as: <strong className="text-white">{currentUser.name.split(' ')[0]}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="my-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Under Review / OTP' },
            { key: 'processing', label: 'Processing' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-950/50'
                  : 'bg-[#151522] text-purple-300/80 hover:bg-purple-950/60 hover:text-white border border-purple-900/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order ID Search */}
        <div className="relative max-w-xs w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs" />
          <input
            type="text"
            placeholder="Search by Order ID or TRX..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#13131a] border border-purple-900/50 rounded-xl text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Orders List */}
      {userOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#111119] rounded-3xl border border-purple-900/30 p-8 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center text-3xl shadow-inner">
            <i className="fa-solid fa-box-open" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">No Orders Found</h3>
            <p className="text-xs text-purple-300/70 max-w-sm mx-auto mt-1">
              {currentUser
                ? "You haven't placed any orders matching this filter yet."
                : 'Sign in to see your active and past orders, or search by Order ID above.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={goHome}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-purple-900/40"
            >
              Explore Products
            </button>
            {!currentUser && (
              <button
                onClick={openSignIn}
                className="px-5 py-2.5 rounded-xl bg-[#1b152b] hover:bg-[#251d3b] text-purple-200 border border-purple-700/50 font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isOtpSent = order.status === 'otp_sent';
            const isProcessing =
              order.status === 'processing' ||
              order.status === 'preparing' ||
              order.status === 'shipped';
            const isRejected = order.status === 'rejected';
            const isDelivered =
              order.status === 'delivered' ||
              order.status === 'verified';

            const secondsLeft = order.approvalSecondsLeft ?? 0;
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            return (
              <div
                key={order.id}
                className={`rounded-3xl border overflow-hidden transition-all shadow-xl ${
                  isPending
                    ? 'bg-[#151224] border-purple-700/50 shadow-purple-950/40'
                    : isOtpSent
                    ? 'bg-[#1b1429] border-amber-500/50 shadow-amber-950/30'
                    : isProcessing
                    ? 'bg-[#171226] border-purple-500/50 shadow-purple-950/40'
                    : isDelivered
                    ? 'bg-[#0f1820] border-emerald-500/40'
                    : isRejected
                    ? 'bg-[#1f1016] border-rose-500/50 shadow-rose-950/30'
                    : 'bg-[#13131c] border-purple-900/40'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 border-b border-purple-900/30 bg-[#0d0d16] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-300">
                      <i className={`fa-solid ${
                        isDelivered
                          ? 'fa-circle-check text-emerald-400'
                          : isRejected
                          ? 'fa-circle-xmark text-rose-400'
                          : isProcessing
                          ? 'fa-gears text-purple-400 animate-spin'
                          : isOtpSent
                          ? 'fa-key text-amber-400'
                          : 'fa-clock text-purple-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-white">
                          #{String(order.id).slice(-8)}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isDelivered
                              ? 'bg-emerald-500 text-white'
                              : isRejected
                              ? 'bg-rose-600 text-white'
                              : isProcessing
                              ? 'bg-purple-600 text-white'
                              : isOtpSent
                              ? 'bg-amber-400 text-black font-extrabold animate-pulse'
                              : 'bg-purple-900/80 text-purple-200 border border-purple-600/40'
                          }`}
                        >
                          {isOtpSent
                            ? 'Admin Approved • Enter OTP'
                            : isDelivered
                            ? 'Delivered'
                            : isRejected
                            ? 'Rejected'
                            : isProcessing
                            ? 'Processing'
                            : 'Pending Admin Action'}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-400/80 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">Total Amount</span>
                      <span className="text-base sm:text-lg font-black text-white">
                        {formatPKR(order.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1f1a2e] hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      title="View Official Receipt"
                    >
                      <i className="fa-solid fa-file-invoice" />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-950/60 hover:bg-rose-600 border border-rose-700/50 text-rose-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      title="Delete this Order"
                    >
                      <i className="fa-solid fa-trash-can" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-5">
                  
                  {/* CASE 1: PENDING ADMIN APPROVAL — TIMING DISPLAY */}
                  {isPending && (
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-700/40 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#0a0a0f] border-2 border-purple-500/60 flex flex-col items-center justify-center text-center shadow-lg shadow-purple-950/80">
                          <span className="font-mono text-base font-black text-white tracking-wider">
                            {formattedTimer}
                          </span>
                          <span className="text-[8px] font-extrabold text-purple-400 uppercase tracking-tight">
                            Time Left
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                            <span>Awaiting Merchant Decision</span>
                          </h4>
                          <p className="text-xs text-purple-300/80 mt-0.5 leading-relaxed">
                            Admin is reviewing your transaction ID <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">{order.transactionId}</code>. Status will update here as soon as Admin selects Processing, OTP, Deliver, or Reject.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenTimerModal(order.id)}
                          className="flex-1 md:flex-initial py-2 px-3.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                          <i className="fa-solid fa-clock mr-1.5" />
                          View Timer Modal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CASE 2: PROCESSING BY ADMIN */}
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
                          Admin has marked your order as <strong>Processing</strong> and is preparing your items for dispatch.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CASE 3: REJECTED BY ADMIN */}
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
                          Merchant declined the payment verification for this order. Please check your transaction details or contact support.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CASE 4: DELIVERED BY ADMIN */}
                  {isDelivered && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-circle-check text-base" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-200 uppercase tracking-wider">
                          Order Verified &amp; Delivered! 🎉
                        </h4>
                        <p className="text-xs text-emerald-300/90 mt-0.5">
                          Your order has been verified and marked as <strong>Delivered</strong> by Admin.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CASE 5: ADMIN APPROVED — OTP CONFIRMATION BOX */}
                  {isOtpSent && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-sm">
                            <i className="fa-solid fa-key" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">
                              Admin Approved! Enter OTP to Complete Checkout
                            </h4>
                            <p className="text-xs text-amber-200/90">
                              Payment verified by merchant. Enter the 6-digit confirmation OTP sent by Admin:
                            </p>
                          </div>
                        </div>

                        {order.otp && (
                          <div className="flex items-center gap-2 bg-[#120d20] border border-amber-500/40 px-3 py-1 rounded-xl">
                            <span className="text-[11px] text-amber-300">Admin Sent OTP:</span>
                            <span className="font-mono text-sm font-black text-white tracking-widest">{order.otp}</span>
                            <button
                              type="button"
                              onClick={() => handleAutoFillOtp(order)}
                              className="text-[10px] font-black text-amber-400 hover:text-white underline cursor-pointer"
                            >
                              Auto Fill
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otpInputs[order.id] || ''}
                          onChange={(e) => handleOtpChange(order.id, e.target.value)}
                          className="w-full sm:w-60 bg-[#0d0a17] border border-amber-500/60 rounded-xl px-4 py-2.5 text-center font-mono text-base font-black text-white tracking-widest outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          disabled={verifyingId === order.id}
                          onClick={() => handleConfirmOtp(order.id)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          {verifyingId === order.id ? (
                            <i className="fa-solid fa-spinner animate-spin" />
                          ) : (
                            <i className="fa-solid fa-circle-check" />
                          )}
                          <span>Confirm Order &amp; Complete Checkout</span>
                        </button>
                      </div>

                      {otpErrors[order.id] && (
                        <p className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <i className="fa-solid fa-triangle-exclamation" /> {otpErrors[order.id]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Purchased Products with Images and URLs */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 mb-3 flex items-center justify-between">
                      <span>Products in this Order ({order.items.length})</span>
                      <span className="text-[11px] text-purple-400 font-mono font-normal">
                        Payment: {order.method.toUpperCase()} • TRX: {order.transactionId}
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#0f0f18] border border-purple-900/40 flex items-center gap-3 hover:border-purple-700/60 transition group"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-black/60 border border-purple-800/40 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-purple-300 transition">
                              {item.name}
                            </h5>
                            <p className="text-xs text-purple-300/80 mt-0.5">
                              Quantity: <strong className="text-white">{item.quantity}</strong> × {formatPKR(item.price)}
                            </p>
                            {item.productUrl && (
                              <p className="text-[10px] text-purple-400/80 font-mono truncate mt-0.5">
                                URL: <span className="text-purple-300">{item.productUrl}</span>
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewProduct(item.productId || item.id)}
                            className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 text-[10px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer"
                          >
                            View Product
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Order Tracking Status Stepper — Nothing pre-selected before Admin action */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0d0d16] border border-purple-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                        Admin Order Status
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        isDelivered
                          ? 'bg-emerald-500 text-white'
                          : isRejected
                          ? 'bg-rose-600 text-white'
                          : isProcessing
                          ? 'bg-purple-600 text-white'
                          : isOtpSent
                          ? 'bg-amber-400 text-black font-extrabold'
                          : 'bg-[#1b152b] text-purple-300 border border-purple-700/40'
                      }`}>
                        {isDelivered
                          ? 'Delivered'
                          : isRejected
                          ? 'Rejected'
                          : isProcessing
                          ? 'Processing'
                          : isOtpSent
                          ? 'OTP Sent'
                          : 'Awaiting Admin Selection'}
                      </span>
                    </div>

                    {/* 4 Admin-Controlled Status Boxes — None pre-selected when pending */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
                      {[
                        {
                          step: 1,
                          title: 'Processing',
                          desc: isProcessing ? 'Currently processing' : 'Admin sets processing',
                          selected: isProcessing,
                          tone: 'purple'
                        },
                        {
                          step: 2,
                          title: 'OTP Verification',
                          desc: isOtpSent ? 'OTP sent to buyer' : 'Admin sends OTP',
                          selected: isOtpSent,
                          tone: 'amber'
                        },
                        {
                          step: 3,
                          title: 'Delivered',
                          desc: isDelivered ? 'Order delivered' : 'Admin marks delivered',
                          selected: isDelivered,
                          tone: 'emerald'
                        },
                        {
                          step: 4,
                          title: 'Rejected',
                          desc: isRejected ? 'Order declined' : 'Admin marks rejected',
                          selected: isRejected,
                          tone: 'rose'
                        }
                      ].map((st) => {
                        const activeClasses =
                          st.tone === 'emerald'
                            ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                            : st.tone === 'rose'
                            ? 'bg-rose-950/30 border-rose-500 text-rose-300 ring-1 ring-rose-500/40'
                            : st.tone === 'amber'
                            ? 'bg-amber-950/30 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                            : 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500/40';

                        const badgeClasses =
                          st.tone === 'emerald'
                            ? 'bg-emerald-500 text-white'
                            : st.tone === 'rose'
                            ? 'bg-rose-600 text-white'
                            : st.tone === 'amber'
                            ? 'bg-amber-500 text-black'
                            : 'bg-purple-600 text-white';

                        return (
                          <div
                            key={st.step}
                            className={`p-3 rounded-xl border transition-all ${
                              st.selected
                                ? activeClasses
                                : 'bg-[#14141e] border-purple-950/60 text-purple-400/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                  st.selected ? badgeClasses : 'bg-[#222230] text-purple-400/50'
                                }`}
                              >
                                {st.selected ? (
                                  <i className={`fa-solid ${st.tone === 'rose' ? 'fa-xmark' : 'fa-check'}`} />
                                ) : (
                                  st.step
                                )}
                              </div>
                              <span className="text-xs font-black truncate">{st.title}</span>
                            </div>
                            <p className="text-[10px] opacity-80 pl-7">{st.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline logs */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div className="pt-3 border-t border-purple-950 text-xs space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block mb-1">
                          Activity Log:
                        </span>
                        {order.timeline.map((entry, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-purple-300/80">
                            <span className="text-emerald-400">●</span>
                            <span className="font-mono text-purple-400 shrink-0">{entry.time}</span>
                            <span className="font-bold text-white shrink-0">{entry.title}:</span>
                            <span className="truncate">{entry.note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
