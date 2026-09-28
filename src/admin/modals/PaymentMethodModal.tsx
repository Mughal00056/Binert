import React, { useState, useEffect } from 'react';
import { CustomPaymentMethod } from '../../types/store';

interface PaymentMethodModalProps {
  isOpen: boolean;
  paymentMethod: CustomPaymentMethod | null;
  editIndex: number | null;
  onClose: () => void;
  onSave: (data: Partial<CustomPaymentMethod>, editIndex: number | null) => void;
}

const ICONS = [
  'fa-mobile-screen-button',
  'fa-wallet',
  'fa-building-columns',
  'fa-credit-card',
  'fa-money-bill-wave',
  'fa-coins',
  'fa-shield-halved',
  'fa-gem',
  'fa-arrow-right-arrow-left',
  'fa-qrcode',
  'fa-circle-check',
  'fa-hand-holding-dollar'
];

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  paymentMethod,
  editIndex,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [account, setAccount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [icon, setIcon] = useState('fa-mobile-screen-button');
  const [color, setColor] = useState('emerald');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (paymentMethod) {
      setName(paymentMethod.name);
      setDesc(paymentMethod.desc || '');
      setAccount(paymentMethod.account || '');
      setAccountName(paymentMethod.accountName || '');
      setIcon(paymentMethod.icon || 'fa-mobile-screen-button');
      setColor(paymentMethod.color || 'emerald');
      setActive(paymentMethod.active !== false);
    } else {
      setName('');
      setDesc('');
      setAccount('');
      setAccountName('');
      setIcon('fa-mobile-screen-button');
      setColor('emerald');
      setActive(true);
    }
  }, [paymentMethod, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        desc: desc.trim(),
        account: account.trim(),
        accountName: accountName.trim(),
        icon,
        color,
        active
      },
      editIndex
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              {paymentMethod ? 'Edit Payment Method' : 'Add Custom Payment Method'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Method Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nayapay / Sadapay / USDT"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Subtitle / Note
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Instant mobile account transfer"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Account / Wallet / IBAN
                  </label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="03001234567 or IBAN"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Title / Beneficiary
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Anees Abid"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Select Icon
                </label>
                <div className="icon-picker">
                  {ICONS.map((ic) => (
                    <div
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`icon-option ${icon === ic ? 'selected' : ''}`}
                    >
                      <i className={`fa-solid ${ic}`}></i>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Color Accent
                </label>
                <div className="flex gap-2">
                  {['emerald', 'blue', 'rose', 'purple', 'amber', 'indigo'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition border-2 ${
                        color === c ? 'border-slate-800 bg-slate-100 shadow-sm' : 'border-transparent bg-slate-50 text-slate-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div>
                  <p className="text-xs font-black text-slate-800">Enable Method</p>
                  <p className="text-[10px] text-slate-500">Available to customers at checkout</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-200"
              >
                <i className="fa-solid fa-floppy-disk mr-2"></i> Save Method
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
