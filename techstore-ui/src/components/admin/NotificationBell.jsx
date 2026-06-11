import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../services/admin.service';
import { useTheme } from '../../context/ThemeContext';

const NotificationBell = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const isDark = theme === 'dark';

    // Récupération des alertes (Stock bas, Nouvelles commandes)
    const fetchNotifications = async () => {
        try {
            const res = await AdminService.getUnreadNotifications();
            if (res.status === 'success') {
                setNotifications(res.data || []);
            }
        } catch (e) {
            console.error("Erreur synchro notifications", e);
        }
    };

    // Polling hyper-réactif (30s)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fermeture automatique au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await AdminService.markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setIsOpen(false);
            navigate('/admin/history');
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            if (notifications.length > 0) {
                await AdminService.markAllAsRead();
                setNotifications([]);
            }
            setIsOpen(false);
            navigate('/admin/history');
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'STOCK_LOW': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'NEW_ORDER': return <ShoppingBag size={16} className="text-emerald-500" />;
            case 'SUPPLY_RECEIVED': return <Package size={16} className="text-indigo-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton Cloche avec Animation si notif */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all relative group ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
            >
                <Bell size={20} className={notifications.length > 0 ? "animate-bounce" : ""} />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0b0e14] shadow-lg">
                        {notifications.length}
                    </span>
                )}
            </button>

            {/* Menu Déroulant (Style Apple Neon) */}
            <AnimatePresence>
                {isOpen && (
                    <div className={`absolute right-0 mt-4 w-85 rounded-[2rem] border shadow-2xl z-[300] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${
                        isDark ? 'bg-[#161926]/90 backdrop-blur-xl border-white/10' : 'bg-white/90 backdrop-blur-xl border-gray-200'
                    }`}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h4 className={`font-black italic text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>CENTRE D'ALERTES</h4>
                            {notifications.length > 0 && <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>}
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className={`p-5 flex gap-4 hover:bg-white/5 transition-all cursor-pointer group border-b border-white/5`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-black leading-tight mb-1 uppercase ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{n.title}</p>
                                            <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">{n.message}</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 self-center transition-all">
                                            <Check size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center opacity-20">
                                    <Bell size={48} className="mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-white">Système Nominal</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-white/5 text-center border-t border-white/5">
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-400 transition-colors tracking-widest"
                            >
                                Tout l'historique
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Petit helper pour Framer Motion
const AnimatePresence = ({ children }) => <>{children}</>;

export default NotificationBell;