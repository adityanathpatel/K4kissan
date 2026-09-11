/** Strip values Firebase Realtime Database cannot store (undefined, huge data-URLs). */
export function toRtdbValue(value) {
    return JSON.parse(
        JSON.stringify(value, (_key, v) => {
            if (v === undefined) return null;
            if (typeof v === 'string' && v.startsWith('data:') && v.length > 1500) {
                return null;
            }
            return v;
        })
    );
}

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800';

export function safeMediaUrl(url, fallback = PLACEHOLDER_IMAGE) {
    if (!url || typeof url !== 'string') return fallback;
    if (url.startsWith('data:')) return fallback;
    return url;
}

export function safeImageList(images, cover) {
    const list = Array.isArray(images) ? images : [];
    const urls = list
        .map((img) => safeMediaUrl(img, ''))
        .filter(Boolean);
    const coverUrl = safeMediaUrl(cover, urls[0] || PLACEHOLDER_IMAGE);
    if (!urls.length) return { images: [coverUrl], image_url: coverUrl, image: coverUrl };
    return { images: urls, image_url: urls[0], image: urls[0] };
}
