import React, { useState } from 'react';
import { Product } from '../../types/store';

interface HeroImagesTabProps {
  bannerImage?: string | null;
  gallery: string[];
  galleryEnabled: boolean;
  products: Product[];
  onSaveBanner: (url: string) => void;
  onClearBanner: () => void;
  onToggleGallery: (enabled: boolean) => void;
  onAddGalleryImage: (url: string) => void;
  onRemoveGalleryImage: (index: number) => void;
  onEditProduct: (product: Product) => void;
}

export const HeroImagesTab: React.FC<HeroImagesTabProps> = ({
  bannerImage,
  gallery,
  galleryEnabled,
  products,
  onSaveBanner,
  onClearBanner,
  onToggleGallery,
  onAddGalleryImage,
  onRemoveGalleryImage,
  onEditProduct
}) => {
  const [bannerInput, setBannerInput] = useState(bannerImage || '');
  const [newGalleryInput, setNewGalleryInput] = useState('');

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerInput.trim()) return;
    onSaveBanner(bannerInput.trim());
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryInput.trim()) return;
    onAddGalleryImage(newGalleryInput.trim());
    setNewGalleryInput('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Hero Banner Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-panorama text-indigo-600"></i> Main Storefront Banner
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Featured hero banner on top of the store homepage
            </p>
          </div>
          {bannerImage && (
            <button
              onClick={onClearBanner}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
            >
              <i className="fa-solid fa-trash-can mr-1"></i> Clear Banner
            </button>
          )}
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={bannerInput}
              onChange={(e) => setBannerInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono text-xs focus:border-indigo-600 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition flex-shrink-0 shadow-md shadow-indigo-100"
            >
              <i className="fa-solid fa-floppy-disk mr-1.5"></i> Save Banner
            </button>
          </div>

          {/* Banner Preview */}
          <div className="hero-preview-big overflow-hidden border-2 border-slate-200 rounded-2xl relative bg-slate-100 max-h-72">
            {bannerInput ? (
              <img
                src={bannerInput}
                alt="Store Banner Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute(
                    'src',
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600'
                  );
                }}
              />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                <i className="fa-solid fa-image text-3xl mb-2 text-slate-300"></i>
                <p className="text-xs font-bold">No banner image set</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 2. Hero Gallery Carousel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-lg">
              <i className="fa-solid fa-images"></i>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Hero Image Showcase ({gallery.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Multiple highlight slides shown in carousel mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Enable Slider</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={galleryEnabled}
                onChange={(e) => onToggleGallery(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Add new image to gallery */}
        <form onSubmit={handleAddGallery} className="flex gap-2 mb-5">
          <input
            type="url"
            value={newGalleryInput}
            onChange={(e) => setNewGalleryInput(e.target.value)}
            placeholder="Paste image URL to append to gallery..."
            className="flex-1 text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono text-xs focus:border-indigo-600 transition"
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-pink-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Slide</span>
          </button>
        </form>

        {/* Gallery Slots Grid */}
        {gallery.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            <i className="fa-solid fa-images text-3xl mb-2 text-slate-300"></i>
            <p className="text-xs font-bold">No gallery slides added yet</p>
          </div>
        ) : (
          <div className="hero-grid">
            {gallery.map((imgUrl, idx) => (
              <div key={idx} className="hero-slot group">
                <img
                  src={imgUrl}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      'src',
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
                    );
                  }}
                />
                <span className="slot-badge">Slide #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveGalleryImage(idx)}
                  className="slot-remove"
                  title="Remove slide"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <div className="slot-label">Hero Gallery Slide</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. All Product Visuals Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Product Images Library ({products.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Click the edit icon on any item to update product photos
            </p>
          </div>
        </div>

        <div className="hero-grid">
          {products.map((p) => (
            <div key={p.id} className="hero-slot group">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute(
                    'src',
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
                  );
                }}
              />
              <span className="slot-badge">{p.category}</span>
              <button
                type="button"
                onClick={() => onEditProduct(p)}
                className="slot-remove bg-indigo-600! hover:bg-indigo-700!"
                title="Edit Product"
              >
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <div className="slot-label truncate">{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
