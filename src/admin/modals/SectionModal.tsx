import React, { useState, useEffect } from 'react';
import { Section, ProductLayoutType } from '../../types/store';

interface SectionModalProps {
  isOpen: boolean;
  section: Section | null;
  onClose: () => void;
  onSave: (sectionData: Partial<Section>, editId?: number) => void;
}

const FILTER_OPTIONS = [
  { filter: 'headphone', label: 'Headphones', icon: 'fa-headphones' },
  { filter: 'watch', label: 'Watches', icon: 'fa-clock' },
  { filter: 'shoe', label: 'Shoes', icon: 'fa-shoe-prints' },
  { filter: 'glasses', label: 'Glasses', icon: 'fa-glasses' },
  { filter: 'electronics', label: 'Electronics', icon: 'fa-laptop' },
  { filter: 'audio', label: 'Audio', icon: 'fa-music' },
  { filter: 'wearables', label: 'Wearables', icon: 'fa-mobile-screen' },
  { filter: 'accessories', label: 'Accessories', icon: 'fa-bag-shopping' },
  { filter: 'footwear', label: 'Footwear', icon: 'fa-shoe-prints' },
  { filter: 'all', label: 'All Products', icon: 'fa-star' }
];

export const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  section,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('headphone');
  const [layout, setLayout] = useState<ProductLayoutType | ''>('');
  const [order, setOrder] = useState('1');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setFilter(section.filter || 'headphone');
      setLayout(section.layout || '');
      setOrder(String(section.order || 1));
      setActive(section.active !== false);
    } else {
      setTitle('');
      setFilter('headphone');
      setLayout('');
      setOrder('1');
      setActive(true);
    }
  }, [section, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        filter,
        layout: layout || '',
        order: parseInt(order, 10) || 1,
        active
      },
      section ? section.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              {section ? 'Edit Section' : 'Add New Homepage Section'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PREMIUM AUDIO & HEADPHONES"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-bold focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Product Filter Type
                </label>
                <div className="filter-picker">
                  {FILTER_OPTIONS.map((opt) => (
                    <div
                      key={opt.filter}
                      onClick={() => setFilter(opt.filter)}
                      className={`filter-option ${filter === opt.filter ? 'selected' : ''}`}
                    >
                      <i className={`fa-solid ${opt.icon}`}></i> {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Layout Override
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as ProductLayoutType | '')}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none bg-white font-semibold focus:border-indigo-600 transition"
                  >
                    <option value="">Use Global Layout</option>
                    <option value="horizontal">Horizontal Scroll</option>
                    <option value="vertical">Vertical Grid</option>
                    <option value="compact">Compact Grid</option>
                    <option value="featured">Featured List</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div>
                  <p className="text-xs font-black text-emerald-900">Active on Homepage</p>
                  <p className="text-[10px] text-emerald-600">Show this section on the storefront</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-200"
              >
                <i className="fa-solid fa-floppy-disk mr-2"></i> Save Section
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
