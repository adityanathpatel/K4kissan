/**
 * farmerProductsStore.js
 * Shared reactive store — products added by farmers in FarmerDashboard are
 * immediately reflected on the Landing (Home) page via a pub-sub pattern.
 *
 * Flow:
 *  1. Home page calls subscribeProducts(cb) — gets updates whenever list changes
 *  2. FarmerDashboard saves to Firebase AND calls addFarmerProduct() here
 *  3. All subscribers (Home) instantly receive the updated list
 *
 * Firebase sync layer is in FarmerDashboard.jsx (authoritative write path).
 * This store holds a merged view: seed catalog + any runtime-added products.
 */

import { grainProducts as seedProducts } from './grainProducts';

// Build a normalised seed list so Home always has initial products
const normalisedSeed = seedProducts.map(p => ({
    ...p,
    _source: 'seed',
}));

// Mutable working copy
let _products = [...normalisedSeed];

// Subscribers
const _listeners = new Set();

/** Get current snapshot */
export function getProducts() {
    return _products;
}

/** Subscribe to changes — returns an unsubscribe function */
export function subscribeProducts(callback) {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
}

function _notify() {
    const snapshot = [..._products];
    _listeners.forEach(cb => cb(snapshot));
}

/**
 * Normalise a raw Firebase product record to match the shape
 * expected by the Home and Buyer product cards.
 */
function normaliseFarmerProduct(raw) {
    const rawImages = Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : [raw.image_url || raw.image].filter(Boolean);
    const mainImage = rawImages[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800';

    return {
        // Core identity
        id:          raw.id || `fp-${Date.now()}`,
        name:        raw.name        || 'Unnamed Product',
        description: raw.description || '',
        price:       Number(raw.price) || 0,
        unit:        raw.unit        || 'kg',
        quantity:    Number(raw.quantity) || 0,
        category:    raw.category    || 'Others',
        image:       mainImage,
        image_url:   mainImage,
        images:      rawImages.length > 0 ? rawImages : [mainImage],
        video_url:   raw.video_url || raw.video || '',

        // Card display fields
        variety:     raw.category    || 'Farm Fresh',
        organic:     false,
        rating:      raw.rating      || 4.5,
        reviewCount: raw.reviewCount || 0,

        // Farmer info block (required by Home card)
        farmer: raw.farmer || {
            name:     raw.farmerName  || 'K4kissan Farmer',
            avatar:   raw.farmerAvatar|| 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            location: raw.location    || 'India',
            rating:   raw.farmerRating|| 4.5,
        },

        // Metadata
        location:  raw.location  || '',
        _source:   'farmer',
        _isCustom: true,
        farmer_id: raw.farmer_id || '',
        created_at: raw.created_at || new Date().toISOString(),
    };
}

/**
 * Add a new farmer product (called from FarmerDashboard after Firebase write).
 * Returns the normalised product.
 */
export function addFarmerProduct(rawProduct) {
    const product = normaliseFarmerProduct(rawProduct);
    // Avoid duplicates if the store is refreshed
    if (!_products.find(p => p.id === product.id)) {
        _products = [product, ..._products];
        _notify();
    }
    return product;
}

/**
 * Bulk-load all farmer products for a user (called after Firebase fetch).
 * Merges with seed data — seed items are kept, farmer items are prepended.
 */
export function loadFarmerProducts(rawList) {
    const seeds    = _products.filter(p => p._source === 'seed');
    const farmer   = rawList.map(normaliseFarmerProduct);
    // Deduplicate by id
    const seen = new Set();
    const merged = [...farmer, ...seeds].filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });
    _products = merged;
    _notify();
}

/** Update an existing product */
export function updateFarmerProduct(id, updates) {
    _products = _products.map(p =>
        p.id === id ? normaliseFarmerProduct({ ...p, ...updates }) : p
    );
    _notify();
}

/** Remove a product */
export function removeFarmerProduct(id) {
    _products = _products.filter(p => p.id !== id);
    _notify();
}
