import React, { useState, useEffect } from 'react';
import { Check, Package, Plus, Truck, X, Star, MapPin, CheckCircle, Eye, ShoppingBag } from 'lucide-react';
import { grainProducts } from '../data/grainProducts';
import FarmerModal from '../components/FarmerModal';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, child, set, push, onValue } from 'firebase/database';
import { toRtdbValue } from '../lib/rtdbSafe';

const initialPendingOrders = [
    { id: 'K4K-1048', product: 'Natural Hulled Organic Barley Grain (Jau)', quantity: '60 kg', date: 'Sep 17, 2026', status: 'Packaging' },
    { id: 'K4K-1045', product: 'Khapli Emmer Ancient Wheat Grain', quantity: '35 kg', date: 'Sep 16, 2026', status: 'Payment verified' },
    { id: 'K4K-1042', product: '1121 Extra Long Raw Basmati Rice', quantity: '25 kg', date: 'Sep 12, 2026', status: 'In transit' },
    { id: 'K4K-1039', product: 'MP Sharbati Golden Wheat Grain', quantity: '50 kg', date: 'Sep 14, 2026', status: 'Processing' },
    { id: 'K4K-1036', product: 'Desi Golden Yellow Maize Corn Grains', quantity: '40 kg', date: 'Sep 15, 2026', status: 'Awaiting pickup' },
];

const initialCompletedOrders = [
    { id: 'K4K-1028', product: 'Organically Grown Red Ragi Grains', quantity: '20 kg', date: 'Sep 2, 2026', status: 'Delivered' },
    { id: 'K4K-1021', product: 'Desi Organic Pearl Millet (Bajra)', quantity: '30 kg', date: 'Aug 28, 2026', status: 'Delivered' },
    { id: 'K4K-1017', product: 'Maldandi White Jowar Grain', quantity: '15 kg', date: 'Aug 22, 2026', status: 'Delivered' },
    { id: 'K4K-1014', product: 'Organic Whole Grain Brown Rice', quantity: '45 kg', date: 'Aug 18, 2026', status: 'Delivered' },
    { id: 'K4K-1008', product: 'Desi Golden Yellow Maize Corn Grains', quantity: '100 kg', date: 'Aug 10, 2026', status: 'Delivered' },
];

function TruckIcon() {
    return <Truck aria-hidden="true" size={25} strokeWidth={1.8} />;
}

function OrderCard({ order, completed, onBookTransport }) {
    return (
        <article className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-emerald-300">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    {completed ? <Check aria-hidden="true" size={26} strokeWidth={2.5} /> : <TruckIcon />}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-800">{order.product}</h3>
                    <p className="mt-1 text-xs text-gray-500">Order {order.id} · {order.quantity} · {order.date}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.status}
                    </span>
                </div>
            </div>
            {order.status === 'Fulfilled - Logistics by Buyer' && (
                <button
                    onClick={() => onBookTransport && onBookTransport(order)}
                    className="w-full sm:w-auto shrink-0 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition cursor-pointer"
                >
                    Book Transport
                </button>
            )}
        </article>
    );
}

function AddProductModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({ name: '', category: '', quantity: '', price: '' });

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="add-product-title" className="text-xl font-bold text-gray-800">Add New Product Requirement</h2>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer" aria-label="Close dialog">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        ['name', 'Product Name', 'e.g. Basmati rice'],
                        ['category', 'Category', 'e.g. Rice'],
                        ['quantity', 'Quantity', 'e.g. 50 kg'],
                        ['price', 'Target Price', 'e.g. ₹120 per kg'],
                    ].map(([name, label, placeholder]) => (
                        <label key={name} className="block text-sm font-medium text-gray-700">
                            {label}
                            <input required name={name} value={form[name]} onChange={updateField} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                        </label>
                    ))}
                    <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 cursor-pointer">Submit Requirement</button>
                </form>
            </div>
        </div>
    );
}

