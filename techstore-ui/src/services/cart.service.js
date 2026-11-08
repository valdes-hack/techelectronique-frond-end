import api from '../api/axiosConfig';

const CartService = {
    // 1. Voir le contenu du panier (GET /api/v1/cart)
    getCart: async (sessionId) => {
        try {
            const response = await api.get('cart', {
                headers: { 'X-Session-Id': sessionId }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lecture panier", error);
            throw error;
        }
    },

    // 2. Ajouter un article (POST /api/v1/cart/add)
    addToCart: async (data, sessionId) => {
        try {
            // data = { productId, variantId, quantity }
            const response = await api.post('cart/add', data, {
                headers: { 'X-Session-Id': sessionId }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur ajout panier", error);
            throw error;
        }
    },

    // 3. Modifier la quantité d'un article (PUT /api/v1/cart/update/{itemId})
    updateQuantity: async (itemId, quantity, sessionId) => {
        try {
            // La quantité est envoyée en paramètre d'URL (?quantity=X)
            const response = await api.put(`cart/update/${itemId}?quantity=${quantity}`, {}, {
                headers: { 'X-Session-Id': sessionId }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur modification quantité", error);
            throw error;
        }
    },

    // 4. Retirer un article (DELETE /api/v1/cart/remove/{itemId})
    removeItem: async (itemId, sessionId) => {
        try {
            const response = await api.delete(`cart/remove/${itemId}`, {
                headers: { 'X-Session-Id': sessionId }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur suppression article", error);
            throw error;
        }
    },

    // 5. Vider le panier complètement (DELETE /api/v1/cart/clear)
    clearCart: async (sessionId) => {
        try {
            const response = await api.delete('cart/clear', {
                headers: { 'X-Session-Id': sessionId }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur vidage panier", error);
            throw error;
        }
    },

    // 6. Fusionner le panier visiteur vers le compte à la connexion (POST /api/v1/cart/merge)
    mergeCart: async (sessionId) => {
        try {
            const response = await api.post(`cart/merge?sessionId=${sessionId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur fusion panier", error);
            throw error;
        }
    }
};

export default CartService;