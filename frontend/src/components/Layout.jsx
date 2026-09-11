import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, child } from 'firebase/database';
import Footer from './Footer';
import Notifications from './Notifications';
import BrandSwitcherNavbar from './BrandSwitcherNavbar';
import { subscribeAllFarmerProducts } from '../lib/marketplace';

const Layout = () => {
    const { user, userRole, signOut } = useAuth();
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeCategory, setActiveCategory] = useState('for-you');

    useEffect(() => {
        const unsubProducts = subscribeAllFarmerProducts();
        return () => unsubProducts?.();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            if (database) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `notifications/${user.uid || user.id}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const count = Object.values(data).filter(n => !n.read).length;
                    setUnreadCount(count);
                }
            }
        } catch (error) {
            // Graceful fallback
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Unified Top Navbar & Category Strip */}
            <BrandSwitcherNavbar
                user={user}
                userRole={userRole}
                onLogout={handleLogout}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                unreadCount={unreadCount}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <main className="flex-grow container mx-auto px-4 py-6">
                <Outlet context={{ activeCategory, setActiveCategory }} />
            </main>

            <Footer />

            <Notifications
                isOpen={isNotificationsOpen}
                onClose={() => {
                    setIsNotificationsOpen(false);
                    fetchUnreadCount();
                }}
            />
        </div>
    );
};

export default Layout;
