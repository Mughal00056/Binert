import React, { useState, useEffect } from 'react';

const SPLASH_PNG_URL =
  'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/084b9ad6-dbbb-45c7-baf0-b38fc93b4325.png';
const FALLBACK_LOGO_URL =
  'https://i.supaimg.com/0ffab3ca-b15e-48fd-a213-7db2aa7158cc/bb9ac2b2-70ac-461a-b3d7-1d8aabf1a38c.jpg';

interface AdminSplashAuthProps {
  onAuthenticated: () => void;
}

export const AdminSplashAuth: React.FC<AdminSplashAuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 8, ry: -8 });

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 8);
      });
    }, 60);

    let angle = 0;
    const tiltInterval = setInterval(() => {
      angle += 0.1;
      setTilt({
        rx: Math.round(Math.sin(angle) * 7 * 10) / 10,
        ry: Math.round(Math.cos(angle) * 9 * 10) / 10
      });
    }, 55);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tiltInterval);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 16,
      ry: x * 16
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'admin' && cleanPass === 'admin123') {
      setFading(true);
      setTimeout(() => {
        onAuthenticated();
      }, 320);
    } else {
      setError('Invalid credentials! Enter Admin User: admin & Password:••••••••');
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden transition-all duration-500 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none scale-105 filter blur-sm' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #1a0936 0%, #0b0418 55%, #040109 100%)',
        perspective: '1200px'
      }}
    >
      {/* Ambient 3D Depth Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-85">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] bg-gradient-to-tr from-purple-600/40 via-fuchsia-600/30 to-indigo-600/20 rounded-3xl rotate-12 blur-[100px] animate-pulse" />
      </div>

      {/* 3D Cube Perspective Wrapper */}
      <div
        className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] my-auto transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* 3D Extruded Back Shadow Layers (Square Cube Depth) */}
        <div
          className="absolute inset-0 rounded-3xl bg-purple-950/85 border-2 border-purple-500/45 pointer-events-none"
          style={{
            transform: 'translateZ(-32px) translateY(14px) scale(0.95)',
            boxShadow: '0 35px 85px rgba(0, 0, 0, 0.95), 0 0 65px rgba(168, 85, 247, 0.5)'
          }}
        />
        <div
          className="absolute inset-0 rounded-3xl bg-[#160a2e]/90 border border-fuchsia-500/45 pointer-events-none"
          style={{
            transform: 'translateZ(-16px) translateY(7px) scale(0.975)'
          }}
        />

        {/* MAIN 3D SQUARE / CUBE ADMIN LOGIN CARD */}
        <div
          className="w-full rounded-3xl bg-gradient-to-br from-[#1b0c38] via-[#110722] to-[#090314] border-2 border-purple-400/75 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_55px_rgba(168,85,247,0.6),inset_0_2px_20px_rgba(255,255,255,0.18)] flex flex-col items-center justify-between p-5 sm:p-7 text-center relative overflow-hidden"
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Top 3D Bevel Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/50 via-purple-400/20 to-transparent" />

          {/* Top Status Pill Floating in 3D */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/90 border border-purple-400/50 text-[9px] font-black uppercase tracking-[2.5px] text-purple-200 shadow-lg mb-3"
            style={{ transform: 'translateZ(26px)' }}
          >
            <span className="w-2 h-2 rounded-sm bg-emerald-400 animate-pulse" />
            <span>APEX 3D POWER ADMIN</span>
          </div>

          {/* Center 3D Square Emblem Cube */}
          <div
            className="relative my-1.5 flex items-center justify-center"
            style={{ transform: 'translateZ(46px)' }}
          >
            {/* Outer Square 3D Frames */}
            <div className="absolute -inset-2 rounded-2xl border border-purple-400/45 rotate-6 pointer-events-none bg-purple-500/5" />
            <div className="absolute -inset-2 rounded-2xl border border-fuchsia-400/45 -rotate-6 pointer-events-none bg-fuchsia-500/5" />

            {/* Inner 3D Square Logo Box */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-2xl bg-[#0d051d] p-2 border-2 border-purple-300/85 shadow-[0_14px_35px_rgba(0,0,0,0.85),0_0_35px_rgba(192,132,252,0.85),inset_0_2px_10px_rgba(255,255,255,0.28)] flex items-center justify-center relative overflow-hidden">
              <img
                src={SPLASH_PNG_URL}
                alt="ApexStore 3D Admin Emblem"
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
          <div className="space-y-0.5 mt-2 mb-3" style={{ transform: 'translateZ(34px)' }}>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]">
              APEX
              <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                ADMIN
              </span>
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-purple-300/90 uppercase">
              3D Security Gate • Authorized Access Only
            </p>
          </div>

          {/* 3D Progress Bar */}
          <div className="w-full mb-3.5" style={{ transform: 'translateZ(28px)' }}>
            <div className="flex items-center justify-between text-[9px] font-mono font-black text-purple-200 mb-1 px-0.5">
              <span>3D CORE ENGINE READY</span>
              <span className="text-amber-300">{progress}%</span>
            </div>
            <div className="w-full bg-[#090314] h-2 rounded-lg overflow-hidden border border-purple-500/60 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-amber-300 rounded-md transition-all duration-100 ease-out shadow-[0_0_12px_rgba(217,70,239,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 3D Admin Login Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-2.5 text-left"
            style={{ transform: 'translateZ(36px)' }}
          >
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[11px] font-bold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">
                Admin User
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-purple-400 pointer-events-none">
                  <i className="fa-solid fa-user-shield text-xs" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter admin user"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090314]/90 border border-purple-500/60 focus:border-purple-300 text-white text-xs sm:text-sm font-bold placeholder-purple-400/40 outline-none shadow-inner transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-purple-400 pointer-events-none">
                  <i className="fa-solid fa-key text-xs" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#090314]/90 border border-purple-500/60 focus:border-purple-300 text-white text-xs sm:text-sm font-bold placeholder-purple-400/40 outline-none shadow-inner transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-white cursor-pointer"
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(88,28,135,0.85)] border border-purple-300/50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-cube text-xs" />
              <span>UNLOCK 3D ADMIN PANEL</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
