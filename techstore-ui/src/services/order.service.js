import api from '../api/axiosConfig';

const OrderService = {
    // Créer la commande
    createOrder: async (orderData, config = {}) => {
    // On fusionne les headers par défaut avec le config passé
    const response = await api.post('orders', orderData, config);
    return response.data;
},

    // Voir mes commandes (Client)
    getMyOrders: async () => {
        const response = await api.get('orders');
        return response.data; // Renvoie { status: "success", data: [...] }
    },
      getOrderDetails: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    // Pour l'admin (si l'URL est différente dans ton backend)
    getAdminOrderDetails: async (orderId) => {
        const response = await api.get(`/admin/orders/${orderId}`);
        return response.data;
    }
};

export default OrderService;