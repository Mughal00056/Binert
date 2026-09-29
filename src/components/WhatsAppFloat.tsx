import React from 'react';
import { useStore } from '../context/StoreContext';

export const WhatsAppFloat: React.FC = () => {
  const { storeInfo } = useStore();

  const rawUrl = (storeInfo.whatsapp || 'https://whatsapp.com/channel/0029Vb7r27cI7BeE38n42O1V').trim();
  const resolvedHref =
    rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : /^\+?\d[\d\s-]+$/.test(rawUrl)
      ? `https://wa.me/${rawUrl.replace(/[^\d]/g, '')}`
      : `https://${rawUrl}`;

  return (
    <a
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open WhatsApp"
      className="fixed bottom-4 left-3 sm:bottom-5 sm:left-5 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-950/80 border border-emerald-400/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group"
      title="Chat / Join Official WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-xl sm:text-2xl group-hover:rotate-12 transition-transform" />
    </a>
  );
};

