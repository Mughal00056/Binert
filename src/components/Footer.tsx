import React from 'react';

const LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#13131a] border-t border-purple-900/40 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0a0a0f] text-white flex items-center justify-center overflow-hidden border border-purple-500/40">
              <img
                src={LOGO_URL}
                alt="ApexStore Logo"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
            <span className="text-base font-extrabold text-white">ApexStore</span>
            <span className="text-xs text-purple-400/80 ml-2">© 2026 ApexStore Inc.</span>
          </div>

          <div className="flex items-center gap-4 text-xl text-purple-400/70">
            <i className="fa-brands fa-cc-visa hover:text-purple-300 transition" />
            <i className="fa-brands fa-cc-mastercard hover:text-purple-300 transition" />
            <i className="fa-brands fa-cc-apple-pay hover:text-purple-300 transition" />
            <i className="fa-solid fa-shield-halved hover:text-purple-300 transition text-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
};
