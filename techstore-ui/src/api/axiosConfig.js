import axios from 'axios';

const baseApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1/',
    headers: { 'Content-Type': 'application/json' }
});

baseApi.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('techstore_token');
    if (token && token !== "null" && token !== "undefined") {
        const cleanToken = token.replace(/"/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    const sessionId = localStorage.getItem('techstore_session_id');
    if (sessionId) config.headers['X-Session-Id'] = sessionId;
    return config;
}, error => Promise.reject(error));

export default baseApi;