import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard } from '../utils/helpers';

export const AccountVerificationModal: React.FC = () => {
  const {
    currentUser,
    registeredUsers,
    verifyUserAccountOtp,
    logout,
    adminModalOpen,
    showToast
  } = useStore();

  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find latest user record from registeredUsers to catch 0ms Admin OTP updates
  const latestUserRecord = currentUser
    ? registeredUsers.find(
        (u) => (u.email || '').trim().toLowerCase() === currentUser.email.trim().toLowerCase()
      ) || currentUser
    : null;

  const isVerified = Boolean(
    !currentUser ||
      currentUser.role === 'admin' ||
      currentUser.verified ||
      latestUserRecord?.verified
  );

  const activeOtp = (latestUserRecord?.verificationOtp || currentUser?.verificationOtp || '').trim();

  useEffect(() => {
    setErrorMsg(null);
  }, [activeOtp, currentUser?.email]);

  // Only show Verification Gate when a non-admin user is logged in and NOT yet verified
  if (!currentUser || isVerified || adminModalOpen) return null;

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpInput.trim()) {
      setErrorMsg('Please enter the 6-digit verification OTP sent by Admin.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyUserAccountOtp(otpInput.trim());
      setIsVerifying(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid OTP code.');
      } else {
        setOtpInput('');
      }
    }, 250);
  };

  const handleInstantAutoVerify = () => {
    if (!activeOtp) return;
    setOtpInput(activeOtp);
    setErrorMsg(null);
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyUserAccountOtp(activeOtp);
      setIsVerifying(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid OTP code.');
      }
    }, 200);
  };

  const handleCopyOtp = async () => {
    if (!activeOtp) return;
    const ok = await copyToClipboard(activeOtp);
    if (ok) {
      setCopied(true);
      showToast('Account Verification OTP copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-[#07050c]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-[fadeIn_0.25s_ease-out]">
      <div className="relative w-full max-w-md bg-[#13131a] rounded-3xl overflow-hidden border border-purple-700/50 shadow-[0_0_60px_rgba(147,51,234,0.35)] my-auto flex flex-col max-h-[94vh] animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-purple-900/50 bg-gradient-to-r from-purple-950/90 via-purple-900/40 to-[#13131a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <i className="fa-solid fa-user-lock text-base animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Account Verification Panel
              </h2>
              <p className="text-[10px] text-purple-300/80 font-semibold">
                Admin OTP Verification Required to Enter Store
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-widest shrink-0">
            ● Unverified
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* User Profile Summary (Strictly Unverified) */}
          <div className="p-3.5 rounded-2xl bg-[#0d0914] border border-purple-800/50 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-black text-white truncate">
                  {currentUser.name}
                </p>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                  Unverified Profile
                </span>
              </div>
              <p className="text-[11px] font-mono text-purple-300/80 truncate mt-0.5">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Store Gate Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 leading-relaxed flex items-start gap-2.5">
            <i className="fa-solid fa-shield-halved text-purple-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-black text-white block mb-0.5">
                Store Access Locked Until OTP Verified
              </span>
              Your account is registered as <strong className="text-amber-300">Unverified</strong>. To enter ApexStore and unlock your <strong className="text-emerald-300">Verified</strong> badge, enter the 6-digit OTP sent by the Store Admin below.
            </div>
          </div>

          {/* LIVE ADMIN OTP BOX */}
          {activeOtp ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-[#111f1c] to-amber-950/40 border-2 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-3 animate-[fadeIn_0.25s]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-key text-amber-400 animate-bounce" />
                  <span>Admin Sent Your Verification OTP!</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                  Ready to Verify
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/60 border border-emerald-500/40 rounded-xl px-4 py-3">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-purple-300/70">
                    Your 6-Digit Account OTP
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-black tracking-[6px] text-amber-300 select-all mt-0.5">
                    {activeOtp}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-2.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border border-purple-700/50"
                  >
                    <i className={`fa-regular ${copied ? 'fa-circle-check text-emerald-400' : 'fa-copy'} mr-1`} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpInput(activeOtp)}
                    className="px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border border-amber-500/40"
                  >
                    Fill OTP
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantAutoVerify}
                disabled={isVerifying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <i className="fa-solid fa-bolt" />
                <span>1-Click Auto-Fill &amp; Verify Account Now</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <i className="fa-solid fa-hourglass-half animate-spin text-sm" />
              </div>
              <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Waiting for Admin to Send OTP...
              </p>
              <p className="text-[11px] text-purple-300/80 leading-relaxed">
                Your signup request (<span className="text-white font-mono">{currentUser.email}</span>) has been received. As soon as your 6-digit verification OTP is dispatched, it will appear right here automatically!
              </p>
            </div>
          )}

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Manual OTP Entry Form */}
          <form onSubmit={handleVerifySubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-1.5">
                Enter 6-Digit Verification OTP
              </label>
              <input
                type="text"
                maxLength={8}
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ''));
                  setErrorMsg(null);
                }}
                placeholder="• • • • • •"
                className="w-full py-3 px-4 rounded-2xl bg-[#0a0a0f] border-2 border-purple-800/60 focus:border-purple-400 text-center font-mono text-xl font-black tracking-[8px] text-white placeholder-purple-700 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-950/80 border border-purple-400/40 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-check" />
                  <span>Verify OTP &amp; Enter Store</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Action: Switch Account / Sign Out Only (No Admin Panel button) */}
          <div className="pt-3 border-t border-purple-900/40">
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
