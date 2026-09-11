import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, Clock3, MapPin, X, Timer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/firebase';
import { ref, set, get, child, onValue } from 'firebase/database';

const initialLoads = [
    { id: 'load-1', product: 'Wheat', quantity: '5,000 kg', pickup: 'Mandi, Lucknow', pickupCoords: [26.8467, 80.9462], dropoff: 'Central Warehouse, Kanpur', dropoffCoords: [26.4499, 80.3319], pickupTime: 'Today, 4:00 PM', deliveryDeadline: 'Today, 8:30 PM', distance: '92 km', duration: '2h 15m', payout: '₹4,500', status: 'available' },
    { id: 'load-2', product: 'Basmati Rice', quantity: '3,500 kg', pickup: 'Karnal Grain Market', pickupCoords: [29.6857, 76.9905], dropoff: 'Azadpur Wholesale Hub, Delhi', dropoffCoords: [28.7041, 77.1025], pickupTime: 'Tomorrow, 7:30 AM', deliveryDeadline: 'Tomorrow, 12:00 PM', distance: '128 km', duration: '3h 10m', payout: '₹6,200', status: 'available' },
    { id: 'load-3', product: 'Yellow Maize', quantity: '4,000 kg', pickup: 'Chhindwara Collection Point', pickupCoords: [22.0574, 78.9382], dropoff: 'Nehru Nagar Depot, Nagpur', dropoffCoords: [21.1458, 79.0882], pickupTime: 'Sep 10, 8:00 AM', deliveryDeadline: 'Sep 10, 1:30 PM', distance: '135 km', duration: '3h 20m', payout: '₹5,800', status: 'available' },
    { id: 'load-4', product: 'Red Ragi', quantity: '2,000 kg', pickup: 'Hassan Farmer Collective', pickupCoords: [13.0033, 76.1004], dropoff: 'Yeshwanthpur Market, Bengaluru', dropoffCoords: [13.0285, 77.5401], pickupTime: 'Sep 11, 6:00 AM', deliveryDeadline: 'Sep 11, 11:45 AM', distance: '190 km', duration: '4h 30m', payout: '₹7,400', status: 'available' },
];

