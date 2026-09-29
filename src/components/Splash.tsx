import React, { useState, useEffect } from 'react';

// Official emblem for the 3D Square Splash Screen
const SPLASH_PNG_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/084b9ad6-dbbb-45c7-baf0-b38fc93b4325.png';
const FALLBACK_LOGO_URL = 'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

export const Splash: React.FC = () => {
  // Always show on every page refresh / load
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(5);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 9, ry: -9 });

  useEffect(() => {
    const triggerSplashAgain = () => {
      setFading(false);
      setProgress(5);
      setVisible(true);
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        triggerSplashAgain();
      }
    };

    window.addEventListener('apex_trigger_splash', triggerSplashAgain);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('apex_trigger_splash', triggerSplashAgain);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Smooth progress bar fill from 5% to 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 5) + 4;
        return Math.min(100, prev + delta);
      });
    }, 85);

    // Autonomous 3D oscillation so the square cube rotates smoothly in 3D space
    let angle = 0;
    const tiltInterval = setInterval(() => {
      angle += 0.12;
      setTilt({
        rx: Math.round(Math.sin(angle) * 8 * 10) / 10,
        ry: Math.round(Math.cos(angle) * 10 * 10) / 10
      });
    }, 55);

    // Smooth fade-out after loading completes (~3.2s)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3200);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 3650);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tiltInterval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible]);

  const handleEnter = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 280);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 20,
      ry: x * 20
    });
  };

  if (!visible) return null;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden transition-all duration-500 ease-out select-none ${
        fading
          ? 'opacity-0 pointer-events-none scale-105 filter blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #1a0936 0%, #0b0418 55%, #040109 100%)',
        perspective: '1200px'
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-gradient-to-tr from-purple-600/40 via-fuchsia-600/30 to-indigo-600/20 rounded-3xl rotate-12 blur-[100px] animate-pulse" />
      </div>

      {/* 3D Square Perspective Wrapper */}
      <div
        className="relative z-10 transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* 3D Extruded Back Shadow Layers (Square Cube Depth) */}
        <div
          className="absolute inset-0 rounded-3xl bg-purple-950/85 border-2 border-purple-500/45 pointer-events-none"
          style={{
            transform: 'translateZ(-32px) translateY(16px) scale(0.95)',
            boxShadow: '0 35px 85px rgba(0, 0, 0, 0.95), 0 0 65px rgba(168, 85, 247, 0.5)'
          }}
        />
        <div
          className="absolute inset-0 rounded-3xl bg-[#160a2e]/90 border border-fuchsia-500/45 pointer-events-none"
          style={{
            transform: 'translateZ(-16px) translateY(8px) scale(0.975)'
          }}
        />

        {/* MAIN 3D SQUARE CARD (Strict 1:1 Square Aspect Ratio) */}
        <div
          className="w-[310px] h-[310px] sm:w-[370px] sm:h-[370px] aspect-square rounded-3xl bg-gradient-to-br from-[#1b0c38] via-[#110722] to-[#090314] border-2 border-purple-400/75 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_55px_rgba(168,85,247,0.6),inset_0_2px_20px_rgba(255,255,255,0.18)] flex flex-col items-center justify-between p-6 sm:p-7 text-center relative overflow-hidden"
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Top 3D Bevel Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/50 via-purple-400/20 to-transparent" />

          {/* Top Status Pill Floating in 3D */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/90 border border-purple-400/50 text-[9px] font-black uppercase tracking-[2.5px] text-purple-200 shadow-lg"
            style={{ transform: 'translateZ(26px)' }}
          >
            <span className="w-2 h-2 rounded-sm bg-emerald-400 animate-pulse" />
            <span>APEX 3D SQUARE</span>
          </div>

          {/* Center 3D Square Emblem Cube */}
          <div
            className="relative my-1 flex items-center justify-center"
            style={{ transform: 'translateZ(46px)' }}
          >
            {/* Outer Square 3D Frames */}
            <div className="absolute -inset-2.5 rounded-2xl border border-purple-400/45 rotate-6 pointer-events-none bg-purple-500/5" />
            <div className="absolute -inset-2.5 rounded-2xl border border-fuchsia-400/45 -rotate-6 pointer-events-none bg-fuchsia-500/5" />

            {/* Inner 3D Square Logo Box */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl bg-[#0d051d] p-2.5 border-2 border-purple-300/85 shadow-[0_14px_35px_rgba(0,0,0,0.85),0_0_35px_rgba(192,132,252,0.85),inset_0_2px_10px_rgba(255,255,255,0.28)] flex items-center justify-center relative overflow-hidden">
              <img
                src={SPLASH_PNG_URL}
                alt="ApexStore 3D Square Emblem"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_16px_rgba(168,85,247,0.9)]"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_LOGO_URL;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* 3D Brand Title */}
          <div
            className="space-y-0.5"
            style={{ transform: 'translateZ(34px)' }}
          >
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]">
              APEX<span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">STORE</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-purple-300/90 uppercase">
              Verified 3D Digital &amp; Luxury Store
            </p>
          </div>

          {/* Bottom 3D Progress & Enter Button */}
          <div
            className="w-full space-y-2.5"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="w-full">
              <div className="flex items-center justify-between text-[10px] font-mono font-black text-purple-200 mb-1 px-0.5">
                <span>LOADING 3D STORE</span>
                <span className="text-amber-300">{progress}%</span>
              </div>
              <div className="w-full bg-[#090314] h-2.5 rounded-lg overflow-hidden border border-purple-500/60 p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-amber-300 rounded-md transition-all duration-100 ease-out shadow-[0_0_12px_rgba(217,70,239,0.9)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnter}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(88,28,135,0.8)] border border-purple-300/50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>ENTER STORE</span>
              <i className="fa-solid fa-cube text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
