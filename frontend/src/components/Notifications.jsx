import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, update, child } from 'firebase/database';
import { Bell, X, Package, MessageCircle, ShoppingCart } from 'lucide-react';

const Notifications = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && isOpen) {
            fetchNotifications();
        }
    }, [user, isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            if (database && user) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `notifications/${user.uid || user.id}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
                    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                    setNotifications(list);
                    return;
                }
            }
            setNotifications([]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            if (database && user) {
                await update(ref(database, `notifications/${user.uid || user.id}/${notificationId}`), {
                    read: true
                });
            }
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        onClose();

        // Navigate based on notification type
        if (notification.type === 'order_placed' || notification.type === 'order_updated') {
            if (notification.type === 'order_placed') {
                navigate('/farmer-orders');
            } else {
                navigate('/orders');
            }
        } else if (notification.type === 'new_message') {
            navigate('/chat');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_placed':
                return <ShoppingCart className="text-green-500" size={20} />;
            case 'order_updated':
                return <Package className="text-blue-500" size={20} />;
            case 'new_message':
                return <MessageCircle className="text-purple-500" size={20} />;
            default:
                return <Bell className="text-gray-500" size={20} />;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Notifications;
