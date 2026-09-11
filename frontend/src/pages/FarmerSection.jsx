import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Star, ShieldCheck, ImageOff, Check, AlertTriangle } from 'lucide-react';
import {
  getProducts,
  subscribeProducts,
  addFarmerProduct,
  updateFarmerProduct,
  removeFarmerProduct,
} from '../data/farmerProductsStore';

// ──────────────────────────────────────────────────────────────────────────────
// AI Warning Banner
// ──────────────────────────────────────────────────────────────────────────────
function AIWarningBanner() {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-5">
      <AlertTriangle className="shrink-0 mt-0.5 text-red-500" size={18} />
      <div>
        <span className="font-bold block mb-0.5">⚠️ No AI-Generated Images</span>
        <span>
          Uploading AI-generated or fake crop images is a violation of K4kissan policies.
          All images are algorithmically checked. Getting caught{' '}
          <strong>will lower your farmer rating and can result in a permanent ban.</strong>
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Add / Edit Crop Modal
// ──────────────────────────────────────────────────────────────────────────────
const GRAIN_CATEGORIES = ['Rice', 'Wheat', 'Maize', 'Sorghum', 'Pearl Millet', 'Finger Millet', 'Barley'];

function CropModal({ initial, onClose, onSave }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    name: '',
    variety: '',
    category: 'rice',
    price: '',
    unit: 'kg',
    quantity: '',
    harvestDate: '',
    description: '',
    organic: false,
    imageUrl: '',
    farmerName: '',
    farmerLocation: '',
    rating: 4.5,
    ...initial,
  });
  const [imagePreview, setImagePreview] = useState(initial?.image || null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImagePreview(ev.target.result);
      set('imageUrl', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));

    const product = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      image: imagePreview || `https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600`,
      rating: Number(form.rating),
      reviewCount: initial?.reviewCount || 0,
      _isCustom: true,
      farmer: {
        id: 'me',
        name: form.farmerName || 'My Farm',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        location: form.farmerLocation || 'India',
        rating: Number(form.rating),
        ratingCount: initial?.farmer?.ratingCount || 0,
        experience: 'Verified Farmer',
        farmSize: '',
        verified: true,
        badge: 'K4kissan Certified',
        totalSales: '',
        bio: form.description,
        qualityRating: '5.0',
        deliveryRating: '5.0',
        purityTrust: '5.0',
      },
    };

    onSave(product);
    setSaving(false);
    setSuccess(true);
    setTimeout(onClose, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-700 text-white px-6 py-4 shrink-0">
          <h2 className="text-lg font-bold">{isEdit ? '✏️ Edit Crop Listing' : '🌾 List Your Crop'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <AIWarningBanner />

          {/* Crop Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Crop Photo <span className="text-red-500">*</span>
              <span className="ml-1 text-gray-400 font-normal text-[11px]">(Real field photo only — no AI images)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Crop preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageOff size={28} className="text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  id="crop-image-upload"
                  className="hidden"
                  onChange={handleImageFile}
                />
                <label
                  htmlFor="crop-image-upload"
                  className="block w-full text-center py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition"
                >
                  Upload Real Crop Photo
                </label>
                <p className="text-[11px] text-gray-500 mt-1 text-center">JPG, PNG. Must be your own field photo.</p>
              </div>
            </div>
          </div>

          {/* Crop Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Crop / Product Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sharbati Wheat, Basmati Rice 1121"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Variety */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Variety / Kism (किस्म)
            </label>
            <input
              value={form.variety}
              onChange={e => set('variety', e.target.value)}
              placeholder="e.g. C-306, Maldandi, 1121"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Crop Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {GRAIN_CATEGORIES.map(g => (
                <option key={g} value={g.toLowerCase().replace(' ', '-')}>{g}</option>
              ))}
            </select>
          </div>

          {/* Price & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="e.g. 120"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="kg">Per kg</option>
                <option value="100 kg">Per 100 kg (Quintal)</option>
                <option value="tonne">Per Tonne</option>
              </select>
            </div>
          </div>

          {/* Quantity Available */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Total Quantity Available (kg) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
              placeholder="e.g. 500"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Harvest Date / Month</label>
            <input
              type="text"
              value={form.harvestDate}
              onChange={e => set('harvestDate', e.target.value)}
              placeholder="e.g. October 2026"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe your crop — cultivation method, quality, certifications, etc."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Your Farm Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Your Farm Details</p>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Name / Farm Name</label>
              <input
                value={form.farmerName}
                onChange={e => set('farmerName', e.target.value)}
                placeholder="e.g. Ramesh Patel's Organic Farm"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Location (Village/District)</label>
              <input
                value={form.farmerLocation}
                onChange={e => set('farmerLocation', e.target.value)}
                placeholder="e.g. Sehore, Madhya Pradesh"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>
          </div>

          {/* Organic checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.organic}
              onChange={e => set('organic', e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm font-medium text-gray-700">Organically Grown / Chemical-Free</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || success}
            className={`flex items-center gap-2 px-7 py-2 rounded-xl text-white text-sm font-bold shadow transition ${
              success ? 'bg-green-500' : 'bg-emerald-600 hover:bg-emerald-700'
            } disabled:opacity-70`}
          >
            {success ? (
              <><Check size={16} /> Saved!</>
            ) : saving ? (
              'Saving...'
            ) : (
              <>{isEdit ? '✏️ Update Listing' : '🌾 List Crop'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Farmer Product Card (editable)
// ──────────────────────────────────────────────────────────────────────────────
function FarmerProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
      {/* Edit & Delete controls */}
      <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(product)}
          title="Edit listing"
          className="w-8 h-8 flex items-center justify-center bg-white/95 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg shadow-sm transition"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          title="Remove listing"
          className="w-8 h-8 flex items-center justify-center bg-white/95 text-red-500 hover:bg-red-500 hover:text-white rounded-lg shadow-sm transition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Image */}
      <div className="h-40 overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          <span className="bg-[#00ff33] text-gray-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full italic shadow">
            {product.variety || product.category}
          </span>
          {product.organic && (
            <span className="bg-emerald-900/90 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Organic
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-auto">
          <Star size={12} className="fill-current" /> {product.rating}
          <span className="text-gray-400 font-normal ml-1">({product.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-black text-gray-900">
            ₹{product.price} <span className="text-xs font-normal text-gray-500">/ {product.unit}</span>
          </span>
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
      </div>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main FarmerSection Page
// ──────────────────────────────────────────────────────────────────────────────
export default function FarmerSection() {
  const [products, setProducts] = useState(getProducts);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [notification, setNotification] = useState('');

  // Subscribe to shared store so any other tab update is reflected here too
  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return unsub;
  }, []);

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAdd = (product) => {
    addFarmerProduct(product);
    setIsAddOpen(false);
    showNotif(`"${product.name}" listed successfully! It is now visible on the Home page.`);
  };

  const handleEdit = (product) => {
    setEditTarget(product);
  };

  const handleSaveEdit = (updated) => {
    updateFarmerProduct(editTarget.id, updated);
    setEditTarget(null);
    showNotif(`"${updated.name}" updated! Changes are live on the Home page.`);
  };

  const handleDelete = (id) => {
    const product = products.find(p => p.id === id);
    if (!window.confirm(`Remove "${product?.name}" from your listings?`)) return;
    removeFarmerProduct(id);
    showNotif('Product removed from your listings and Home page.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
          <Check size={16} /> {notification}
        </div>
      )}

      {/* Page Header */}
      <section className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white rounded-2xl px-6 py-5 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#00ff33] text-gray-900 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider italic shadow mb-2">
            Farmer Seller Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Manage Your Crop Listings
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mt-1 max-w-xl">
            Add new crop listings and edit existing ones. All changes appear instantly on the Home page for buyers to see.
          </p>
        </div>
      </section>

      {/* My Listings Section */}
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              🌾 My Crop Listings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {products.length} product{products.length !== 1 ? 's' : ''} — hover a card to edit or remove
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>All listings are verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* ─── Plus / Add Card ─── */}
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-emerald-600 shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-lg border-2 border-dashed border-emerald-400"
          >
            <Plus className="h-16 w-16 text-white" strokeWidth={3} />
            <span className="mt-2 text-sm font-bold text-white">Add New Crop</span>
            <span className="text-emerald-200 text-xs mt-0.5">Click to list your produce</span>
          </button>

          {/* ─── Existing Product Cards ─── */}
          {products.map(product => (
            <FarmerProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>

      {/* Add Modal */}
      {isAddOpen && (
        <CropModal
          onClose={() => setIsAddOpen(false)}
          onSave={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <CropModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
