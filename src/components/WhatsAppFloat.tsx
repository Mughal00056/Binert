import React from 'react';
import { useStore } from '../context/StoreContext';

export const WhatsAppFloat: React.FC = () => {
  const { storeInfo } = useStore();

  return (
    <a
      href={storeInfo.whatsapp || 'https://whatsapp.com/channel/0029Vb7r27cI7BeE38n42O1V'}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join WhatsApp Channel"
      className="fixed bottom-5 left-5 z-40 w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-950/80 border border-emerald-400/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 group"
      title="Join Official WhatsApp Channel"
    >
      <i className="fa-brands fa-whatsapp text-2xl group-hover:rotate-12 transition-transform" />
    </a>
  );
};
