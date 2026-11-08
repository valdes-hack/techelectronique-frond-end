import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../api/axiosConfig';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. On appelle ton API Client pour voir SES commandes ✨
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('orders'); 
            // Ton Swagger dit : status: "success", data: [...]
            if (res.data && res.data.status === 'success') {
                setOrders(res.data.data || []);
            }
        } catch (e) {
            console.error("Impossible de lire vos commandes", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <RefreshCw className="animate-spin text-indigo-500 mr-2" />
            <span className="font-bold opacity-30 italic">Préparation de vos factures...</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen animate-in fade-in duration-700">
            <header className="mb-16">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900">Vos Achats.</h1>
                <p className="text-slate-400 font-medium mt-4">Retrouvez l'historique de vos commandes PEOC.</p>
            </header>

            {orders.length === 0 ? (
                <div className="bg-slate-50 p-20 rounded-[3.5rem] text-center border-4 border-dashed border-white shadow-inner">
                    <Package className="mx-auto text-slate-200 mb-6" size={80} strokeWidth={1} />
                    <p className="text-2xl font-black text-slate-300 italic mb-6">C'est encore bien vide par ici, Valdes.</p>
                    <Link to="/catalog" className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all">
                        Découvrir les nouveautés
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((o) => (
                        <div 
                            key={o.id}
                            onClick={() => navigate(`/my-orders/${o.id}`)}
                            className="bg-white dark:bg-[#161926] p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl hover:shadow-2xl hover:border-indigo-500/20 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-center gap-6"
                        >
                            <div className="flex items-center space-x-6 w-full">
                                {/* Petite icône avec effet selon statut */}
                                <div className={`p-4 sm:p-5 rounded-3xl shrink-0 ${
                                    o.status === 'LIVRE' || o.status === 'COMPLETED'
                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                        : 'bg-indigo-500/10 text-indigo-500'
                                }`}>
                                    <Package size={30} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <p className="text-xs font-black text-slate-400 font-mono tracking-widest truncate">
                                            N° {o.orderNumber || o.id}
                                        </p>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                            o.status === 'LIVRE' || o.status === 'COMPLETED'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                                        }`}>
                                            {o.status || 'Confirmée'}
                                        </span>
                                    </div>
                                    <p className="font-black text-2xl text-slate-900 dark:text-white leading-none">
                                        {(o.totalAmount || 0).toLocaleString('fr-FR')} <span className="text-sm font-medium">FCFA</span>
                                    </p>
                                    <div className="flex flex-wrap items-center text-[10px] mt-4 text-slate-400 gap-4">
                                        <span className="flex items-center"><Clock size={12} className="mr-1"/> {o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Date récente'}</span>
                                        {o.shippingAddressLabel && (
                                            <span className="flex items-center truncate max-w-xs"><MapPin size={12} className="mr-1 shrink-0"/> {o.shippingAddressLabel}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/my-orders/${o.id}`);
                                    }}
                                    className="w-full md:w-auto flex items-center justify-center space-x-2 bg-slate-900 hover:bg-indigo-600 dark:bg-white/10 dark:hover:bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg text-xs uppercase tracking-wider"
                                >
                                    <span>Facture & Détail</span>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;