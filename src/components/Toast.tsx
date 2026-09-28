import React from 'react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 pointer-events-none items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-2xl shadow-2xl text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 animate-[slideUpFade_0.25s_cubic-bezier(0.22,1,0.36,1)] pointer-events-auto border border-white/10 ${
            t.type === 'error'
              ? 'bg-rose-600'
              : 'bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 shadow-purple-900/60'
          }`}
        >
          <i
            className={`fa-solid ${
              t.type === 'error'
                ? 'fa-circle-exclamation'
                : t.type === 'info'
                ? 'fa-circle-info'
                : 'fa-circle-check'
            }`}
          />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
