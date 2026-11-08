import api from '../api/axiosConfig'; // On importe 'api'
import { getFastCache, setFastCache } from '../utils/fastCache';

const ProductService = {
    // 1. Lister tous les produits (Paginé) avec cache rapide sur la première page
    getAll: async (page = 0, size = 12) => {
        const cacheKey = `products_${page}_${size}`;
        try {
            const response = await api.get('products', {
                params: { page, size }
            });
            if (response.data && response.data.status === 'success') {
                setFastCache(cacheKey, response.data, 3600); // 1h cache
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getAllProducts", error);
            const cached = getFastCache(cacheKey);
            if (cached) return cached;
            throw error;
        }
    },

    // 2. Recherche intelligente
    search: async (query, page = 0, size = 12) => {
        try {
            const response = await api.get('products/search', {
                params: { q: query, page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur search", error);
            throw error;
        }
    },

    // 3. Filtrer par catégorie
    getByCategory: async (slug, page = 0, size = 12) => {
        const cacheKey = `products_cat_${slug}_${page}_${size}`;
        try {
            const response = await api.get(`products/category/${slug}`, {
                params: { page, size }
            });
            if (response.data && response.data.status === 'success') {
                setFastCache(cacheKey, response.data, 3600);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getByCategory", error);
            const cached = getFastCache(cacheKey);
            if (cached) return cached;
            throw error;
        }
    },

    // 4. Détails d'un produit (Slug)
    getBySlug: async (slug) => {
        const cacheKey = `product_slug_${slug}`;
        try {
            const response = await api.get(`products/${slug}`);
            if (response.data && response.data.status === 'success') {
                setFastCache(cacheKey, response.data, 3600);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur detail produit", error);
            const cached = getFastCache(cacheKey);
            if (cached) return cached;
            throw error;
        }
    },

    // 5. Récupérer toutes les catégories pour la Navbar (Avec cache persistant 0ms)
    getCategories: async (forceRefresh = false) => {
        const cached = getFastCache('categories_all');
        if (!forceRefresh && cached) {
            // Revalidation silencieuse en arrière-plan sans bloquer
            api.get('categories').then(res => {
                if (res.data && res.data.status === 'success') {
                    setFastCache('categories_all', res.data, 86400);
                }
            }).catch(() => {});
            return cached;
        }
        try {
            const response = await api.get('categories');
            if (response.data && response.data.status === 'success') {
                setFastCache('categories_all', response.data, 86400);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getCategories", error);
            return cached || { status: 'error', data: [] }; 
        }
    },

    // Récupérer les catégories avec un échantillon de produits pour l'accueil (Avec cache persistant 0ms)
    getGroupedCategories: async (forceRefresh = false) => {
        const cached = getFastCache('grouped_categories');
        if (!forceRefresh && cached) {
            api.get('categories/grouped-products').then(res => {
                if (res.data && res.data.status === 'success') {
                    setFastCache('grouped_categories', res.data, 86400);
                }
            }).catch(() => {});
            return cached;
        }
        try {
            const response = await api.get('categories/grouped-products');
            if (response.data && response.data.status === 'success') {
                setFastCache('grouped_categories', response.data, 86400);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getGroupedCategories", error);
            return cached || { status: 'error', data: [] };
        }
    },
    
// Récupérer les avis d'un produit (p. 15 du Swagger)
getProductReviews: async (productId) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
},

// Poster un nouvel avis (p. 31 du Swagger)
// reviewData: { productId, orderId, rating, title, body }
postReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
},

// Poster un avis en tant qu'invité
postGuestReview: async (reviewData, token) => {
    const res = await api.post(`/reviews/guest?token=${token}`, reviewData);
    return res.data;
},

// 6. Récupérer les produits en promotion (discountPrice > 0)
getPromotions: async () => {
    try {
        const response = await api.get('products', {
            params: { page: 0, size: 100 }
        });
        if (response.data && response.data.status === 'success') {
            const list = response.data.data?.content || response.data.data || [];
            const promoList = list.filter(p => p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.basePrice));
            return { status: 'success', data: promoList };
        }
        return response.data;
    } catch (error) {
        console.error("Erreur getPromotions", error);
        throw error;
    }
}

};

export default ProductService;