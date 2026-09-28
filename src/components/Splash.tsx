import React, { useState, useEffect } from 'react';

// Exact user-provided PNG for the loading screen
const SPLASH_PNG_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/084b9ad6-dbbb-45c7-baf0-b38fc93b4325.png';

const SYSTEM_LOGS = [
  '⚡ [SYSTEM] Apex Hyper-Engine v6.0 Initializing...',
  '🛡️ [SECURITY] 256-Bit SSL Payment Guard Active',
  '💎 [CATALOG] 100% Verified Authentic Luxury Inventory Loaded',
  '🚀 [STATUS] Systems Armed & Synced • Ready for Launch'
];

export const Splash: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem('apex_splash_shown');
  });
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Dynamic, fast cyber progress loader
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 9) + 5;
        return Math.min(100, prev + delta);
      });
    }, 55);

    // Cycling high-tech telemetry logs
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % SYSTEM_LOGS.length);
    }, 420);

    // Automatic smooth fade-out
    const fadeTimer = setTimeout(() => {
      setFading(true);
      sessionStorage.setItem('apex_splash_shown', 'true');
    }, 2400);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2850);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible]);

  const handleEnter = () => {
    setFading(true);
    sessionStorage.setItem('apex_splash_shown', 'true');
    setTimeout(() => setVisible(false), 280);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-out select-none cursor-pointer ${
        fading
          ? 'opacity-0 pointer-events-none scale-105 filter blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #190933 0%, #0d041c 50%, #04010a 100%)'
      }}
    >
      {/* Background Animated Cyber Mesh & Nebula Radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/35 via-fuchsia-600/25 to-indigo-600/20 rounded-full blur-[110px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-fuchsia-900/30 rounded-full blur-3xl" />
      </div>

      {/* Cyber Matrix Subtle Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Central Powerful Showcase */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center animate-[slideUpFade_0.4s_cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Holographic Glowing Showcase Container for user PNG */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Pulsing Rotating Glow Rings */}
          <div className="absolute -inset-7 rounded-full border-2 border-purple-500/30 animate-[spin_10s_linear_infinite] pointer-events-none shadow-[0_0_40px_rgba(168,85,247,0.35)]" />
          <div className="absolute -inset-4 rounded-full border border-dashed border-fuchsia-400/50 animate-[spin_6s_linear_infinite_reverse] pointer-events-none" />

          {/* User PNG Display Card with Cyber Glow */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-[#110826]/90 p-3 border-2 border-purple-400/70 shadow-[0_0_65px_rgba(168,85,247,0.85)] flex items-center justify-center relative group backdrop-blur-xl">
            <img
              src={SPLASH_PNG_URL}
              alt="ApexStore Flagship Emblem"
              className="w-full h-full object-contain pointer-events-none transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(192,132,252,0.9)]"
              draggable={false}
              onError={(e) => {
                // Fallback gracefully if network drops
                (e.target as HTMLImageElement).src = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';
              }}
            />
            {/* Holographic dynamic light sweep shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none animate-[pulse_2s_infinite] rounded-3xl" />
          </div>

          {/* Core Under-Glow Aura */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-36 h-7 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 rounded-full blur-xl opacity-90 animate-pulse" />
        </div>

        {/* Brand Header with Electric Gradient */}
        <div className="space-y-1 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-[10px] font-black uppercase tracking-[3px] text-purple-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>OFFICIAL FLAGSHIP STORE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(168,85,247,0.7)]">
            APEX<span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">STORE</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold tracking-wide text-purple-200/90 uppercase">
            The Pinnacle of Luxury Shopping
          </p>
        </div>

        {/* Live Cyber Diagnostic Telemetry Log */}
        <div className="w-full max-w-xs bg-black/70 backdrop-blur-md rounded-xl border border-purple-700/60 py-1.5 px-3.5 mb-4 min-h-[30px] flex items-center justify-center">
          <span className="text-[11px] font-mono text-purple-300 truncate">
            {SYSTEM_LOGS[logIndex]}
          </span>
        </div>

        {/* High-Voltage Dynamic Progress Bar */}
        <div className="w-full max-w-xs mb-5">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-300 mb-1.5 px-1">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-bolt text-amber-300 text-[10px] animate-pulse" />
              <span>CORE BOOT</span>
            </span>
            <span className="text-white font-black">{progress}%</span>
          </div>
          <div className="w-full bg-[#150a2b] h-2.5 rounded-full overflow-hidden border border-purple-600/70 p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-amber-300 rounded-full transition-all duration-100 ease-out shadow-[0_0_18px_rgba(217,70,239,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ENTER STORE Powerful CTA */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
            className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-purple-950/90 border border-purple-400/60 hover:border-purple-300 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2.5"
          >
            <span>ENTER STORE NOW</span>
            <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform" />
          </button>

          <span className="text-[10px] font-semibold text-purple-400/70 uppercase tracking-widest mt-0.5">
            Tap anywhere to skip
          </span>
        </div>

      </div>
    </div>
  );
};
