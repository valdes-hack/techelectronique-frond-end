export const getFullImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const baseDomain = baseUrl.replace(/\/api\/v1\/?$/, ''); // Enlève /api/v1 à la fin

    if (url.startsWith('http')) {
        // Corrige les URLs localhost enregistrées en base si on est en production
        if (url.includes('localhost') && !baseDomain.includes('localhost')) {
            const parts = url.split('/uploads/');
            if (parts.length > 1) {
                return `${baseDomain}/uploads/${parts[1]}`;
            }
        }
        return url;
    }
    
    return `${baseDomain}/uploads/products/${url}`;
};
