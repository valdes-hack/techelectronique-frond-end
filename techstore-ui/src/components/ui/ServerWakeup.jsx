import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * ServerWakeup – Affiché quand le backend Render est en veille.
 * Montre une bannière discrète "Connexion en cours..." avec compte à rebours.
 * Disparaît dès que l'API répond.
 */
const ServerWakeup = ({ isLoading, hasError, onRetry }) => {
    const [seconds, setSeconds] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer;
        if (isLoading) {
            // Afficher la bannière après 3s (laisse le temps aux requêtes rapides)
            const showTimer = setTimeout(() => setVisible(true), 3000);
            timer = setInterval(() => setSeconds(s => s + 1), 1000);
            return () => { clearTimeout(showTimer); clearInterval(timer); };
        } else {
            setVisible(false);
            setSeconds(0);
        }
        return () => clearInterval(timer);
    }, [isLoading]);

    if (!visible && !hasError) return null;

    if (hasError) return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-md shadow-xl">
            <WifiOff size={16} className="text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-400">Serveur inaccessible</p>
            <button
                onClick={onRetry}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 transition-colors"
            >
                <RefreshCw size={12} /> Réessayer
            </button>
        </div>
    );

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-xl">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Connexion au serveur…</p>
                {seconds > 10 && (
                    <p className="text-[10px] text-gray-500 mt-0.5">Le serveur se réveille ({seconds}s) – patience 🚀</p>
                )}
            </div>
            <Wifi size={16} className="text-indigo-400 shrink-0 animate-pulse" />
        </div>
    );
};

export default ServerWakeup;
