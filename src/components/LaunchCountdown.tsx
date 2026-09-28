import React from 'react';
import { useStore } from '../context/StoreContext';

export const LaunchCountdown: React.FC = () => {
  const { launchConfig } = useStore();

  const totalSecs = Math.max(0, launchConfig.secondsLeft ?? 300);
  const minutes = Math.floor(totalSecs / 60);
  const seconds = totalSecs % 60;
  const progressPercent = Math.min(100, Math.max(0, ((300 - totalSecs) / 300) * 100));

  return (
    <div className="w-full bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 text-white text-xs relative overflow-hidden border-y border-purple-600/40 shadow-lg shadow-purple-950/40 select-none">
      {/* Background Glow & Ambient Pulse */}
      <div className="absolute inset-0 countdown-shine pointer-events-none opacity-40" />

      {/* Progress Track at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-950">
        <div
          className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between sm:justify-center gap-3 sm:gap-6 relative z-10 flex-wrap">
        {/* Left Badge with Animated Rocket */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-purple-800/80 border border-purple-400/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            <i className="fa-solid fa-rocket text-purple-200 text-xs countdown-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-wider text-[11px] sm:text-xs text-white">
              Next Drop Launch
            </span>
            <span className="text-[9px] text-purple-300 font-semibold hidden xs:inline">
              Exclusive Flagship Drops
            </span>
          </div>
        </div>

        {/* Live Digits Display */}
        <div className="flex items-center gap-1.5 shrink-0 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-purple-500/40 shadow-inner">
          {/* Minutes */}
          <div className="flex flex-col items-center min-w-[26px]">
            <span className="font-mono font-black text-sm sm:text-base text-purple-200 leading-tight">
              {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-[8px] uppercase font-bold text-purple-400 tracking-tighter">min</span>
          </div>

          <span className="font-black text-purple-400 text-xs sm:text-sm animate-pulse">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center min-w-[26px]">
            <span className="font-mono font-black text-sm sm:text-base text-amber-300 leading-tight">
              {String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[8px] uppercase font-bold text-amber-400/80 tracking-tighter">sec</span>
          </div>
        </div>

        {/* Right Info Pill */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-purple-200 font-bold bg-purple-900/40 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Limited Quantities Guaranteed
          </span>
        </div>
      </div>
    </div>
  );
};
