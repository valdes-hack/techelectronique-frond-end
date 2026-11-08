export const getFullImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80";
    
    // Si l'URL contient une URL Cloudinary (même imbriquée dans un préfixe localhost corrompu)
    const cloudinaryMatch = url.match(/https?:\/\/res\.cloudinary\.com[^\s"']+/);
    if (cloudinaryMatch) {
        return cloudinaryMatch[0];
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const baseDomain = baseUrl.replace(/\/api\/v1\/?$/, ''); // Enlève /api/v1 à la fin

    if (url.startsWith('http://') || url.startsWith('https://')) {
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
