import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'green' }) => {
    const colorClasses = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                {Icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
                <p className="text-sm text-gray-500 mt-2">{trend}</p>
            )}
        </div>
    );
};

export default StatCard;
