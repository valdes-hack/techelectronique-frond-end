import React from 'react';
import { Star, CheckCircle, User } from 'lucide-react';

const ProductReviews = ({ reviews, stats, theme }) => {
    const isDark = theme === 'dark';

    // Calcul de la moyenne pour l'affichage des étoiles
    const average = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-20 border-t border-apple-border dark:border-white/5 pt-16">
            <h3 className={`text-3xl font-black italic tracking-tighter mb-10 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Avis Clients<span className="text-indigo-500">.</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* --- RÉSUMÉ DES NOTES (Style Apple) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-end gap-4">
                        <span className={`text-6xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{average}</span>
                        <div className="pb-2">
                            <div className="flex text-amber-400 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < Math.round(average) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sur {reviews.length} avis</p>
                        </div>
                    </div>

                    {/* Barres de progression (Simulées ou réelles si ton API le permet) */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-4 text-xs font-bold uppercase">
                                <span className="w-3">{star}</span>
                                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full" 
                                        style={{ width: `${reviews.filter(r => r.rating === star).length / reviews.length * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- LISTE DES COMMENTAIRES --- */}
                <div className="lg:col-span-8 space-y-8">
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review.id} className={`p-8 rounded-[2.5rem] border transition-all ${
                            isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                                        {review.user?.firstName?.charAt(0) || <User size={18}/>}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {review.user?.firstName} {review.user?.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
                                            <CheckCircle size={12} /> Achat vérifié
                                        </div>
                                    </div>
                                </div>
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            <h4 className={`font-black text-lg mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{review.title}</h4>
                            <p className={`text-sm leading-relaxed opacity-70 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                                {review.body}
                            </p>
                            <p className="mt-4 text-[10px] text-gray-500 font-medium italic">
                                Posté le {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-20 italic">
                            <Star size={40} className="mx-auto mb-4" />
                            <p>Aucun avis pour le moment. Soyez le premier !</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;