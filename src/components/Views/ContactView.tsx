import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export const ContactView: React.FC = () => {
  const { storeInfo, goHome, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Message sent! Our support team will reply shortly.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="pb-6 border-b border-purple-900/40">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
          <button onClick={goHome} className="hover:text-white transition cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-white">Contact Us</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Customer Support &amp; Concierge</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="p-6 rounded-3xl bg-[#13131a] border border-purple-900/40 space-y-4">
          <h3 className="text-base font-black text-white">Direct Contact Channels</h3>
          <div className="space-y-3 text-xs text-purple-200">
            <p className="flex items-center gap-3">
              <i className="fa-solid fa-user-tie text-purple-400 w-5" />
              <span>Founder: <strong>{storeInfo.owner}</strong></span>
            </p>
            <p className="flex items-center gap-3">
              <i className="fa-solid fa-envelope text-purple-400 w-5" />
              <span>{storeInfo.email}</span>
            </p>
            <p className="flex items-center gap-3">
              <i className="fa-solid fa-phone text-purple-400 w-5" />
              <span>{storeInfo.phone}</span>
            </p>
            <p className="flex items-center gap-3">
              <i className="fa-solid fa-location-dot text-purple-400 w-5" />
              <span>{storeInfo.city}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-[#13131a] border border-purple-900/40 space-y-3">
          <h3 className="text-base font-black text-white">Send a Message</h3>
          <input
            type="text"
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0a0a0f] border border-purple-900/60 text-xs text-white outline-none focus:border-purple-400"
          />
          <input
            type="email"
            required
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0a0a0f] border border-purple-900/60 text-xs text-white outline-none focus:border-purple-400"
          />
          <textarea
            rows={4}
            required
            placeholder="How can we help you?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0a0a0f] border border-purple-900/60 text-xs text-white outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
};
