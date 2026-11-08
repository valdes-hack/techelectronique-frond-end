import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. On va chercher les infos dans sessionStorage au lieu de localStorage ✨
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('techstore_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('techstore_user');
        
        if (token && savedUser && savedUser !== "undefined" && savedUser !== "null") {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Erreur session", e);
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, [token]);

    const login = (userData, userToken) => {
        // 2. On enregistre en sessionStorage : s'effacera à la fermeture du navigateur ! 🪄
        sessionStorage.setItem('techstore_token', userToken);
        sessionStorage.setItem('techstore_user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
    };

    const logout = () => {
        // 3. On vide tout proprement
        sessionStorage.clear();
        setUser(null);
        setToken(null);
    };

    const hasPermission = (p) => user?.permissions?.includes(p);
    const isAdmin = () => user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout, hasPermission, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);