import React, { createContext, useContext, useState, useEffect } from 'react';
import baseApi from '../api/axiosConfig';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteName: 'TechStore',
        contactEmail: 'contact@techstore.cm',
        contactPhone: '+237 600 000 000',
        contactAddress: 'Douala, Cameroun',
        logoUrl: '',
        heroImageUrl: ''
    });

    const loadSettings = async () => {
        try {
            const res = await baseApi.get('/settings');
            if (res.data && res.data.data) {
                setSettings(res.data.data);
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
