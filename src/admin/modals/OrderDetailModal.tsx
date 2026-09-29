import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderDeliveryInfo } from '../../types/store';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  userPassword?: string;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus, customOtp?: string, deliveryInfo?: OrderDeliveryInfo) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  userPassword,
  onClose,
  onUpdateStatus,
  onDeleteOrder
}) => {
  const [customOtp, setCustomOtp] = useState('');
  const [productName, setProductName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (!order) return;
    const defaultProdName =
      order.deliveryInfo?.productName ||
      (order.items && order.items.length > 0
        ? order.items.map((it) => it.name).join(', ')
        : 'Flagship Tech / Digital Product');
    const firstId = order.items?.[0]?.productId || order.items?.[0]?.id || order.id;
    const defaultLink =
      order.deliveryInfo?.productLink ||
      order.items?.[0]?.productUrl ||
      `${window.location.origin}/#product-${firstId}`;
    const defaultDownload =
      order.deliveryInfo?.downloadUrl ||
      order.items?.[0]?.image ||
      defaultLink;

    setProductName(defaultProdName);
    setProductLink(defaultLink);
    setDownloadUrl(defaultDownload);
    setFileName(
      order.deliveryInfo?.fileName ||
        `${defaultProdName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.html`
    );
    setLicenseKey(
      order.deliveryInfo?.licenseKey ||
        `APX-KEY-${String(order.id).slice(-6).toUpperCase()}`
    );
    setDeliveryNote(
      order.deliveryInfo?.deliveryNote ||
        'Thank you for your order! Your verified product link, license key, and direct download file are included below.'
    );
  }, [order]);

  if (!isOpen || !order) return null;

  const statusColor = (status: OrderStatus) => {
    switch (status) {
      case 'verified':
      case 'delivered':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'otp_sent':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      case 'processing':
      case 'preparing':
      case 'shipped':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/50';
      case 'rejected':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDownloadUrl(reader.result);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeliverWithDetails = () => {
    const info: OrderDeliveryInfo = {
      productName: productName.trim() || 'Verified Order Package',
      productLink: productLink.trim() || window.location.origin,
      downloadUrl: downloadUrl.trim() || productLink.trim() || window.location.origin,
      fileName: fileName.trim() || 'ApexStore_Product_Package.html',
      licenseKey: licenseKey.trim(),
      deliveryNote: deliveryNote.trim(),
      deliveredAt: new Date().toISOString()
    };
    onUpdateStatus('delivered', undefined, info);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-[#13131a] rounded-3xl border border-purple-800/60 shadow-2xl shadow-purple-950/90 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-purple-900/50 bg-gradient-to-r from-purple-950/60 via-[#13131a] to-[#13131a]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
              Order Verification &amp; Product Delivery Console
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Order #{String(order.id).slice(-6)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${statusColor(
                order.status
              )}`}
            >
              {order.status === 'otp_sent' ? 'OTP Sent' : order.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Customer & Payment Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0d0d14] p-4 rounded-2xl border border-purple-900/40 text-xs">
            <div>
              <span className="text-purple-400/70 block font-bold">Customer Name</span>
              <span className="font-black text-white">{order.customer || 'Guest Buyer'}</span>
            </div>
            <div>
              <span className="text-purple-400/70 block font-bold">Buyer Email (Target)</span>
              <span className="font-black text-purple-300 break-all">{order.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-purple-400/70 block font-bold">User Login Password</span>
              <span className="font-mono font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40 inline-block mt-0.5">
                {order.userPassword || userPassword || '••••••'}
              </span>
            </div>
            <div>
              <span className="text-purple-400/70 block font-bold">Phone / Mobile</span>
              <span className="font-black text-white">{order.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-purple-400/70 block font-bold">Payment Gateway</span>
              <span className="font-black text-emerald-300 uppercase">{order.method}</span>
            </div>
            <div>
              <span className="text-purple-400/70 block font-bold">Transaction ID (TID)</span>
              <span className="font-mono font-black text-purple-200">{order.transactionId || 'N/A'}</span>
            </div>
            {order.otp && (
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-purple-400/70 text-[11px] font-bold mr-2">Dispatched 6-Digit OTP:</span>
                  <span className="font-mono font-black text-amber-300 tracking-widest bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/40">
                    {order.otp}
                  </span>
                </div>
                {order.otpVerified ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                    <i className="fa-solid fa-check-double mr-1"></i>
                    Buyer Verified OTP — Ready for Delivery!
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase">
                    <i className="fa-solid fa-hourglass-half mr-1"></i>
                    Waiting for Buyer to Enter OTP
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Step 1: Send 6-Digit OTP Box */}
          <div className="p-4 rounded-2xl bg-[#181326] border border-purple-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
                <i className="fa-solid fa-key text-amber-400"></i>
                <span>Step 1: Send 6-Digit OTP to {order.email || 'Buyer'}</span>
              </label>
              <span className="text-[10px] font-bold text-purple-300/70">
                When buyer enters OTP, order auto-switches to Processing
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={8}
                value={customOtp}
                onChange={(e) => setCustomOtp(e.target.value)}
                placeholder="Type custom 6-digit OTP or leave blank for auto-OTP"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-purple-700/60 bg-[#0d0d14] text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus('otp_sent', customOtp);
                  setCustomOtp('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Send OTP to User</span>
              </button>
            </div>
          </div>

          {/* Step 2 & 3: Product Delivery Package Form (Product Name, Product Link, Download URL/File, Details) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#111e1c] via-[#13131a] to-[#181326] border border-emerald-500/40 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-800/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider">
                  Step 2: Deliver Product Name, Link, Download &amp; Details to User
                </h4>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Unlocks User Download Button
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                  Delivered Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Apex Pro Wireless Studio"
                  className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                  License Key / Activation Code
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="e.g. APX-KEY-982341"
                  className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-amber-300 font-mono text-xs font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                Product Link (Direct Access URL / Drive / Website Link)
              </label>
              <input
                type="text"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-sky-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                Product Download File URL or Upload File for Customer Download
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://... or upload file"
                  className="flex-1 px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
                <label className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/50 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload File</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                Full Delivery Details &amp; Instructions for Customer
              </label>
              <textarea
                rows={2}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Write complete product instructions, credentials, or delivery notes for the customer..."
                className="w-full px-3 py-2 rounded-xl border border-purple-800/60 bg-[#0d0d14] text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              onClick={handleDeliverWithDetails}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-box-open"></i>
              <span>Send Product Link, Download &amp; Details — Mark Delivered</span>
            </button>
          </div>

          {/* Items Ordered */}
          <div>
            <h4 className="text-xs font-bold uppercase text-purple-400 mb-2">Ordered Items</h4>
            <div className="divide-y divide-purple-900/30 border border-purple-900/40 rounded-2xl overflow-hidden bg-[#0d0d14]">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-purple-800/50 shrink-0"
                      />
                    )}
                    <span className="font-bold text-white truncate">
                      {item.name} <span className="text-purple-400">× {item.quantity}</span>
                    </span>
                  </div>
                  <span className="font-black text-purple-200 shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-[#181326] text-sm font-black text-white">
                <span>Total Paid</span>
                <span className="text-emerald-400">Rs. {(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Screenshot Proof */}
          {order.proofUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase text-purple-400 mb-2">Payment Proof Screenshot</h4>
              <div className="rounded-2xl overflow-hidden border border-purple-900/50 bg-[#0d0d14] max-h-56 flex items-center justify-center">
                <img
                  src={order.proofUrl}
                  alt="Payment Proof"
                  className="max-h-56 w-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Status Actions */}
        <div className="px-5 sm:px-6 py-4 bg-[#0d0d14] border-t border-purple-900/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateStatus('otp_sent', customOtp)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-key"></i>
              <span>Send OTP</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus('processing')}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-gears"></i>
              <span>Processing</span>
            </button>
            <button
              type="button"
              onClick={handleDeliverWithDetails}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-truck-fast"></i>
              <span>Deliver + Link</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus('rejected')}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>Reject</span>
            </button>
            {onDeleteOrder && (
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(String(order.id));
                  onClose();
                }}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/50 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Delete</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/50 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
