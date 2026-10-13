import api from '../api/axiosConfig'; // On importe 'api'

// Cache mémoire client (évite les requêtes réseau répétitives lors de la navigation)
let categoriesCache = null;
let groupedCategoriesCache = null;

const ProductService = {
    // 1. Lister tous les produits (Paginé)
    getAll: async (page = 0, size = 12) => {
        try {
            const response = await api.get('products', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur getAllProducts", error);
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
        try {
            const response = await api.get(`products/category/${slug}`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur getByCategory", error);
            throw error;
        }
    },

    // 4. Détails d'un produit (Slug)
    getBySlug: async (slug) => {
        try {
            const response = await api.get(`products/${slug}`);
            return response.data;
        } catch (error) {
            console.error("Erreur detail produit", error);
            throw error;
        }
    },

    // 5. Récupérer toutes les catégories pour la Navbar (Avec cache mémoire client)
    getCategories: async (forceRefresh = false) => {
        if (!forceRefresh && categoriesCache) {
            return categoriesCache;
        }
        try {
            const response = await api.get('categories');
            if (response.data && response.data.status === 'success') {
                categoriesCache = response.data;
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getCategories", error);
            return categoriesCache || { status: 'error', data: [] }; 
        }
    },

    // Récupérer les catégories avec un échantillon de produits pour l'accueil (Avec cache mémoire client)
    getGroupedCategories: async (forceRefresh = false) => {
        if (!forceRefresh && groupedCategoriesCache) {
            return groupedCategoriesCache;
        }
        try {
            const response = await api.get('categories/grouped-products');
            if (response.data && response.data.status === 'success') {
                groupedCategoriesCache = response.data;
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getGroupedCategories", error);
            return groupedCategoriesCache || { status: 'error', data: [] };
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