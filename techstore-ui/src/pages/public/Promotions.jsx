import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductService from '../../services/product.service';
import ProductCard from '../../components/product/ProductCard';
import { 
    Flame, Sparkles, Percent, Tag, Clock, ArrowRight, 
    SlidersHorizontal, Search, Grid3X3, LayoutGrid, Grid2X2, 
    StretchHorizontal, List, RefreshCw, Box
} from 'lucide-react';

const Promotions = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('discountDesc'); // 'discountDesc' | 'priceAsc' | 'priceDesc'

    // 5 Modes d'affichage comme le catalogue
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('techstore_promo_view') || 'grid';
    });

    const handleViewChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('techstore_promo_view', mode);
    };

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await ProductService.getPromotions();
            if (res && res.status === 'success') {
                setProducts(res.data || []);
            }
        } catch (e) {
            console.error("Erreur chargement promotions", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    // Catégories disponibles parmi les promos
    const categories = useMemo(() => {
        return ['ALL', ...new Set(products.map(p => p.categoryName).filter(Boolean))];
    }, [products]);

    // Filtrage et tri
    const filteredPromotions = useMemo(() => {
        return products
            .filter(p => {
                const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                                    p.brand?.toLowerCase().includes(search.toLowerCase());
                const matchCat = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
                return matchSearch && matchCat;
            })
            .sort((a, b) => {
                const discA = Math.round((1 - Number(a.discountPrice) / Number(a.basePrice)) * 100);
                const discB = Math.round((1 - Number(b.discountPrice) / Number(b.basePrice)) * 100);
                if (sortBy === 'discountDesc') return discB - discA;
                if (sortBy === 'priceAsc') return Number(a.discountPrice) - Number(b.discountPrice);
                if (sortBy === 'priceDesc') return Number(b.discountPrice) - Number(a.discountPrice);
                return 0;
            });
    }, [products, search, selectedCategory, sortBy]);

    // Calcul de la plus grosse remise
    const maxDiscount = useMemo(() => {
        if (products.length === 0) return 0;
        return Math.max(...products.map(p => Math.round((1 - Number(p.discountPrice) / Number(p.basePrice)) * 100)));
    }, [products]);

    const getGridClassName = () => {
        switch (viewMode) {
            case 'compact':
                return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5";
            case 'large-grid':
                return "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8";
            case 'editorial':
                return "grid grid-cols-1 gap-6 max-w-4xl mx-auto";
            case 'list':
                return "flex flex-col gap-3.5 sm:gap-4";
            case 'grid':
            default:
                return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5 md:gap-6 xl:gap-8";
        }
    };

    return (
        <div className={`min-h-screen pb-24 transition-colors duration-500 ${isDark ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>
            
            {/* ── BANNIÈRE HÉRO PROMOTIONS ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-indigo-900 text-white py-14 sm:py-20 px-4 sm:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg">
                            <Flame size={15} className="fill-white" /> Ventes Flash & Offres Spéciales
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            Les Grandes Promos<span className="text-yellow-300">.</span>
                        </h1>
                        <p className="text-sm sm:text-base font-semibold text-white/90 leading-relaxed max-w-xl">
                            Profitez de remises exclusives sur une sélection d'articles haute technologie, smartphones, PC et accessoires officiels garantis.
                        </p>
                    </div>

                    {maxDiscount > 0 && (
                        <div className="self-start md:self-auto bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg">
                                %
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block">Jusqu'à</span>
                                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
                                    -{maxDiscount}%
                                </span>
                                <span className="text-[10px] font-bold text-yellow-300 block mt-1 uppercase tracking-wider">de réduction immédiate</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
                
                {/* ── BARRE DE CONTRÔLE (Filtres, Recherche, 5 Modes d'Affichage) ── */}
                <div className={`p-4 sm:p-6 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                    
                    {/* Recherche */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une promotion..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Filtre catégories & Tri */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-900 dark:text-white cursor-pointer"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c === 'ALL' ? 'Tous les Rayons' : c}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-900 dark:text-white cursor-pointer"
                        >
                            <option value="discountDesc">Plus forte remise</option>
                            <option value="priceAsc">Prix croissant</option>
                            <option value="priceDesc">Prix décroissant</option>
                        </select>

                        {/* ── LES 5 MODES D'AFFICHAGE ── */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/10 p-1 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => handleViewChange('compact')}
                                title="Grille Compacte"
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'compact' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Grid3X3 size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange('grid')}
                                title="Grille Standard"
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'grid' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange('large-grid')}
                                title="Grande Grille"
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'large-grid' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Grid2X2 size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange('editorial')}
                                title="Vue Éditoriale"
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'editorial' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <StretchHorizontal size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange('list')}
                                title="Vue Liste"
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'list' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <List size={15} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── LISTE DES PRODUITS EN PROMOTION ── */}
                {loading ? (
                    <div className={getGridClassName()}>
                        {[...Array(6)].map((_, idx) => (
                            <div 
                                key={idx}
                                className={`rounded-3xl p-4 space-y-4 border animate-pulse ${
                                    isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100'
                                }`}
                            >
                                <div className="aspect-square bg-gray-200 dark:bg-white/5 rounded-2xl" />
                                <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className={`py-24 text-center rounded-[2.5rem] border-2 border-dashed ${
                        isDark ? 'border-white/5 bg-[#161926]/40' : 'border-slate-200 bg-white/50'
                    }`}>
                        <Flame size={48} className="mx-auto text-gray-400 mb-4 opacity-40" />
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">
                            Aucune promotion en cours
                        </h3>
                        <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto mt-2">
                            Toutes les offres spéciales ont été saisies ou aucun produit ne correspond à vos filtres.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        key={`promo-grid-${viewMode}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={getGridClassName()}
                    >
                        {filteredPromotions.map((p, index) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.02, 0.2) }}
                            >
                                <ProductCard product={p} viewMode={viewMode} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

            </div>
        </div>
    );
};

export default Promotions;