const markerIcon = (color) => L.divIcon({ className: 'route-marker', html: `<span style="background:${color};border-color:white;width:16px;height:16px;border-radius:50%;display:block;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });

function FitRouteBounds({ load }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(L.latLngBounds([load.pickupCoords, load.dropoffCoords]), { padding: [60, 60], maxZoom: 14 });
    }, [load, map]);
    return null;
}

function LoadCard({ load, selected, onSelect, onAccept }) {
    return (
        <article onClick={onSelect} className={`cursor-pointer rounded-xl border p-4 transition-all ${selected ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20' : 'border-gray-200 bg-white hover:border-emerald-300'}`}>
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-gray-800">{load.product} <span className="font-semibold text-emerald-700">— {load.quantity}</span></h3>
                <span className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">{load.payout}</span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />{load.pickup}</div>
                <div className="ml-1 h-3 border-l border-dotted border-gray-400" />
                <div className="flex items-center gap-2"><MapPin size={15} className="text-red-600" />{load.dropoff}</div>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock3 size={14} className="text-emerald-600" /><strong>Pickup:</strong> {load.pickupTime}</span>
                    <span className="font-semibold text-gray-700">{load.distance}</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                    <Timer size={13} className="text-amber-600" />
                    <span>Deadline: {load.deliveryDeadline}</span>
                </div>
            </div>
            <button type="button" disabled={load.status === 'accepted'} onClick={(event) => { event.stopPropagation(); onAccept(load); }} className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold ${load.status === 'accepted' ? 'cursor-not-allowed bg-gray-200 text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'}`}>{load.status === 'accepted' ? '✓ Job Accepted' : 'Accept Delivery'}</button>
        </article>
    );
}

export default function TransporterDashboard() {
    const { user } = useAuth();
    const [loads, setLoads] = useState(initialLoads);
    const [selectedLoad, setSelectedLoad] = useState(initialLoads[0]);
    const [acceptedLoadId, setAcceptedLoadId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pendingAcceptance, setPendingAcceptance] = useState(null);
    const [toast, setToast] = useState('');

    // Load available jobs and previously accepted jobs from Firebase on mount
    useEffect(() => {
        if (!user || !database) return;
        const uid = user.uid || user.id;
        const jobsRef = ref(database, `transporter_jobs/${uid}`);
        const reqsRef = ref(database, `transporter_requests`);
        
        let localAccepted = {};

        const unsubJobs = onValue(jobsRef, (snapshot) => {
            if (snapshot.exists()) {
                localAccepted = snapshot.val();
                // Restore the last accepted job ID
                const acceptedJob = Object.entries(localAccepted).find(([, v]) => v.status === 'accepted');
                if (acceptedJob) setAcceptedLoadId(acceptedJob[0]);
            } else {
                localAccepted = {};
            }
        });

        const unsubReqs = onValue(reqsRef, (snapshot) => {
            const liveLoads = [];
            if (snapshot.exists()) {
                const reqs = snapshot.val();
                Object.values(reqs).forEach(req => {
                    // Only show available, or if the current transporter accepted it
                    if (req.status === 'available' || (localAccepted[req.id] && localAccepted[req.id].status === 'accepted')) {
                        liveLoads.push(localAccepted[req.id] ? { ...req, status: 'accepted' } : req);
                    }
                });
            }
            // Combine with initialLoads
            const combined = [...initialLoads];
            liveLoads.forEach(liveLoad => {
                const existingIdx = combined.findIndex(l => l.id === liveLoad.id);
                if (existingIdx >= 0) combined[existingIdx] = liveLoad;
                else combined.unshift(liveLoad);
            });

            // Map accepted status from local accepted
            const finalLoads = combined.map(load => {
                const savedJob = localAccepted[load.id];
                return savedJob ? { ...load, status: savedJob.status } : load;
            });
            setLoads(finalLoads);
            if (!selectedLoad || !finalLoads.find(l => l.id === selectedLoad.id)) {
                setSelectedLoad(finalLoads[0] || initialLoads[0]);
            }
        });

        return () => { unsubJobs(); unsubReqs(); };
    }, [user, selectedLoad]);

    const requestAcceptance = (load) => { setPendingAcceptance(load); setShowModal(true); };

    const confirmAcceptance = async () => {
        const updatedLoads = loads.map((load) =>
            load.id === pendingAcceptance.id ? { ...load, status: 'accepted' } : load
        );
        setLoads(updatedLoads);
        setAcceptedLoadId(pendingAcceptance.id);
        setSelectedLoad({ ...pendingAcceptance, status: 'accepted' });
        setShowModal(false);
        setPendingAcceptance(null);
        setToast('Trip Accepted! Navigation route sent to your phone');
        window.setTimeout(() => setToast(''), 4000);

        // Save accepted job to Firebase
        if (user && database) {
            const uid = user.uid || user.id;
            try {
                const jobUpdate = {
                    ...pendingAcceptance,
                    status: 'accepted',
                    accepted_at: new Date().toISOString(),
                    transporter_id: uid
                };
                await set(ref(database, `transporter_jobs/${uid}/${pendingAcceptance.id}`), jobUpdate);
                
                // If it is a dynamic request from buyer, update it there too
                if (pendingAcceptance.req_id) {
                    await set(ref(database, `transporter_requests/${pendingAcceptance.id}`), jobUpdate);
                    // Also notify buyer via buyer_requirements update
                    if (pendingAcceptance.buyer_id) {
                        const reqRef = ref(database, `buyer_requirements/${pendingAcceptance.buyer_id}/${pendingAcceptance.req_id}`);
                        get(reqRef).then(snapshot => {
                            if (snapshot.exists()) {
                                set(reqRef, { ...snapshot.val(), status: 'Transport Booked' });
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn('Firebase job save notice:', e);
            }
        }
    };

    return (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-12">
            <section className="flex flex-col gap-4 lg:col-span-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Available Delivery Jobs</h1>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{loads.filter((load) => load.status === 'available').length} Available</span>
                </div>
                <div className="max-h-[700px] space-y-4 overflow-y-auto pr-2">
                    {loads.map((load) => <LoadCard key={load.id} load={load} selected={selectedLoad.id === load.id} onSelect={() => setSelectedLoad(load)} onAccept={requestAcceptance} />)}
                </div>
            </section>
            <section className="sticky top-6 h-[600px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-7">
                <MapContainer center={selectedLoad.pickupCoords} zoom={8} className="h-full w-full">
                    <TileLayer
                        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        maxZoom={20}
                        attribution="&copy; Google Maps"
                    />
                    <FitRouteBounds load={selectedLoad} />
                    <Marker position={selectedLoad.pickupCoords} icon={markerIcon('#16a34a')}>
                        <Popup>{selectedLoad.pickup}</Popup>
                    </Marker>
                    <Marker position={selectedLoad.dropoffCoords} icon={markerIcon('#dc2626')}>
                        <Popup>{selectedLoad.dropoff}</Popup>
                    </Marker>
                    <Polyline positions={[selectedLoad.pickupCoords, selectedLoad.dropoffCoords]} pathOptions={{ color: '#16a34a', weight: 4 }} />
                </MapContainer>
                <div className="absolute left-4 right-4 top-4 z-[1000] rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected route</p>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-gray-900">{selectedLoad.pickup.split(',')[0]} ➔ {selectedLoad.dropoff.split(',')[0]}</h2>
                                {acceptedLoadId === selectedLoad.id && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Accepted</span>}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">Distance: {selectedLoad.distance} | Est. Time: {selectedLoad.duration}</p>
                        </div>
                        <p className="text-lg font-bold text-emerald-700">{selectedLoad.payout}</p>
                    </div>
                </div>
            </section>
            {toast && <div className="fixed bottom-6 right-6 z-[1100] flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl"><Check size={17} className="text-emerald-400" />{toast}</div>}
            {showModal && pendingAcceptance && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Confirm delivery</h2>
                            <button type="button" onClick={() => setShowModal(false)} aria-label="Close"><X size={20} /></button>
                        </div>
                        <p className="mt-4 text-gray-600">Accept the {pendingAcceptance.product} trip from {pendingAcceptance.pickup} to {pendingAcceptance.dropoff}?</p>
                        <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                            <div className="flex justify-between text-sm"><span>Payout</span><strong className="text-emerald-800">{pendingAcceptance.payout}</strong></div>
                            <div className="mt-2 flex justify-between text-sm"><span>Distance</span><span>{pendingAcceptance.distance}</span></div>
                            <div className="mt-2 flex justify-between text-sm text-amber-800 font-semibold"><span>Delivery Deadline</span><span>{pendingAcceptance.deliveryDeadline}</span></div>
                        </div>
                        <button type="button" onClick={confirmAcceptance} className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700">Confirm Acceptance</button>
                    </div>
                </div>
            )}
        </div>
    );
}
