import React, { useState, useEffect } from 'react';
import { Product } from '../../types/store';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Partial<Product>, editId?: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Audio');
  const [badge, setBadge] = useState('');
  const [price, setPrice] = useState<string>('');
  const [oldPrice, setOldPrice] = useState<string>('');
  const [rating, setRating] = useState<string>('4.5');
  const [reviews, setReviews] = useState<string>('0');
  const [stock, setStock] = useState<string>('10');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || 'Audio');
      setBadge(product.badge || '');
      setPrice(product.price ? String(product.price) : '');
      setOldPrice(product.oldPrice ? String(product.oldPrice) : '');
      setRating(product.rating !== undefined ? String(product.rating) : '4.5');
      setReviews(product.reviews !== undefined ? String(product.reviews) : '0');
      setStock(product.stock !== undefined ? String(product.stock) : '10');
      setImage(product.image || '');
      setDescription(product.description || '');
      setIsPublic(product.public !== false);
    } else {
      setName('');
      setCategory('Audio');
      setBadge('');
      setPrice('');
      setOldPrice('');
      setRating('4.5');
      setReviews('0');
      setStock('10');
      setImage('');
      setDescription('');
      setIsPublic(true);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    onSave(
      {
        name: name.trim(),
        category,
        badge: badge.trim() || null,
        price: parsedPrice,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        rating: parseFloat(rating) || 4.5,
        reviews: parseInt(reviews, 10) || 0,
        stock: parseInt(stock, 10) || 0,
        image: image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        description: description.trim(),
        public: isPublic
      },
      product ? product.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              {product ? 'Edit Product' : 'Add New Product'}
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
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SonicPro Wireless ANC Headphones"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-600 transition"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-600 transition"
                  >
                    <option value="">None</option>
                    <option value="SALE">SALE</option>
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="POPULAR">POPULAR</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 55997"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Old Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="e.g. 69997"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Reviews
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reviews}
                    onChange={(e) => setReviews(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono text-xs focus:border-indigo-600 transition"
                />
                <div className="mt-2 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">Image Preview</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the product..."
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div>
                  <p className="text-xs font-black text-slate-800">Public Visibility</p>
                  <p className="text-[10px] text-slate-500">Show on store homepage</p>
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
                <i className="fa-solid fa-floppy-disk mr-2"></i> Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
