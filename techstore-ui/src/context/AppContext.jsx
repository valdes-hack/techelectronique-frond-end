import React, { createContext, useContext, useState, useEffect } from 'react';
import baseApi from '../api/axiosConfig';
import { getFastCache, setFastCache } from '../utils/fastCache';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const defaultSettings = {
        siteName: 'PEOC',
        siteSubtitle: "Petit Éleveur de l'Ouest Cameroun",
        contactEmail: 'contact@peoc.cm',
        contactPhone: '+237 600 000 000',
        contactAddress: 'Ouest, Cameroun',
        logoUrl: '/logo.png',
        heroImageUrl: ''
    };

    const [settings, setSettings] = useState(() => getFastCache('app_settings', defaultSettings));

    const loadSettings = async () => {
        try {
            const res = await baseApi.get('settings');
            if (res.data && res.data.data) {
                setSettings(res.data.data);
                setFastCache('app_settings', res.data.data, 86400 * 7); // 7 jours
            }
        } catch (e) {
            console.warn('Failed to load fresh app settings, keeping cache', e);
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
