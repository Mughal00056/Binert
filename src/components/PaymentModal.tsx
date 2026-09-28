import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR, copyToClipboard } from '../utils/helpers';

export const PaymentModal: React.FC = () => {
  const {
    paymentModalOpen,
    cancelPayment,
    cartTotal,
    paymentConfig,
    customPaymentMethods,
    confirmPayment,
    showToast
  } = useStore();

  const [selectedMethod, setSelectedMethod] = useState<string>('easypaisa');
  const [email, setEmail] = useState<string>('customer@apexstore.io');
  const [senderMobile, setSenderMobile] = useState<string>('03455724552');
  const [transactionId, setTransactionId] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentModalOpen) {
      setIsSubmitting(false);
      if (!transactionId) {
        setTransactionId(`APX-${Date.now().toString().slice(-6)}`);
      }
    }
  }, [paymentModalOpen]);

  if (!paymentModalOpen) return null;

  // Compile payment methods list
  const availableMethods: { key: string; name: string; icon: string }[] = [];
  if (paymentConfig.easypaisa?.active !== false) {
    availableMethods.push({ key: 'easypaisa', name: 'EasyPaisa', icon: 'fa-mobile-screen-button' });
  }
  if (paymentConfig.jazzcash?.active !== false) {
    availableMethods.push({ key: 'jazzcash', name: 'JazzCash', icon: 'fa-mobile-screen-button' });
  }
  if (paymentConfig.bank?.active !== false) {
    availableMethods.push({ key: 'bank', name: 'Bank Transfer', icon: 'fa-building-columns' });
  }
  if (paymentConfig.card?.active !== false) {
    availableMethods.push({ key: 'card', name: 'Debit / Credit Card', icon: 'fa-credit-card' });
  }
  customPaymentMethods.forEach((cm) => {
    availableMethods.push({ key: `custom_${cm.id}`, name: cm.name, icon: cm.icon || 'fa-wallet' });
  });

  // Selected account details
  let accountLabel = 'Transfer to Account';
  let accountNumber = '03455724552';

  if (selectedMethod === 'easypaisa') {
    accountLabel = paymentConfig.easypaisa?.name || 'Anees Abid (EasyPaisa)';
    accountNumber = paymentConfig.easypaisa?.number || '03455724552';
  } else if (selectedMethod === 'jazzcash') {
    accountLabel = paymentConfig.jazzcash?.name || 'Anees Abid (JazzCash)';
    accountNumber = paymentConfig.jazzcash?.number || '03001234567';
  } else if (selectedMethod === 'bank') {
    accountLabel = paymentConfig.bank?.name || 'Meezan Bank Ltd (ApexStore)';
    accountNumber = paymentConfig.bank?.number || 'PK88MEZN00012345678901';
  } else if (selectedMethod === 'card') {
    accountLabel = 'Card Payment Instruction';
    accountNumber = 'PK88MEZN00012345678901 (Online Transfer)';
  } else if (selectedMethod.startsWith('custom_')) {
    const id = parseInt(selectedMethod.replace('custom_', ''), 10);
    const cm = customPaymentMethods.find((c) => c.id === id);
    if (cm) {
      accountLabel = cm.name + (cm.accountName ? ` - ${cm.accountName}` : '');
      accountNumber = cm.account;
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(accountNumber);
    if (success) {
      setCopied(true);
      showToast('Account number copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAutoGenerateProof = () => {
    const autoTrx = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
    const autoProof = `https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80`;
    setTransactionId(autoTrx);
    setProofUrl(autoProof);
    showToast('Sample transaction ID & proof generated!');
  };

  const handlePayNow = () => {
    const finalProof = proofUrl.trim() || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80';
    const finalTrx = transactionId.trim() || `APX-${Date.now().toString().slice(-6)}`;

    setIsSubmitting(true);

    setTimeout(() => {
      confirmPayment({
        method: selectedMethod,
        email: email.trim() || 'customer@apexstore.io',
        senderMobile: senderMobile.trim() || accountNumber,
        transactionId: finalTrx,
        proofUrl: finalProof
      });
      setIsSubmitting(false);
    }, 400);
  };

  const handleClose = () => {
    setIsSubmitting(false);
    cancelPayment();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/80 max-w-xl w-full border border-purple-900/50 relative max-h-[92vh] flex flex-col my-auto animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-[#13131a] shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-lock text-purple-400" />
              <span>Checkout &amp; Payment Submission</span>
            </h3>
            <p className="text-[11px] text-purple-300 font-semibold mt-0.5">
              Total to Pay: <span className="font-black text-white">{formatPKR(cartTotal)}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-purple-400 hover:text-white p-2 cursor-pointer rounded-xl transition"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Payment Form Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Manual Approval Notice Banner (NO Auto Approval) */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#1b1429] border border-purple-700/40 text-xs">
            <div className="w-7 h-7 rounded-xl bg-purple-900/70 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <i className="fa-solid fa-user-shield text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-white block">Manual Admin Approval Required</span>
              <span className="text-[11px] text-purple-300/80 block leading-relaxed mt-0.5">
                Auto-approval is disabled. Once submitted, your order status remains <strong className="text-amber-300">Pending Verification</strong> until our merchant manually verifies your payment details.
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-purple-400 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableMethods.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMethod(m.key)}
                  className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    selectedMethod === m.key
                      ? 'border-purple-500 bg-purple-950/70 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'border-purple-950/80 bg-[#0a0a0f] hover:border-purple-800'
                  }`}
                >
                  <i className={`fa-solid ${m.icon} text-purple-400 text-sm`} />
                  <span className="text-xs font-black text-purple-100 truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Details Box */}
          <div className="rounded-2xl border border-purple-800/60 bg-[#0a0a0f] p-3.5 sm:p-4 text-center">
            <p className="text-xs font-black text-white mb-2">{accountLabel}</p>
            <div className="flex items-center gap-2 bg-[#13131a] rounded-xl border border-purple-900/60 p-2 px-3">
              <span className="flex-1 font-mono text-xs sm:text-sm font-black text-purple-300 break-all select-all">
                {accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0 ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-purple-950 text-purple-300 hover:bg-purple-900'
                }`}
                title="Copy account number"
              >
                <i className={`fa-regular ${copied ? 'fa-circle-check' : 'fa-copy'} text-xs`} />
              </button>
            </div>
            <p className="text-[11px] text-purple-400/90 mt-2">
              Exact Amount: <strong className="text-white font-mono">{formatPKR(cartTotal)}</strong>
            </p>
          </div>

          {/* Email and Sender Mobile (Grid on sm+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-purple-400 mb-1">
                Receipt Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/70 outline-none focus:border-purple-400 bg-[#0a0a0f] text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-purple-400 mb-1">
                Sender Mobile / Account
              </label>
              <input
                type="text"
                placeholder="03xx xxx xxxx"
                value={senderMobile}
                onChange={(e) => setSenderMobile(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/70 outline-none focus:border-purple-400 font-mono bg-[#0a0a0f] text-white"
              />
            </div>
          </div>

          {/* Transaction ID & Proof Generation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-black uppercase tracking-widest text-purple-400">
                Transaction ID &amp; Proof Slip
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateProof}
                className="text-[11px] font-bold text-purple-300 hover:text-purple-200 underline cursor-pointer flex items-center gap-1"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
                <span>Fill Sample Proof</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Transaction ID (e.g. APX-849201)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/70 outline-none focus:border-purple-400 font-mono bg-[#0a0a0f] text-white"
              />

              <input
                type="url"
                placeholder="Payment Screenshot / Proof URL (optional)"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/70 outline-none focus:border-purple-400 font-mono bg-[#0a0a0f] text-white placeholder-purple-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePayNow}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-900/50 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" />
                  <span>Submit Order for Verification ({formatPKR(cartTotal)})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-purple-400/80">
              🔒 256-Bit SSL Encrypted • Manual Verification by Merchant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