export default function BuyerDashboard() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
    const [completedOrders, setCompletedOrders] = useState(initialCompletedOrders);
    const [notice, setNotice] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
    const [dbLoading, setDbLoading] = useState(false);
    const [buyerProfile, setBuyerProfile] = useState({});

    const { addToCart } = useCart ? useCart() : { addToCart: () => {} };

    // Load buyer's orders and requirements from Firebase on login
    useEffect(() => {
        if (!user || !database) return;
        const uid = user.uid || user.id;
        setDbLoading(true);

        // Load buyer profile
        const profileRef = ref(database, `users/${uid}`);
        get(profileRef).then((snapshot) => {
            if (snapshot.exists()) setBuyerProfile(snapshot.val());
        }).catch(e => console.warn('Could not load profile:', e));

        // Load orders from Firebase
        const ordersRef = ref(database, `orders/${uid}`);
        const unsubOrders = onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                const pending = list.filter(o =>
                    ['pending', 'Packaging', 'Payment verified', 'In transit', 'Processing', 'Awaiting pickup', 'Requirement posted'].includes(o.status)
                );
                const completed = list.filter(o => ['Delivered', 'delivered', 'completed', 'Completed'].includes(o.status));
                if (pending.length > 0) setPendingOrders(pending);
                if (completed.length > 0) setCompletedOrders(completed);
            }
        });

        // Load requirements from Firebase
        const reqRef = ref(database, `buyer_requirements/${uid}`);
        const unsubReqs = onValue(reqRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                if (list.length > 0) {
                    setPendingOrders(prev => {
                        // merge without duplicates
                        const existing = new Set(prev.map(o => o.id));
                        const newReqs = list.filter(r => !existing.has(r.id));
                        return newReqs.length ? [...newReqs, ...prev] : prev;
                    });
                }
            }
            setDbLoading(false);
        });

        return () => { unsubOrders(); unsubReqs(); };
    }, [user]);

    const handleSubmit = async (form) => {
        const newOrder = {
            id: `K4K-${1043 + pendingOrders.length}`,
            product: form.name,
            quantity: form.quantity,
            targetPrice: form.price,
            category: form.category,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'Requirement posted',
            created_at: new Date().toISOString(),
            buyer_id: user?.uid || user?.id,
            buyer_name: buyerProfile.full_name || user?.displayName || 'Unknown Buyer',
            buyer_location: buyerProfile.location || 'Location not specified'
        };

        // Save to Firebase if user is logged in
        if (user && database) {
            const uid = user.uid || user.id;
            try {
                const newRef = push(ref(database, `buyer_requirements/${uid}`));
                await set(newRef, toRtdbValue({ ...newOrder, id: newRef.key }));
                newOrder.id = newRef.key;
            } catch (e) {
                console.warn('Firebase save notice:', e);
            }
        }

        setPendingOrders((orders) => [newOrder, ...orders]);
        setIsModalOpen(false);
        setNotice(`✅ "${form.name}" requirement added successfully!`);
        window.setTimeout(() => setNotice(''), 4000);
    };

    const handleBookTransport = async (order) => {
        if (!user || !database) return;
        const uid = user.uid || user.id;

        try {
            // Push to global transporter requests
            const newLoad = {
                id: `load-${Date.now()}`,
                req_id: order.id,
                buyer_id: uid,
                product: order.product,
                quantity: order.quantity,
                pickup: order.farmer_location || 'Farmer Location',
                pickupCoords: [22.0, 78.0], // default fallback
                dropoff: order.buyer_location || buyerProfile.location || 'Buyer Location',
                dropoffCoords: [23.0, 79.0], // default fallback
                pickupTime: 'ASAP',
                deliveryDeadline: 'Within 2 days',
                distance: 'TBD',
                duration: 'TBD',
                payout: 'Negotiable',
                status: 'available',
                created_at: new Date().toISOString()
            };

            await set(ref(database, `transporter_requests/${newLoad.id}`), toRtdbValue(newLoad));

            // Update requirement status
            const updatedOrder = { ...order, status: 'Transport Requested' };
            await set(ref(database, `buyer_requirements/${uid}/${order.id}`), toRtdbValue(updatedOrder));
            
            setNotice(`✅ Transport requested for ${order.product}. Transporters will see it now.`);
            window.setTimeout(() => setNotice(''), 4000);
        } catch (error) {
            console.error('Error booking transport:', error);
            setNotice('❌ Failed to book transport.');
            window.setTimeout(() => setNotice(''), 4000);
        }
    };

    const handleViewDetail = (product) => {
        setSelectedProduct(product);
        setIsFarmerModalOpen(true);
    };

    const handlePurchase = (product, e) => {
        if (e) e.stopPropagation();
        if (addToCart) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                farmer: product.farmer?.name || 'K4kissan Farmer',
                unit: product.unit || 'kg'
            });
        }
        setSelectedProduct(product);
        setIsFarmerModalOpen(true);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
            {notice && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-xs">{notice}</div>}
            
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <section className="flex flex-col items-start">
                        <h2 className="mb-4 inline-block border-b-2 border-emerald-500 pb-2 text-xl font-bold text-gray-800">Add Product</h2>
                        <button type="button" onClick={() => setIsModalOpen(true)} className="flex h-48 w-full max-w-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl bg-emerald-600 shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-lg">
                            <Plus aria-hidden="true" className="h-20 w-20 text-white" strokeWidth={3.5} />
                            <span className="mt-2 text-base font-semibold text-white">Add Product</span>
                        </button>
                    </section>
                    <section>
                        <h2 className="mb-6 inline-block border-b-2 border-emerald-500 pb-2 text-xl font-bold text-gray-800">Pending</h2>
                        <div className="flex flex-col gap-4">
                            {pendingOrders.map((order) => (
                                <OrderCard key={order.id} order={order} onBookTransport={handleBookTransport} />
                            ))}
                        </div>
                    </section>
                    <section>
                        <h2 className="mb-6 inline-block border-b-2 border-emerald-500 pb-2 text-xl font-bold text-gray-800">Completed</h2>
                        <div className="flex flex-col gap-4">
                            {completedOrders.map((order) => (
                                <OrderCard key={order.id} order={order} completed />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Products section removed - buyers now browse from the Home page */}

            {isModalOpen && <AddProductModal onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />}

            {/* Farmer Rating & Spec Modal */}
            <FarmerModal
                product={selectedProduct}
                isOpen={isFarmerModalOpen}
                onClose={() => setIsFarmerModalOpen(false)}
                onAddToCart={addToCart}
            />
        </div>
    );
}

