import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    Package, ArrowLeft, Printer, Truck, CheckCircle2, Clock, 
    CreditCard, MapPin, Phone, Mail, ShieldCheck, Download, Star, 
    AlertCircle, Loader2, Sparkles, HelpCircle
} from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useAppContext();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Formulaire d'avis rapide
    const [reviewProduct, setReviewProduct] = useState(null); // produit sélectionné pour notation
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewBody, setReviewBody] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/orders/${id}`);
                if (res.data && res.data.status === 'success') {
                    setOrder(res.data.data);
                } else {
                    setError("Commande introuvable.");
                }
            } catch (err) {
                console.error("Erreur chargement commande", err);
                setError(err.response?.data?.message || "Impossible de charger cette facture.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleSendReview = async (e) => {
        e.preventDefault();
        if (!reviewProduct) return;
        setSubmittingReview(true);
        try {
            await api.post('/reviews', {
                productId: reviewProduct.productId || reviewProduct.id,
                orderId: order.id,
                rating: rating,
                title: reviewTitle.trim() || 'Avis sur mon achat',
                body: reviewBody.trim() || 'Excellent produit, conforme à mes attentes.'
            });
            setReviewSuccess(true);
            setTimeout(() => {
                setReviewProduct(null);
                setReviewSuccess(false);
                setReviewTitle('');
                setReviewBody('');
            }, 2000);
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'envoi de votre note.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
                <p className="text-sm font-bold text-gray-500 italic">Édition de votre facture en cours...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Facture non disponible</h2>
                <p className="text-sm text-gray-500 mb-6">{error || "Cette commande n'existe pas ou n'est plus accessible."}</p>
                <Link to="/my-orders" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
                    <ArrowLeft size={16} /> Retour à mes commandes
                </Link>
            </div>
        );
    }

    const items = order.items || [];
    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Date non renseignée';

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-500">
            
            {/* ── BARRE D'ACTIONS (CACHÉE À L'IMPRESSION) ── */}
            <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-8">
                <Link
                    to="/my-orders"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Retour à mes achats
                </Link>

                <div className="flex items-center gap-2.5">
                    {order.trackingToken && (
                        <Link
                            to={`/track/${order.trackingToken}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-all"
                        >
                            <Truck size={15} /> Suivre le colis
                        </Link>
                    )}
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/25"
                    >
                        <Printer size={15} /> Imprimer la Facture
                    </button>
                </div>
            </div>

            {/* ── CORPS DE LA FACTURE (ZONE IMPRIMABLE OFFICIELLE) ── */}
            <div className="bg-white dark:bg-[#161926] rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-12 space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none">
                
                {/* 1. EN-TÊTE FACTURE */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/30">
                                🐣
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 dark:text-white uppercase">
                                    {settings?.siteName || 'PEOC Élevage'}
                                </h1>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                    Petit Éleveur de l'Ouest Cameroun
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <p className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500" /> {settings?.contactAddress || 'Bafoussam, Ouest - Cameroun'}</p>
                            <p className="flex items-center gap-1.5"><Phone size={12} className="text-indigo-500" /> {settings?.contactPhone || '+237 686 669 222'}</p>
                            <p className="flex items-center gap-1.5"><Mail size={12} className="text-indigo-500" /> {settings?.contactEmail || 'contact@peoc.cm'}</p>
                        </div>
                    </div>

                    {/* Bloc N° Commande & Statut */}
                    <div className="sm:text-right space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                            Facture & Reçu d'achat
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            N° {order.orderNumber || `PEOC-${order.id}`}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>
                        <div className="pt-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                order.status === 'LIVRE' || order.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                            }`}>
                                <CheckCircle2 size={12} />
                                {order.status || 'Confirmée'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. DÉTAILS CLIENT ET LIVRAISON */}
                <div className="grid sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Facturé à :
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {order.customerName || 'Client PEOC'}
                        </h3>
                        {order.customerPhone && (
                            <p className="text-xs text-gray-500 mt-0.5">Tél : {order.customerPhone}</p>
                        )}
                        {order.customerEmail && (
                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                        )}
                    </div>

                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Point de livraison :
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200">
                            {order.shippingAddressLabel || 'Adresse enregistrée par GPS'}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                            <CreditCard size={12} className="text-indigo-500" />
                            <span>Paiement : {order.paymentMethod || 'Mobile Money / En agence'}</span>
                        </div>
                    </div>
                </div>

                {/* 3. TABLEAU DES ARTICLES */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Articles commandés
                    </h3>
                    
                    <div className="border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Article</th>
                                    <th className="py-3 px-4 text-center">Quantité</th>
                                    <th className="py-3 px-4 text-right">Prix Unitaire</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                    <th className="py-3 px-4 text-center print:hidden">Avis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                                {items.map((item, idx) => {
                                    const unitPrice = item.price || 0;
                                    const qty = item.quantity || 1;
                                    const totalLine = unitPrice * qty;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    {item.imageUrl && (
                                                        <img
                                                            src={getFullImageUrl(item.imageUrl)}
                                                            alt={item.productName}
                                                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-white/10 shrink-0 print:hidden"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-white block">
                                                            {item.productName || 'Produit'}
                                                        </span>
                                                        {item.variantName && (
                                                            <span className="text-[10px] text-gray-400">
                                                                Variante : {item.variantName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold">
                                                {qty}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {unitPrice.toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                                                {totalLine.toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td className="py-3.5 px-4 text-center print:hidden">
                                                <button
                                                    onClick={() => setReviewProduct(item)}
                                                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-white/5 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white text-[10px] font-bold transition-all inline-flex items-center gap-1"
                                                >
                                                    <Star size={11} /> Noter
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. TOTAL ET RÉCAPITULATIF FINANCIER */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-gray-100 dark:border-white/10">
                    <div className="text-xs text-gray-500 max-w-sm space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">Garantie & Authenticité PEOC :</p>
                        <p>Matériel garanti constructeur. Les couveuses automatiques bénéficient d'une assistance technique au démarrage.</p>
                    </div>

                    <div className="w-full sm:w-72 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-500">
                            <span>Sous-total articles :</span>
                            <span className="font-bold">{((order.totalAmount || 0) - (order.shippingCost || 0)).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Frais de livraison :</span>
                            <span className="font-bold">{order.shippingCost ? `${order.shippingCost.toLocaleString('fr-FR')} FCFA` : 'Inclus / Gratuit'}</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
                            <span>Total TTC :</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>
                </div>

                {/* 5. MENTIONS DE PIED DE FACTURE */}
                <div className="pt-6 border-t border-dashed border-gray-200 dark:border-white/10 text-center text-[10px] text-gray-400">
                    Merci pour votre confiance envers PEOC (Petit Éleveur de l'Ouest Cameroun). Pour toute réclamation, munissez-vous de votre référence N° {order.orderNumber || order.id}.
                </div>
            </div>

            {/* ── MODAL DE NOTATION DU PRODUIT ── */}
            {reviewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#161926] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Star size={16} className="text-amber-500 fill-amber-500" /> Noter cet achat
                            </h3>
                            <button onClick={() => setReviewProduct(null)} className="text-gray-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs font-bold text-slate-700 dark:text-gray-300">
                            {reviewProduct.productName}
                        </p>

                        {reviewSuccess ? (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 text-xs font-bold text-center">
                                ✨ Merci ! Votre avis et votre note ont été enregistrés avec succès.
                            </div>
                        ) : (
                            <form onSubmit={handleSendReview} className="space-y-4">
                                {/* Étoiles */}
                                <div className="flex items-center justify-center gap-2 py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 hover:scale-125 transition-transform"
                                        >
                                            <Star
                                                size={28}
                                                className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Titre de votre avis</label>
                                    <input
                                        type="text"
                                        value={reviewTitle}
                                        onChange={(e) => setReviewTitle(e.target.value)}
                                        placeholder="Ex: Couveuse très fiable, bon taux d'éclosion"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Votre commentaire</label>
                                    <textarea
                                        rows={3}
                                        value={reviewBody}
                                        onChange={(e) => setReviewBody(e.target.value)}
                                        placeholder="Racontez votre expérience aux autres éleveurs..."
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setReviewProduct(null)}
                                        className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Envoi...' : 'Publier ma note'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
