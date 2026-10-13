import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const baseApi = axios.create({
    baseURL: rawBaseURL.endsWith('/') ? `${rawBaseURL}api/v1` : `${rawBaseURL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
    // ── TIMEOUTS INTELLIGENTS ────────────────────────────────────────────────
    // 60s pour le premier appel (cold start Render free tier peut prendre 50s)
    timeout: 60000,
});

// ── VALIDATION DES HEADERS ───────────────────────────────────────────────────
const isValidHeaderValue = (value) => {
    if (!value) return false;
    const clean = value.trim().toLowerCase();
    return clean !== '' && clean !== 'null' && clean !== 'undefined';
};

// ── INTERCEPTEUR REQUEST ─────────────────────────────────────────────────────
baseApi.interceptors.request.use((config) => {
    // Normalise l'URL pour ne pas écraser le préfixe /api/v1
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('//')) {
        config.url = config.url.substring(1);
    }

    const token = sessionStorage.getItem('techstore_token');
    if (isValidHeaderValue(token)) {
        config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
    }

    const sessionId = localStorage.getItem('techstore_session_id');
    if (isValidHeaderValue(sessionId)) {
        config.headers['X-Session-Id'] = sessionId.replace(/"/g, '');
    }

    return config;
}, error => Promise.reject(error));

// ── INTERCEPTEUR RESPONSE – RETRY AUTOMATIQUE ────────────────────────────────
// Quand Render se réveille, le 1er appel peut échouer (timeout/503).
// On réessaie automatiquement jusqu'à 2 fois avec un délai croissant.
baseApi.interceptors.response.use(
    response => response,
    async (error) => {
        const config = error.config;

        // Ne pas retry les mutations (POST/PUT/DELETE sauf cart/add)
        const isSafeToRetry = config.method === 'get' ||
            (config.method === 'post' && config.url?.includes('cart'));

        // Initialiser le compteur de retry
        if (!config._retryCount) config._retryCount = 0;

        const isNetworkError = !error.response;
        const isServerError  = error.response?.status >= 500;
        const isTimeout      = error.code === 'ECONNABORTED';

        if (isSafeToRetry && (isNetworkError || isServerError || isTimeout) && config._retryCount < 2) {
            config._retryCount += 1;

            // Délai exponentiel : 2s, puis 5s
            const delay = config._retryCount === 1 ? 2000 : 5000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Augmenter le timeout sur les retries (le serveur est peut-être en train de démarrer)
            config.timeout = 90000;

            return baseApi(config);
        }

        return Promise.reject(error);
    }
);

export default baseApi;