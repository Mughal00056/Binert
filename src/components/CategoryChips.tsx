import React from 'react';
import { useStore } from '../context/StoreContext';

export const CategoryChips: React.FC = () => {
  const { categories, activeCategory, setActiveCategory } = useStore();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="text-center mb-6 section-fade-up">
        <h2 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-1">
          Select Categories
        </h2>
        <p className="text-lg sm:text-xl font-black text-white">
          Explore Collections in Style
        </p>
      </div>

      <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar py-2 px-2">
        {categories.map((c, i) => {
          const isActive = activeCategory.toLowerCase() === c.filter.toLowerCase();
          return (
            <div
              key={c.id || c.filter}
              onClick={() => setActiveCategory(c.filter)}
              className="circle-pop flex flex-col items-center gap-2 cursor-pointer group shrink-0"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 active:scale-95 flex items-center justify-center bg-[#13131a] ${
                  isActive
                    ? 'border-purple-400 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-500/30'
                    : 'border-purple-500/30 group-hover:border-purple-400'
                }`}
              >
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <i
                    className={`fa-solid ${c.icon || 'fa-layer-group'} text-xl sm:text-2xl ${
                      isActive ? 'text-purple-300' : 'text-purple-400/80 group-hover:text-purple-300'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold transition ${
                  isActive ? 'text-purple-300' : 'text-purple-400/80 group-hover:text-purple-300'
                }`}
              >
                {c.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
