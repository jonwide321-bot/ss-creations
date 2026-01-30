
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, Plus, Copy, List, AlertTriangle, Sparkles, Star } from 'lucide-react';
import { Product } from '../../types';
import { db } from '../../lib/supabase';

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete?: (id: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: undefined,
    category: 'Flowers',
    stock: 0,
    image: '',
    description: '',
    highlights: [],
    gallery: ['', '', '', ''],
    isFreeShipping: false,
    isBestSeller: false,
    isNewArrival: true
  });
  
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  useEffect(() => {
    if (product) {
      const existingGallery = Array.isArray(product.gallery) ? [...product.gallery] : [product.image];
      while (existingGallery.length < 4) existingGallery.push('');
      
      setFormData({
        ...product,
        gallery: existingGallery.slice(0, 4)
      });
    }
  }, [product]);

  const handleBulkImport = () => {
    const urls = bulkUrls.split(/[,\n;]+/).map(u => u.trim()).filter(u => u !== '');
    const newGallery = [...(formData.gallery || ['', '', '', ''])];
    
    urls.forEach((url, i) => {
      if (i < 4) newGallery[i] = url;
    });

    setFormData(prev => ({ ...prev, gallery: newGallery }));
    setBulkUrls('');
    setShowBulkPaste(false);
  };

  const updateGalleryUrl = (index: number, url: string) => {
    const newGallery = [...(formData.gallery || ['', '', '', ''])];
    newGallery[index] = url;
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(index);
    try {
      const url = await db.products.uploadImage(file);
      updateGalleryUrl(index, url);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Upload failed: ' + (error.message || 'Check your Supabase bucket permissions.'));
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGallery = (formData.gallery || []).filter(img => img && img.trim() !== '');
    
    if (finalGallery.length === 0 && !formData.image) {
      alert('Please provide at least one product image.');
      return;
    }

    const finalProduct = {
      ...formData,
      id: product?.id,
      image: finalGallery.length > 0 ? finalGallery[0] : (formData.image || ''),
      gallery: finalGallery,
      price: parseFloat(formData.price?.toString() || '0'),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice.toString()) : undefined,
      stock: parseInt(formData.stock?.toString() || '0'),
      isFreeShipping: !!formData.isFreeShipping,
      isBestSeller: !!formData.isBestSeller,
      isNewArrival: !!formData.isNewArrival
    } as Product;
    
    onSave(finalProduct);
  };

  const executeDelete = async () => {
    if (product && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
        onClose();
      } catch (error: any) {
        alert("Delete failed: " + error.message);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-200">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 serif">
              {product ? 'Edit Treasure' : 'New Listing'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-stone-200 shadow-sm">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Title</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Artisanal Velvet Box" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Selling Price (Rs.)</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Original Price (Rs.)</label>
                  <input type="number" step="0.01" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:border-rose-500 outline-none text-sm font-bold" value={formData.originalPrice || ''} onChange={e => setFormData({...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined})} placeholder="Optional for strike-through" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Stock Quantity</label>
                  <input required type="number" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {['Flowers', 'Gourmet', 'Personalized', 'Home Decor', 'Toys', 'Accessories'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Free Delivery</p>
                    <p className="text-[8px] text-emerald-600">Global cart override</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isFreeShipping} 
                      onChange={e => setFormData({...formData, isFreeShipping: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Best Seller</p>
                    <p className="text-[8px] text-amber-600">Show badge on shop</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isBestSeller} 
                      onChange={e => setFormData({...formData, isBestSeller: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Description</label>
                <textarea required rows={4} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the craftsmanship..." />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Imagery (4 Slots)</label>
                <button type="button" onClick={() => setShowBulkPaste(!showBulkPaste)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase flex items-center gap-1">
                  <List className="w-3 h-3" /> Bulk URL
                </button>
              </div>

              {showBulkPaste && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
                  <textarea rows={2} className="w-full p-3 text-xs rounded-xl border border-rose-100 outline-none font-mono" placeholder="Paste URLs here..." value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} />
                  <button type="button" onClick={handleBulkImport} className="w-full py-2 bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase">Apply</button>
                </div>
              )}

              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0 overflow-hidden relative">
                      {formData.gallery?.[i] ? (
                        <img src={formData.gallery[i]} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300"><Plus className="w-4 h-4" /></div>
                      )}
                      {uploadingIdx === i && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-rose-500" /></div>}
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{i === 0 ? 'Primary' : `Alt ${i}`}</span>
                        <input type="file" accept="image/*" className="hidden" id={`file-${i}`} onChange={(e) => handleFileUpload(e, i)} />
                        <label htmlFor={`file-${i}`} className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"><Upload className="w-3 h-3" /></label>
                      </div>
                      <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-300" />
                        <input type="url" className="w-full pl-7 pr-3 py-1.5 text-[10px] rounded-lg bg-stone-50 border border-stone-200 outline-none font-mono" placeholder="URL..." value={formData.gallery?.[i] || ''} onChange={e => updateGalleryUrl(i, e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            {product && onDelete && !showConfirmDelete && (
              <button type="button" onClick={() => setShowConfirmDelete(true)} className="px-6 py-4 rounded-2xl border border-rose-200 text-rose-500 font-bold hover:bg-rose-50 transition-all flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Archive
              </button>
            )}
            {showConfirmDelete && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={executeDelete} disabled={isDeleting} className="px-5 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-lg">Confirm</button>
                <button type="button" onClick={() => setShowConfirmDelete(false)} className="px-5 py-3 rounded-xl bg-white border border-stone-200 text-slate-400 text-xs font-bold">Cancel</button>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl bg-white border border-stone-200 text-slate-500 font-bold">Discard</button>
            <button type="submit" form="product-form" className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-rose-500 transition-all shadow-lg flex items-center gap-2">
              <Save className="w-5 h-5" /> {product ? 'Update Treasure' : 'List Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
