import React, { useState, useEffect } from 'react';
import { LaunchConfig, LaunchPoolProduct } from '../../types/store';
import { formatPKR } from '../../lib/format';

interface LaunchControlTabProps {
  config: LaunchConfig;
  pool: LaunchPoolProduct[];
  nextProductId: string | number | null | undefined;
  onUpdateConfig: (config: Partial<LaunchConfig>) => void;
  onPickNextProduct: () => void;
  onOpenAddToPool: () => void;
  onEditPoolProduct: (product: LaunchPoolProduct, index: number) => void;
  onDeletePoolProduct: (index: number) => void;
  onMovePoolProductToNext: (index: number) => void;
  onDropNow: () => void;
}

export const LaunchControlTab: React.FC<LaunchControlTabProps> = ({
  config,
  pool,
  nextProductId,
  onUpdateConfig,
  onPickNextProduct,
  onOpenAddToPool,
  onEditPoolProduct,
  onDeletePoolProduct,
  onMovePoolProductToNext,
  onDropNow
}) => {
  const [mins, setMins] = useState(Math.floor((config.totalSeconds || 300) / 60));
  const [secs, setSecs] = useState((config.totalSeconds || 300) % 60);

  useEffect(() => {
    setMins(Math.floor((config.totalSeconds || 300) / 60));
    setSecs((config.totalSeconds || 300) % 60);
  }, [config.totalSeconds]);

  const remaining = Math.max(0, config.secondsLeft ?? 300);
  const dispM = Math.floor(remaining / 60);
  const dispS = remaining % 60;
  const timeFormatted = `${String(dispM).padStart(2, '0')}:${String(dispS).padStart(2, '0')}`;

  const total = config.totalSeconds || 300;
  const fraction = total > 0 ? remaining / total : 0;
  const circ = 2 * Math.PI * 88; // 552.92
  const strokeOffset = circ * (1 - fraction);

  const setPreset = (m: number, s: number) => {
    const totalSecs = m * 60 + s;
    setMins(m);
    setSecs(s);
    onUpdateConfig({
      totalSeconds: totalSecs,
      secondsLeft: totalSecs,
      isRunning: true,
      endTime: Date.now() + totalSecs * 1000
    });
  };

  const handleApplyCustomTime = () => {
    const totalSecs = Math.max(1, (Number(mins) || 0) * 60 + (Number(secs) || 0));
    onUpdateConfig({
      totalSeconds: totalSecs,
      secondsLeft: totalSecs,
      isRunning: config.isRunning,
      endTime: config.isRunning ? Date.now() + totalSecs * 1000 : null
    });
  };

  const handleStart = () => {
    const inputTotalSecs = (Number(mins) || 0) * 60 + (Number(secs) || 0);
    const activeSecs =
      inputTotalSecs > 0 && inputTotalSecs !== config.totalSeconds
        ? inputTotalSecs
        : config.secondsLeft > 0
        ? config.secondsLeft
        : Math.max(60, inputTotalSecs || 300);
    const totalSecs = inputTotalSecs > 0 ? inputTotalSecs : config.totalSeconds || activeSecs;
    onUpdateConfig({
      totalSeconds: totalSecs,
      secondsLeft: activeSecs,
      isRunning: true,
      endTime: Date.now() + activeSecs * 1000
    });
  };

  const handlePause = () => {
    onUpdateConfig({ isRunning: false, endTime: null });
  };

  const handleReset = () => {
    const totalSecs = (Number(mins) || 0) * 60 + (Number(secs) || 0) || 300;
    onUpdateConfig({
      totalSeconds: totalSecs,
      secondsLeft: totalSecs,
      isRunning: false,
      endTime: null
    });
  };

  const nextProduct = pool.find((p) => p.id === nextProductId) || pool[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-rocket text-rose-500"></i> Product Launch Control Center
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Orchestrate product drops, timed releases, and automated launch countdowns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Timer Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-stopwatch text-indigo-600"></i> Launch Countdown Timer
            </h3>

            {/* Circular Timer Ring */}
            <div className="timer-ring my-2">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle className="bg" cx="100" cy="100" r="88" />
                <circle
                  className="progress"
                  cx="100"
                  cy="100"
                  r="88"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="timer-inner">
                <div className="timer-display">{timeFormatted}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {config.isRunning ? 'Active Countdown' : 'Paused / Standby'}
                </div>
              </div>
            </div>

            {/* Inputs for Minutes & Seconds */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={mins}
                  onChange={(e) => setMins(parseInt(e.target.value, 10) || 0)}
                  onBlur={handleApplyCustomTime}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none font-mono text-center font-black focus:border-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={secs}
                  onChange={(e) => setSecs(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 outline-none font-mono text-center font-black focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const totalSecs = Math.max(1, (Number(mins) || 0) * 60 + (Number(secs) || 0));
                onUpdateConfig({
                  totalSeconds: totalSecs,
                  secondsLeft: totalSecs,
                  isRunning: true,
                  endTime: Date.now() + totalSecs * 1000
                });
              }}
              className="w-full mt-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black py-2 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-clock"></i> Set &amp; Update User Timer Now
            </button>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPreset(1, 0)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                1 min
              </button>
              <button
                type="button"
                onClick={() => setPreset(5, 0)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                5 min
              </button>
              <button
                type="button"
                onClick={() => setPreset(10, 0)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                10 min
              </button>
              <button
                type="button"
                onClick={() => setPreset(30, 0)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                30 min
              </button>
              <button
                type="button"
                onClick={() => setPreset(60, 0)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                1 hour
              </button>
              <button
                type="button"
                onClick={() => setPreset(0, 30)}
                className="px-2 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 transition"
              >
                30 sec
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <i className="fa-solid fa-play"></i> Start
            </button>
            <button
              type="button"
              onClick={handlePause}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <i className="fa-solid fa-pause"></i> Pause
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1"
            >
              <i className="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        {/* 2. Launch Mode & Automation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-eye text-indigo-600"></i> Mode & Automation
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Public: countdown widget visible to shoppers. Private: hidden secret drop.
            </p>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => onUpdateConfig({ mode: 'public' })}
                className={`mode-btn public ${config.mode === 'public' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-globe"></i>
                <span>Public Drop</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateConfig({ mode: 'private' })}
                className={`mode-btn private ${config.mode === 'private' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-lock"></i>
                <span>Private Drop</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl mb-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                Current Mode Status
              </p>
              <p className="text-sm font-black text-indigo-600 capitalize">
                {config.mode === 'public' ? 'Public Visible Countdown' : 'Secret Stealth Drop'}
              </p>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/70">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.autoLaunch}
                  onChange={(e) => onUpdateConfig({ autoLaunch: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="flex-1">
                <p className="text-xs font-black text-indigo-900">Auto-Launch Trigger</p>
                <p className="text-[10px] text-indigo-600 font-semibold">
                  Instantly publish next product to store when timer hits 00:00
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium">
            <i className="fa-solid fa-bolt text-amber-500 mr-1"></i>
            Real-time synced across all active customer browsers via Firebase.
          </div>
        </div>

        {/* 3. Next Product To Drop */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-arrow-right text-rose-500"></i> Next In Line
            </h3>

            {nextProduct ? (
              <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={nextProduct.image}
                    alt={nextProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                      );
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      NEXT TO DROP
                    </span>
                    <p className="text-xs font-black text-slate-900 truncate mt-1">
                      {nextProduct.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">{nextProduct.category}</p>
                    <p className="text-sm font-black text-rose-600 mt-0.5">
                      {formatPKR(nextProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-400 mb-4">
                <i className="fa-solid fa-inbox text-3xl mb-2 text-slate-300 block"></i>
                <p className="text-xs font-bold text-slate-600">No products in queue</p>
              </div>
            )}

            <button
              type="button"
              onClick={onPickNextProduct}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md shadow-rose-100 flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-hand-pointer"></i> Pick From Launch Pool
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onDropNow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-bolt"></i> Drop Now
            </button>
            <button
              type="button"
              onClick={onOpenAddToPool}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-plus"></i> Add to Pool
            </button>
          </div>
        </div>
      </div>

      {/* Launch Pool Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Launch Pool Queue</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Items waiting to be published sequentially
            </p>
          </div>
          <span className="bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded-full">
            {pool.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 w-16">
                  Order
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Product
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden sm:table-cell">
                  Price
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pool.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-slate-400">
                    <i className="fa-solid fa-rocket text-4xl mb-3 text-slate-300 block"></i>
                    <p className="font-bold text-slate-700">Launch pool is empty</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add to Pool" to queue upcoming products for drop.
                    </p>
                  </td>
                </tr>
              ) : (
                pool.map((p, idx) => {
                  const isNext = (nextProductId ?? pool[0]?.id) === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={`table-row-hover ${isNext ? 'bg-rose-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-black ${
                            isNext ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute(
                                'src',
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                              );
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-black text-slate-900">
                          {formatPKR(p.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {isNext ? (
                          <span className="status-badge status-pending bg-rose-100 text-rose-800">
                            <i className="fa-solid fa-arrow-right"></i> NEXT
                          </span>
                        ) : (
                          <span className="status-badge bg-slate-100 text-slate-500">
                            In Queue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onMovePoolProductToNext(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Make next in line"
                          >
                            <i className="fa-solid fa-arrow-up text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditPoolProduct(p, idx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePoolProduct(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
