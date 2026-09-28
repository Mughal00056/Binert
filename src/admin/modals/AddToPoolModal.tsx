import React, { useState, useEffect } from 'react';
import { LaunchPoolProduct } from '../../types/store';

interface AddToPoolModalProps {
  isOpen: boolean;
  product: LaunchPoolProduct | null;
  editIndex: number | null;
  onClose: () => void;
  onSave: (data: Partial<LaunchPoolProduct>, editIndex: number | null) => void;
}

export const AddToPoolModal: React.FC<AddToPoolModalProps> = ({
  isOpen,
  product,
  editIndex,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Audio');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || 'Audio');
      setPrice(product.price ? String(product.price) : '');
      setOldPrice(product.oldPrice ? String(product.oldPrice) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '20');
      setImage(product.image || '');
      setDescription(product.description || '');
    } else {
      setName('');
      setCategory('Audio');
      setPrice('');
      setOldPrice('');
      setStock('20');
      setImage('');
      setDescription('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    onSave(
      {
        name: name.trim(),
        category,
        price: parsedPrice,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        stock: parseInt(stock, 10) || 20,
        image: image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        description: description.trim() || 'Upcoming drop product.'
      },
      editIndex
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 relative animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              {product ? 'Edit Pool Product' : 'Add to Launch Pool'}
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
                  placeholder="e.g. CyberSound Spatial ANC"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition font-bold"
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
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-rose-500 transition font-semibold"
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
                    Pool Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Launch Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-rose-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Original Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="e.g. 59000"
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono focus:border-rose-500 transition"
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
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none font-mono text-xs focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Drop Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this launch drop special?"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 outline-none resize-none focus:border-rose-500 transition"
                />
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
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-rose-200"
              >
                <i className="fa-solid fa-rocket mr-2"></i> Save to Pool
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
