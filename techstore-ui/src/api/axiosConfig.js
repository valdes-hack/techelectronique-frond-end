import axios from 'axios';

// On récupère l'URL de base (soit la variable d'environnement, soit le localhost par défaut)
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const baseApi = axios.create({
    // ✨ CORRECTION CRUCIALE : On s'assure que /api/v1 est TOUJOURS ajouté à la fin de l'URL
    baseURL: rawBaseURL.endsWith('/') ? `${rawBaseURL}api/v1` : `${rawBaseURL}/api/v1`,
    headers: { 'Content-Type': 'application/json' }
});
baseApi.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('techstore_token');
    if (token && token !== "null" && token !== "undefined") {
        const cleanToken = token.replace(/"/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    const sessionId = localStorage.getItem('techstore_session_id');
    // ✨ CORRECTION : On vérifie strictement que le sessionId existe et n'est pas une chaîne fantôme
    if (sessionId && sessionId !== "null" && sessionId !== "undefined" && sessionId.trim() !== "") {
        config.headers['X-Session-Id'] = sessionId;
    }
    
    return config;
}, error => Promise.reject(error));
export default baseApi;