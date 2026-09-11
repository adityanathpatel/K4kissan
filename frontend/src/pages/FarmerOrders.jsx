import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, child, update } from 'firebase/database';
import { 
    Package, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Truck, 
    MapPin, 
    Phone, 
    Mail, 
    Search, 
    Filter, 
    ArrowLeft, 
    DollarSign, 
    ShoppingBag, 
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOrders } from '../data/mockOrders';

// Helper to normalize individual line items from different order schemas
const parseLineItem = (item, idx, order) => {
    const rawName = item.product?.name || item.name || item.product_name || order?.product || 'Agri Commodity';
    const category = item.product?.category || item.category || order?.category || 'Grains & Pulses';

    // Parse quantity & unit
    let rawQty = item.quantity !== undefined ? item.quantity : (order?.quantity || 1);
    let unit = item.unit || item.product?.unit || '';
    let numericQty = 1;

    if (typeof rawQty === 'number') {
        numericQty = rawQty;
        if (!unit) unit = 'kg';
    } else if (typeof rawQty === 'string') {
        const match = rawQty.match(/^([\d.]+)\s*(.*)$/);
        if (match) {
            numericQty = parseFloat(match[1]) || 1;
            if (!unit && match[2]) unit = match[2];
        } else {
            numericQty = parseFloat(rawQty) || 1;
        }
        if (!unit) unit = 'kg';
    }

    // Parse unit price
    let rawPrice = item.price_per_unit ?? item.price ?? item.price_at_time ?? item.targetPrice ?? order?.targetPrice ?? order?.price ?? 0;
    let numericPrice = 0;
    if (typeof rawPrice === 'number') {
        numericPrice = rawPrice;
    } else if (typeof rawPrice === 'string') {
        numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    }

    // Subtotal
    const subtotal = item.subtotal || (numericQty * numericPrice);

    // Image fallback based on name or category
    let image = item.product?.image_url || item.image || item.image_url || '';
    if (!image) {
        const lowerName = (rawName + ' ' + category).toLowerCase();
        if (lowerName.includes('rice') || lowerName.includes('basmati') || lowerName.includes('paddy')) {
            image = '/images/basmati_rice.jpg';
        } else if (lowerName.includes('wheat') || lowerName.includes('gehu') || lowerName.includes('sharbati')) {
            image = '/images/sharbati_wheat.jpg';
        } else if (lowerName.includes('ragi') || lowerName.includes('millet')) {
            image = '/images/organic_ragi.jpg';
        } else if (lowerName.includes('maize') || lowerName.includes('corn') || lowerName.includes('makka')) {
            image = '/images/yellow_maize.jpg';
        } else {
            image = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
        }
    }

    return {
        id: item.id || `item-${idx}`,
        name: rawName,
        category,
        quantityDisplay: typeof rawQty === 'string' && rawQty.includes(' ') ? rawQty : `${numericQty} ${unit}`,
        numericQty,
        unit: unit || 'kg',
        numericPrice,
        subtotal,
        image
    };
};

// Normalize order items whether from order_items, items, or direct requirement
const getOrderItems = (order) => {
    if (Array.isArray(order.order_items) && order.order_items.length > 0) {
        return order.order_items.map((item, idx) => parseLineItem(item, idx, order));
    }
    if (Array.isArray(order.items) && order.items.length > 0) {
        return order.items.map((item, idx) => parseLineItem(item, idx, order));
    }
    if (order.product || order.product_name || order.name) {
        return [parseLineItem({
            name: typeof order.product === 'string' ? order.product : (order.product?.name || order.product_name || order.name),
            category: order.category || order.product?.category || 'Grains & Pulses',
            quantity: order.quantity || 1,
            unit: order.unit || (typeof order.quantity === 'string' && order.quantity.includes(' ') ? order.quantity.split(' ')[1] : 'kg'),
            price: order.targetPrice || order.price || order.price_per_unit || 0,
            image: order.image || order.image_url || order.product?.image_url || ''
        }, 0, order)];
    }
    return [];
};

