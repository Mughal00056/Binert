import React from 'react';
import { Section, ProductLayoutType } from '../../types/store';

interface LayoutTabProps {
  globalLayout: ProductLayoutType;
  sections: Section[];
  onSelectGlobalLayout: (layout: ProductLayoutType) => void;
  onSaveGlobalLayout: () => void;
  onUpdateSectionLayout: (sectionId: number, layout: ProductLayoutType | '') => void;
}

const LAYOUT_OPTIONS: Array<{
  id: ProductLayoutType;
  title: string;
  desc: string;
}> = [
  {
    id: 'horizontal',
    title: 'Horizontal Scroll',
    desc: 'Cards slide left-to-right smoothly. Great for mobile & showcases.'
  },
  {
    id: 'vertical',
    title: 'Vertical Grid',
    desc: 'Multi-column responsive card grid. Standard e-commerce experience.'
  },
  {
    id: 'compact',
    title: 'Compact Grid',
    desc: 'Dense, space-saving product matrix for extensive catalogs.'
  },
  {
    id: 'featured',
    title: 'Featured List',
    desc: 'Single-column prominent hero banners showcasing specs.'
  }
];

export const LayoutTab: React.FC<LayoutTabProps> = ({
  globalLayout,
  sections,
  onSelectGlobalLayout,
  onSaveGlobalLayout,
  onUpdateSectionLayout
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-table-columns text-indigo-600"></i> Storefront Layout & Display
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Select how products are arranged across all sections or customize per category
        </p>
      </div>

      {/* 1. Global Product Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-indigo-600"></i> Global Product Layout
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Applies to all storefront sections by default
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = globalLayout === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectGlobalLayout(opt.id)}
                className={`layout-option rounded-2xl p-4 flex flex-col justify-between ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-800">{opt.title}</span>
                    <i
                      className={`fa-solid fa-circle-check text-indigo-600 check-icon ${
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                    ></i>
                  </div>

                  {/* Visual Layout Mockups */}
                  <div className="preview-mini">
                    {opt.id === 'horizontal' && (
                      <div className="flex gap-2">
                        <div className="preview-card-mini w-16">
                          <div className="h-10 bg-gradient-to-br from-indigo-200 to-purple-200"></div>
                        </div>
                        <div className="preview-card-mini w-16">
                          <div className="h-10 bg-gradient-to-br from-emerald-200 to-teal-200"></div>
                        </div>
                      </div>
                    )}
                    {opt.id === 'vertical' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="preview-card-mini">
                          <div className="h-8 bg-gradient-to-br from-indigo-200 to-purple-200"></div>
                        </div>
                        <div className="preview-card-mini">
                          <div className="h-8 bg-gradient-to-br from-emerald-200 to-teal-200"></div>
                        </div>
                      </div>
                    )}
                    {opt.id === 'compact' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="preview-card-mini">
                          <div className="h-6 bg-gradient-to-br from-indigo-200 to-purple-200"></div>
                        </div>
                        <div className="preview-card-mini">
                          <div className="h-6 bg-gradient-to-br from-emerald-200 to-teal-200"></div>
                        </div>
                        <div className="preview-card-mini">
                          <div className="h-6 bg-gradient-to-br from-pink-200 to-rose-200"></div>
                        </div>
                      </div>
                    )}
                    {opt.id === 'featured' && (
                      <div className="space-y-1.5">
                        <div className="flex gap-2 items-center bg-white rounded-lg p-1">
                          <div className="w-7 h-7 rounded bg-indigo-200"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-12 bg-slate-200 rounded"></div>
                            <div className="h-1 w-8 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-3 font-medium">{opt.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={onSaveGlobalLayout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-xs shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Save Global Layout</span>
          </button>
          <span className="text-xs text-slate-500 font-bold capitalize">
            Active: <span className="text-indigo-600">{globalLayout}</span>
          </span>
        </div>
      </div>

      {/* 2. Per-Section Override */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
          <i className="fa-solid fa-sliders text-indigo-600"></i> Per-Section Custom Overrides
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Override the global layout for specific category rows
        </p>

        <div className="space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="flex items-center justify-between gap-3 p-3 bg-slate-50/80 border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                  {sec.order}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{sec.title}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Filter: {sec.filter}
                  </p>
                </div>
              </div>

              <select
                value={sec.layout || ''}
                onChange={(e) =>
                  onUpdateSectionLayout(sec.id, e.target.value as ProductLayoutType | '')
                }
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-2xs outline-none focus:border-indigo-600"
              >
                <option value="">Use Global ({globalLayout})</option>
                <option value="horizontal">Horizontal Scroll</option>
                <option value="vertical">Vertical Grid</option>
                <option value="compact">Compact Grid</option>
                <option value="featured">Featured List</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
