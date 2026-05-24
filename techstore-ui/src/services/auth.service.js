import api from '../api/axiosConfig';

const AuthService = {
    /**
     * Inscription (Gère le format JSON ou Multipart pour la photo)
     */
    register: async (userData) => {
        try {
            // Si userData est un FormData (cas du checkout), on laisse Axios gérer le Content-Type
            const config = (userData instanceof FormData) 
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.post('auth/register', userData, config);
            
            // On retourne l'objet complet de la réponse du serveur (ApiResponse)
            return response.data; 
        } catch (error) {
            console.error("Détail erreur register:", error.response?.data);
            throw error.response?.data || "Erreur lors de l'inscription.";
        }
    },

    /**
     * Connexion classique
     */
    login: async (credentials) => {
        try {
            const response = await api.post('auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || "Identifiants incorrects.";
        }
    },

    /**
     * Vérification de la session actuelle
     */
    getProfile: async () => {
        try {
            const response = await api.get('auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    }
};

export default AuthService;