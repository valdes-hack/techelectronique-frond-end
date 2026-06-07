import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const baseApi = axios.create({
    baseURL: rawBaseURL.endsWith('/') ? `${rawBaseURL}api/v1` : `${rawBaseURL}/api/v1`,
    headers: { 'Content-Type': 'application/json' }
});

// Fonction utilitaire pour vérifier si une valeur stockée est valide
const isValidHeaderValue = (value) => {
    if (!value) return false;
    const clean = value.trim().toLowerCase();
    return clean !== '' && clean !== 'null' && clean !== 'undefined';
};

baseApi.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('techstore_token');
    
    // Validation stricte du token du protocole d'authentification
    if (isValidHeaderValue(token)) {
        const cleanToken = token.replace(/"/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    const sessionId = localStorage.getItem('techstore_session_id');
    
    // Validation stricte de l'identifiant de session invité
    if (isValidHeaderValue(sessionId)) {
        config.headers['X-Session-Id'] = sessionId.replace(/"/g, '');
    }
    
    return config;
}, error => Promise.reject(error));

export default baseApi;