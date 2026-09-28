import React, { useState } from 'react';
import { Product } from '../../types/store';
import { formatPKR } from '../../lib/format';

interface ProductsTabProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onTogglePublic: (productId: number) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onTogglePublic
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Top Filter & Add bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 bg-white shadow-xs transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 bg-white font-semibold shadow-xs transition"
          >
            <option value="all">All Categories</option>
            <option value="Audio">Audio</option>
            <option value="Wearables">Wearables</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>

          <button
            onClick={onAddProduct}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-100 flex-shrink-0"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 w-10"></th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Product Details
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden md:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Price
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden sm:table-cell">
                  Stock
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                  Visibility
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                    <i className="fa-solid fa-box-open text-4xl mb-3 text-slate-300 block"></i>
                    <p className="font-bold text-slate-700">No products match your search</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting the search query or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isVisible = p.public !== false;
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3 text-slate-300">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute(
                                'src',
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                              );
                            }}
                          />
                          <div className="min-w-0 max-w-[220px] sm:max-w-xs">
                            <p className="font-bold text-slate-800 text-xs truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.badge && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  {p.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                <i className="fa-solid fa-star text-amber-400 text-[9px]"></i>
                                {p.rating || 4.5} ({p.reviews || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-xs font-black text-slate-900">
                            {formatPKR(p.price)}
                          </span>
                          {p.oldPrice && (
                            <span className="block text-[10px] text-slate-400 line-through font-mono">
                              {formatPKR(p.oldPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            p.stock > 10
                              ? 'text-emerald-700 bg-emerald-50'
                              : p.stock > 0
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <button
                          type="button"
                          onClick={() => onTogglePublic(p.id)}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                            isVisible
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                          }`}
                        >
                          <i className={`fa-solid ${isVisible ? 'fa-globe' : 'fa-lock'}`}></i>
                          {isVisible ? 'PUBLIC' : 'PRIVATE'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                            title="Edit Product"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete Product"
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
