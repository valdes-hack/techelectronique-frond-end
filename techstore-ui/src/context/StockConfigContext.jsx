import React, { createContext, useContext, useState, useEffect } from 'react';

const StockConfigContext = createContext();

const STORAGE_KEY = 'peoc_stock_config';

const DEFAULT_CONFIG = {
    manageStockViaSupply: true, // Gérer le stock dans le ravitaillement (/admin/stock)
    manageStockDirectly: true   // Gérer le stock lors de l'ajout/modification d'un produit
};

export const StockConfigProvider = ({ children }) => {
    const [stockConfig, setStockConfig] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    manageStockViaSupply: parsed.manageStockViaSupply !== false,
                    manageStockDirectly: parsed.manageStockDirectly !== false
                };
            }
        } catch (e) {
            console.error("Erreur lecture stock config:", e);
        }
        return DEFAULT_CONFIG;
    });

    const updateStockConfig = (updates) => {
        setStockConfig(prev => {
            const next = { ...prev, ...updates };
            // Sécurité : au moins l'un des deux modes doit rester activé
            if (!next.manageStockViaSupply && !next.manageStockDirectly) {
                return prev;
            }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                window.dispatchEvent(new CustomEvent('peoc_stock_config_changed', { detail: next }));
            } catch (e) {
                console.error("Erreur sauvegarde stock config:", e);
            }
            return next;
        });
    };

    useEffect(() => {
        const handleSync = (e) => {
            if (e.type === 'peoc_stock_config_changed' && e.detail) {
                setStockConfig(e.detail);
            } else if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    setStockConfig(JSON.parse(e.newValue));
                } catch {}
            }
        };

        window.addEventListener('peoc_stock_config_changed', handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener('peoc_stock_config_changed', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    return (
        <StockConfigContext.Provider value={{ stockConfig, updateStockConfig }}>
            {children}
        </StockConfigContext.Provider>
    );
};

export const useStockConfig = () => {
    const context = useContext(StockConfigContext);
    if (!context) {
        return {
            stockConfig: DEFAULT_CONFIG,
            updateStockConfig: () => {}
        };
    }
    return context;
};
