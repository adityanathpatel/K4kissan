import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Truck, MapPin, Calendar, Clock, DollarSign, CheckCircle, Navigation, AlertCircle, X, ShieldCheck, Timer } from 'lucide-react';

// Custom Leaflet Icons
const pickupIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: `<div style="background-color: #16a34a; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div>
        </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const dropoffIcon = L.divIcon({
  className: 'custom-dropoff-marker',
  html: `<div style="background-color: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="background: white; width: 8px; height: 8px; border-radius: 50%;"></div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to auto-fit map view bounds
function FitBoundsToRoute({ pickup, dropoff }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
    }
  }, [pickup, dropoff, map]);

  return null;
}

// 1 Quintal = 100 kg mathematical conversion applied throughout
const initialLoads = [
  {
    id: 'TRIP-701',
    crop: 'MP Sharbati Wheat',
    weight: '5,000 kg', // 50 Quintals = 5,000 kg
    pickup: {
      location: 'Mandi, Lucknow',
      lat: 26.8467,
      lng: 80.9462
    },
    dropoff: {
      location: 'Central Warehouse, Kanpur',
      lat: 26.4499,
      lng: 80.3319
    },
    pickupTime: 'Today, 4:00 PM',
    deliveryDeadline: 'Today, 8:30 PM',
    distance: '92 km',
    estTime: '2h 15m',
    payout: 4500,
    status: 'available',
    farmerName: 'Rameshwar Patel',
    farmerPhone: '+91 98123 76543'
  },
  {
    id: 'TRIP-702',
    crop: '1121 Raw Basmati Rice',
    weight: '8,000 kg', // 80 Quintals = 8,000 kg
    pickup: {
      location: 'Grain Mandi, Karnal',
      lat: 29.6857,
      lng: 76.9905
    },
    dropoff: {
      location: 'Azadpur Wholesale Mandi, Delhi',
      lat: 28.7159,
      lng: 77.1783
    },
    pickupTime: 'Tomorrow, 6:00 AM',
    deliveryDeadline: 'Tomorrow, 11:30 AM',
    distance: '128 km',
    estTime: '2h 45m',
    payout: 6800,
    status: 'available',
    farmerName: 'Sardar Gurpreet Singh',
    farmerPhone: '+91 98765 43210'
  },
  {
    id: 'TRIP-703',
    crop: 'Desi Golden Maize Corn',
    weight: '4,000 kg', // 40 Quintals = 4,000 kg
    pickup: {
      location: 'Krishi Upaj Mandi, Sehore',
      lat: 23.2033,
      lng: 77.0844
    },
    dropoff: {
      location: 'Food Processing Plant, Bhopal',
      lat: 23.2599,
      lng: 77.4126
    },
    pickupTime: 'Today, 6:30 PM',
    deliveryDeadline: 'Today, 9:00 PM',
    distance: '38 km',
    estTime: '55m',
    payout: 2400,
    status: 'available',
    farmerName: 'Rajendra Singh Gurjar',
    farmerPhone: '+91 97555 88990'
  },
  {
    id: 'TRIP-704',
    crop: 'Organic Red Ragi Grains',
    weight: '3,500 kg', // 35 Quintals = 3,500 kg
    pickup: {
      location: 'APMC Yard, Mandya',
      lat: 12.5218,
      lng: 76.8951
    },
    dropoff: {
      location: 'Yeshwanthpur Subzi Market, Bengaluru',
      lat: 13.0285,
      lng: 77.5407
    },
    pickupTime: 'Tomorrow, 7:00 AM',
    deliveryDeadline: 'Tomorrow, 12:00 PM',
    distance: '105 km',
    estTime: '2h 30m',
    payout: 5200,
    status: 'available',
    farmerName: 'Kavita Sharma',
    farmerPhone: '+91 94480 11223'
  },
  {
    id: 'TRIP-705',
    crop: 'Maldandi White Jowar (Sorghum)',
    weight: '6,000 kg', // 60 Quintals = 6,000 kg
    pickup: {
      location: 'Market Yard, Solapur',
      lat: 17.6599,
      lng: 75.9064
    },
    dropoff: {
      location: 'Agro Depot, Pune',
      lat: 18.5204,
      lng: 73.8567
    },
    pickupTime: 'Sep 09, 10:00 AM',
    deliveryDeadline: 'Sep 09, 5:30 PM',
    distance: '248 km',
    estTime: '4h 50m',
    payout: 11500,
    status: 'available',
    farmerName: 'Babu Rao Deshmukh',
    farmerPhone: '+91 98220 54321'
  }
];