// Compute order total amount safely
const calculateOrderTotal = (order, items) => {
    if (order.total_amount && !isNaN(Number(order.total_amount)) && Number(order.total_amount) > 0) {
        return Number(order.total_amount);
    }
    const sum = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    if (sum > 0) return sum;
    if (order.targetPrice || order.price) {
        const p = parseFloat(String(order.targetPrice || order.price).replace(/[^0-9.]/g, '')) || 0;
        return p;
    }
    return 0;
};

// Format dates nicely
const formatOrderDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
        return String(dateVal);
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const FarmerOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders(mockOrders);
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            if (database && user) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `farmer_orders/${user.uid || user.id}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                    setOrders(list.length ? list : mockOrders);
                    return;
                }
            }
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders(mockOrders);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            if (database && user) {
                const uid = user.uid || user.id;
                await update(ref(database, `farmer_orders/${uid}/${orderId}`), {
                    status: newStatus
                });

                // Find order to cross-update buyer portals if applicable
                const targetOrder = orders.find(o => o.id === orderId);
                if (targetOrder?.buyer_id) {
                    await update(ref(database, `buyer_requirements/${targetOrder.buyer_id}/${orderId}`), {
                        status: newStatus
                    }).catch(() => {});
                }
                if (targetOrder?.buyer?.uid) {
                    await update(ref(database, `orders/${targetOrder.buyer.uid}/${orderId}`), {
                        status: newStatus
                    }).catch(() => {});
                }
            }

            // Update local state
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const getStatusIcon = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('pending') || s.includes('requirement')) {
            return <Clock className="text-amber-500" size={18} />;
        }
        if (s.includes('confirm') || s.includes('packag') || s.includes('process')) {
            return <CheckCircle className="text-blue-500" size={18} />;
        }
        if (s.includes('ship') || s.includes('transit') || s.includes('logistics') || s.includes('pickup')) {
            return <Truck className="text-purple-500" size={18} />;
        }
        if (s.includes('deliver') || s.includes('complete') || s.includes('fulfilled')) {
            return <CheckCircle className="text-emerald-500" size={18} />;
        }
        if (s.includes('cancel')) {
            return <XCircle className="text-red-500" size={18} />;
        }
        return <Package className="text-gray-500" size={18} />;
    };

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('pending') || s.includes('requirement')) {
            return 'bg-amber-50 text-amber-800 border-amber-200';
        }
        if (s.includes('confirm') || s.includes('packag') || s.includes('process')) {
            return 'bg-blue-50 text-blue-800 border-blue-200';
        }
        if (s.includes('ship') || s.includes('transit') || s.includes('pickup')) {
            return 'bg-purple-50 text-purple-800 border-purple-200';
        }
        if (s.includes('deliver') || s.includes('complete') || s.includes('fulfilled')) {
            return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        }
        if (s.includes('cancel')) {
            return 'bg-red-50 text-red-800 border-red-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Filter and search logic
    const filteredOrders = orders.filter(order => {
        // Status filter
        let matchesFilter = true;
        const s = (order.status || '').toLowerCase();
        if (filter === 'pending') {
            matchesFilter = s.includes('pending') || s.includes('requirement');
        } else if (filter === 'confirmed') {
            matchesFilter = s.includes('confirmed') || s.includes('packag') || s.includes('process');
        } else if (filter === 'shipped') {
            matchesFilter = s.includes('shipped') || s.includes('transit');
        } else if (filter === 'delivered') {
            matchesFilter = s.includes('delivered') || s.includes('completed');
        } else if (filter === 'fulfilled') {
            matchesFilter = s.includes('fulfilled');
        } else if (filter === 'cancelled') {
            matchesFilter = s.includes('cancelled');
        }

        if (!matchesFilter) return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const buyerName = (order.buyer?.full_name || order.buyer_name || '').toLowerCase();
        const orderId = (order.id || '').toLowerCase();
        const items = getOrderItems(order);
        const itemNames = items.map(it => it.name.toLowerCase()).join(' ');

        return orderId.includes(q) || buyerName.includes(q) || itemNames.includes(q);
    });

    // Metric counters
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => (o.status || '').toLowerCase().includes('pending') || (o.status || '').toLowerCase().includes('requirement')).length;
    const deliveredOrdersCount = orders.filter(o => (o.status || '').toLowerCase().includes('deliver') || (o.status || '').toLowerCase().includes('complete') || (o.status || '').toLowerCase().includes('fulfilled')).length;
    const totalSalesVolume = orders.reduce((acc, o) => {
        const items = getOrderItems(o);
        return acc + calculateOrderTotal(o, items);
    }, 0);

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16 px-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Farmer Order Management</h2>
                <p className="text-gray-500 mb-6">Please log in to your verified Farmer account to view and manage your farm orders.</p>
                <Link
                    to="/login"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm"
                >
                    Sign In to Portal
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                <p className="text-gray-500 font-medium">Loading farmer orders and dispatches...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            
            {/* Header & Back Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link 
                            to="/farmer-dashboard" 
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                        <Package className="text-emerald-600" size={30} />
                        Manage Orders & Dispatches
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Track incoming buyer purchase requests, pack produce, and coordinate logistics
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/farmer-dashboard"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <ShoppingBag size={15} /> Farm Catalog
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</div>
                    <div className="text-2xl font-black text-gray-900">{totalOrdersCount}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Package size={12} className="text-blue-500" /> Lifetime received
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-xs bg-amber-50/20">
                    <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Pending Action</div>
                    <div className="text-2xl font-black text-amber-800">{pendingOrdersCount}</div>
                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <Clock size={12} /> Awaiting dispatch
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs bg-emerald-50/20">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Fulfilled / Delivered</div>
                    <div className="text-2xl font-black text-emerald-800">{deliveredOrdersCount}</div>
                    <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={12} /> Completed orders
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs bg-purple-50/20">
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Total Value</div>
                    <div className="text-2xl font-black text-purple-900">₹{totalSalesVolume.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> Gross commodities
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Buyer, Crop..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1 pl-1">
                        <Filter size={14} /> Filter:
                    </span>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'confirmed', label: 'Confirmed' },
                        { id: 'shipped', label: 'In Transit' },
                        { id: 'delivered', label: 'Delivered' },
                        { id: 'fulfilled', label: 'Fulfilled' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                filter === tab.id
                                    ? 'bg-gray-900 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-12 text-center">
                    <Package size={56} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No orders match your filter</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                        {searchQuery 
                            ? `No results found for "${searchQuery}". Try a different keyword.` 
                            : `There are currently no orders in the "${filter}" category.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const items = getOrderItems(order);
                        const totalAmount = calculateOrderTotal(order, items);
                        const buyerName = order.buyer?.full_name || order.buyer?.name || order.buyer_name || (order.shipping_address ? 'Direct Customer' : 'Registered Buyer');
                        const buyerPhone = order.buyer?.phone || order.buyer_phone || order.phone;
                        const buyerLocation = order.buyer?.location || order.buyer_location || order.shipping_address || order.location;
                        const buyerEmail = order.buyer?.email || order.buyer_email;
                        const isFulfilledReq = (order.status || '').toLowerCase().includes('fulfilled');
                        const logisticsProvider = order.logistics_provider || (order.status?.includes('Logistics by Buyer') ? 'Buyer' : order.status?.includes('Logistics by Farmer') ? 'Farmer' : null);

                        return (
                            <div 
                                key={order.id} 
                                className="bg-white rounded-2xl shadow-xs border border-gray-200/90 overflow-hidden hover:shadow-md transition"
                            >
                                {/* Order Card Header */}
                                <div className="bg-gray-50/90 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-black text-gray-900 text-sm tracking-tight">
                                                Order #{order.id}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Pending'}
                                            </span>
                                            {isFulfilledReq && (
                                                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-300">
                                                    Buyer Requirement
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Placed on: <span className="font-semibold text-gray-700">{formatOrderDate(order.created_at || order.order_date || order.date)}</span>
                                        </div>
                                    </div>

                                    {/* Action Status Controls */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Value</div>
                                            <div className="text-xl font-black text-emerald-700">
                                                ₹{totalAmount.toLocaleString('en-IN')}
                                            </div>
                                        </div>

                                        <div className="min-w-[150px]">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                Update Status:
                                            </label>
                                            <select
                                                value={order.status || 'pending'}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-xs cursor-pointer"
                                            >
                                                <option value="pending">⏳ Pending</option>
                                                <option value="confirmed">✅ Confirmed</option>
                                                <option value="Packaging">📦 Packaging</option>
                                                <option value="shipped">🚚 In Transit / Shipped</option>
                                                <option value="delivered">🎉 Delivered</option>
                                                <option value="cancelled">❌ Cancelled</option>
                                                {isFulfilledReq && (
                                                    <option value={order.status}>{order.status}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6 grid md:grid-cols-3 gap-6">
                                    
                                    {/* Product Details Section (2 Cols) */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                            <Package size={14} className="text-emerald-600" />
                                            Produce Details ({items.length} {items.length === 1 ? 'item' : 'items'})
                                        </h3>

                                        <div className="space-y-3">
                                            {items.map((item, idx) => (
                                                <div 
                                                    key={item.id || idx} 
                                                    className="flex items-start justify-between gap-4 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 hover:border-gray-200 transition"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 bg-white shrink-0"
                                                            onError={(e) => { e.target.src = '/images/basmati_rice.jpg'; }}
                                                        />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-black text-gray-900 text-sm">
                                                                    {item.name}
                                                                </h4>
                                                                {item.category && (
                                                                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                                                        {item.category}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-xs text-gray-600">
                                                                Quantity: <strong className="font-bold text-gray-900">{item.quantityDisplay}</strong>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Rate: <strong className="text-gray-700">₹{item.numericPrice.toLocaleString('en-IN')}/{item.unit}</strong>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <div className="text-[11px] text-gray-400 font-semibold">Subtotal</div>
                                                        <div className="text-base font-black text-gray-900 mt-0.5">
                                                            ₹{item.subtotal.toLocaleString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Logistics provider note if fulfilled */}
                                        {logisticsProvider && (
                                            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-center justify-between gap-3 text-xs text-blue-900">
                                                <div className="flex items-center gap-2">
                                                    <Truck size={16} className="text-blue-600 shrink-0" />
                                                    <span>
                                                        <strong>Logistics Mode:</strong> Handled by <strong>{logisticsProvider}</strong>
                                                        {logisticsProvider === 'Buyer' ? ' (Buyer is coordinating transporter pickup)' : ' (Farmer arranges transport dispatch)'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Buyer / Delivery Info Section (1 Col) */}
                                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Buyer & Delivery Info
                                        </h3>

                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <div className="text-gray-400 font-semibold text-[11px]">Buyer Name</div>
                                                <div className="font-bold text-gray-900 text-sm mt-0.5">{buyerName}</div>
                                            </div>

                                            {buyerPhone && (
                                                <div>
                                                    <div className="text-gray-400 font-semibold text-[11px] flex items-center gap-1">
                                                        <Phone size={12} /> Contact Number
                                                    </div>
                                                    <a 
                                                        href={`tel:${buyerPhone}`}
                                                        className="font-bold text-emerald-700 hover:underline mt-0.5 inline-block"
                                                    >
                                                        {buyerPhone}
                                                    </a>
                                                </div>
                                            )}

                                            {buyerEmail && (
                                                <div>
                                                    <div className="text-gray-400 font-semibold text-[11px] flex items-center gap-1">
                                                        <Mail size={12} /> Email
                                                    </div>
                                                    <div className="text-gray-700 font-medium">{buyerEmail}</div>
                                                </div>
                                            )}

                                            <div>
                                                <div className="text-gray-400 font-semibold text-[11px] flex items-center gap-1">
                                                    <MapPin size={12} /> Destination Location
                                                </div>
                                                <div className="text-gray-800 font-medium bg-white p-2.5 rounded-lg border border-gray-200 mt-1">
                                                    {buyerLocation || 'Delivery location specified on dispatch'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default FarmerOrders;
