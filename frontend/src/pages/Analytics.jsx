import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, get, child } from 'firebase/database';
import { Package, ShoppingCart, DollarSign, Star, TrendingUp, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultStats = {
    totalProducts: 12,
    totalOrders: 48,
    totalRevenue: 284500,
    avgRating: 4.9
};

const defaultPriceComparison = [
    { category: 'Rice', yourPrice: '120.00', marketAvg: '115.00' },
    { category: 'Wheat', yourPrice: '65.00', marketAvg: '68.50' },
    { category: 'Maize', yourPrice: '45.00', marketAvg: '48.00' },
    { category: 'Millets', yourPrice: '68.00', marketAvg: '72.00' },
    { category: 'Barley', yourPrice: '50.00', marketAvg: '52.00' },
];

const defaultSalesTrend = [
    { date: '1/9', orders: 4 },
    { date: '2/9', orders: 7 },
    { date: '3/9', orders: 5 },
    { date: '4/9', orders: 9 },
    { date: '5/9', orders: 12 },
    { date: '6/9', orders: 8 },
    { date: '7/9', orders: 15 },
];

const defaultTopProducts = [
    { name: '1121 Extra Long Basmati', totalQuantity: 340, totalRevenue: 40800 },
    { name: 'MP Sharbati Golden Wheat', totalQuantity: 520, totalRevenue: 33800 },
    { name: 'Organically Grown Red Ragi', totalQuantity: 280, totalRevenue: 19040 },
    { name: 'Desi Golden Yellow Maize', totalQuantity: 310, totalRevenue: 13950 },
];

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(defaultStats);
    const [priceComparison, setPriceComparison] = useState(defaultPriceComparison);
    const [salesTrend, setSalesTrend] = useState(defaultSalesTrend);
    const [topProducts, setTopProducts] = useState(defaultTopProducts);

    useEffect(() => {
        fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            if (database && user) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `analytics/${user.uid || user.id}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data.stats) setStats(data.stats);
                    if (data.priceComparison) setPriceComparison(data.priceComparison);
                    if (data.salesTrend) setSalesTrend(data.salesTrend);
                    if (data.topProducts) setTopProducts(data.topProducts);
                }
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Please log in to view analytics.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-10">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="green"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue}`}
                    icon={DollarSign}
                    color="purple"
                />
                <StatCard
                    title="Avg Rating"
                    value={stats.avgRating.toFixed(1)}
                    icon={Star}
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price Comparison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Price Comparison by Category
                    </h2>
                    {priceComparison.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priceComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="yourPrice" fill="#10b981" name="Your Price" />
                                <Bar dataKey="marketAvg" fill="#3b82f6" name="Market Avg" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No data available</p>
                    )}
                </div>

                {/* Sales Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} />
                        Sales Trend (Last 7 Days)
                    </h2>
                    {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" name="Orders" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No sales data yet</p>
                    )}
                </div>
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="space-y-3">
                        {topProducts.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`}
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                                <span className="text-gray-600">{product.quantity} units sold</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
