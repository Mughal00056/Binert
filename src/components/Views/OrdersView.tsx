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

  // Strict privacy: Only show orders when user is logged in with email & password, and ONLY their own non-deleted orders
  let deletedIdsSet = new Set<string>();
  try {
    const rawDel = localStorage.getItem('apex_deleted_order_ids');
    if (rawDel) {
      const parsed: string[] = JSON.parse(rawDel);
      if (Array.isArray(parsed)) {
        deletedIdsSet = new Set(parsed.map((id) => String(id).trim()));
      }
    }
  } catch {}

  const userOrders = orders.filter((o) => {
    if (deletedIdsSet.has(String(o.id).trim())) {
      return false;
    }
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

  const handleInstantVerifyOtp = (order: Order) => {
    if (!order.otp) return;
    setOtpInputs((prev) => ({ ...prev, [order.id]: order.otp || '' }));
    setVerifyingId(order.id);
    setTimeout(() => {
      verifyOrderOtp(order.id, order.otp || '');
      setVerifyingId(null);
    }, 250);
  };

  const handleDownloadDeliveredProduct = (order: Order) => {
    const prodName =
      order.deliveryInfo?.productName ||
      order.items.map((i) => i.name).join(', ') ||
      'ApexStore Digital Product';
    const prodLink =
      order.deliveryInfo?.productLink ||
      order.items?.[0]?.productUrl ||
      `${window.location.origin}/#product-${order.items?.[0]?.productId || order.items?.[0]?.id || order.id}`;
    const dlUrl = order.deliveryInfo?.downloadUrl || '';
    const license =
      order.deliveryInfo?.licenseKey || `APX-KEY-${String(order.id).slice(-6).toUpperCase()}`;
    const note =
      order.deliveryInfo?.deliveryNote ||
      'Thank you for purchasing from ApexStore! Your verified product access link and license details are below.';

    // If Admin uploaded a direct data URL file, trigger direct download of that file
    if (dlUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = order.deliveryInfo?.fileName || `${prodName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate a complete, styled offline Product Delivery Package HTML file for instant download
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Delivered Product Package - ${prodName}</title>
<style>
  body { background:#0a0a0f; color:#f8fafc; font-family: system-ui, -apple-system, sans-serif; padding: 32px 16px; margin:0; }
  .card { max-width: 640px; margin: 0 auto; background: #13131a; border: 2px solid #10b981; border-radius: 24px; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.7); }
  .badge { display:inline-block; background:#064e3b; color:#6ee7b7; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
  h1 { font-size: 24px; margin: 14px 0 6px; color: #ffffff; }
  .meta { color: #a78bfa; font-size: 13px; margin-bottom: 20px; }
  .box { background: #0d0d14; border: 1px solid rgba(168,85,247,0.35); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
  .label { font-size: 11px; text-transform: uppercase; color: #c084fc; font-weight: 800; letter-spacing: 0.8px; display:block; margin-bottom: 6px; }
  .val { font-size: 15px; font-weight: 800; color: #ffffff; word-break: break-all; }
  .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #052e16; font-weight: 900; text-decoration: none; padding: 12px 22px; border-radius: 12px; margin-top: 10px; font-size: 14px; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">✓ Official ApexStore Product Delivery Package</span>
    <h1>${prodName}</h1>
    <div class="meta">Order #${String(order.id).slice(-8)} • Buyer: ${order.email || order.customer} • Total: Rs. ${(order.total || 0).toLocaleString()}</div>
    <div class="box">
      <span class="label">Official Product Access Link</span>
      <div class="val"><a href="${prodLink}" style="color:#38bdf8">${prodLink}</a></div>
      <a class="btn" href="${prodLink}" target="_blank">Open Product Link</a>
    </div>
    ${
      dlUrl
        ? `<div class="box">
      <span class="label">Direct Download Asset / File URL</span>
      <div class="val"><a href="${dlUrl}" style="color:#34d399">${dlUrl}</a></div>
      <a class="btn" href="${dlUrl}" target="_blank" download>Download Product File</a>
    </div>`
        : ''
    }
    <div class="box">
      <span class="label">License Key / Activation Code</span>
      <div class="val" style="font-family:monospace; color:#fcd34d;">${license}</div>
    </div>
    <div class="box">
      <span class="label">Delivery Instructions &amp; Details from Admin</span>
      <div class="val" style="font-weight:500; line-height:1.6;">${note}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexStore_${prodName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Order_${String(order.id).slice(-6)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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

                  {/* CASE 2: PROCESSING BY ADMIN (After Buyer Enters OTP) */}
                  {isProcessing && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#1a142c] to-purple-950/40 border border-purple-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/50 text-purple-300 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-gears animate-spin text-lg" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">
                              Order Processing in Progress ⚙️
                            </h4>
                            {order.otpVerified && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                ✓ OTP Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-purple-200/90 mt-1 leading-relaxed">
                            Your OTP is confirmed and your order is now <strong>Processing</strong>! Admin is preparing your <strong>Product Name, Product Link, Download File &amp; Delivery Details</strong>. As soon as Admin delivers, your download &amp; link will unlock right here automatically!
                          </p>
                        </div>
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

                  {/* CASE 4: DELIVERED BY ADMIN — FULL PRODUCT DELIVERY PACKAGE, LINK & DOWNLOAD FEATURE */}
                  {isDelivered && (
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-[#0f1c1e] to-[#13131a] border-2 border-emerald-500/60 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 text-lg font-black shadow-lg">
                            <i className="fa-solid fa-box-open" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
                              Official Admin Delivery Package Ready
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-white">
                              {order.deliveryInfo?.productName ||
                                order.items.map((it) => it.name).join(', ') ||
                                'Order Verified & Delivered! 🎉'}
                            </h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadDeliveredProduct(order)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-download" />
                            <span>Download Product</span>
                          </button>

                          {(order.deliveryInfo?.productLink || order.items?.[0]?.productUrl) && (
                            <a
                              href={
                                order.deliveryInfo?.productLink ||
                                order.items?.[0]?.productUrl ||
                                '#'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2"
                            >
                              <i className="fa-solid fa-up-right-from-square" />
                              <span>Open Product Link</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Delivered Product Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#0a0a0f]/90 border border-emerald-800/40">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                            Delivered Product Name
                          </span>
                          <span className="font-black text-white text-sm">
                            {order.deliveryInfo?.productName ||
                              order.items.map((it) => it.name).join(', ')}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0a0a0f]/90 border border-emerald-800/40">
                          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block mb-1">
                            Direct Product Link
                          </span>
                          <a
                            href={
                              order.deliveryInfo?.productLink ||
                              order.items?.[0]?.productUrl ||
                              '#'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-bold text-sky-300 hover:text-white underline break-all"
                          >
                            {order.deliveryInfo?.productLink ||
                              order.items?.[0]?.productUrl ||
                              `${window.location.origin}/#product-${order.items?.[0]?.id || order.id}`}
                          </a>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#0a0a0f]/90 border border-emerald-800/40">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                            License / Activation Key
                          </span>
                          <span className="font-mono font-black text-amber-300 select-all">
                            {order.deliveryInfo?.licenseKey ||
                              `APX-KEY-${String(order.id).slice(-6).toUpperCase()}`}
                          </span>
                        </div>
                      </div>

                      {/* Admin Delivery Notes / Instructions */}
                      <div className="p-3.5 rounded-xl bg-[#0a0a0f]/90 border border-purple-900/50">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                          <i className="fa-solid fa-circle-info mr-1 text-purple-400" />
                          Delivery Details &amp; Instructions from Admin
                        </span>
                        <p className="text-xs text-purple-100 leading-relaxed whitespace-pre-line">
                          {order.deliveryInfo?.deliveryNote ||
                            'Thank you for shopping with ApexStore! Your product link and downloadable package are ready above.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CASE 5: ADMIN APPROVED — OTP CONFIRMATION BOX (Clearly Shows OTP to User) */}
                  {(isOtpSent || (order.otp && !order.otpVerified && !isDelivered && !isRejected)) && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1c142b] to-amber-500/10 border-2 border-amber-400/70 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shrink-0 shadow">
                            <i className="fa-solid fa-key" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                              Step 1 Complete • Admin Sent Your Personal OTP
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-white">
                              Enter Your 6-Digit OTP to Start Order Processing
                            </h4>
                          </div>
                        </div>

                        {order.otp && (
                          <div className="flex items-center gap-2.5 bg-[#0a0a0f] border-2 border-amber-400 px-4 py-2 rounded-2xl shadow-md">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">
                                Your Order OTP Code
                              </span>
                              <span className="font-mono text-lg sm:text-xl font-black text-white tracking-[0.25em] select-all">
                                {order.otp}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAutoFillOtp(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otpInputs[order.id] || ''}
                          onChange={(e) => handleOtpChange(order.id, e.target.value)}
                          className="w-full sm:w-60 bg-[#0a0a0f] border-2 border-amber-500/70 rounded-xl px-4 py-2.5 text-center font-mono text-base font-black text-white tracking-widest outline-none focus:border-amber-300"
                        />
                        <button
                          type="button"
                          disabled={verifyingId === order.id}
                          onClick={() => handleConfirmOtp(order.id)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          {verifyingId === order.id ? (
                            <i className="fa-solid fa-spinner animate-spin" />
                          ) : (
                            <i className="fa-solid fa-circle-check" />
                          )}
                          <span>Verify OTP → Start Order Processing</span>
                        </button>
                        {order.otp && (
                          <button
                            type="button"
                            onClick={() => handleInstantVerifyOtp(order)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-bolt" />
                            <span>1-Click Verify OTP ({order.otp})</span>
                          </button>
                        )}
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
