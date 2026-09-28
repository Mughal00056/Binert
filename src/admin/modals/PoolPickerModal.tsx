import React from 'react';
import { LaunchPoolProduct } from '../../types/store';
import { formatPKR } from '../../lib/format';

interface PoolPickerModalProps {
  isOpen: boolean;
  pool: LaunchPoolProduct[];
  selectedId: string | number | null | undefined;
  onClose: () => void;
  onSelect: (productId: string | number) => void;
}

export const PoolPickerModal: React.FC<PoolPickerModalProps> = ({
  isOpen,
  pool,
  selectedId,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Select Next Product To Launch
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose which item from the pool drops next
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {pool.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <i className="fa-solid fa-inbox text-3xl mb-2 text-slate-300"></i>
                <p className="text-sm font-bold text-slate-600">The launch pool is empty</p>
                <p className="text-xs text-slate-400 mt-1">Add items to the pool first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pool.map((p) => {
                  const isSelected = selectedId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelect(p.id)}
                      className={`text-left p-3 rounded-2xl border-2 transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.category}</p>
                        <p className="text-xs font-black text-rose-600 mt-0.5">{formatPKR(p.price)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 text-right">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
