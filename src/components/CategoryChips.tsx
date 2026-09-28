import React from 'react';
import { useStore } from '../context/StoreContext';

interface CategoryItem {
  name: string;
  filter: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: 'All',
    filter: 'all',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Audio',
    filter: 'audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Wearables',
    filter: 'wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Electronics',
    filter: 'electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Accessories',
    filter: 'accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Footwear',
    filter: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'
  }
];

export const CategoryChips: React.FC = () => {
  const { activeCategory, setActiveCategory } = useStore();

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
        {CATEGORIES.map((c, i) => {
          const isActive = activeCategory === c.filter;
          return (
            <div
              key={c.filter}
              onClick={() => setActiveCategory(c.filter)}
              className="circle-pop flex flex-col items-center gap-2 cursor-pointer group shrink-0"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'border-purple-400 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-500/30'
                    : 'border-purple-500/30 group-hover:border-purple-400'
                }`}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
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
