import api from '../api/axiosConfig';

const AddressService = {
    // 1. Lister les adresses du client
    getMyAddresses: async () => {
        try {
            const response = await api.get('addresses');
            return response.data; 
        } catch (error) {
            console.error("Erreur lecture adresses", error);
            throw error;
        }
    },

    // 2. Ajouter une adresse ✨ Ajout de l'argument config
    addAddress: async (addressData, config = {}) => {
        try {
            const response = await api.post('addresses', addressData, config);
            return response.data;
        } catch (error) {
            console.error("Erreur création adresse", error);
            throw error;
        }
    },

    // 3. Supprimer
    deleteAddress: async (id) => {
        const response = await api.delete(`addresses/${id}`);
        return response.data;
    }
};

export default AddressService;