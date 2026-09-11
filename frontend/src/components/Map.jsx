import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ products, center = [20.5937, 78.9629], zoom = 5 }) => {
    const navigate = useNavigate();

    // Filter products that have coordinates
    const productsWithCoords = products.filter(p => p.latitude && p.longitude);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
                attribution="&copy; Google Maps"
            />

            {productsWithCoords.map(product => (
                <Marker
                    key={product.id}
                    position={[product.latitude, product.longitude]}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{product.location}</p>
                            <p className="text-green-600 font-bold text-lg mb-2">
                                ₹{product.price}/{product.unit}
                            </p>
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                                View Details
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
