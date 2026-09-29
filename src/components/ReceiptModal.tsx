import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { formatPKR, copyToClipboard } from '../utils/helpers';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const ReceiptModal: React.FC = () => {
  const { receiptOrder, setReceiptOrder, showToast, transcriptSettings } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!receiptOrder) return null;

  const isVerified =
    receiptOrder.status === 'verified' || receiptOrder.status === 'delivered';
  const isDelivered = receiptOrder.status === 'delivered' || receiptOrder.status === 'verified';
  const isPending =
    receiptOrder.status === 'pending' ||
    receiptOrder.status === 'processing' ||
    receiptOrder.status === 'otp_sent';

  const deliv = receiptOrder.deliveryInfo || {};
  const delivProductName =
    deliv.productName ||
    receiptOrder.productName ||
    receiptOrder.items?.map((i) => i.name).join(', ') ||
    'ApexStore Verified Product';
  const delivProductLink =
    deliv.productLink ||
    receiptOrder.productLink ||
    receiptOrder.items?.[0]?.productUrl ||
    `${window.location.origin}/#product-${receiptOrder.items?.[0]?.productId || receiptOrder.items?.[0]?.id || receiptOrder.id}`;
  const delivDownloadUrl = deliv.downloadUrl || receiptOrder.downloadUrl || delivProductLink;
  const delivDownloadFileName =
    deliv.fileName ||
    deliv.downloadFileName ||
    receiptOrder.downloadFileName ||
    `ApexStore_${String(receiptOrder.id).slice(-6)}_Package.html`;
  const delivDetails =
    deliv.deliveryNote ||
    deliv.deliveryDetails ||
    receiptOrder.deliveryDetails ||
    'Your order has been verified and delivered by Admin! Use the Product Link or Download Product button below to access your complete package.';
  const delivLicenseKey =
    deliv.licenseKey ||
    receiptOrder.licenseKey ||
    `APX-KEY-${String(receiptOrder.id).slice(-6).toUpperCase()}`;

  const handleCopyProductLink = async () => {
    const ok = await copyToClipboard(delivProductLink);
    if (ok) {
      setCopiedLink(true);
      showToast('Product link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyLicenseKey = async () => {
    const ok = await copyToClipboard(delivLicenseKey);
    if (ok) {
      setCopiedKey(true);
      showToast('License key copied!');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleDownloadProductFile = () => {
    if (delivDownloadUrl && delivDownloadUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = delivDownloadUrl;
      a.download = delivDownloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Product file download started!');
      return;
    }

    // Generate complete offline Product Delivery Package HTML file for instant download
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Delivered Product Receipt & Package - ${delivProductName}</title>
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
    <span class="badge">✓ Official ApexStore Product Delivery Receipt</span>
    <h1>${delivProductName}</h1>
    <div class="meta">Order #${String(receiptOrder.id).slice(-8)} • Buyer: ${receiptOrder.email || receiptOrder.customer} • Total: Rs. ${(receiptOrder.total || 0).toLocaleString()}</div>
    <div class="box">
      <span class="label">Official Product Access Link</span>
      <div class="val"><a href="${delivProductLink}" style="color:#38bdf8">${delivProductLink}</a></div>
      <a class="btn" href="${delivProductLink}" target="_blank">Open Product Link</a>
    </div>
    <div class="box">
      <span class="label">License Key / Activation Code</span>
      <div class="val" style="font-family:monospace; color:#fcd34d;">${delivLicenseKey}</div>
    </div>
    <div class="box">
      <span class="label">Delivery Details &amp; Instructions from Admin</span>
      <div class="val" style="font-weight:500; line-height:1.6;">${delivDetails}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexStore_${delivProductName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Order_${String(receiptOrder.id).slice(-6)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('Delivered product package downloaded!');
  };

  const dt = new Date(receiptOrder.createdAt || Date.now());
  const dateFormatted = dt.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      if (isVerified) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `ApexStore_Slip_${String(receiptOrder.id).slice(-8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Receipt slip downloaded successfully!');
    } catch {
      showToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[240] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-lg my-auto animate-[slideUpFade_0.35s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Printable Receipt Card */}
        <div ref={receiptRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl relative text-slate-800">
          {/* Header */}
          <div
            className={`p-5 sm:p-6 text-white relative overflow-hidden ${
              isVerified
                ? 'bg-gradient-to-br from-purple-950 via-purple-700 to-emerald-600'
                : 'bg-gradient-to-br from-purple-950 via-purple-800 to-amber-700'
            }`}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur border border-purple-300/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={LOGO_URL}
                    alt="Logo"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div>
                  <div className="text-base font-black tracking-tight leading-none">
                    Apex<span className="text-purple-300">Store</span>
                  </div>
                  <div className="text-[9px] font-bold tracking-[2px] opacity-75 uppercase mt-1">
                    Official Delivery Receipt
                  </div>
                </div>
              </div>

              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  <i className="fa-solid fa-check-circle text-[10px]" />
                  <span>{isDelivered ? 'Delivered & Verified' : transcriptSettings?.badge || 'Verified'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
                  <i className="fa-solid fa-clock text-[10px]" />
                  <span>Pending Approval</span>
                </div>
              )}
            </div>

            <div className="text-center pt-1 relative z-10">
              <div className="text-xl sm:text-2xl font-black tracking-tight mb-0.5">
                {isDelivered
                  ? 'Official Delivery & Payment Receipt'
                  : isVerified
                  ? transcriptSettings?.title || 'Payment Receipt'
                  : 'Order Confirmation Slip'}
              </div>
              <div className="text-[11px] font-semibold opacity-90 tracking-wide">
                {isDelivered
                  ? 'Product Link, License Key & Complete Order Transcript'
                  : 'Payment Submitted • Under Review'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 bg-white space-y-4 max-h-[72vh] overflow-y-auto">
            {/* Pending Notice Box if not verified */}
            {isPending && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <i className="fa-solid fa-circle-exclamation text-amber-600 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-extrabold block">Awaiting Manual Verification</span>
                  <span className="text-[11px] text-amber-800">
                    Your payment details have been sent to the store merchant.
                  </span>
                </div>
              </div>
            )}

            {/* DELIVERED PRODUCT LINK & COMPLETE DETAILS (Prominent at Top when Delivered) */}
            {isDelivered && (
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-purple-50 border-2 border-emerald-400 rounded-2xl p-4 space-y-3 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider">
                    <i className="fa-solid fa-box-open text-emerald-600 text-sm" />
                    <span>Delivered Product &amp; Link Details</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                    Ready to Access
                  </span>
                </div>

                {/* Product Name */}
                <div>
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">
                    Delivered Product Name
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{delivProductName}</div>
                </div>

                {/* Direct Product Link */}
                <div className="bg-white border border-emerald-300 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                      Official Product Link / URL
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyProductLink}
                        className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 text-[9px] font-black uppercase cursor-pointer"
                      >
                        {copiedLink ? '✓ Copied' : 'Copy Link'}
                      </button>
                      <a
                        href={delivProductLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase"
                      >
                        Open Link ↗
                      </a>
                    </div>
                  </div>
                  <a
                    href={delivProductLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11px] font-mono font-bold text-purple-700 hover:underline break-all"
                  >
                    {delivProductLink}
                  </a>
                </div>

                {/* License Key */}
                <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">
                      License Key / Activation Code
                    </span>
                    <div className="text-xs font-mono font-black text-slate-900 select-all truncate">
                      {delivLicenseKey}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLicenseKey}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[9px] font-black uppercase shrink-0 cursor-pointer"
                  >
                    {copiedKey ? '✓ Copied' : 'Copy Key'}
                  </button>
                </div>

                {/* Full Delivery Instructions */}
                <div className="bg-white/90 border border-emerald-200 rounded-xl p-2.5">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block mb-0.5">
                    Delivery Details &amp; Instructions
                  </span>
                  <div className="text-[11px] text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                    {delivDetails}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Customer & Order Meta Grid */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5">
                <div className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                  Order ID
                </div>
                <div className="font-mono text-xs font-black text-slate-900 mt-0.5">
                  #{String(receiptOrder.id).slice(-8)}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5">
                <div className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                  Date &amp; Time
                </div>
                <div className="text-xs font-black text-slate-900 mt-0.5 truncate">
                  {dateFormatted}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5">
                <div className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                  Customer Name &amp; Email
                </div>
                <div className="text-xs font-black text-slate-900 mt-0.5 truncate">
                  {receiptOrder.customer || 'Verified Buyer'}
                </div>
                <div className="text-[10px] font-mono text-purple-700 truncate">
                  {receiptOrder.email || '—'}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5">
                <div className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                  Method &amp; TRX ID
                </div>
                <div className="text-xs font-black text-slate-900 mt-0.5 capitalize">
                  {receiptOrder.method}
                </div>
                <div className="font-mono text-[10px] font-bold text-purple-700 truncate">
                  TRX: {receiptOrder.transactionId || '—'}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div>
              <div className="text-[10px] font-black text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-purple-600 rounded-full" />
                <span>Ordered Products ({receiptOrder.items?.length || 0})</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(receiptOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-purple-50/40 border border-purple-100/80 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 rounded-lg object-cover bg-purple-100 border border-purple-200 shrink-0"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 line-clamp-1">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-700 font-bold mt-0.5">
                        <span className="bg-purple-100 px-1.5 py-0.2 rounded-full">
                          ×{item.quantity}
                        </span>
                        <span>{formatPKR(item.price)} each</span>
                      </div>
                    </div>
                    <div className="text-xs font-black text-purple-800 shrink-0 text-right">
                      {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 font-black">{formatPKR(receiptOrder.subtotal)}</span>
              </div>

              {receiptOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-black">-{formatPKR(receiptOrder.discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-purple-300">
                <span className="font-black text-sm text-slate-900">Total Paid</span>
                <span className="text-xl font-black text-purple-800">
                  {formatPKR(receiptOrder.total)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-purple-100">
              <div className="text-sm font-black text-purple-700 mb-1">
                {isVerified
                  ? transcriptSettings?.thanks || 'Order Confirmed & Delivered 🎉'
                  : 'Order Submitted Successfully!'}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold leading-relaxed whitespace-pre-line">
                {isVerified
                  ? transcriptSettings?.footer ||
                    'Your payment and product delivery have been verified by ApexStore.'
                  : 'Your payment slip is undergoing manual merchant verification.'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {isDelivered && (
            <>
              <a
                href={delivProductLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <i className="fa-solid fa-up-right-from-square" />
                <span>Open Product Link</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadProductFile}
                className="flex-1 min-w-[160px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <i className="fa-solid fa-cloud-arrow-down" />
                <span>Download Product</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 transition cursor-pointer disabled:opacity-75"
          >
            <i className={`fa-solid ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`} />
            <span>{downloading ? 'Preparing...' : 'Download Receipt Slip'}</span>
          </button>

          <button
            type="button"
            onClick={() => setReceiptOrder(null)}
            className="px-5 bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-700/50 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
