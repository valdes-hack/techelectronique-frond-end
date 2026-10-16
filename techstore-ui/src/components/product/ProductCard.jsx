import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, ShieldCheck, Heart, Zap, Check, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [wished, setWished] = useState(false);

    if (!product) return null;

    // ── Détection et Gestion des Variantes & Stock ──
    const hasVariants = product.variants && product.variants.length > 0;
    const inStockVariant = hasVariants ? product.variants.find(v => (v.stockQty || 0) > 0) : null;
    const defaultVariant = inStockVariant || (hasVariants ? product.variants[0] : null);
    const availableStock = defaultVariant ? (defaultVariant.stockQty || 0) : (product.stockQty || 0);
    const isOutOfStock = availableStock <= 0;

    // ── Image ──
    let displayImage = "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?w=600";
    if (product.imageUrl) {
        displayImage = getFullImageUrl(product.imageUrl);
    } else if (product.images?.length > 0) {
        const primary = product.images.find(img => img.isPrimary) || product.images[0];
        if (primary?.url) displayImage = getFullImageUrl(primary.url);
    }

    // ── Prix ──
    const unitPrice = defaultVariant ? defaultVariant.price : (product.discountPrice > 0 ? product.discountPrice : (product.basePrice || 0));
    const originalPrice = defaultVariant ? null : (product.discountPrice > 0 ? product.basePrice : null);
    const discount = originalPrice ? Math.round((1 - unitPrice / originalPrice) * 100) : null;
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(unitPrice);
    const formattedOriginal = originalPrice ? new Intl.NumberFormat('fr-FR').format(originalPrice) : null;

    // ── Rating ──
    const rating = parseFloat(product.ratingAvg) || 5.0;
    const reviewCount = product.reviewCount || 0;

    // ── Add to cart ──
    const handleAddClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product.id, defaultVariant?.id || null, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const handleWish = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWished(w => !w);
    };

    // ═════════════════════════════════════════════════════════
    // 1. VUE LISTE (HORIZONTAL)
    // ═════════════════════════════════════════════════════════
    if (viewMode === 'list') {
        return (
            <Link
                to={`/product/${product.slug}`}
                className="group relative flex flex-col sm:flex-row bg-white dark:bg-[#161926] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 p-4 sm:p-5 gap-4 sm:gap-6 items-center"
            >
                {/* Image miniature */}
                <div className="relative w-full sm:w-44 md:w-52 aspect-square bg-gray-50 dark:bg-[#111421] rounded-2xl flex items-center justify-center p-4 overflow-hidden shrink-0">
                    <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80";
                        }}
                    />
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {discount && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                                -{discount}%
                            </span>
                        )}
                        {product.isNew && (
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Zap size={8} className="fill-white" /> NEW
                            </span>
                        )}
                    </div>
                </div>

                {/* Contenu textuel */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1 w-full">
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                {product.brand || 'Premium'}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                !isOutOfStock 
                                    ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' 
                                    : 'bg-red-500/10 text-red-500 dark:text-red-400'
                            }`}>
                                {!isOutOfStock ? `En Stock (${availableStock})` : 'Rupture'}
                            </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-apple-dark dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {product.name}
                        </h3>

                        {product.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Note */}
                        <div className="flex items-center gap-1 mt-2.5">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={11}
                                        className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700 fill-current'}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 font-medium ml-1">
                                {rating.toFixed(1)}{reviewCount > 0 ? ` (${reviewCount} avis)` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Prix et Actions en bas */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                            {formattedOriginal && (
                                <span className="text-xs text-gray-400 line-through font-medium">
                                    {formattedOriginal} F
                                </span>
                            )}
                            <div className="text-xl sm:text-2xl font-black text-apple-dark dark:text-white tracking-tight">
                                {formattedPrice} <span className="text-xs font-bold text-gray-400">F</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleWish}
                                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                aria-label="Favoris"
                            >
                                <Heart size={16} className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                            </button>

                            <button
                                onClick={handleAddClick}
                                disabled={isOutOfStock}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-md ${
                                    isOutOfStock
                                        ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none'
                                        : added
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                                }`}
                            >
                                {added ? (
                                    <>
                                        <Check size={14} strokeWidth={3} />
                                        <span>Ajouté</span>
                                    </>
                                ) : isOutOfStock ? (
                                    <span>Épuisé</span>
                                ) : (
                                    <>
                                        <ShoppingBag size={14} />
                                        <span>Ajouter</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // ═════════════════════════════════════════════════════════
    // 2. VUE ÉDITORIALE (PLEINE LARGEUR HORIZONTALE AVEC DÉTAILS)
    // ═════════════════════════════════════════════════════════
    if (viewMode === 'editorial') {
        return (
            <Link
                to={`/product/${product.slug}`}
                className="group relative flex flex-col md:flex-row bg-white dark:bg-[#161926] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 p-6 sm:p-8 gap-8 items-center"
            >
                {/* Grand Visuel */}
                <div className="relative w-full md:w-80 aspect-square bg-gray-50 dark:bg-[#111421] rounded-3xl flex items-center justify-center p-8 overflow-hidden shrink-0">
                    <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80";
                        }}
                    />
                    {discount && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Détails */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-2 w-full">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                                {product.brand || 'PEOC Élevage'}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                !isOutOfStock ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                                {!isOutOfStock ? `Stock : ${availableStock} unités` : 'Rupture'}
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-apple-dark dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">
                            {product.name}
                        </h3>

                        {product.description && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={13}
                                        className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700 fill-current'}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 font-bold ml-1">
                                {rating.toFixed(1)} / 5 {reviewCount > 0 && `(${reviewCount} avis clients)`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                        <div>
                            {formattedOriginal && (
                                <span className="text-xs text-gray-400 line-through font-bold block">
                                    {formattedOriginal} F
                                </span>
                            )}
                            <span className="text-2xl sm:text-3xl font-black text-apple-dark dark:text-white tracking-tight">
                                {formattedPrice} <span className="text-xs font-bold text-gray-400">FCFA</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleWish}
                                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <Heart size={18} className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                            </button>

                            <button
                                onClick={handleAddClick}
                                disabled={isOutOfStock}
                                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
                                    isOutOfStock
                                        ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'
                                        : added
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                                }`}
                            >
                                {added ? <Check size={16} strokeWidth={3} /> : <ShoppingBag size={16} />}
                                <span>{added ? 'Ajouté' : isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // ═════════════════════════════════════════════════════════
    // 3. VUE GRANDE GRILLE (LARGE GRID / 2 COLONNES)
    // ═════════════════════════════════════════════════════════
    if (viewMode === 'large-grid') {
        return (
            <Link
                to={`/product/${product.slug}`}
                className="group relative flex flex-col bg-white dark:bg-[#161926] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500"
            >
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {discount && (
                        <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/20">
                            -{discount}%
                        </span>
                    )}
                    {product.isNew && (
                        <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1">
                            <Zap size={10} className="fill-white" /> NOUVEAUTÉ
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    onClick={handleWish}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md"
                    aria-label="Wishlist"
                >
                    <Heart size={16} className={wished ? 'fill-red-500 text-red-500' : 'text-gray-400'} strokeWidth={2} />
                </button>

                {/* Grand Visuel */}
                <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-[#111421] flex items-center justify-center p-8 overflow-hidden">
                    <img
                        src={displayImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80";
                        }}
                    />
                </div>

                {/* Infos */}
                <div className="flex flex-col flex-1 p-6 gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                            {product.brand || 'Électronique'}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            !isOutOfStock ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {!isOutOfStock ? `En stock (${availableStock})` : 'Rupture'}
                        </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-apple-dark dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700 fill-current'}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {rating.toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
                        </span>
                    </div>

                    {/* Prix + CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                        <div>
                            {formattedOriginal && (
                                <span className="text-xs text-gray-400 line-through font-medium block">
                                    {formattedOriginal} F
                                </span>
                            )}
                            <span className="text-xl sm:text-2xl font-black text-apple-dark dark:text-white tracking-tight">
                                {formattedPrice} <span className="text-xs font-bold text-gray-400">F</span>
                            </span>
                        </div>

                        <button
                            onClick={handleAddClick}
                            disabled={isOutOfStock}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg ${
                                isOutOfStock
                                    ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none'
                                    : added
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                            }`}
                        >
                            {added ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                            <span>{added ? 'Ajouté' : isOutOfStock ? 'Épuisé' : 'Commander'}</span>
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // ═════════════════════════════════════════════════════════
    // 3. VUE STANDARD (GRILLE CLASSIQUE)
    // ═════════════════════════════════════════════════════════
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
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80";
                    }}
                />
                {/* Stock Tag si Rupture */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                            Rupture de Stock
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ── Infos ── */}
            <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1.5 sm:gap-2">
                {/* Marque + Stock status */}
                <div className="flex items-center justify-between">
                    <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                        {product.brand || 'Premium'}
                    </p>
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase ${
                        !isOutOfStock ? 'text-emerald-500' : 'text-red-400'
                    }`}>
                        {!isOutOfStock ? `${availableStock} dispo` : 'Épuisé'}
                    </span>
                </div>

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
                        disabled={isOutOfStock}
                        className={`flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-90 shadow-lg z-10 shrink-0 ${
                            isOutOfStock
                                ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none p-2'
                                : added
                                    ? 'bg-emerald-500 shadow-emerald-500/30 px-2.5 sm:px-3 py-2 sm:py-2.5 gap-1'
                                    : 'bg-apple-dark dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-black/20 dark:shadow-indigo-500/30 p-2 sm:p-2.5'
                        }`}
                        aria-label="Ajouter au panier"
                    >
                        {added ? (
                            <>
                                <Check size={12} strokeWidth={3} className="text-white" />
                                <span className="text-white text-[9px] font-black uppercase tracking-widest hidden sm:block">OK</span>
                            </>
                        ) : isOutOfStock ? (
                            <span className="text-[9px] font-bold uppercase px-1">0</span>
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