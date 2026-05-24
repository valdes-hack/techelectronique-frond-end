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
                <p className="text-slate-400 font-medium mt-4">Retrouvez l'historique de vos commandes TechStore.</p>
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
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-center"
                        >
                            <div className="flex items-center space-x-8 w-full">
                                {/* Petite icône avec effet selon statut */}
                                <div className={`p-5 rounded-3xl ${o.status === 'LIVRE' ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                    <Package size={32} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">N° {o.orderNumber || o.id}</p>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${o.status === 'EN_ATTENTE' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <p className="font-black text-2xl text-slate-900 leading-none">
                                        {o.totalAmount.toLocaleString()} <span className="text-sm font-medium">FCFA</span>
                                    </p>
                                    <div className="flex items-center text-[10px] mt-4 text-slate-400 space-x-4">
                                        <span className="flex items-center"><Clock size={12} className="mr-1"/> {o.createdAt?.split('T')[0]}</span>
                                        <span className="flex items-center"><MapPin size={12} className="mr-1"/> {o.shippingAddressLabel}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-8 md:mt-0 w-full md:w-auto flex items-center justify-center space-x-2 bg-slate-900 text-white px-6 py-4 rounded-full font-bold group-hover:bg-indigo-600 transition-all shadow-lg">
                                <span>Voir détail</span>
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;