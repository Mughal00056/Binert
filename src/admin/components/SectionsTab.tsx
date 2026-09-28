import React, { useState } from 'react';
import { Section, Product, CategoryItem } from '../../types/store';
import { filterProductsByTag } from '../../lib/format';

interface SectionsTabProps {
  sections: Section[];
  categories: CategoryItem[];
  products: Product[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory: (categoryId: string | number, partial: Partial<CategoryItem>) => void;
  onDeleteCategoryImage: (categoryId: string | number) => void;
  onDeleteCategory: (categoryId: string | number) => void;
  onResetCategories: () => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: number) => void;
  onToggleActive: (sectionId: number, active: boolean) => void;
  onReorderSections: (newSections: Section[]) => void;
  onResetSections: () => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategoryImage,
  onDeleteCategory,
  onResetCategories,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onToggleActive,
  onReorderSections,
  onResetSections
}) => {
  const [draggedId, setDraggedId] = useState<number | null>(null);

  // Add Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatFilter, setNewCatFilter] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('fa-layer-group');
  const [editingImageUrls, setEditingImageUrls] = useState<Record<string, string>>({});

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;
    const cleanFilter = (newCatFilter.trim() || cleanName).toLowerCase();
    onAddCategory({
      name: cleanName,
      filter: cleanFilter,
      image: newCatImage.trim(),
      icon: newCatIcon.trim() || 'fa-layer-group'
    });
    setNewCatName('');
    setNewCatFilter('');
    setNewCatImage('');
    setNewCatIcon('fa-layer-group');
  };

  const handleFileUploadNewCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewCatImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUploadExistingCategory = (catId: string | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateCategory(catId, { image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

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
    <div className="space-y-8">
      {/* ================================================================= */}
      {/* 1. STOREFRONT CATEGORIES MANAGER (Add/Delete Category & Images) */}
      {/* ================================================================= */}
      <div className="bg-[#13131a] rounded-2xl border border-purple-900/50 p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <i className="fa-solid fa-tags text-sm"></i>
              </span>
              <span>Storefront Categories &amp; Category Images</span>
            </h2>
            <p className="text-xs text-purple-300/70 font-medium mt-1">
              Add new categories, upload or paste category images, remove category images, or delete categories directly.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetCategories}
            className="bg-[#1b152b] hover:bg-purple-900/60 text-purple-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-purple-700/50 cursor-pointer self-start sm:self-auto"
          >
            <i className="fa-solid fa-rotate-left"></i> Reset Default Categories
          </button>
        </div>

        {/* Add New Category Form */}
        <form
          onSubmit={handleCreateCategory}
          className="p-4 sm:p-5 rounded-2xl bg-[#0d0d14] border border-purple-800/40 space-y-4"
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <i className="fa-solid fa-circle-plus text-purple-400"></i>
            <span>Add New Category</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300/80 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gaming Gear"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  if (!newCatFilter) {
                    setNewCatFilter(e.target.value.toLowerCase().trim());
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/60 bg-[#13131a] text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300/80 mb-1">
                Filter Key (Product Category)
              </label>
              <input
                type="text"
                placeholder="e.g. gaming"
                value={newCatFilter}
                onChange={(e) => setNewCatFilter(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-900/60 bg-[#13131a] text-white font-mono outline-none focus:border-purple-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300/80 mb-1">
                Category Image URL or Upload File
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-purple-900/60 bg-[#13131a] text-white font-mono outline-none focus:border-purple-400"
                />
                <label className="px-3 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1.5">
                  <i className="fa-solid fa-upload"></i>
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadNewCategory}
                    className="hidden"
                  />
                </label>
                {newCatImage && (
                  <button
                    type="button"
                    onClick={() => setNewCatImage('')}
                    className="px-2.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold cursor-pointer transition"
                    title="Clear Image"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              {newCatImage ? (
                <div className="flex items-center gap-2 bg-[#13131a] px-3 py-1.5 rounded-xl border border-purple-800/50">
                  <img
                    src={newCatImage}
                    alt="Preview"
                    className="w-8 h-8 rounded-full object-cover border border-purple-500"
                  />
                  <span className="text-[11px] text-emerald-400 font-bold">Image Ready</span>
                </div>
              ) : (
                <span className="text-[11px] text-purple-400/70">
                  Tip: Paste an image URL or click Upload to add a category photo.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-purple-950/60 cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Category</span>
            </button>
          </div>
        </form>

        {/* Existing Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catKey = String(cat.id);
            const draftUrl = editingImageUrls[catKey] !== undefined ? editingImageUrls[catKey] : cat.image;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-[#0d0d14] border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50 bg-[#13131a] flex items-center justify-center shrink-0 relative">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className={`fa-solid ${cat.icon || 'fa-layer-group'} text-purple-400 text-lg`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-white text-sm truncate">{cat.name}</h4>
                      <p className="text-[11px] text-purple-400 font-mono truncate">
                        Filter: <strong className="text-purple-200">{cat.filter}</strong>
                      </p>
                      <span
                        className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          cat.image
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-700/40'
                        }`}
                      >
                        {cat.image ? 'Has Image' : 'No Image (Icon Mode)'}
                      </span>
                    </div>
                  </div>

                  {/* Delete Category Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Delete Category"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>Delete</span>
                  </button>
                </div>

                {/* Category Image Add / Update / Delete Controls */}
                <div className="space-y-2 pt-2 border-t border-purple-900/30">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-300/80">
                    Category Image (Add / Change / Delete)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Paste image URL..."
                      value={draftUrl}
                      onChange={(e) =>
                        setEditingImageUrls((prev) => ({ ...prev, [catKey]: e.target.value }))
                      }
                      className="flex-1 text-xs p-2 rounded-xl border border-purple-900/60 bg-[#13131a] text-white font-mono outline-none focus:border-purple-400 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateCategory(cat.id, { image: (draftUrl || '').trim() })}
                      className="px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shrink-0"
                      title="Save Image URL"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <label
                      className="px-2.5 py-2 rounded-xl bg-[#1b152b] hover:bg-purple-900 text-purple-200 border border-purple-700/50 text-xs font-bold transition cursor-pointer shrink-0"
                      title="Upload Image File"
                    >
                      <i className="fa-solid fa-upload"></i>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadExistingCategory(cat.id, e)}
                        className="hidden"
                      />
                    </label>
                    {cat.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageUrls((prev) => ({ ...prev, [catKey]: '' }));
                          onDeleteCategoryImage(cat.id);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold transition cursor-pointer shrink-0"
                        title="Delete Category Image"
                      >
                        <i className="fa-solid fa-image-slash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. HOMEPAGE PRODUCT SECTIONS                                      */}
      {/* ================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#13131a] p-5 rounded-2xl border border-purple-900/50">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-purple-400"></i> Homepage Product Sections
          </h2>
          <p className="text-xs text-purple-300/70 font-semibold mt-0.5">
            Drag cards or use arrows to reorder · Toggle switch to show/hide on storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddSection}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i> Add Section
          </button>
          <button
            onClick={onResetSections}
            className="bg-[#1b152b] hover:bg-purple-900/60 text-purple-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-purple-700/50 cursor-pointer"
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
