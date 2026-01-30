
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, Plus, Copy, List, AlertTriangle, Sparkles } from 'lucide-react';
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
    category: 'Flowers',
    stock: 0,
    image: '',
    description: '',
    highlights: [],
    gallery: ['', '', '', ''],
    isFreeShipping: false
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
      alert('Upload failed: ' + error.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGallery = (formData.gallery || []).filter(img => img && img.trim() !== '');
    
    if (finalGallery.length === 0) {
      alert('Please add at least the main product image.');
      return;
    }

    const finalProduct = {
      ...formData,
      id: product?.id,
      image: finalGallery[0],
      gallery: finalGallery,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      rating: product?.rating || 4.5,
      highlights: formData.highlights?.length ? formData.highlights : ['Premium Quality', 'Hand Crafted'],
      detailedDescription: formData.description || '',
    } as Product;
    
    onSave(finalProduct);
    onClose();
  };

  const executeDelete = async () => {
    if (product && onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
        onClose();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete product.");
        setIsDeleting(false);
        setShowConfirmDelete(false);
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
              {product ? 'Edit Creation' : 'New Creation'}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Title of your gift item" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price (Rs.)</label>
                  <input required type="number" step="1" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Stock Quantity</label>
                  <input required type="number" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-emerald-800">Free Shipping Privilege</p>
                  <p className="text-[10px] text-emerald-600">If enabled, any order containing this product will have Rs. 0 shipping fee.</p>
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {['Flowers', 'Gourmet', 'Personalized', 'Home Decor', 'Toys', 'Accessories'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Public Description</label>
                <textarea required rows={5} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none text-sm font-medium resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Tell the story of this gift..." />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gallery (4 Slots)</label>
                <button 
                  type="button" 
                  onClick={() => setShowBulkPaste(!showBulkPaste)}
                  className="text-[10px] font-bold text-rose-500 hover:underline uppercase flex items-center gap-1"
                >
                  <List className="w-3 h-3" /> Bulk URL Import
                </button>
              </div>

              {showBulkPaste && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] font-bold text-rose-400 uppercase">Paste URLs (comma or line separated)</label>
                  <textarea 
                    rows={3}
                    className="w-full p-3 text-xs rounded-xl border border-rose-100 outline-none font-mono"
                    placeholder="url1, url2, url3, url4"
                    value={bulkUrls}
                    onChange={e => setBulkUrls(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleBulkImport} className="flex-1 py-2 bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase">Apply All</button>
                    <button type="button" onClick={() => setShowBulkPaste(false)} className="px-3 py-2 bg-white text-slate-400 text-[10px] font-bold rounded-lg uppercase">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0 overflow-hidden relative">
                      {formData.gallery?.[i] ? (
                        <img src={formData.gallery[i]} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Plus className="w-5 h-5" />
                        </div>
                      )}
                      {uploadingIdx === i && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{i === 0 ? 'Main Image' : `Image ${i + 1}`}</span>
                        <div className="flex gap-2">
                           <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id={`file-${i}`} 
                            onChange={(e) => handleFileUpload(e, i)} 
                          />
                          <label htmlFor={`file-${i}`} className="p-1.5 hover:bg-rose-50 rounded-md cursor-pointer text-slate-400 hover:text-rose-500 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                          </label>
                        </div>
                      </div>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                        <input 
                          type="url" 
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:border-rose-500 outline-none font-mono" 
                          placeholder="Image URL..." 
                          value={formData.gallery?.[i] || ''} 
                          onChange={e => updateGalleryUrl(i, e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center">
            {product && onDelete && !showConfirmDelete && (
              <button 
                type="button" 
                onClick={() => setShowConfirmDelete(true)}
                className="px-6 py-4 rounded-2xl bg-white border border-rose-200 text-rose-500 font-bold hover:bg-rose-50 transition-all flex items-center gap-2 group"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Delete Forever
              </button>
            )}

            {showConfirmDelete && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-rose-500 text-white p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex flex-col mr-4">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Are you sure?</span>
                  <span className="text-xs text-slate-500">This cannot be undone.</span>
                </div>
                <button 
                  type="button" 
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-5 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all shadow-lg flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Delete"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-3 rounded-xl bg-white border border-stone-200 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl bg-white border border-stone-200 text-slate-500 font-bold hover:bg-stone-100 transition-colors">Discard</button>
            <button 
              type="submit" 
              form="product-form"
              className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-rose-500 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> {product ? 'Update Treasure' : 'List Treasure'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
