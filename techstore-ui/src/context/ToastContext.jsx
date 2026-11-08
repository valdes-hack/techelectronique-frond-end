import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Configuration des notifications activées / désactivées par type ou globale
    const [config, setConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('techstore_notification_settings');
            return saved ? JSON.parse(saved) : {
                enabled: true,           // Global toggle
                create: true,            // Ajout produit / catégorie / fournisseur
                update: true,            // Modification
                delete: true,            // Suppression
                supply: true,            // Ravitaillement stock
                order: true,             // Statut commande
            };
        } catch {
            return { enabled: true, create: true, update: true, delete: true, supply: true, order: true };
        }
    });

    const updateConfig = (newConfig) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            try {
                localStorage.setItem('techstore_notification_settings', JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
            return updated;
        });
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showToast = ({ type = 'info', actionCategory = 'general', title = '', message = '', duration = 4000 }) => {
        // Vérifie si les notifications globales ou spécifiques sont activées
        if (!config.enabled) return;
        if (actionCategory && config[actionCategory] === false) return;

        const id = 'toast-' + Math.random().toString(36).substring(2, 9);
        const newToast = { id, type, title, message };

        setToasts(prev => [...prev.slice(-4), newToast]); // Garde les 5 derniers max

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    // Fonctions d'aide pratiques
    const notifySuccess = (message, title = 'Succès', actionCategory = 'general') => 
        showToast({ type: 'success', title, message, actionCategory });

    const notifyError = (message, title = 'Erreur', actionCategory = 'general') => 
        showToast({ type: 'error', title, message, actionCategory });

    const notifyInfo = (message, title = 'Info', actionCategory = 'general') => 
        showToast({ type: 'info', title, message, actionCategory });

    const notifyAction = (actionType, resourceName, details = '') => {
        const labels = {
            create: { title: 'Ajout réussi', type: 'success' },
            update: { title: 'Modification enregistrée', type: 'success' },
            delete: { title: 'Suppression effectuée', type: 'info' },
            supply: { title: 'Ravitaillement validé', type: 'success' },
            order: { title: 'Commande mise à jour', type: 'info' },
        };
        const meta = labels[actionType] || { title: 'Action effectuée', type: 'info' };
        showToast({
            type: meta.type,
            title: meta.title,
            message: `${resourceName}${details ? ` : ${details}` : ''}`,
            actionCategory: actionType
        });
    };

    return (
        <ToastContext.Provider value={{
            showToast,
            notifySuccess,
            notifyError,
            notifyInfo,
            notifyAction,
            notificationConfig: config,
            updateNotificationConfig: updateConfig
        }}>
            {children}
            {/* CONTAINER D'AFFICHAGE FLOTTANT DES TOASTS */}
            <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
                {toasts.map((t) => {
                    const isSuccess = t.type === 'success';
                    const isError = t.type === 'error';
                    const isWarning = t.type === 'warning';

                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-top-3 fade-in duration-300 ${
                                isSuccess
                                    ? 'bg-[#10b981]/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10'
                                    : isError
                                    ? 'bg-red-500/15 border-red-500/30 text-red-300 shadow-red-500/10'
                                    : isWarning
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-amber-500/10'
                                    : 'bg-indigo-600/15 border-indigo-500/30 text-indigo-200 shadow-indigo-500/10'
                            }`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
                                {isError && <XCircle size={18} className="text-red-400" />}
                                {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
                                {!isSuccess && !isError && !isWarning && <Info size={18} className="text-indigo-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                {t.title && (
                                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                                        {t.title}
                                    </h4>
                                )}
                                <p className="text-xs font-semibold leading-relaxed opacity-90 mt-0.5 break-words">
                                    {t.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeToast(t.id)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white shrink-0"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
