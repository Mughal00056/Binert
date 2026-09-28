import React, { useState, useEffect } from 'react';
import { PaymentMethodConfig, CustomPaymentMethod } from '../../types/store';

interface PaymentsTabProps {
  paymentMethods: {
    easypaisa?: PaymentMethodConfig;
    jazzcash?: PaymentMethodConfig;
    bank?: PaymentMethodConfig;
    card?: PaymentMethodConfig;
    [key: string]: PaymentMethodConfig | undefined;
  };
  customPaymentMethods: CustomPaymentMethod[];
  onSavePaymentMethods: (methods: any) => void;
  onOpenCustomModal: () => void;
  onEditCustomMethod: (method: CustomPaymentMethod, index: number) => void;
  onDeleteCustomMethod: (index: number) => void;
  onToggleCustomMethod: (index: number, active: boolean) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  paymentMethods,
  customPaymentMethods,
  onSavePaymentMethods,
  onOpenCustomModal,
  onEditCustomMethod,
  onDeleteCustomMethod,
  onToggleCustomMethod
}) => {
  const [methods, setMethods] = useState(paymentMethods);

  useEffect(() => {
    setMethods(paymentMethods);
  }, [paymentMethods]);

  const updateMethod = (key: string, field: string, value: any) => {
    setMethods((prev) => {
      const existing: PaymentMethodConfig = prev[key] || { active: true };
      return {
        ...prev,
        [key]: {
          ...existing,
          active: existing.active ?? true,
          [field]: value
        }
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePaymentMethods(methods);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-credit-card text-indigo-600"></i> Payment Gateways & Accounts
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure mobile wallets (EasyPaisa/JazzCash), Bank IBAN, and custom payment options
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCustomModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-100 self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus"></i> Add Custom Method
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Built-in methods */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Built-In Gateway Integrations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EasyPaisa */}
            <div
              className={`payment-method-card bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${
                methods.easypaisa?.active === false ? 'disabled' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">EasyPaisa</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Mobile Wallet & Till</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={methods.easypaisa?.active !== false}
                    onChange={(e) => updateMethod('easypaisa', 'active', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="payment-body space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Account / Phone Number
                  </label>
                  <input
                    type="text"
                    value={methods.easypaisa?.number || ''}
                    onChange={(e) => updateMethod('easypaisa', 'number', e.target.value)}
                    placeholder="03455724552"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    value={methods.easypaisa?.name || ''}
                    onChange={(e) => updateMethod('easypaisa', 'name', e.target.value)}
                    placeholder="ApexStore — EasyPaisa"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* JazzCash */}
            <div
              className={`payment-method-card bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${
                methods.jazzcash?.active === false ? 'disabled' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">JazzCash</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Mobile Account</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={methods.jazzcash?.active !== false}
                    onChange={(e) => updateMethod('jazzcash', 'active', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="payment-body space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Account / Phone Number
                  </label>
                  <input
                    type="text"
                    value={methods.jazzcash?.number || ''}
                    onChange={(e) => updateMethod('jazzcash', 'number', e.target.value)}
                    placeholder="03455724552"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    value={methods.jazzcash?.name || ''}
                    onChange={(e) => updateMethod('jazzcash', 'name', e.target.value)}
                    placeholder="ApexStore — JazzCash"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div
              className={`payment-method-card bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${
                methods.bank?.active === false ? 'disabled' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">Direct Bank Transfer</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Meezan / HBL / UBL IBAN</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={methods.bank?.active !== false}
                    onChange={(e) => updateMethod('bank', 'active', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="payment-body space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Full IBAN
                  </label>
                  <input
                    type="text"
                    value={methods.bank?.number || ''}
                    onChange={(e) => updateMethod('bank', 'number', e.target.value)}
                    placeholder="PK36MEZN0001234567890123"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 font-mono text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={methods.bank?.name || ''}
                    onChange={(e) => updateMethod('bank', 'name', e.target.value)}
                    placeholder="ApexStore Pvt Ltd"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Card Payment */}
            <div
              className={`payment-method-card bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${
                methods.card?.active === false ? 'disabled' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-xs">
                  <i className="fa-solid fa-credit-card"></i>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900">Card Payment</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Visa / Mastercard Gateway</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={methods.card?.active !== false}
                    onChange={(e) => updateMethod('card', 'active', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="payment-body space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Gateway Service Name
                  </label>
                  <input
                    type="text"
                    value={methods.card?.gateway || ''}
                    onChange={(e) => updateMethod('card', 'gateway', e.target.value)}
                    placeholder="e.g. Secure Card Gateway"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Card Instructions
                  </label>
                  <input
                    type="text"
                    value={methods.card?.desc || ''}
                    onChange={(e) => updateMethod('card', 'desc', e.target.value)}
                    placeholder="Visa / Mastercard accepted"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom methods */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Custom Configured Gateways & Wallets
          </p>

          {customPaymentMethods.length === 0 ? (
            <div className="text-center py-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              <i className="fa-solid fa-wallet text-3xl mb-2 text-slate-300 block"></i>
              <p className="text-sm font-bold text-slate-600">No custom payment methods</p>
              <p className="text-xs text-slate-400 mt-1">
                Add Crypto USDT, Nayapay, Sadapay, or Cash On Delivery
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customPaymentMethods.map((pm, idx) => (
                <div
                  key={pm.id}
                  className={`payment-method-card bg-white rounded-2xl border border-slate-200 p-5 shadow-xs ${
                    pm.active === false ? 'disabled' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                        pm.color === 'rose'
                          ? 'bg-rose-50 text-rose-600'
                          : pm.color === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : pm.color === 'purple'
                          ? 'bg-purple-50 text-purple-600'
                          : pm.color === 'amber'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <i className={`fa-solid ${pm.icon || 'fa-wallet'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{pm.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {pm.desc || 'Custom payment method'}
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={pm.active !== false}
                        onChange={(e) => onToggleCustomMethod(idx, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="payment-body space-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Account / Wallet:</span>
                      <span className="font-mono font-bold text-slate-800">{pm.account || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Title:</span>
                      <span className="font-bold text-slate-800">{pm.accountName || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`status-badge ${
                        pm.active !== false ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {pm.active !== false ? 'Active' : 'Off'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCustomMethod(pm, idx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomMethod(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md shadow-indigo-100 flex items-center gap-2"
        >
          <i className="fa-solid fa-floppy-disk"></i>
          <span>Save Payment Settings</span>
        </button>
      </form>
    </div>
  );
};
