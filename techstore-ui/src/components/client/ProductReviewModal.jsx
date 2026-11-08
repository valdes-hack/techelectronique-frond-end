import React, { useState } from 'react';
import { Star, X, CheckCircle, Loader } from 'lucide-react';
import ProductService from '../../services/product.service';

const ProductReviewModal = ({ isOpen, onClose, product, orderId, trackingToken, isGuest }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const reviewData = {
                productId: product.id,
                orderId: orderId,
                rating: rating,
                title: title,
                body: body
            };

            // Appel API pour créer l'avis (normal ou invité)
            if (isGuest) {
                // Pour les invités, le service doit envoyer le trackingToken en query parameter
                // Assurons-nous que ProductService.postGuestReview existe
                await ProductService.postGuestReview(reviewData, trackingToken);
            } else {
                await ProductService.postReview(reviewData);
            }
            
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setRating(5);
                setTitle('');
                setBody('');
            }, 2000);
        } catch (err) {
            console.error("Erreur review:", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre avis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#161926] rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300 relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-black italic tracking-tighter text-apple-dark dark:text-white uppercase mb-2">
                        Laisser un avis
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Partagez votre expérience avec le produit <span className="font-bold text-indigo-500">{product?.name}</span>.
                    </p>

                    {success ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <CheckCircle size={64} className="text-emerald-500 mb-4 animate-bounce" />
                            <h3 className="text-xl font-black text-apple-dark dark:text-white mb-2">Avis publié avec succès !</h3>
                            <p className="text-gray-500 text-sm">Merci pour votre retour. Il aidera d'autres clients.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Stars */}
                            <div className="flex flex-col items-center mb-6">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Note Globale</p>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <Star 
                                                size={36} 
                                                fill={(hover || rating) >= star ? "#fbbf24" : "transparent"} 
                                                className={`${(hover || rating) >= star ? "text-amber-400" : "text-gray-300 dark:text-white/20"} transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-500">Titre de l'avis</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Excellent produit, très satisfait !"
                                    className="w-full bg-gray-50 dark:bg-[#111421] border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-500">Votre commentaire</label>
                                <textarea 
                                    required
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows="4"
                                    placeholder="Dites-nous ce que vous avez aimé ou moins aimé..."
                                    className="w-full bg-gray-50 dark:bg-[#111421] border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white resize-none"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !title || !body}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                {loading ? 'Envoi en cours...' : 'Publier mon avis'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviewModal;
