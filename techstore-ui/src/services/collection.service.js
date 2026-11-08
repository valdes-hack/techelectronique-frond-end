import api from '../api/axiosConfig';
import { getFastCache, setFastCache, clearFastCachePrefix } from '../utils/fastCache';

// Après toute modification admin, on vide le cache vitrine (liste + détails) pour que les clients voient les changements.
const invalidateCache = () => clearFastCachePrefix('collection');

/**
 * CollectionService - Gestion des COLLECTIONS (rayons) de la boutique.
 * Modèle "Shopify-like" : une collection regroupe des produits via une table
 * de liaison, un produit peut appartenir à plusieurs collections.
 */
const CollectionService = {

    // ==========================================
    // 🌍 PUBLIC
    // ==========================================

    /**
     * Toutes les collections actives (Navbar, page /collections)
     * Cache 24h avec revalidation silencieuse en arrière-plan.
     */
    getAll: async (forceRefresh = false) => {
        const cached = getFastCache('collections_all');
        if (!forceRefresh && cached) {
            api.get('collections').then(res => {
                if (res.data && res.data.status === 'success') {
                    setFastCache('collections_all', res.data, 86400);
                }
            }).catch(() => {});
            return cached;
        }
        try {
            const response = await api.get('collections');
            if (response.data && response.data.status === 'success') {
                setFastCache('collections_all', response.data, 86400);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getAllCollections", error);
            return cached || { status: 'error', data: [] };
        }
    },

    /**
     * Détail d'une collection par slug
     */
    getBySlug: async (slug) => {
        const cacheKey = `collection_slug_${slug}`;
        const cached = getFastCache(cacheKey);
        if (cached) return cached;
        try {
            const response = await api.get(`collections/${slug}`);
            if (response.data && response.data.status === 'success') {
                setFastCache(cacheKey, response.data, 3600);
            }
            return response.data;
        } catch (error) {
            console.error("Erreur getCollectionBySlug", error);
            return cached || { status: 'error' };
        }
    },

    /**
     * Produits ACTIFS d'une collection (paginés)
     */
    getProducts: async (slug, page = 0, size = 12) => {
        try {
            const response = await api.get(`collections/${slug}/products`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur getCollectionProducts", error);
            throw error;
        }
    },

    // ==========================================
    // 🔐 ADMIN
    // ==========================================

    /** Toutes les collections (y compris inactives) */
    adminGetAll: async () => {
        const response = await api.get('/admin/collections');
        return response.data;
    },

    /** Collections contenant un produit donné (page produit) */
    adminGetByProduct: async (productId) => {
        const response = await api.get(`/admin/collections/by-product/${productId}`);
        return response.data;
    },

    adminCreate: async (collectionData) => {
        const response = await api.post('/admin/collections', collectionData);
        invalidateCache();
        return response.data;
    },

    adminUpdate: async (id, collectionData) => {
        const response = await api.put(`/admin/collections/${id}`, collectionData);
        invalidateCache();
        return response.data;
    },

    adminDelete: async (id) => {
        const response = await api.delete(`/admin/collections/${id}`);
        invalidateCache();
        return response.data;
    },

    /** Produits liés à une collection (admin, y compris inactifs) */
    adminGetProducts: async (id, page = 0, size = 100) => {
        const response = await api.get(`/admin/collections/${id}/products`, {
            params: { page, size }
        });
        return response.data;
    },

    /** Lier un produit à une collection */
    adminAddProduct: async (collectionId, productId) => {
        const response = await api.post(`/admin/collections/${collectionId}/products/${productId}`);
        invalidateCache();
        return response.data;
    },

    /** Délier un produit d'une collection */
    adminRemoveProduct: async (collectionId, productId) => {
        const response = await api.delete(`/admin/collections/${collectionId}/products/${productId}`);
        invalidateCache();
        return response.data;
    },

    /** Remplacer toute la liste des produits d'une collection */
    adminSetProducts: async (collectionId, productIds) => {
        const response = await api.put(`/admin/collections/${collectionId}/products`, productIds);
        invalidateCache();
        return response.data;
    },
};

export default CollectionService;
