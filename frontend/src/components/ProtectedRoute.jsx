import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function normalizeRole(role) {
    const r = String(role || '').trim().toLowerCase();
    if (r.startsWith('farm')) return 'farmer';
    if (r.startsWith('buy') || r === 'consumer' || r === 'retailer') return 'buyer';
    if (r.startsWith('trans') || r === 'logistics') return 'transporter';
    return r;
}

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading, userRole } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && roles.length) {
        const current = normalizeRole(userRole);
        const allowed = roles.map(normalizeRole);
        if (!allowed.includes(current)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
