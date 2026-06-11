import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderService from '../../services/order.service';
import { Search, Package, Calendar, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import ProductReviewModal from '../../components/client/ProductReviewModal';

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const tokenParam = searchParams.get('token');

    const [token, setToken] = useState(tokenParam || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null });

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!token.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const res = await OrderService.trackOrder(token.trim());
            if (res.status === 'success') {
                setOrder(res.data);
            } else {
                setError(res.message || "Commande introuvable.");
            }
        } catch (err) {
            setError("Le code de suivi est invalide ou la commande n'existe pas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-search if token is in URL
    useEffect(() => {
        if (tokenParam) {
            handleSearch();
        }
    }, [tokenParam]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'EN_ATTENTE': return { text: 'En attente de confirmation', color: 'text-amber-500', bg: 'bg-amber-500/10' };
            case 'CONFIRME': return { text: 'Confirmée & En préparation', color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
            case 'EXPEDIE': return { text: 'En cours de livraison', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'LIVRE': return { text: 'Livrée avec succès', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'ANNULE': return { text: 'Commande annulée', color: 'text-red-500', bg: 'bg-red-500/10' };
            default: return { text: 'Statut inconnu', color: 'text-gray-500', bg: 'bg-gray-500/10' };
        }
    };

    return (
        <div className="min-h-[80vh] bg-apple-white dark:bg-[#0b0e14] py-20 px-4 transition-colors duration-500">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white uppercase">Suivre ma commande</h1>
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto">Entrez le code de suivi reçu par email pour voir l'état d'avancement de votre commande.</p>
                </div>

                <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-16">
                    <input 
                        type="text" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Ex: TRK-123456"
                        className="w-full bg-white dark:bg-[#161926] border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-6 pr-16 text-lg font-bold shadow-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl text-center max-w-lg mx-auto flex items-center flex-col">
                        <AlertCircle size={40} className="mb-4" />
                        <h3 className="font-black italic text-lg uppercase tracking-widest mb-1">Erreur de suivi</h3>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {order && (
                    <div className="bg-white dark:bg-[#161926] rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4">
                        {/* Header Commande */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-white/5 pb-8 mb-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Commande N°</p>
                                <h2 className="text-3xl font-black text-apple-dark dark:text-white">#{order.orderNumber}</h2>
                                <div className="flex items-center gap-2 mt-3">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={`px-6 py-3 rounded-2xl ${getStatusInfo(order.status).bg} flex items-center gap-3`}>
                                <div className={`w-3 h-3 rounded-full ${getStatusInfo(order.status).color.replace('text', 'bg')} animate-pulse`} />
                                <span className={`font-black uppercase tracking-widest text-xs ${getStatusInfo(order.status).color}`}>
                                    {getStatusInfo(order.status).text}
                                </span>
                            </div>
                        </div>

                        {/* Informations de Livraison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Adresse de Livraison
                                </h3>
                                <p className="font-bold text-apple-dark dark:text-gray-200 mb-1">{order.customerName}</p>
                                <p className="text-gray-500 text-sm leading-relaxed">{order.shippingAddress}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <Clock size={16} /> Contact
                                </h3>
                                <p className="text-gray-500 text-sm">{order.userEmail}</p>
                            </div>
                        </div>

                        {/* Articles */}
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <Package size={16} /> Articles Commandés
                        </h3>
                        
                        <div className="space-y-4 mb-8">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                                        <div className="w-16 h-16 bg-white dark:bg-[#111421] rounded-xl flex items-center justify-center p-2">
                                            <img src={item.productImage || 'https://placehold.co/100x100?text=IMG'} alt={item.productName} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-apple-dark dark:text-white line-clamp-1">{item.productName}</p>
                                            <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                        <p className="font-black text-apple-dark dark:text-white whitespace-nowrap">{item.priceAtPurchase.toLocaleString()} F</p>
                                        
                                        {/* Bouton Donner un Avis (seulement si livré) */}
                                        {order.status === 'LIVRE' && (
                                            <button 
                                                onClick={() => setReviewModal({ isOpen: true, product: { id: item.productId, name: item.productName }})}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                Donner un avis
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex justify-between items-center">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total Payé</span>
                            <span className="text-2xl md:text-3xl font-black text-indigo-500">{order.totalAmount.toLocaleString()} F</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal pour les avis invités */}
            <ProductReviewModal 
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, product: null })}
                product={reviewModal.product}
                orderId={order?.id}
                trackingToken={token} // On passe le token pour l'avis invité !
                isGuest={true} // Indique que c'est un invité
            />
        </div>
    );
};

export default TrackOrder;
