import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, ShieldCheck, ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import { getProducts, subscribeProducts, loadFarmerProducts } from '../data/farmerProductsStore';
import { database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import FarmerModal from '../components/FarmerModal';
import { useCart } from '../contexts/CartContext';

const Landing = () => {
    const context = useOutletContext();
    const activeCategory = context?.activeCategory || 'for-you';
    const { addToCart } = useCart();

    const [allProducts, setAllProducts] = useState(getProducts);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Subscribe to store and fetch global products from Firebase
    useEffect(() => {
        const unsubStore = subscribeProducts(setAllProducts);
        
        if (database) {
            const productsRef = ref(database, 'farmer_products');
            const unsubDb = onValue(productsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const globalProducts = [];
                    // Flatten farmer_products/{uid}/{productId} into a single array
                    Object.values(data).forEach(farmerProductsObj => {
                        Object.values(farmerProductsObj).forEach(prod => {
                            globalProducts.push(prod);
                        });
                    });
                    loadFarmerProducts(globalProducts);
                }
            });
            return () => {
                unsubStore();
                unsubDb();
            };
        }
        
        return unsubStore;
    }, []);

    // Filter products based on category strip and search query
    const filteredProducts = allProducts.filter(p => {
        const matchesCategory = activeCategory === 'for-you' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAddToCart = (product, e) => {
        if (e) e.stopPropagation();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || product.image,
            farmer: product.farmer?.name || 'K4kissan Farmer',
            farmer_id: product.farmer_id || '',
            unit: product.unit || 'kg'
        });
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header Banner (Compact Height) */}
            <section className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white rounded-2xl px-6 py-4 shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-3xl space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-[#00ff33] text-gray-900 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider italic shadow-xs">
                        Direct Farm Marketplace
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                        Fresh Organic Grains Directly From Verified Farmers
                    </h1>
                    <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
                        Buy authentic Basmati Rice, Sharbati Wheat, Maize, Jowar, Bajra & Ragi with complete transparency. Click any product to inspect verified farmer ratings and farm experience.
                    </p>
                </div>
            </section>

            {/* Grain Product Showcase Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span>🌾</span> Grain Varieties & Farm Catalog
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Showing <strong className="text-emerald-700">{filteredProducts.length}</strong> grain samples for <span className="capitalize font-bold text-gray-800">{activeCategory.replace('-', ' ')}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>100% Verified Farmer Ratings</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for grain varieties, products, or descriptions..." 
                        className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition shadow-sm"
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleCardClick(product)}
                            className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                        >
                            {/* Product Image & Badges */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                                    <span className="bg-[#00ff33] text-gray-900 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full italic shadow-2xs">
                                        {product.variety}
                                    </span>
                                    {product.organic && (
                                        <span className="bg-emerald-900/90 text-emerald-200 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-xs">
                                            Organic Certified
                                        </span>
                                    )}
                                </div>

                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                    <span>{product.rating}</span>
                                    <span className="text-gray-400 font-normal text-[10px]">({product.reviewCount})</span>
                                </div>

                                {/* Photo Count & Video Badges */}
                                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                                    {product.images && product.images.length > 1 && (
                                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                            📷 {product.images.length} Photos
                                        </span>
                                    )}
                                    {(product.video_url || product.video) && (
                                        <span className="bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                            🎥 Video
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <h3 className="font-extrabold text-gray-900 text-base group-hover:text-emerald-700 transition line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Farmer Details Card Pill */}
                                <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between gap-3 group-hover:bg-emerald-100/70 transition">
                                    <div className="flex items-center gap-2.5">
                                        <img
                                            src={product.farmer.avatar}
                                            alt={product.farmer.name}
                                            className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                                                <span>{product.farmer.name}</span>
                                                <CheckCircle size={13} className="text-emerald-600 fill-current" />
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                <MapPin size={11} /> {product.farmer.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs font-extrabold text-amber-600 flex items-center justify-end gap-0.5">
                                            <Star size={11} className="fill-current text-amber-400" />
                                            {product.farmer.rating}
                                        </div>
                                        <div className="text-[10px] text-emerald-800 font-medium">Click for Profile</div>
                                    </div>
                                </div>

                                {/* Price & Action Footer */}
                                <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                                    <div>
                                        <div className="text-2xl font-black text-gray-900 tracking-tight">
                                            ₹{product.price} <span className="text-xs font-normal text-gray-500">/ {product.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(product);
                                            }}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                                            title="Inspect Farmer Rating & Experience"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(product);
                                            }}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ShoppingBag size={14} />
                                            <span>Purchase</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Farmer Rating Modal */}
            <FarmerModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={(product) => handleAddToCart(product, null)}
            />
        </div>
    );
};

export default Landing;
