import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const ReceiptModal: React.FC = () => {
  const { receiptOrder, setReceiptOrder, showToast, transcriptSettings } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!receiptOrder) return null;

  const isVerified =
    receiptOrder.status === 'verified' || receiptOrder.status === 'delivered';
  const isDelivered = receiptOrder.status === 'delivered';
  const isPending =
    receiptOrder.status === 'pending' ||
    receiptOrder.status === 'processing' ||
    receiptOrder.status === 'otp_sent';

  const deliv = receiptOrder.deliveryInfo || {};
  const delivProductName =
    deliv.productName ||
    receiptOrder.productName ||
    receiptOrder.items?.map((i) => i.name).join(', ');
  const delivProductLink = deliv.productLink || receiptOrder.productLink || '';
  const delivDownloadUrl = deliv.downloadUrl || receiptOrder.downloadUrl || '';
  const delivDownloadFileName =
    deliv.downloadFileName ||
    receiptOrder.downloadFileName ||
    `ApexStore_${String(receiptOrder.id).slice(-6)}_Package.html`;
  const delivDetails = deliv.deliveryDetails || receiptOrder.deliveryDetails || '';
  const delivLicenseKey = deliv.licenseKey || receiptOrder.licenseKey || '';

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
    if (delivDownloadUrl && /^https?:\/\//i.test(delivDownloadUrl)) {
      window.open(delivDownloadUrl, '_blank', 'noopener,noreferrer');
      showToast('Opening product download link...');
      return;
    }
    if (delivProductLink && /^https?:\/\//i.test(delivProductLink)) {
      window.open(delivProductLink, '_blank', 'noopener,noreferrer');
      showToast('Opening product link...');
      return;
    }
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
      showToast('Slip downloaded successfully!');
    } catch {
      showToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-md my-auto animate-[slideUpFade_0.4s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Printable Receipt Card */}
        <div ref={receiptRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl relative text-slate-800">
          {/* Header */}
          <div className={`p-6 sm:p-7 text-white relative overflow-hidden ${
            isVerified 
              ? 'bg-gradient-to-br from-purple-950 via-purple-700 to-emerald-600'
              : 'bg-gradient-to-br from-purple-950 via-purple-800 to-amber-700'
          }`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
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
                    Premium Shopping
                  </div>
                </div>
              </div>

              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  <i className="fa-solid fa-check-circle text-[10px]" />
                  <span>{transcriptSettings?.badge || 'Verified'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
                  <i className="fa-solid fa-clock text-[10px]" />
                  <span>Pending Approval</span>
                </div>
              )}
            </div>

            <div className="text-center pt-2 relative z-10">
              <div className="text-2xl font-black tracking-tight mb-1">
                {isVerified ? (transcriptSettings?.title || 'Payment Receipt') : 'Order Confirmation Slip'}
              </div>
              <div className="text-[11px] font-semibold opacity-90 tracking-wide">
                {isVerified ? (transcriptSettings?.subtitle || 'Official Verified Transcript') : 'Payment Submitted • Under Review'}
              </div>
              <div className="w-12 h-12 mx-auto mt-3 rounded-full bg-black/30 backdrop-blur border-2 border-white/40 flex items-center justify-center text-white text-xl">
                <i className={`fa-solid ${isVerified ? 'fa-check' : 'fa-hourglass-half'}`} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 bg-white space-y-4">
            {/* Pending Notice Box if not verified */}
            {isPending && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <i className="fa-solid fa-circle-exclamation text-amber-600 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-extrabold block">Awaiting Manual Verification</span>
                  <span className="text-[11px] text-amber-800">
                    Your payment details have been sent to the store merchant. Auto-approval is disabled to ensure fraud protection.
                  </span>
                </div>
              </div>
            )}

            {/* Meta Grid */}
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
                  Payment Method
                </div>
                <div className="text-xs font-black text-slate-900 mt-0.5 capitalize">
                  {receiptOrder.method}
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5">
                <div className="text-[9px] font-black text-purple-700 uppercase tracking-wider">
                  Transaction ID
                </div>
                <div className="font-mono text-xs font-black text-purple-700 mt-0.5 truncate">
                  {receiptOrder.transactionId || '—'}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div>
              <div className="text-[10px] font-black text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-purple-600 rounded-full" />
                <span>Ordered Products</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {receiptOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-purple-50/40 border border-purple-100/80 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-purple-100 border border-purple-200 shrink-0"
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
                <span className="font-black text-sm text-slate-900">Total</span>
                <span className="text-xl font-black text-purple-800">
                  {formatPKR(receiptOrder.total)}
                </span>
              </div>
            </div>

            {/* Delivered Product Details & Link */}
            {isDelivered && (delivProductLink || delivDownloadUrl || delivLicenseKey || delivDetails) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  <i className="fa-solid fa-box-open" />
                  <span>Delivered Product Package</span>
                </div>
                {delivProductName && (
                  <div className="text-xs font-black text-slate-900">{delivProductName}</div>
                )}
                {delivLicenseKey && (
                  <div className="bg-white border border-emerald-200 rounded-lg p-2 text-[11px] font-mono font-bold text-emerald-800 break-all">
                    Key/Code: {delivLicenseKey}
                  </div>
                )}
                {delivProductLink && (
                  <div className="bg-white border border-emerald-200 rounded-lg p-2 text-[10px] font-mono text-purple-700 break-all">
                    Link: {delivProductLink}
                  </div>
                )}
                {delivDetails && (
                  <div className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                    {delivDetails}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2 border-t border-purple-100">
              <div className="text-sm font-black text-purple-700 mb-1">
                {isVerified
                  ? transcriptSettings?.thanks || 'Order Confirmed & Approved 🎉'
                  : 'Order Submitted Successfully!'}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold leading-relaxed whitespace-pre-line">
                {isVerified
                  ? transcriptSettings?.footer ||
                    'Your payment has been manually verified by ApexStore.\nYour delivery will be initiated promptly.'
                  : 'Your payment slip is undergoing manual merchant verification.\nPlease keep this slip for your reference.'}
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-[10px] font-extrabold text-purple-700">
                <i className="fa-solid fa-bag-shopping text-purple-600" />
                <span>{transcriptSettings?.watermark || 'ApexStore · Premium Shopping'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 mt-4">
          {isDelivered && (delivDownloadUrl || delivProductLink) && (
            <button
              type="button"
              onClick={handleDownloadProductFile}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition cursor-pointer active:scale-[0.98]"
            >
              <i className="fa-solid fa-cloud-arrow-down" />
              <span>Download / Open Delivered Product</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 transition cursor-pointer active:scale-[0.98] disabled:opacity-75"
          >
            <i className={`fa-solid ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`} />
            <span>{downloading ? 'Preparing...' : 'Download Slip'}</span>
          </button>

          <button
            type="button"
            onClick={() => setReceiptOrder(null)}
            className="px-6 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/40 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
