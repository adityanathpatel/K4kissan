import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { database } from '../lib/firebase';
import { ref, get, child } from 'firebase/database';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { mockOrders } from '../data/mockOrders';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed' | 'all'

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            if (!database || !user) {
                setOrders(mockOrders);
                return;
            }

            const dbRef = ref(database);
            const uid = user.uid || user.id;
            const snapshot = await get(child(dbRef, `orders/${uid}`));

            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                setOrders(list.length ? list : mockOrders);
            } else {
                setOrders(mockOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders(mockOrders);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock size={14} className="text-amber-600" /> Pending Confirmation
                    </span>
                );
            case 'confirmed':
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        <Truck size={14} className="text-blue-600" /> In Transit / Shipping
                    </span>
                );
            case 'delivered':
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle size={14} className="text-emerald-600" /> Completed & Delivered
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <XCircle size={14} className="text-red-600" /> Order Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                        <Package size={14} /> {status}
                    </span>
                );
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped');
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed' || o.status === 'cancelled');

    const displayedOrders = activeTab === 'pending' 
        ? pendingOrders 
        : activeTab === 'completed' 
            ? completedOrders 
            : orders;

    if (loading) {
        return (
            <div className="text-center py-16 text-gray-500 font-medium">
                Loading your K4kissan orders...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-4">
            
            {/* Top Navigation & Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Package className="text-emerald-600" size={28} />
                        My Buyer Orders
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Track your pending produce shipments and completed farm purchases
                    </p>
                </div>

                <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                >
                    <ArrowLeft size={14} /> Browse More Products
                </Link>
            </div>

            {/* Pending & Completed Section Filter Tabs */}
            <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'pending'
                            ? 'bg-[#00ff33] text-gray-900 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    ⏳ Pending Orders ({pendingOrders.length})
                </button>

                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'completed'
                            ? 'bg-[#00ff33] text-gray-900 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    ✅ Completed Orders ({completedOrders.length})
                </button>

                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'all'
                            ? 'bg-gray-900 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    All Orders ({orders.length})
                </button>
            </div>

            {/* Orders List Display */}
            {displayedOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs space-y-4">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">No {activeTab} orders found</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        You have no {activeTab} grain purchases yet. Explore our verified farmer catalog to place a direct farm order.
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition"
                    >
                        Explore Farmer Grain Catalog
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {displayedOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-gray-900 text-sm">Order #{order.id}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Placed on: <span className="font-semibold text-gray-700">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Total Order Value</div>
                                    <div className="text-xl font-black text-emerald-700">₹{order.total_amount}</div>
                                </div>
                            </div>

                            {/* Order Items & Farmer Info */}
                            <div className="p-6 space-y-4">
                                {(order.order_items || order.items || []).map((item, idx) => {
                                    const prod = item.product || {};
                                    const itemName = prod.name || item.name || 'Agri Commodity';
                                    const itemImage = prod.image_url || item.image || '/images/basmati_rice.jpg';
                                    const itemUnit = item.unit || prod.unit || 'kg';
                                    const itemPrice = item.price_per_unit || item.price || 0;
                                    const totalItemPrice = item.quantity * itemPrice;

                                    return (
                                        <div key={item.id || idx} className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={itemImage}
                                                    alt={itemName}
                                                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                                                    onError={(e) => { e.target.src = '/images/basmati_rice.jpg'; }}
                                                />
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-gray-900 text-sm">{itemName}</h4>
                                                    <div className="text-xs text-gray-500">
                                                        Quantity: <strong className="text-gray-800">{item.quantity} {itemUnit}</strong> @ ₹{itemPrice}/{itemUnit}
                                                    </div>
                                                    {order.farmer && (
                                                        <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold pt-0.5">
                                                            <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                👨‍🌾 {order.farmer.name || 'Verified Farmer'} {order.farmer.location ? `(${order.farmer.location})` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                    ₹{totalItemPrice.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Delivery & Payment Details Footer */}
                                <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 border border-gray-100 flex justify-between items-center flex-wrap gap-4">
                                    <div className="space-y-1">
                                        <div className="text-gray-500 flex items-center gap-1 font-medium">
                                            <MapPin size={13} className="text-gray-400" /> Shipping Address: <span className="text-gray-800 font-semibold">{order.shipping_address || 'Registered Buyer Address'}</span>
                                        </div>
                                        <div className="text-gray-500 font-medium">
                                            Payment: <span className="text-emerald-700 font-bold">{order.payment_method}</span> ({order.payment_status})
                                        </div>
                                    </div>

                                    {order.status === 'pending' || order.status === 'confirmed' ? (
                                        <div className="bg-amber-50 text-amber-900 font-bold px-3 py-1.5 rounded-lg border border-amber-200 text-xs">
                                            🚚 Expected Delivery: {order.estimated_delivery}
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 text-emerald-900 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
                                            ✓ Delivered Successfully
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
