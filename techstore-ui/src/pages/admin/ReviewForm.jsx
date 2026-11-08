import React, { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import ProductService from '../../services/product.service';

const ReviewForm = ({ productId, orderId, onReviewAdded, theme }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', body: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ProductService.postReview({
                productId,
                orderId,
                rating,
                ...formData
            });
            alert("Avis publié ! Merci de votre retour.");
            onReviewAdded();
        } catch (err) {
            alert("Erreur lors de la publication de l'avis.");
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl space-y-6">
            <h4 className="text-xl font-black italic tracking-tighter uppercase">Donnez votre avis</h4>
            
            {/* Étoiles Interactives */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Star 
                            size={32} 
                            fill={(hover || rating) >= star ? "#fbbf24" : "none"} 
                            className="transition-all hover:scale-110"
                        />
                    </button>
                ))}
            </div>

            <input 
                required placeholder="Titre de votre avis"
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl outline-none placeholder:text-white/40 font-bold"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
            />

            <textarea 
                required placeholder="Racontez votre expérience d'utilisation..."
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl outline-none placeholder:text-white/40 h-32"
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
            />

            <button disabled={loading} type="submit" className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-apple-gray transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} 
                Publier mon avis
            </button>
        </form>
    );
};