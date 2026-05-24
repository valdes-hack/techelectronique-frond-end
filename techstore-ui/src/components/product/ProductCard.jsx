import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext'; 

const ProductCard = ({ product }) => {
    // 1. Branchement au cerveau du panier
    const { addToCart } = useCart();

    if (!product) return null;

    // --- LOGIQUE IMAGE ---
    let displayImage = "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?w=600"; 

    if (product.images && product.images.length > 0) {
        const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
        if (primaryImg.url) {
            displayImage = primaryImg.url;
        }
    }

    // --- LOGIQUE PRIX ---
    const currentPrice = product.discountPrice > 0 ? product.discountPrice : (product.basePrice || 0);
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(currentPrice) + " FCFA";

    // --- GESTION DU CLIC ---
    const handleAddClick = (e) => {
        e.preventDefault(); // Empêche d'ouvrir la page produit
        e.stopPropagation(); // Évite les conflits de clics
        
        console.log("🚀 Valdes, j'envoie le produit n°", product.id, "au panier !");
        
        // On appelle le service (ID produit, pas de variante pour l'instant, Qté 1)
        addToCart(product.id, null, 1);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-apple-border/40 p-6 flex flex-col h-[480px] shadow-sm hover:shadow-2xl transition-all duration-500 group relative">
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-apple-blue">
                <ShieldCheck size={18} />
            </div>

            <Link to={`/product/${product.slug}`} className="flex-grow flex flex-col">
                <div className="h-56 w-full mb-6 rounded-2xl overflow-hidden bg-apple-gray/20 flex items-center justify-center p-6 relative text-center">
                    <img 
                        src={displayImage} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => { e.target.src = "https://placehold.co/400?text=Produit+TechStore"; }}
                    />
                </div>
                
                <div className="px-2">
                    <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest mb-1">
                        {product.brand || 'Premium'}
                    </p>
                    <h3 className="text-xl font-bold text-apple-dark leading-tight group-hover:text-apple-blue transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    
                    <div className="flex items-center mt-3 text-yellow-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-black ml-2 text-apple-dark/30">
                            ({product.ratingAvg?.toFixed(1) || '5.0'})
                        </span>
                    </div>
                </div>
            </Link>

            <div className="mt-auto pt-4 flex justify-between items-center border-t border-apple-gray/50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-apple-dark/40 font-bold uppercase">Prix</span>
                    <span className="text-xl font-black text-apple-dark tracking-tighter">
                        {formattedPrice}
                    </span>
                </div>
                
                {/* LE DÉCLENCHEUR ✨ */}
                <button 
                    onClick={handleAddClick}
                    className="bg-apple-dark text-white p-3.5 rounded-full hover:bg-apple-blue transition-all active:scale-90 shadow-lg group-hover:shadow-apple-blue/40 z-10"
                >
                    <Plus size={22} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;