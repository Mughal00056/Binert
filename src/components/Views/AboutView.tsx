import React from 'react';
import { useStore } from '../../context/StoreContext';

export const AboutView: React.FC = () => {
  const { storeInfo, goHome } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="pb-6 border-b border-purple-900/40">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
          <button onClick={goHome} className="hover:text-white transition cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-white">About {storeInfo.name}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">About {storeInfo.name}</h1>
      </div>

      <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-[#13131a] border border-purple-900/40 space-y-4 text-sm text-purple-200 leading-relaxed">
        <p>
          Welcome to <strong className="text-white">{storeInfo.name}</strong>, founded by{' '}
          <strong className="text-purple-300">{storeInfo.owner}</strong> in {storeInfo.city}. We specialize in
          curated flagship audio, wearables, footwear, and next-generation tech accessories.
        </p>
        <p>
          Every order goes through our verified merchant quality inspection and real-time OTP confirmation
          system to ensure 100% authenticity and customer protection across Pakistan.
        </p>
      </div>
    </div>
  );
};
