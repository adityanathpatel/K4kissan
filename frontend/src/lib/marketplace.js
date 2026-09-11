import { ref, set, update, remove, onValue, push } from 'firebase/database';
import { database } from './firebase';
import { toRtdbValue, safeImageList, safeMediaUrl } from './rtdbSafe';
import { loadFarmerProducts } from '../data/farmerProductsStore';

function assertDb() {
    if (!database) {
        throw new Error('Database is not connected. Check Firebase configuration.');
    }
}

function assertUid(uid) {
    if (!uid) {
        throw new Error('You must be logged in to save this.');
    }
}

export function buildProductRecord(uid, productData, existingId) {
    const media = safeImageList(productData.images, productData.image_url || productData.image);
    const id = existingId || productData.id || `p-${Date.now()}`;
    return toRtdbValue({
        ...productData,
        ...media,
        video_url: safeMediaUrl(productData.video_url || productData.video, ''),
        video: null,
        id,
        farmer_id: uid,
        price: Number(productData.price) || 0,
        quantity: Number(productData.quantity) || 0,
        updated_at: new Date().toISOString(),
        created_at: productData.created_at || new Date().toISOString(),
    });
}

export async function saveFarmerProduct(uid, productData, existingId) {
    assertDb();
    assertUid(uid);
    const record = buildProductRecord(uid, productData, existingId);
    await set(ref(database, `farmer_products/${uid}/${record.id}`), record);
    await set(ref(database, `products/${record.id}`), {
        ...record,
        farmer_id: uid,
    });
    return record;
}

export async function updateFarmerProductRecord(uid, productId, productData) {
    assertDb();
    assertUid(uid);
    const record = buildProductRecord(uid, { ...productData, id: productId }, productId);
    await update(ref(database, `farmer_products/${uid}/${productId}`), record);
    await update(ref(database, `products/${productId}`), record);
    return record;
}

export async function deleteFarmerProductRecord(uid, productId) {
    assertDb();
    assertUid(uid);
    await remove(ref(database, `farmer_products/${uid}/${productId}`));
    await remove(ref(database, `products/${productId}`));
}

export async function saveBuyerRequirement(uid, requirement) {
    assertDb();
    assertUid(uid);
    const reqRef = push(ref(database, `buyer_requirements/${uid}`));
    const record = toRtdbValue({
        ...requirement,
        id: reqRef.key,
        buyer_id: uid,
        created_at: new Date().toISOString(),
    });
    await set(reqRef, record);
    await set(ref(database, `buyer_requirements_feed/${reqRef.key}`), record);
    return record;
}

export function subscribeAllFarmerProducts(callback) {
    if (!database) return () => {};
    const productsRef = ref(database, 'farmer_products');
    return onValue(productsRef, (snapshot) => {
        const list = [];
        if (snapshot.exists()) {
            snapshot.forEach((userSnap) => {
                const products = userSnap.val() || {};
                Object.entries(products).forEach(([id, val]) => {
                    list.push({ id, ...val });
                });
            });
        }
        list.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
        loadFarmerProducts(list);
        callback?.(list);
    });
}

export function formatFirebaseError(error) {
    const msg = `${error?.code || ''} ${error?.message || error || ''}`;
    if (msg.includes('PERMISSION_DENIED') || msg.includes('permission')) {
        return 'Database permission denied. Sign in again, and allow writes in Firebase Realtime Database rules.';
    }
    if (msg.includes('too large') || msg.includes('PAYLOAD')) {
        return 'The listing is too large to save. Use a photo URL instead of a large device upload.';
    }
    return error?.message || 'Could not save to the database.';
}
