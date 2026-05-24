import api from '../api/axiosConfig'; // On importe 'api'

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

    // 5. Récupérer toutes les catégories pour la Navbar
    getCategories: async () => {
        try {
            const response = await api.get('categories');
            return response.data;
        } catch (error) {
            console.error("Erreur getCategories", error);
            return { status: 'error', data: [] }; 
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
}

};

export default ProductService;