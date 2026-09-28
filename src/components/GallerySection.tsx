import React from 'react';
import { useStore } from '../context/StoreContext';

export const GallerySection: React.FC = () => {
  const { galleryEnabled, galleryImages } = useStore();

  if (!galleryEnabled || galleryImages.length === 0) return null;

  const third = Math.ceil(galleryImages.length / 3);
  const row1 = galleryImages.slice(0, third);
  const row2 = galleryImages.slice(third, third * 2);
  const row3 = galleryImages.slice(third * 2);

  const renderRow = (images: string[], speedClass: string, animDuration?: string) => {
    const doubled = [...images, ...images];
    return (
      <div className="overflow-hidden mb-2">
        <div
          className={`flex gap-3 sm:gap-5 py-2 w-max ${speedClass}`}
          style={animDuration ? { animationDuration: animDuration } : undefined}
        >
          {doubled.map((src, i) => (
            <div
              key={i}
              className="w-48 sm:w-64 md:w-80 aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-950/40 shrink-0 bg-[#13131a]"
            >
              <img
                src={src}
                alt="Product Showcase"
                className="w-full h-full object-cover pointer-events-none hover:scale-105 transition-transform duration-500"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black border-b border-purple-900/40 py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <i className="fa-solid fa-images text-purple-400 text-sm" />
          <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
            Product Gallery
          </span>
          <span className="h-px flex-1 bg-purple-900/40" />
        </div>

        {renderRow(row1.length ? row1 : galleryImages, 'thumb-scroll-rtl')}
        {renderRow(row2.length ? row2 : galleryImages, 'thumb-scroll-rtl', '55s')}
        {renderRow(row3.length ? row3 : galleryImages, 'thumb-scroll-rtl', '40s')}
      </div>
    </div>
  );
};
