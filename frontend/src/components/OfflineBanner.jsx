import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = ({ isOnline }) => {
    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50 flex items-center justify-center gap-2">
            <WifiOff size={20} />
            <span className="font-medium">You are currently offline. Showing cached content.</span>
        </div>
    );
};

export default OfflineBanner;
