import api from '../api/axiosConfig';

/**
 * AdminService - Gestion centralisée des appels API d'administration
 * Optimisé pour gérer le JSON et le Multipart (Images)
 */
const AdminService = {
    
    // ==========================================
    // 👤 GESTION DES UTILISATEURS
    // ==========================================

    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    toggleUserStatus: async (id) => {
        const response = await api.patch(`/admin/users/${id}/toggle-status`);
        return response.data;
    },

    resetUserPassword: async (id, newPassword) => {
        const response = await api.patch(`/admin/users/${id}/reset-password`, { newPassword });
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // ==========================================
    // 📦 GESTION DES PRODUITS (Multipart compatible)
    // ==========================================

    getAdminProducts: async () => {
        const response = await api.get('/admin/products');
        return response.data;
    },

    /**
     * Crée un produit (JSON + Fichiers)
     */
    createProduct: async (productData, files) => {
        const formData = new FormData();
        
        // Emballage obligatoire du JSON en Blob avec type application/json
        const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
        formData.append('product', productBlob);

        if (files && files.length > 0) {
            files.forEach(file => formData.append('files', file));
        }

        const response = await api.post('/admin/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Modifie un produit (JSON + Fichiers)
     */
    updateProduct: async (id, productData, files) => {
        const formData = new FormData();
        
        const productBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
        formData.append('product', productBlob);

        if (files && files.length > 0) {
            files.forEach(file => formData.append('files', file));
        }

        // Selon ton Swagger, le PUT pour le produit est aussi en multipart/form-data
        const response = await api.put(`/admin/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    },

    // ==========================================
    // 🏷️ GESTION DES CATÉGORIES (Multipart compatible)
    // ==========================================

    getAllAdminCategories: async () => {
        const response = await api.get('/admin/categories');
        return response.data;
    },

    createCategory: async (formData) => {
        const response = await api.post('/admin/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateCategory: async (id, formData) => {
        const response = await api.put(`/admin/categories/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // ==========================================
    // 🚚 GESTION DES FOURNISSEURS
    // ==========================================

    getSuppliers: async () => {
        const response = await api.get('/admin/suppliers');
        return response.data;
    },

    getSupplierById: async (id) => {
        const response = await api.get(`/admin/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (supplierData) => {
        const response = await api.post('/admin/suppliers', supplierData);
        return response.data;
    },

    updateSupplier: async (id, supplierData) => {
        const response = await api.put(`/admin/suppliers/${id}`, supplierData);
        return response.data;
    },

    deleteSupplier: async (id) => {
        const response = await api.delete(`/admin/suppliers/${id}`);
        return response.data;
    },

    // ==========================================
    // 🧾 GESTION DES COMMANDES
    // ==========================================

    getOrders: async () => {
        const response = await api.get('/admin/orders');
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/orders/${orderId}/status?status=${status}`);
        return response.data;
    },

    // ==========================================
    // 🚀 GESTION DU STOCK (RAVITAILLEMENT)
    // ==========================================

    supplyStock: async (supplyData) => {
        // Normalisation des données pour éviter les erreurs de type côté Backend
        const payload = {
            productId: parseInt(supplyData.productId),
            supplierId: parseInt(supplyData.supplierId),
            quantity: parseInt(supplyData.quantity),
            purchasePrice: parseFloat(supplyData.purchasePrice),
            variantId: supplyData.variantId ? parseInt(supplyData.variantId) : null
        };
        const response = await api.post('/admin/stock/supply', payload);
        return response.data;
    },
    // ==========================================
    // 🔔 GESTION DES NOTIFICATIONS (Admin)
    // ==========================================

    // Récupérer les notifications non lues
    getUnreadNotifications: async () => {
        const response = await api.get('/admin/notifications/unread');
        return response.data; // Renvoie ApiResponseListAdminNotification
    },

    // Marquer une notification comme lue
    markAsRead: async (id) => {
        const response = await api.patch(`/admin/notifications/${id}/read`);
        return response.data;
    },
    // ==========================================
    // 📊 STATISTIQUES & ANALYTICS
    // ==========================================

    // On peut soit appeler un endpoint dédié, soit traiter les listes existantes
   // src/services/admin.service.js
getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data; // Contient l'objet avec totalRevenue, topSellingProducts, etc.
},
// src/services/product.service.js

};

export default AdminService;