export default function TransporterDashboard() {
  const [loads, setLoads] = useState(initialLoads);
  const [selectedLoad, setSelectedLoad] = useState(initialLoads[0]);
  const [acceptedLoadId, setAcceptedLoadId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingModalLoad, setPendingModalLoad] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenModal = (load) => {
    setPendingModalLoad(load);
    setShowModal(true);
  };

  const handleConfirmAccept = () => {
    if (!pendingModalLoad) return;

    const targetId = pendingModalLoad.id;
    setLoads((prev) =>
      prev.map((l) => (l.id === targetId ? { ...l, status: 'accepted' } : l))
    );
    setAcceptedLoadId(targetId);
    setSelectedLoad((prev) => (prev.id === targetId ? { ...prev, status: 'accepted' } : prev));
    setShowModal(false);
    setPendingModalLoad(null);

    // Trigger toast notification
    setToastMessage('Trip Accepted! Navigation route sent to your phone');
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const availableCount = loads.filter((l) => l.status === 'available').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-fade-in">
          <CheckCircle size={20} className="text-[#00ff33]" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Left Column (Load Cards Feed) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Header with Live Counter Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Truck className="text-emerald-600" size={24} />
              Available Delivery Jobs
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any load to view route on the interactive GPS map
            </p>
          </div>

          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
            {availableCount} Available
          </span>
        </div>

        {/* Vertical Scroll Area */}
        <div className="max-h-[700px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
          {loads.map((load) => {
            const isSelected = selectedLoad?.id === load.id;
            const isAccepted = load.status === 'accepted';

            return (
              <div
                key={load.id}
                onClick={() => setSelectedLoad(load)}
                className={`border rounded-xl p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                {/* Top Bar: Crop/Product & Weight + Payout Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {load.crop} — <span className="text-emerald-700 font-bold">{load.weight}</span>
                    </h3>
                    <div className="text-[11px] text-gray-400 font-medium">Job #{load.id}</div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm shrink-0 shadow-2xs">
                    ₹{load.payout.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Route Info (From ➔ To) */}
                <div className="mt-4 space-y-1">
                  {/* Pickup */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                    <span className="truncate">{load.pickup.location}</span>
                  </div>

                  {/* Connecting Line */}
                  <div className="ml-1 pl-2 border-l-2 border-dashed border-gray-300 h-4 my-0.5"></div>

                  {/* Delivery */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                    <MapPin size={12} className="text-red-600 shrink-0" />
                    <span className="truncate">{load.dropoff.location}</span>
                  </div>
                </div>

                {/* Pickup Time & Delivery Deadline Time Row */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-emerald-600" />
                      <strong>Pickup:</strong> {load.pickupTime}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {load.distance} ({load.estTime})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-[11px] font-semibold">
                    <span className="flex items-center gap-1">
                      <Timer size={13} className="text-amber-600" />
                      <span>Delivery Deadline:</span>
                    </span>
                    <span className="font-bold">{load.deliveryDeadline}</span>
                  </div>
                </div>

                {/* Action Button */}
                {load.status === 'available' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLoad(load);
                      handleOpenModal(load);
                    }}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition shadow-xs cursor-pointer"
                  >
                    Accept Delivery
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-3 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={15} className="text-emerald-600" />
                    Job Accepted
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column (Sticky Route Map) */}
      <div className="lg:col-span-7 sticky top-6 h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
        
        {/* Floating Route Header (Overlayed at top of map) */}
        {selectedLoad && (
          <div className="absolute top-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Route</div>
              <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                <span>{selectedLoad.pickup.location.split(',')[0]}</span>
                <span className="text-emerald-600 font-bold">➔</span>
                <span>{selectedLoad.dropoff.location.split(',')[0]}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Distance: <strong className="text-gray-800">{selectedLoad.distance}</strong> | Est. Time: <strong className="text-gray-800">{selectedLoad.estTime}</strong>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Earnings</div>
              <div className="text-xl font-black text-emerald-700">
                ₹{selectedLoad.payout.toLocaleString('en-IN')}
              </div>
              {selectedLoad.status === 'accepted' && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ✓ Confirmed Trip
                </span>
              )}
            </div>
          </div>
        )}

        {/* Leaflet Interactive Route Map with Google Maps Tiles */}
        <MapContainer
          center={[26.8467, 80.9462]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
            attribution="&copy; Google Maps"
          />

          {selectedLoad && (
            <>
              {/* Pickup Marker (Green) */}
              <Marker
                position={[selectedLoad.pickup.lat, selectedLoad.pickup.lng]}
                icon={pickupIcon}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <strong className="text-emerald-700 text-xs uppercase block">Pickup Location</strong>
                    <div className="font-bold text-sm text-gray-800">{selectedLoad.pickup.location}</div>
                    <div className="text-xs text-gray-500 mt-1">Farmer: {selectedLoad.farmerName}</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">Pickup: {selectedLoad.pickupTime}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Delivery Marker (Red) */}
              <Marker
                position={[selectedLoad.dropoff.lat, selectedLoad.dropoff.lng]}
                icon={dropoffIcon}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <strong className="text-red-700 text-xs uppercase block">Dropoff Destination</strong>
                    <div className="font-bold text-sm text-gray-800">{selectedLoad.dropoff.location}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">Payout: ₹{selectedLoad.payout}</div>
                    <div className="text-xs text-amber-700 font-semibold mt-0.5">Deadline: {selectedLoad.deliveryDeadline}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Connecting Polyline Route */}
              <Polyline
                positions={[
                  [selectedLoad.pickup.lat, selectedLoad.pickup.lng],
                  [selectedLoad.dropoff.lat, selectedLoad.dropoff.lng]
                ]}
                color="#16a34a"
                weight={4}
                opacity={0.85}
                dashArray="8, 8"
              />

              {/* Bounds Fitter */}
              <FitBoundsToRoute
                pickup={selectedLoad.pickup}
                dropoff={selectedLoad.dropoff}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Confirmation Modal */}
      {showModal && pendingModalLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-lg">
                <Truck size={20} />
                <span>Confirm Delivery Acceptance</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <div className="font-bold text-gray-900">{pendingModalLoad.crop} ({pendingModalLoad.weight})</div>
                <div className="text-xs text-gray-500">Trip ID: #{pendingModalLoad.id}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                  <span className="text-gray-500">Pickup:</span>
                  <strong className="text-gray-800">{pendingModalLoad.pickup.location}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-red-600 shrink-0" />
                  <span className="text-gray-500">Dropoff:</span>
                  <strong className="text-gray-800">{pendingModalLoad.dropoff.location}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">Pickup Time:</span>
                  <strong className="text-gray-800">{pendingModalLoad.pickupTime}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={12} className="text-amber-600 shrink-0" />
                  <span className="text-gray-500">Delivery Deadline:</span>
                  <strong className="text-amber-800 font-bold">{pendingModalLoad.deliveryDeadline}</strong>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Total Guaranteed Payout</span>
                <span className="text-xl font-black text-emerald-700">₹{pendingModalLoad.payout.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
