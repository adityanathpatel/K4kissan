import React from 'react';
import { CheckCircle, Circle, Package, Truck, MapPin } from 'lucide-react';

const DeliveryTracker = ({ tracking }) => {
    if (!tracking) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No tracking information available yet.</p>
            </div>
        );
    }

    const statuses = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'packed', label: 'Packed', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: MapPin }
    ];

    const currentIndex = statuses.findIndex(s => s.key === tracking.status);

    return (
        <div className="space-y-6">
            {/* Status Timeline */}
            <div className="relative">
                {statuses.map((status, index) => {
                    const Icon = status.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={status.key} className="flex items-center mb-8 last:mb-0">
                            {/* Icon */}
                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 
                ${isCompleted ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                                {isCompleted ? (
                                    <Icon size={24} className="text-white" />
                                ) : (
                                    <Circle size={24} className="text-gray-400" />
                                )}
                            </div>

                            {/* Line to next status */}
                            {index < statuses.length - 1 && (
                                <div className={`absolute left-6 w-0.5 h-20 mt-12 
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}
                                    style={{ height: '60px' }}
                                />
                            )}

                            {/* Label */}
                            <div className="ml-4">
                                <p className={`font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {status.label}
                                </p>
                                {isCurrent && tracking.updated_at && (
                                    <p className="text-xs text-gray-500">
                                        {new Date(tracking.updated_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-3">
                {tracking.tracking_number && (
                    <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-mono font-medium">{tracking.tracking_number}</p>
                    </div>
                )}

                {tracking.delivery_partner && (
                    <div>
                        <p className="text-sm text-gray-600">Delivery Partner</p>
                        <p className="font-medium">{tracking.delivery_partner}</p>
                    </div>
                )}

                {tracking.current_location && (
                    <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-medium">{tracking.current_location}</p>
                    </div>
                )}

                {tracking.estimated_delivery && (
                    <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium">
                            {new Date(tracking.estimated_delivery).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {tracking.notes && (
                    <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm">{tracking.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryTracker;
