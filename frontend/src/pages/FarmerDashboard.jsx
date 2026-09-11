import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { database } from '../lib/firebase';
import { ref, get, child, set, update, remove, onValue } from 'firebase/database';
import { Plus, Edit, Trash2, Package, BarChart3, List, MapPin } from 'lucide-react';
import { addFarmerProduct, updateFarmerProduct, removeFarmerProduct, loadFarmerProducts } from '../data/farmerProductsStore';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import { toRtdbValue } from '../lib/rtdbSafe';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [buyerReqs, setBuyerReqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [message, setMessage] = useState(null);
    const [selectedReq, setSelectedReq] = useState(null);
    const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [user]);

    const demoProducts = [
        {
            id: 'dp-1',
            name: 'Demo Organic Tomatoes',
            description: 'Fresh organic farm tomatoes.',
            price: 45,
            unit: 'kg',
            quantity: 80,
            category: 'Vegetables',
            image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
            location: 'Demo Farm, Maharashtra',
        },
        {
            id: 'dp-2',
            name: 'Demo Basmati Rice',
            description: 'Premium aged basmati rice.',
            price: 110,
            unit: 'kg',
            quantity: 300,
            category: 'Grains',
            image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
            location: 'Demo Farm, Punjab',
        },
    ];

    const fetchProducts = async () => {
        const uid = user?.uid || user?.id;
        if (!database || !uid) {
            setProducts(demoProducts);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const dbRef = ref(database, `farmer_products/${uid}`);
            
            // Also fetch buyer requirements
            const reqRef = ref(database, 'buyer_requirements');
            onValue(reqRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const allReqs = [];
                    Object.values(data).forEach(buyerReqsObj => {
                        Object.values(buyerReqsObj).forEach(req => {
                            allReqs.push(req);
                        });
                    });
                    // Sort newest first
                    allReqs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                    setBuyerReqs(allReqs);
                }
            });
            // Real-time listener — updates whenever Firebase data changes
            const unsub = onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                    const displayList = list.length ? list : demoProducts;
                    setProducts(displayList);
                    // 🔄 Push into shared store so Home page updates instantly
                    loadFarmerProducts(list.map(p => ({
                        ...p,
                        farmerName:   user.displayName || 'Verified Farmer',
                        farmerAvatar: user.photoURL    || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    })));
                } else {
                    setProducts(demoProducts);
                    loadFarmerProducts([]); // clear any previous farmer products
                }
                setLoading(false);
            });
            // Store unsubscribe so we can call it on cleanup
            return unsub;
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(demoProducts);
            setLoading(false);
        }
    };

    const handleSaveProduct = async (productData) => {
        setSaving(true);
        setMessage(null);
        const uid = user?.uid || user?.id || 'demo_farmer';

        try {
            if (editingProduct) {
                const updated = {
                    ...productData,
                    updated_at: new Date().toISOString(),
                    farmer_id: uid,
                    farmerName:   user?.displayName || 'Verified Farmer',
                    farmerAvatar: user?.photoURL    || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                };
                if (database) {
                    await update(ref(database, `farmer_products/${uid}/${editingProduct.id}`), toRtdbValue(updated));
                }
                setMessage({ type: 'success', text: '✅ Product updated successfully!' });
            } else {
                const newId = `p-${Date.now()}`;
                const newProd = {
                    ...productData,
                    id: newId,
                    farmer_id: uid,
                    farmerName:   user?.displayName || 'Verified Farmer',
                    farmerAvatar: user?.photoURL    || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    location:     productData.location || '',
                    created_at:   new Date().toISOString(),
                };
                if (database) {
                    await set(ref(database, `farmer_products/${uid}/${newId}`), toRtdbValue(newProd));
                }
                setMessage({ type: 'success', text: '✅ Product added! It is now visible on the Home page.' });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving product: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const uid = user?.uid || user?.id;

        try {
            if (database && uid) {
                await remove(ref(database, `farmer_products/${uid}/${productId}`));
            }
            setMessage({ type: 'success', text: '✅ Product deleted.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error deleting product: ' + error.message });
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleFulfillRequirement = async (provider) => {
        if (!selectedReq || !user) return;
        setSaving(true);
        const uid = user.uid || user.id;

        try {
            // Calculate numeric total if possible
            const qtyNum = parseFloat(String(selectedReq.quantity).replace(/[^0-9.]/g, '')) || 1;
            const priceNum = parseFloat(String(selectedReq.targetPrice || selectedReq.price || 0).replace(/[^0-9.]/g, '')) || 0;
            const totalAmt = qtyNum * priceNum;
            const unit = typeof selectedReq.quantity === 'string' && selectedReq.quantity.includes(' ') 
                ? selectedReq.quantity.split(' ')[1] 
                : 'kg';

            // Update requirement status
            const updatedReq = {
                ...selectedReq,
                status: `Fulfilled - Logistics by ${provider}`,
                farmer_id: uid,
                farmer_name: user.displayName || 'Verified Farmer',
                logistics_provider: provider,
                order_date: new Date().toISOString(),
                created_at: selectedReq.created_at || new Date().toISOString(),
                total_amount: totalAmt > 0 ? totalAmt : (selectedReq.targetPrice || selectedReq.price || 0),
                buyer: {
                    uid: selectedReq.buyer_id || '',
                    full_name: selectedReq.buyer_name || 'Registered Buyer',
                    location: selectedReq.buyer_location || '',
                    phone: selectedReq.buyer_phone || ''
                },
                items: [
                    {
                        id: selectedReq.id,
                        name: selectedReq.product,
                        category: selectedReq.category || 'Produce',
                        quantity: selectedReq.quantity,
                        price: priceNum || selectedReq.targetPrice || selectedReq.price,
                        price_per_unit: priceNum,
                        unit: unit,
                        image: selectedReq.image || selectedReq.image_url || ''
                    }
                ]
            };
            
            if (database) {
                // Update in buyer_requirements
                await set(ref(database, `buyer_requirements/${selectedReq.buyer_id}/${selectedReq.id}`), toRtdbValue(updatedReq));
                // Add to farmer_orders
                await set(ref(database, `farmer_orders/${uid}/${selectedReq.id}`), toRtdbValue(updatedReq));
            }
            
            setMessage({ type: 'success', text: `✅ Requirement fulfilled! Logistics handled by ${provider}. Added to Manage Orders.` });
            setIsFulfillModalOpen(false);
            setSelectedReq(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fulfilling requirement: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading your products...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                <div className="flex gap-3">
                    <Link
                        to="/analytics"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        <BarChart3 size={20} />
                        Analytics
                    </Link>
                    <Link
                        to="/farmer-orders"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Package size={20} />
                        Manage Orders
                    </Link>
                    <button
                        onClick={openAddModal}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first product to the marketplace.</p>
                    <button
                        onClick={openAddModal}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            {(product.image_url || (product.images && product.images[0])) && (
                                <div className="h-48 overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={product.image_url || product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                        {product.images && product.images.length > 1 && (
                                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                📷 {product.images.length}
                                            </span>
                                        )}
                                        {product.video_url && (
                                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                🎥 Video
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                        {product.category}
                                    </span>
                                </div>

                                {product.description && (
                                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                                )}

                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                                    <span className="text-gray-500 text-sm">/{product.unit}</span>
                                </div>

                                <div className="text-sm text-gray-500">
                                    Stock: <span className="font-medium text-gray-700">{product.quantity} {product.unit}</span>
                                </div>

                                {product.location && (
                                    <div className="text-sm text-gray-500">{product.location}</div>
                                )}

                                <div className="pt-4 flex gap-2 border-t border-gray-50">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Live Buyer Requirements Section ── */}
            <section className="mt-12 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <List className="text-emerald-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Live Buyer Requirements</h2>
                </div>
                
                {buyerReqs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <p className="text-gray-500">No active buyer requirements at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buyerReqs.map((req, idx) => (
                            <div key={idx} className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                    {req.status}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1 pr-16">{req.product}</h3>
                                <p className="text-xs text-emerald-700 font-semibold mb-4 bg-emerald-100 inline-block px-2 py-0.5 rounded-full">
                                    {req.category}
                                </p>
                                
                                <div className="space-y-2 text-sm text-gray-700">
                                    {req.buyer_name && (
                                        <div className="flex items-center gap-1.5 text-gray-800 font-medium mb-2">
                                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs">
                                                {req.buyer_name.charAt(0)}
                                            </div>
                                            <span>{req.buyer_name}</span>
                                        </div>
                                    )}
                                    {req.buyer_location && (
                                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                                            <MapPin size={12} />
                                            <span className="truncate">{req.buyer_location}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                                        <span className="text-gray-500">Required Qty</span>
                                        <span className="font-bold text-gray-900">{req.quantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                                        <span className="text-gray-500">Target Price</span>
                                        <span className="font-bold text-green-700">{req.targetPrice || req.price || 'Negotiable'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-500">Posted On</span>
                                        <span className="font-medium">{req.date}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="w-full mt-5 bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-sm text-sm cursor-pointer disabled:opacity-50"
                                    onClick={() => { setSelectedReq(req); setIsFulfillModalOpen(true); }}
                                    disabled={req.status !== 'Requirement posted'}
                                >
                                    {req.status === 'Requirement posted' ? 'Fulfill Requirement' : 'Already Fulfilled'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
            >
                <ProductForm
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={closeModal}
                    saving={saving}
                />
            </Modal>

            {isFulfillModalOpen && selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Fulfill Requirement</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            You are fulfilling the requirement for <strong>{selectedReq.product}</strong> ({selectedReq.quantity}). 
                            <br/><br/>
                            Who will provide the transport/logistics for this delivery?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleFulfillRequirement('Farmer')}
                                disabled={saving}
                                className="flex-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 py-3 text-emerald-800 font-semibold cursor-pointer disabled:opacity-50 transition"
                            >
                                I'll Handle Transport
                            </button>
                            <button
                                onClick={() => handleFulfillRequirement('Buyer')}
                                disabled={saving}
                                className="flex-1 rounded-xl bg-blue-100 hover:bg-blue-200 border border-blue-300 py-3 text-blue-800 font-semibold cursor-pointer disabled:opacity-50 transition"
                            >
                                Buyer Handles Transport
                            </button>
                        </div>
                        <button
                            onClick={() => { setIsFulfillModalOpen(false); setSelectedReq(null); }}
                            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-800 underline py-2 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
