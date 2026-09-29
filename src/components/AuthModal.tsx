import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    showToast
  } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthModalOpen(false);
  };

  const switchMode = (mode: 'signin' | 'signup') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthModalMode(mode);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Welcome back.');
        showToast('Signed in successfully');
        setTimeout(() => {
          handleClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        setSuccessMsg('Account registered! Opening Admin OTP Verification Panel...');
        showToast(`Account created! Verify Admin OTP to enter store.`);
        setTimeout(() => {
          handleClose();
        }, 350);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#13131a] rounded-3xl overflow-hidden border border-purple-900/50 shadow-2xl shadow-purple-950/80 my-auto flex flex-col max-h-[92vh] animate-[slideUpFade_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-[#13131a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <i className={`fa-solid ${authModalMode === 'signin' ? 'fa-arrow-right-to-bracket' : 'fa-user-plus'} text-xs`} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {authModalMode === 'signin' ? 'Sign In to ApexStore' : 'Create Your Account'}
              </h3>
              <p className="text-[10px] text-purple-300/80 font-medium">
                {authModalMode === 'signin' ? 'Access your orders & exclusive perks' : 'Join our verified luxury shopping circle'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1a1a24] hover:bg-purple-900/60 text-purple-300 hover:text-white flex items-center justify-center shadow transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-[#0d071b] border-b border-purple-900/30">
          <div className="grid grid-cols-2 p-1 bg-[#161622] rounded-2xl border border-purple-900/40">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                authModalMode === 'signin'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-right-to-bracket text-xs" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                authModalMode === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-user-plus text-xs" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Status feedback */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2.5 animate-[fadeIn_0.2s]">
              <i className="fa-solid fa-circle-exclamation text-red-400 text-sm shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-[fadeIn_0.2s]">
              <i className="fa-solid fa-circle-check text-emerald-400 text-sm shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authModalMode === 'signin' ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-regular fa-envelope text-xs" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. founderofapexstore@gmail.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                    Password
                  </label>
                  <span className="text-[10px] text-purple-400/80 font-bold hover:underline cursor-pointer" onClick={() => showToast('Password reset link sent to registered email')}>
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-solid fa-lock text-xs" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-white transition cursor-pointer"
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#161622] border-purple-800 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-purple-200/80 font-medium">Remember me</span>
                </label>
                <span className="text-[10px] text-purple-400 flex items-center gap-1 font-semibold">
                  <i className="fa-solid fa-shield-halved text-[9px]" /> 256-Bit SSL Guard
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-950/80 border border-purple-400/40 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-regular fa-user text-xs" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Ahmad"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-regular fa-envelope text-xs" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-solid fa-lock text-xs" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-white transition cursor-pointer"
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <i className="fa-solid fa-check-double text-xs" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161622] border border-purple-900/50 text-white text-xs sm:text-sm placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded bg-[#161622] border-purple-800 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-purple-200/80 font-medium leading-tight">
                    I agree to the <span className="text-purple-300 underline">Terms of Service</span> and <span className="text-purple-300 underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-950/80 border border-purple-400/40 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <i className="fa-solid fa-user-check text-xs" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switch prompt */}
          <div className="text-center pt-2 space-y-2.5">
            {authModalMode === 'signin' ? (
              <>
                <p className="text-xs text-purple-300/80">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-black text-purple-300 hover:text-white underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </p>
                <div className="pt-2 border-t border-purple-900/30">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      window.dispatchEvent(new CustomEvent('apex_switch_mode', { detail: 'admin' }));
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-700/50 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-sliders text-purple-400 text-xs" />
                    <span>Open Admin Panel</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-purple-300/80">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-black text-purple-300 hover:text-white underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
