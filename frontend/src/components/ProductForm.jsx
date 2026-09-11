import React, { useState, useEffect } from 'react';
import { Save, Camera, Video, Plus, Trash2, Upload, AlertCircle, Film } from 'lucide-react';

const ProductForm = ({ product, onSave, onCancel, saving }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        quantity: '',
        category: 'Grains',
        location: '',
    });

    const [images, setImages] = useState([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [videoUrlInput, setVideoUrlInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                unit: product.unit || 'kg',
                quantity: product.quantity || '',
                category: product.category || 'Grains',
                location: product.location || '',
            });

            // Populate images (up to 6)
            if (Array.isArray(product.images) && product.images.length > 0) {
                setImages(product.images.slice(0, 6));
            } else if (product.image_url || product.image) {
                setImages([product.image_url || product.image]);
            } else {
                setImages([]);
            }

            // Populate video
            setVideoUrl(product.video_url || product.video || '');
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ── Photo Upload & Management (Max 6) ──────────────────────────────────
    const handleAddImageUrl = () => {
        const url = imageUrlInput.trim();
        if (!url) return;
        if (images.length >= 6) {
            setErrorMsg('Maximum 6 photos allowed.');
            return;
        }
        setImages([...images, url]);
        setImageUrlInput('');
        setErrorMsg('');
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const availableSlots = 6 - images.length;
        if (availableSlots <= 0) {
            setErrorMsg('Maximum 6 photos reached.');
            return;
        }

        const filesToProcess = files.slice(0, availableSlots);
        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setImages(prev => {
                        if (prev.length >= 6) return prev;
                        return [...prev, reader.result];
                    });
                }
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
        setErrorMsg('');
    };

    const handleRemoveImage = (index) => {
        setImages(images.filter((_, idx) => idx !== index));
    };

    // ── Video Upload & Management (Max 1) ──────────────────────────────────
    const handleAddVideoUrl = () => {
        const url = videoUrlInput.trim();
        if (!url) return;
        setVideoUrl(url);
        setVideoUrlInput('');
    };

    const handleVideoFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                setVideoUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleRemoveVideo = () => {
        setVideoUrl('');
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            images: images,
            image_url: images[0] || '',
            image: images[0] || '',
            video_url: videoUrl,
        });
    };

    const categories = ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Pulses & Millets', 'Others'];
    const units = ['kg', 'quintal', 'piece', 'dozen', 'litre'];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g., Organic Sharbati Wheat"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Description & Harvest Details
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Describe grain purity, harvest date, soil, moisture content..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
                        required
                    >
                        {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Quantity Available <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="0"
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Farm Location (City, State)
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g., Karnal, Haryana"
                    />
                </div>
            </div>

            {/* ── PHOTO UPLOAD SECTION (UP TO 6 PHOTOS) ── */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera size={18} className="text-emerald-700" />
                        <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                            Product Photos (Up to 6 Photos)
                        </h4>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        images.length === 6 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                        {images.length} / 6 Photos
                    </span>
                </div>

                {/* Photo Previews Grid */}
                {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-emerald-500 bg-gray-100 aspect-square shadow-2xs">
                                <img
                                    src={img}
                                    alt={`Product ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {idx === 0 && (
                                    <span className="absolute bottom-1 left-1 bg-black/75 text-[#CEFF00] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                        Cover
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition cursor-pointer"
                                    title="Remove Photo"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Photo Upload Controls */}
                {images.length < 6 && (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* File upload button */}
                            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-2xs">
                                <Upload size={14} />
                                <span>Upload Photos from Device</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-xs text-gray-500">or paste image URL:</span>
                        </div>

                        {/* URL paste input */}
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="https://example.com/crop-photo.jpg"
                                className="flex-1 p-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-3 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                            >
                                <Plus size={14} className="inline mr-1" /> Add
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── VIDEO UPLOAD SECTION (1 VIDEO ON WISH) ── */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Film size={18} className="text-emerald-700" />
                        <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                            Farm & Crop Video (Optional — 1 Video)
                        </h4>
                    </div>
                    {videoUrl && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            1 Video Attached
                        </span>
                    )}
                </div>

                {videoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video max-w-sm">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition cursor-pointer"
                            title="Remove Video"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600">
                            Add a short demonstration video of your crop, farm harvesting, or grain sample quality.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Video file upload */}
                            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-2xs">
                                <Upload size={14} />
                                <span>Upload Video File (MP4/WebM)</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-xs text-gray-500">or paste video URL:</span>
                        </div>

                        {/* Video URL paste */}
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={videoUrlInput}
                                onChange={(e) => setVideoUrlInput(e.target.value)}
                                placeholder="https://example.com/farm-harvest.mp4"
                                className="flex-1 p-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddVideoUrl}
                                className="px-3 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                            >
                                <Plus size={14} className="inline mr-1" /> Add
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-md cursor-pointer active:scale-95"
                >
                    <Save size={18} />
                    {saving ? 'Saving Product...' : 'Save Product Listing'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-100 transition cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
