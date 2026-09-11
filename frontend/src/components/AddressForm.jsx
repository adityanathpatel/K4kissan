import React, { useState } from 'react';
import { database } from '../lib/firebase';
import { ref, push, set, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import LocationVerificationModal, { isLocationVerified } from './LocationVerificationModal';

const AddressForm = ({ address, onSuccess, onCancel }) => {
    const { user } = useAuth();

    // ── Location verification gate ─────────────────────────────────────────
    // Show the OTP modal if the user has never verified their location before.
    const [locationVerified, setLocationVerified] = useState(isLocationVerified);

    const handleLocationVerified = () => {
        setLocationVerified(true);
    };

    // ── Address form state ─────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        address_line1: address?.address_line1 || '',
        address_line2: address?.address_line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
        phone: address?.phone || '',
        landmark: address?.landmark || '',
        is_default: address?.is_default || false
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const uid = user?.uid || user?.id || 'guest_user';
            const addressData = {
                ...formData,
                user_id: uid,
                updated_at: new Date().toISOString()
            };

            if (database) {
                if (address?.id) {
                    await update(ref(database, `addresses/${uid}/${address.id}`), addressData);
                } else {
                    const newAddrRef = push(ref(database, `addresses/${uid}`));
                    await set(newAddrRef, addressData);
                }
            }

            // Save to localStorage as well for offline/instant availability
            localStorage.setItem('user_delivery_address', JSON.stringify(addressData));

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving address:', err);
            setError(err.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    // ── Render: show verification modal first if not yet verified ──────────
    if (!locationVerified) {
        return (
            <LocationVerificationModal
                onVerified={handleLocationVerified}
                onDismiss={onCancel}
            />
        );
    }

    // ── Render: address form (once location is verified) ───────────────────
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                </label>
                <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="House/Flat No., Building Name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                </label>
                <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Road, Area, Colony"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                    </label>
                    <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="123456"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="9876543210"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                </label>
                <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Near..."
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="mr-2"
                    id="is_default"
                />
                <label htmlFor="is_default" className="text-sm text-gray-700">
                    Set as default address
                </label>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    disabled={saving}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : address?.id ? 'Update Address' : 'Save Address'}
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
