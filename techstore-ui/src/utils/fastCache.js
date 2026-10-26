import { useState, useEffect, useCallback, useRef } from 'react';

// Cache mémoire ultra-rapide (0ms, aucun JSON.parse répété)
const memoryCache = new Map();

/**
 * Récupère une valeur depuis le cache synchrone (Mémoire -> localStorage -> defaultValue)
 */
export const getFastCache = (key, defaultValue = null) => {
    if (memoryCache.has(key)) {
        return memoryCache.get(key);
    }
    try {
        const itemStr = localStorage.getItem(`peoc_cache_${key}`);
        if (!itemStr) return defaultValue;

        const item = JSON.parse(itemStr);
        // Vérification d'expiration si un TTL est configuré
        if (item.expiry && Date.now() > item.expiry) {
            localStorage.removeItem(`peoc_cache_${key}`);
            return defaultValue;
        }

        memoryCache.set(key, item.value);
        return item.value;
    } catch (e) {
        return defaultValue;
    }
};

/**
 * Enregistre une valeur dans le cache mémoire et persistant (localStorage)
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds (Par défaut: 24 heures)
 */
export const setFastCache = (key, value, ttlSeconds = 86400) => {
    try {
        memoryCache.set(key, value);
        const item = {
            value,
            expiry: ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null,
            updatedAt: Date.now()
        };
        localStorage.setItem(`peoc_cache_${key}`, JSON.stringify(item));
    } catch (e) {
        // QuotaExceededError fallback : garde en mémoire sans planter
        console.warn('FastCache persistence warning:', e.message);
    }
};

/**
 * Supprime une clé spécifique du cache
 */
export const removeFastCache = (key) => {
    memoryCache.delete(key);
    try {
        localStorage.removeItem(`peoc_cache_${key}`);
    } catch (e) {}
};

/**
 * Nettoie toutes les clés commençant par un préfixe (ex: "admin_")
 */
export const clearFastCachePrefix = (prefix = '') => {
    memoryCache.forEach((_, k) => {
        if (k.startsWith(prefix)) memoryCache.delete(k);
    });
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(`peoc_cache_${prefix}`)) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
};

/**
 * Hook React SWR (Stale-While-Revalidate) :
 * 1. Renvoie les données du cache IMMÉDIATEMENT en 0ms (l'utilisateur ne voit aucun écran blanc).
 * 2. Si du cache existe, `loading` est false dès la première milliseconde.
 * 3. Lance un appel réseau silencieux en arrière-plan pour synchroniser les données fraîches.
 * 4. Si le réseau est lent (Render wake-up) ou hors-ligne (PWA), l'écran reste plein et fonctionnel.
 */
export const useFastData = (cacheKey, fetcher, defaultValue, options = {}) => {
    const { 
        ttlSeconds = 86400,
        revalidateOnMount = true,
        deps = []
    } = options;

    const initialCache = getFastCache(cacheKey, defaultValue);
    const hasInitial = initialCache !== null && initialCache !== undefined && 
                       (!Array.isArray(initialCache) || initialCache.length > 0);

    const [data, setData] = useState(initialCache !== null ? initialCache : defaultValue);
    const [loading, setLoading] = useState(!hasInitial);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const isMounted = useRef(true);

    const reload = useCallback(async (isSilent = false) => {
        if (!isSilent && !hasInitial) {
            setLoading(true);
        }
        setRefreshing(true);
        setError(null);

        try {
            const freshData = await fetcher();
            if (isMounted.current && freshData !== undefined) {
                setData(freshData);
                setFastCache(cacheKey, freshData, ttlSeconds);
            }
        } catch (err) {
            console.warn(`[FastCache] Erreur lors de la revalidation de ${cacheKey}:`, err);
            if (isMounted.current) {
                setError(err);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [cacheKey, fetcher, ttlSeconds, hasInitial]);

    useEffect(() => {
        isMounted.current = true;
        if (revalidateOnMount) {
            reload(hasInitial);
        }
        return () => {
            isMounted.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey, ...deps]);

    // Permet de mettre à jour localement les données et le cache (ex: après ajout/suppression)
    const updateData = useCallback((newDataOrUpdater) => {
        setData(prev => {
            const nextVal = typeof newDataOrUpdater === 'function' ? newDataOrUpdater(prev) : newDataOrUpdater;
            setFastCache(cacheKey, nextVal, ttlSeconds);
            return nextVal;
        });
    }, [cacheKey, ttlSeconds]);

    return [data, updateData, { loading, refreshing, error, reload }];
};

export default {
    getFastCache,
    setFastCache,
    removeFastCache,
    clearFastCachePrefix,
    useFastData
};
