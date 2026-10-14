import React, { createContext, useContext, useState, useEffect } from 'react';
import baseApi from '../api/axiosConfig';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const cachedSettings = () => {
        try {
            const saved = sessionStorage.getItem('techstore_settings');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    };

    const [settings, setSettings] = useState(cachedSettings() || {
        siteName: 'PEOC',
        siteSubtitle: "Petit Éleveur de l'Ouest Cameroun",
        contactEmail: 'contact@peoc.cm',
        contactPhone: '+237 600 000 000',
        contactAddress: 'Ouest, Cameroun',
        logoUrl: '/logo.png',
        heroImageUrl: ''
    });

    const loadSettings = async () => {
        try {
            const res = await baseApi.get('settings');
            if (res.data && res.data.data) {
                setSettings(res.data.data);
                sessionStorage.setItem('techstore_settings', JSON.stringify(res.data.data));
            }
        } catch (e) {
            console.error('Failed to load app settings', e);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <AppContext.Provider value={{ settings, reloadSettings: loadSettings }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
