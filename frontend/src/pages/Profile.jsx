import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, child, update } from 'firebase/database';
import { User, MapPin, Phone, Save } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [profile, setProfile] = useState({
        full_name: '',
        username: '',
        phone: '',
        location: '',
        role: '',
        website: '',
        avatar_url: '',
        kyc: {}
    });

    useEffect(() => {
        if (user) {
            getProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const uid = user.uid || user.id;
            if (database && uid) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `users/${uid}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setProfile({
                        full_name: data.full_name || user.displayName || '',
                        username: data.username || user.email?.split('@')[0] || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        role: data.role || localStorage.getItem('selected_role') || '',
                        website: data.website || '',
                        avatar_url: data.avatar_url || '',
                        kyc: data.kyc || {}
                    });
                    return;
                }
            }
            setProfile({
                full_name: user.displayName || '',
                username: user.email?.split('@')[0] || '',
                phone: '',
                location: '',
                role: localStorage.getItem('selected_role') || 'Farmer',
                website: '',
                avatar_url: '',
                kyc: {}
            });
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const uid = user.uid || user.id;
            const updates = {
                full_name: profile.full_name,
                phone: profile.phone,
                location: profile.location,
                website: profile.website,
                updated_at: new Date().toISOString(),
            };

            if (database && uid) {
                await update(ref(database, `users/${uid}`), updates);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating profile: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div className="text-center py-10">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">My Profile</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">

                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                            {profile.full_name ? profile.full_name[0].toUpperCase() : <User size={40} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{profile.full_name || 'User'}</h2>
                            <p className="text-gray-500 capitalize">{profile.role || 'Member'}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={updateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* KYC Information (Read-only for now) */}
                        {Object.keys(profile.kyc).length > 0 && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Verification & KYC Details</h3>
                                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    {profile.kyc.aadhaar && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Aadhaar No.</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.aadhaar}</p>
                                        </div>
                                    )}
                                    {profile.kyc.khatauni && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Khatauni No. (Land Record)</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.khatauni}</p>
                                        </div>
                                    )}
                                    {profile.kyc.businessName && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Business Name</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.businessName}</p>
                                        </div>
                                    )}
                                    {profile.kyc.gst && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">GST No.</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.gst}</p>
                                        </div>
                                    )}
                                    {profile.kyc.vehicleNumber && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Vehicle No.</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.vehicleNumber}</p>
                                        </div>
                                    )}
                                    {profile.kyc.drivingLicense && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Driving License</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.drivingLicense}</p>
                                        </div>
                                    )}
                                    {profile.kyc.capacity && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Vehicle Capacity</span>
                                            <p className="font-medium text-gray-900">{profile.kyc.capacity}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-70"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
