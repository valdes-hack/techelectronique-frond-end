import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, ShieldCheck, Heart, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [wished, setWished] = useState(false);

    if (!product) return null;

    // ── Image ──
    let displayImage = "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?w=600";
    if (product.imageUrl) {
        displayImage = getFullImageUrl(product.imageUrl);
    } else if (product.images?.length > 0) {
        const primary = product.images.find(img => img.isPrimary) || product.images[0];
        if (primary?.url) displayImage = getFullImageUrl(primary.url);
    }

    // ── Prix ──
    const currentPrice = product.discountPrice > 0 ? product.discountPrice : (product.basePrice || 0);
    const originalPrice = product.discountPrice > 0 ? product.basePrice : null;
    const discount = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : null;
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(currentPrice);
    const formattedOriginal = originalPrice ? new Intl.NumberFormat('fr-FR').format(originalPrice) : null;

    // ── Rating ──
    const rating = parseFloat(product.ratingAvg) || 5.0;
    const reviewCount = product.reviewCount || 0;

    // ── Add to cart ──
    const handleAddClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id, null, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const handleWish = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWished(w => !w);
    };

    return (
        <Link
            to={`/product/${product.slug}`}
            className="group relative flex flex-col bg-white dark:bg-[#161926] rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500"
        >
            {/* ── Badges ── */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {discount && (
                    <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg leading-tight">
                        -{discount}%
                    </span>
                )}
                {product.isNew && (
                    <span className="bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg leading-tight flex items-center gap-1">
                        <Zap size={8} className="fill-white" /> NEW
                    </span>
                )}
            </div>

            {/* ── Wishlist ── */}
            <button
                onClick={handleWish}
                className="absolute top-3 right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90"
                aria-label="Wishlist"
            >
                <Heart
                    size={13}
                    className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    strokeWidth={2}
                />
            </button>

            {/* ── Image ── */}
            <div className="relative w-full aspect-square bg-gray-50 dark:bg-[#111421] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600";
                    }}
                    loading="lazy"
                />
                {/* Shimmer hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ── Infos ── */}
            <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1.5 sm:gap-2">

                {/* Marque */}
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                    {product.brand || 'Premium'}
                </p>

                {/* Nom */}
                <h3 className="text-xs sm:text-sm font-bold text-apple-dark dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={9}
                                className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700 fill-current'}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium leading-none">
                        {rating.toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
                    </span>
                </div>

                {/* Prix + Bouton */}
                <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex flex-col leading-tight">
                        {formattedOriginal && (
                            <span className="text-[9px] text-gray-400 line-through font-medium">
                                {formattedOriginal} F
                            </span>
                        )}
                        <span className="text-sm sm:text-base font-black text-apple-dark dark:text-white tracking-tight">
                            {formattedPrice}
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 ml-0.5">F</span>
                        </span>
                    </div>

                    <button
                        onClick={handleAddClick}
                        className={`flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-90 shadow-lg z-10 shrink-0
                            ${added
                                ? 'bg-emerald-500 shadow-emerald-500/30 px-2.5 sm:px-3 py-2 sm:py-2.5 gap-1'
                                : 'bg-apple-dark dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-black/20 dark:shadow-indigo-500/30 p-2 sm:p-2.5'
                            }`}
                        aria-label="Ajouter au panier"
                    >
                        {added ? (
                            <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="text-white text-[9px] font-black uppercase tracking-widest hidden sm:block">OK</span>
                            </>
                        ) : (
                            <Plus size={16} className="text-white" strokeWidth={3} />
                        )}
                    </button>
                </div>
            </div>

            {/* Garantie — visible au hover desktop */}
            <div className="hidden sm:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-1.5 py-2 bg-indigo-600/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <ShieldCheck size={11} className="text-white/70" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Garantie officielle</span>
            </div>
        </Link>
    );
};

export default ProductCard;