import React, { useState } from 'react';
import { Section, Product } from '../../types/store';
import { filterProductsByTag } from '../../lib/format';

interface SectionsTabProps {
  sections: Section[];
  products: Product[];
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onToggleActive: (sectionId: number, active: boolean) => void;
  onReorderSections: (newSections: Section[]) => void;
  onResetSections: () => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  products,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onToggleActive,
  onReorderSections,
  onResetSections
}) => {
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragStart = (id: number) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;

    const list = [...sortedSections];
    const sourceIndex = list.findIndex((s) => s.id === draggedId);
    const targetIndex = list.findIndex((s) => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);

    // Reassign order
    const updated = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    onReorderSections(updated);
    setDraggedId(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const list = [...sortedSections];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    const updated = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    onReorderSections(updated);
  };

  const moveDown = (index: number) => {
    if (index === sortedSections.length - 1) return;
    const list = [...sortedSections];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    const updated = list.map((s, idx) => ({ ...s, order: idx + 1 }));
    onReorderSections(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border-2 border-dashed border-indigo-200">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-indigo-600"></i> Homepage Product Sections
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Drag cards or use arrows to reorder · Toggle switch to show/hide on storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddSection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-100"
          >
            <i className="fa-solid fa-plus"></i> Add Section
          </button>
          <button
            onClick={onResetSections}
            className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-slate-200 shadow-2xs"
          >
            <i className="fa-solid fa-rotate-left"></i> Reset
          </button>
        </div>
      </div>

      {/* Grid of Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedSections.map((sec, idx) => {
          const matchedProducts = filterProductsByTag(products, sec.filter);
          return (
            <div
              key={sec.id}
              draggable
              onDragStart={() => handleDragStart(sec.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(sec.id)}
              className={`section-card ${draggedId === sec.id ? 'opacity-40 border-dashed' : ''}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <i className="fa-solid fa-grip-vertical drag-handle mt-1"></i>
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                  {sec.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-sm truncate">{sec.title}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Filter: <span className="font-mono text-indigo-600 font-bold">{sec.filter}</span>
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={sec.active}
                    onChange={(e) => onToggleActive(sec.id, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Status and info chips */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`status-badge ${sec.active ? 'status-active' : 'status-inactive'}`}>
                  {sec.active ? 'Active' : 'Hidden'}
                </span>
                <span className="status-badge bg-indigo-100 text-indigo-700">
                  <i className="fa-solid fa-table-columns mr-1"></i>
                  {sec.layout ? sec.layout : 'Global Layout'}
                </span>
                <span className="status-badge bg-slate-100 text-slate-600">
                  {matchedProducts.length} items
                </span>
              </div>

              {/* Mini previews */}
              <div className="section-preview">
                {matchedProducts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {matchedProducts.slice(0, 3).map((p) => (
                      <div key={p.id} className="mini-card relative">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full aspect-video object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                    <i className="fa-solid fa-inbox text-slate-300"></i> No items match '{sec.filter}'
                  </div>
                )}
              </div>

              {/* Footer controls */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveUp(idx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg"
                    title="Move up"
                  >
                    <i className="fa-solid fa-arrow-up text-xs"></i>
                  </button>
                  <button
                    type="button"
                    disabled={idx === sortedSections.length - 1}
                    onClick={() => moveDown(idx)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg"
                    title="Move down"
                  >
                    <i className="fa-solid fa-arrow-down text-xs"></i>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onEditSection(sec)}
                  className="flex-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 py-2 rounded-xl text-center transition"
                >
                  <i className="fa-solid fa-pen mr-1"></i> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSection(sec.id)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl transition"
                  title="Delete Section"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
