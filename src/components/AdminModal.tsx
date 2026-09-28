import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/helpers';
import { Order, OrderStatus, Product } from '../types';

export const AdminModal: React.FC = () => {
  const {
    adminModalOpen,
    setAdminModalOpen,
    orders,
    updateOrderStatus,
    adminSendOtp,
    adminUpdateTracking,
    products,
    saveNewProduct,
    promoCodes,
    savePromoCode,
    storeInfo,
    saveStoreInfo,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'promos' | 'settings'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  // Quick PIN gate
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Audio');
  const [newProdImage, setNewProdImage] = useState('');

  // New promo form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('20');
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Store settings state
  const [editOwner, setEditOwner] = useState(storeInfo.owner);
  const [editPhone, setEditPhone] = useState(storeInfo.phone);
  const [editEmail, setEditEmail] = useState(storeInfo.email);
  const [editPaymentNum, setEditPaymentNum] = useState(storeInfo.paymentNumber || '03455724552');

  if (!adminModalOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'admin') {
      setIsUnlocked(true);
      showToast('Admin Panel Unlocked');
    } else {
      showToast('Invalid PIN. Try 1234', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      showToast('Please provide name and price', 'error');
      return;
    }
    const newP: Product = {
      id: Date.now(),
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      image: newProdImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      rating: 5.0,
      reviews: 1,
      public: true
    };
    saveNewProduct(newP);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImage('');
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    savePromoCode({
      code: newPromoCode.toUpperCase().trim(),
      discount: parseFloat(newPromoDiscount) / 100,
      desc: newPromoDesc || `${newPromoDiscount}% OFF Discount`,
      badge: 'SPECIAL',
      badgeType: 'hot',
      active: true
    });
    setNewPromoCode('');
    setNewPromoDesc('');
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreInfo({
      ...storeInfo,
      owner: editOwner,
      phone: editPhone,
      email: editEmail,
      paymentNumber: editPaymentNum
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#13131a] rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/80 max-w-4xl w-full border-2 border-purple-600/50 relative max-h-[92vh] flex flex-col animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between bg-gradient-to-r from-purple-950 via-[#1a0f30] to-[#13131a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-purple-500/50 text-white flex items-center justify-center shadow-md shadow-purple-900/50 overflow-hidden">
              <img
                src="https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg"
                alt="ApexStore Logo"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Apex<span className="text-purple-400">Store</span> Admin Console
                </h3>
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount} PENDING
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-300/80">Order verification, catalog &amp; settings control</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAdminModalOpen(false);
                window.dispatchEvent(new CustomEvent('apex_switch_mode', { detail: 'admin' }));
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <i className="fa-solid fa-sliders text-xs" />
              <span className="hidden sm:inline">Full Power Admin</span>
            </button>
            <button
              onClick={() => setAdminModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-300 flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* PIN Screen if locked */}
        {!isUnlocked ? (
          <div className="p-8 text-center flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center text-2xl mb-4">
              <i className="fa-solid fa-lock" />
            </div>
            <h4 className="text-lg font-black text-white mb-1">Enter Admin PIN</h4>
            <p className="text-xs text-purple-400 mb-6">Default PIN is 1234</p>

            <form onSubmit={handleUnlock} className="flex gap-2 max-w-xs w-full">
              <input
                type="password"
                placeholder="PIN (1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="flex-1 bg-[#0a0a0f] border border-purple-800 rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white outline-none focus:border-purple-400 font-mono tracking-widest"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Unlock
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-purple-900/40 bg-[#0a0a0f] px-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400/60 hover:text-purple-300'
                }`}
              >
                <i className="fa-solid fa-receipt" />
                <span>Orders ({orders.length})</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400/60 hover:text-purple-300'
                }`}
              >
                <i className="fa-solid fa-boxes-stacked" />
                <span>Products ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('promos')}
                className={`py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
                  activeTab === 'promos'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400/60 hover:text-purple-300'
                }`}
              >
                <i className="fa-solid fa-tags" />
                <span>Promo Codes ({promoCodes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-purple-400/60 hover:text-purple-300'
                }`}
              >
                <i className="fa-solid fa-gear" />
                <span>Store Settings</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      {['all', 'pending', 'processing', 'verified', 'rejected'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFilterStatus(st)}
                          className={`px-3 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer ${
                            filterStatus === st
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#1a1a24] text-purple-300 hover:bg-purple-950'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs text-purple-400 font-bold">
                      Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-purple-400">
                      <i className="fa-solid fa-inbox text-5xl mb-3 text-purple-600" />
                      <p className="font-bold text-white">No {filterStatus !== 'all' ? filterStatus : ''} orders yet</p>
                      <p className="text-xs text-purple-400/70 mt-1">New customer checkout payments will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredOrders.map((order) => {
                        const isPending = order.status === 'pending';
                        return (
                          <div
                            key={order.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isPending
                                ? 'bg-[#1b122c] border-amber-500/60 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30'
                                : order.status === 'verified'
                                ? 'bg-[#0f1722] border-emerald-500/40'
                                : 'bg-[#13131a] border-purple-900/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-900/30">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black text-white">
                                  #{String(order.id).slice(-8)}
                                </span>
                                <span
                                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                    order.status === 'verified'
                                      ? 'bg-emerald-500 text-white'
                                      : order.status === 'pending'
                                      ? 'bg-amber-400 text-black font-extrabold animate-pulse'
                                      : order.status === 'processing'
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {order.status}
                                </span>
                                <span className="text-xs text-purple-400/70">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div className="text-base font-black text-purple-300">
                                {formatPKR(order.total)}
                              </div>
                            </div>

                            {/* Order Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-400/70 block">Customer</span>
                                <span className="text-white font-semibold truncate block">{order.email}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-400/70 block">Method / TRX</span>
                                <span className="text-white font-mono font-bold capitalize">{order.method}</span>
                                <span className="text-purple-300 text-[11px] block font-mono">{order.transactionId || 'No TRX'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-purple-400/70 block">Payment Proof</span>
                                {order.proofUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProofImg(order.proofUrl)}
                                    className="text-xs font-bold text-purple-400 hover:text-purple-200 underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <i className="fa-solid fa-image" /> View Screenshot
                                  </button>
                                ) : (
                                  <span className="text-purple-400/60 text-xs">None provided</span>
                                )}
                              </div>
                            </div>

                            {/* Products preview */}
                            <div className="py-2 flex flex-wrap gap-2">
                              {order.items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-2 py-1 text-[11px] text-purple-200"
                                >
                                  <span className="font-bold text-purple-400">×{item.quantity}</span>
                                  <span className="truncate max-w-[120px]">{item.name}</span>
                                </span>
                              ))}
                            </div>

                            {/* Admin Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-purple-900/30">
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => adminSendOtp(order.id)}
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs py-2 px-3.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-950/40"
                                >
                                  <i className="fa-solid fa-key" />
                                  <span>Approve &amp; Send OTP</span>
                                </button>
                              )}

                              {order.status === 'otp_sent' && (
                                <>
                                  <div className="bg-amber-950/60 border border-amber-500/50 px-3 py-1.5 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                                    <i className="fa-solid fa-key text-xs" />
                                    <span>Sent OTP: <strong className="font-mono text-white font-black">{order.otp}</strong></span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => adminSendOtp(order.id)}
                                    className="bg-purple-900 hover:bg-purple-800 text-purple-200 font-bold text-xs py-2 px-3 rounded-xl uppercase transition cursor-pointer"
                                  >
                                    Resend OTP
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 px-3 rounded-xl uppercase transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <i className="fa-solid fa-circle-check" />
                                    <span>Confirm &amp; Deliver</span>
                                  </button>
                                </>
                              )}

                              {order.status === 'delivered' && (
                                <div className="bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                                  <i className="fa-solid fa-circle-check text-xs" />
                                  <span className="font-bold">Order Delivered to Customer</span>
                                </div>
                              )}

                              {order.status !== 'rejected' && order.status !== 'delivered' && (
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(order.id, 'rejected', 'Payment declined by admin')}
                                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/40 font-black text-xs py-2 px-3 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ml-auto"
                                >
                                  <i className="fa-solid fa-circle-xmark" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Add Product Form */}
                  <form onSubmit={handleAddProduct} className="p-4 bg-[#0a0a0f] rounded-2xl border border-purple-900/40 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">Add New Product</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                      <input
                        type="number"
                        placeholder="Price in PKR (e.g. 45000)"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      >
                        <option value="Audio">Audio</option>
                        <option value="Wearables">Wearables</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Electronics">Electronics</option>
                      </select>
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 px-4 rounded-xl uppercase tracking-wider cursor-pointer"
                    >
                      + Save Product
                    </button>
                  </form>

                  {/* Existing Products List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {products.map((p) => (
                      <div key={p.id} className="p-3 bg-[#0a0a0f] rounded-xl border border-purple-900/40 flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-black" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-purple-300 font-black">{formatPKR(p.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PROMOS */}
              {activeTab === 'promos' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddPromo} className="p-4 bg-[#0a0a0f] rounded-2xl border border-purple-900/40 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">Add Promo Code</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="CODE (e.g. VIP30)"
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono outline-none focus:border-purple-400"
                      />
                      <input
                        type="number"
                        placeholder="Discount % (e.g. 25)"
                        value={newPromoDiscount}
                        onChange={(e) => setNewPromoDiscount(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newPromoDesc}
                        onChange={(e) => setNewPromoDesc(e.target.value)}
                        className="bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 px-4 rounded-xl uppercase tracking-wider cursor-pointer"
                    >
                      + Create Promo Code
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {promoCodes.map((p) => (
                      <div key={p.code} className="p-3 bg-[#0a0a0f] rounded-xl border border-purple-900/40">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-black text-purple-300">{p.code}</span>
                          <span className="text-xs font-black text-emerald-400">{Math.round(p.discount * 100)}% OFF</span>
                        </div>
                        <p className="text-xs text-purple-400/80 mt-1">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveStoreInfo} className="p-4 bg-[#0a0a0f] rounded-2xl border border-purple-900/40 space-y-4 max-w-lg">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">Store & Payment Numbers</h4>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-purple-400 block mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={editOwner}
                      onChange={(e) => setEditOwner(e.target.value)}
                      className="w-full bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-purple-400 block mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-purple-400 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-purple-400 block mb-1">EasyPaisa / Payment Account Number</label>
                    <input
                      type="text"
                      value={editPaymentNum}
                      onChange={(e) => setEditPaymentNum(e.target.value)}
                      className="w-full bg-[#13131a] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-purple-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-3 px-5 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Save Settings
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* Payment Screenshot Preview Modal */}
      {selectedProofImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setSelectedProofImg(null)}
        >
          <div className="relative max-w-lg w-full bg-[#13131a] p-2 rounded-2xl border border-purple-500/50">
            <button
              onClick={() => setSelectedProofImg(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <img
              src={selectedProofImg}
              alt="Payment Proof"
              className="w-full max-h-[80vh] object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
