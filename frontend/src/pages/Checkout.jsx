import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, push, set, get } from 'firebase/database';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        upiId: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            const orderId = `K4K-${Date.now().toString().slice(-6)}`;
            const uid = user.uid || user.id;

            let buyerProfile = {};
            if (database) {
                try {
                    const profileSnap = await get(ref(database, `users/${uid}`));
                    if (profileSnap.exists()) buyerProfile = profileSnap.val();
                } catch (e) {}
            }

            const orderData = {
                id: orderId,
                buyer_id: uid,
                buyer_email: user.email,
                total_amount: getCartTotal(),
                status: 'pending',
                created_at: new Date().toISOString(),
                items: cartItems.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    category: item.category || '',
                    quantity: item.quantity,
                    unit: item.unit || 'kg',
                    price: item.price,
                    price_per_unit: item.price,
                    image: item.image || '',
                    farmer_id: item.farmer_id || ''
                }))
            };

            // Group items by farmer_id to sync with farmer portals
            const farmerOrders = {};
            cartItems.forEach(item => {
                const fId = item.farmer_id || 'unknown_farmer';
                if (!farmerOrders[fId]) {
                    farmerOrders[fId] = {
                        id: orderId,
                        buyer: {
                           uid: uid,
                           email: user.email,
                           full_name: buyerProfile.full_name || user.displayName || 'Buyer',
                           phone: buyerProfile.phone || user.phoneNumber || '',
                           location: buyerProfile.location || ''
                        },
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        total_amount: 0,
                        items: []
                    };
                }
                farmerOrders[fId].items.push({
                    product_id: item.id,
                    name: item.name,
                    category: item.category || '',
                    quantity: item.quantity,
                    unit: item.unit || 'kg',
                    price: item.price,
                    price_per_unit: item.price,
                    image: item.image || ''
                });
                farmerOrders[fId].total_amount += item.quantity * item.price;
            });

            // Save order to Firebase Realtime Database
            if (database) {
                try {
                    await set(ref(database, `orders/${uid}/${orderId}`), orderData);
                    
                    // Push to each farmer's order history
                    for (const [fId, fOrderData] of Object.entries(farmerOrders)) {
                        if (fId !== 'unknown_farmer') {
                            await set(ref(database, `farmer_orders/${fId}/${orderId}`), fOrderData);
                        }
                    }
                } catch (e) {
                    console.warn('Firebase order save notice:', e);
                }
            }

            setSuccess(true);
            clearCart();

            // Redirect after success
            setTimeout(() => {
                navigate('/orders');
            }, 2500);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Please log in to checkout.</p>
            </div>
        );
    }

    if (cartItems.length === 0 && !success) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Your cart is empty.</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <CheckCircle size={80} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to home...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.quantity} {item.unit} × ₹{item.price}</p>
                                </div>
                                <p className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-green-600">₹{getCartTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 p-4 rounded-lg border-2 transition ${paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                                    }`}
                            >
                                <CreditCard className="mx-auto mb-2" size={32} />
                                <p className="font-medium">Card</p>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 p-4 rounded-lg border-2 transition ${paymentMethod === 'upi' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                                    }`}
                            >
                                <Smartphone className="mx-auto mb-2" size={32} />
                                <p className="font-medium">UPI</p>
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-4">
                            {paymentMethod === 'card' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={formData.cardName}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleChange}
                                                placeholder="MM/YY"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={handleChange}
                                                placeholder="123"
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={formData.upiId}
                                        onChange={handleChange}
                                        placeholder="yourname@upi"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70"
                            >
                                {processing ? 'Processing...' : `Pay ₹${getCartTotal().toFixed(2)}`}
                            </button>
                        </form>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            This is a mock payment. No real transaction will occur.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
