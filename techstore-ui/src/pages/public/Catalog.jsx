import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductService from '../../services/product.service';
import ProductCard from '../../components/product/ProductCard';
import { 
    Search, SlidersHorizontal, Box, X, ChevronDown, 
    LayoutGrid, Grid2X2, List, Sparkles, Check, RefreshCw
} from 'lucide-react';

const Catalog = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Mode d'affichage : 'grid' (grille 3-4 cols) | 'large-grid' (grille 2 cols) | 'list' (1 col horizontale)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('techstore_catalog_view') || 'grid';
    });

    const handleViewChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('techstore_catalog_view', mode);
    };

    // États des filtres
    const [priceMax, setPriceMax] = useState(3000000);
    const [selectedBrand, setSelectedBrand] = useState("Toutes");
    const [sortBy, setSortBy] = useState("default");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchParams.get('q') || "");

    // État sidebar mobile/tablette
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            let res;
            if (slug) {
                res = await ProductService.getByCategory(slug);
            } else {
                res = await ProductService.getAll(0, 100);
            }

            if (res && res.status === 'success') {
                const list = res.data?.content || res.data || [];
                setProducts(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error("Erreur liaison", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [slug]);

    // Fermer sidebar quand on resize vers desktop
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Bloquer le scroll body quand sidebar mobile ouverte
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    // Logique de filtrage et tri
    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                const price = p.discountPrice > 0 ? p.discountPrice : (p.basePrice || 0);
                const nameMatch = p.name?.toLowerCase().includes(localQuery.toLowerCase());
                const brandMatch = p.brand?.toLowerCase().includes(localQuery.toLowerCase());
                const categoryMatch = selectedBrand === "Toutes" || p.brand === selectedBrand;
                
                // Calcul stock disponible (produit ou variantes)
                const stock = p.variants?.length > 0 
                    ? p.variants.reduce((acc, v) => acc + (v.stockQty || 0), 0)
                    : (p.stockQty || 0);
                const stockMatch = !inStockOnly || stock > 0;

                return (nameMatch || brandMatch) && price <= priceMax && categoryMatch && stockMatch;
            })
            .sort((a, b) => {
                const priceA = a.discountPrice > 0 ? a.discountPrice : (a.basePrice || 0);
                const priceB = b.discountPrice > 0 ? b.discountPrice : (b.basePrice || 0);

                if (sortBy === "priceAsc") return priceA - priceB;
                if (sortBy === "priceDesc") return priceB - priceA;
                if (sortBy === "rating") return (b.ratingAvg || 0) - (a.ratingAvg || 0);
                if (sortBy === "newest") return (b.id || 0) - (a.id || 0);
                return 0;
            });
    }, [products, localQuery, selectedBrand, priceMax, inStockOnly, sortBy]);

    const brands = useMemo(() => {
        return ["Toutes", ...new Set(products.map(p => p.brand).filter(Boolean))];
    }, [products]);

    const resetFilters = () => {
        setPriceMax(3000000);
        setSelectedBrand("Toutes");
        setLocalQuery("");
        setInStockOnly(false);
        setSortBy("default");
    };

    const hasActiveFilters = priceMax < 3000000 || selectedBrand !== "Toutes" || localQuery !== "" || inStockOnly || sortBy !== "default";
    const isDark = theme === 'dark';

    // ─── Contenu sidebar (réutilisé mobile + desktop) ───
    const SidebarContent = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-black italic text-base sm:text-lg tracking-tight flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-indigo-500" />
                    Filtres & Préférences
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                        <RefreshCw size={10} /> Reset
                    </button>
                )}
            </div>

            {/* DISPONIBILITÉ */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Disponibilité</label>
                <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-bold ${
                        inStockOnly
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                >
                    <span>En stock uniquement</span>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        inStockOnly 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : isDark ? 'border-white/20' : 'border-gray-300'
                    }`}>
                        {inStockOnly && <Check size={12} strokeWidth={3} />}
                    </div>
                </button>
            </div>

            {/* PRIX */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Budget Max</label>
                    <span className="text-xs font-black text-indigo-500">{Number(priceMax).toLocaleString()} F</span>
                </div>
                <input
                    type="range" 
                    min="10000" 
                    max="3000000" 
                    step="25000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] opacity-30 font-bold">
                    <span>10 000 F</span>
                    <span>3 000 000 F</span>
                </div>
            </div>

            {/* MARQUES */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Marques ({brands.length - 1})</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {brands.map(b => (
                        <button
                            key={b}
                            onClick={() => setSelectedBrand(b)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                selectedBrand === b
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                                    : isDark
                                        ? 'bg-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'
                                        : 'bg-slate-100 opacity-60 hover:opacity-100 hover:bg-slate-200'
                            }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* TRI */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Trier par</label>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full rounded-2xl p-3.5 pr-10 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer ${
                            isDark ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-900'
                        }`}
                    >
                        <option value="default">Pertinence</option>
                        <option value="priceAsc">Prix croissant</option>
                        <option value="priceDesc">Prix décroissant</option>
                        <option value="rating">Meilleurs avis</option>
                        <option value="newest">Nouveautés</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className={`h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#0b0e14]' : 'bg-white'}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
            <p className="mt-4 font-black italic tracking-tighter opacity-30 uppercase text-xs">Chargement de la boutique...</p>
        </div>
    );

    return (
        <div className={`min-h-screen pb-20 transition-colors duration-500 ${isDark ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>

            {/* ══════════════════════════════════════
                OVERLAY SIDEBAR MOBILE
            ══════════════════════════════════════ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        />

                        <motion.div
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] z-50 overflow-y-auto p-6 pt-safe lg:hidden ${
                                isDark ? 'bg-[#161926]' : 'bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-6 pt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Filtres</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'
                                    }`}
                                    aria-label="Fermer les filtres"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                            <SidebarContent />

                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Voir les {filteredProducts.length} articles
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* ══════════════════════════════════════
                    HEADER DE LA BOUTIQUE
                ══════════════════════════════════════ */}
                <header className="pt-8 sm:pt-12 pb-6 sm:pb-8 border-b border-black/5 dark:border-white/5">
                    <div className="flex flex-col gap-6">

                        {/* Titre & Compteur */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 px-3 sm:px-4 py-1.5 rounded-full">
                                    <Sparkles size={12} />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                        Catalogue Officiel
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter leading-none capitalize">
                                    {slug?.replace(/-/g, ' ') || 'La Boutique'}
                                    <span className="text-indigo-600">.</span>
                                </h1>
                            </div>

                            {/* COMPTEUR & SÉLECTEUR D'AFFICHAGE (DESKTOP / MOBILE) */}
                            <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4">
                                <span className="text-xs font-bold text-gray-400">
                                    {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                                </span>

                                {/* ── SWITCHER D'AFFICHAGE (GRILLE / GRANDE GRILLE / LISTE) ── */}
                                <div className="flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleViewChange('grid')}
                                        title="Grille Standard (3 colonnes)"
                                        className={`p-2 rounded-xl transition-all ${
                                            viewMode === 'grid'
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <LayoutGrid size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleViewChange('large-grid')}
                                        title="Grande Grille (2 colonnes)"
                                        className={`p-2 rounded-xl transition-all ${
                                            viewMode === 'large-grid'
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Grid2X2 size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleViewChange('list')}
                                        title="Vue Liste Horizontale"
                                        className={`p-2 rounded-xl transition-all ${
                                            viewMode === 'list'
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Barre de recherche + bouton filtres mobile */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className={`lg:hidden flex items-center gap-2 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shrink-0 transition-all active:scale-95 ${
                                    hasActiveFilters
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : isDark
                                            ? 'bg-white/5 text-white hover:bg-white/10'
                                            : 'bg-white text-slate-900 shadow-sm hover:shadow-md'
                                }`}
                                aria-label="Ouvrir les filtres"
                            >
                                <SlidersHorizontal size={15} />
                                <span className="hidden sm:inline">Filtres</span>
                                {hasActiveFilters && (
                                    <span className="w-4 h-4 bg-white text-indigo-600 rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                                        !
                                    </span>
                                )}
                            </button>

                            <div className="relative flex-1 group">
                                <Search
                                    className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                    size={17}
                                />
                                <input
                                    type="text"
                                    placeholder="Rechercher un modèle, marque, accessoires..."
                                    className={`w-full py-3.5 sm:py-4 pl-11 sm:pl-14 pr-10 rounded-2xl outline-none transition-all font-bold text-sm border-2 ${
                                        isDark
                                            ? 'bg-white/5 border-white/5 focus:bg-white/10 focus:border-indigo-500/30 text-white placeholder-white/30'
                                            : 'bg-white border-transparent shadow-sm focus:shadow-xl focus:ring-4 focus:ring-indigo-500/10 text-slate-900 placeholder-slate-400'
                                    }`}
                                    value={localQuery}
                                    onChange={(e) => setLocalQuery(e.target.value)}
                                />
                                {localQuery && (
                                    <button
                                        onClick={() => setLocalQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity p-1"
                                        aria-label="Effacer la recherche"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtres actifs (Pills cliquables) */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {localQuery && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                        "{localQuery}"
                                        <button onClick={() => setLocalQuery("")}><X size={10} /></button>
                                    </span>
                                )}
                                {selectedBrand !== "Toutes" && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                        {selectedBrand}
                                        <button onClick={() => setSelectedBrand("Toutes")}><X size={10} /></button>
                                    </span>
                                )}
                                {priceMax < 3000000 && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                        ≤ {Number(priceMax).toLocaleString()} F
                                        <button onClick={() => setPriceMax(3000000)}><X size={10} /></button>
                                    </span>
                                )}
                                {inStockOnly && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'}`}>
                                        En stock uniquement
                                        <button onClick={() => setInStockOnly(false)}><X size={10} /></button>
                                    </span>
                                )}
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors ml-2"
                                >
                                    Tout réinitialiser
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* ══════════════════════════════════════
                    LAYOUT PRINCIPAL
                ══════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 mt-8 sm:mt-10">

                    {/* ─── SIDEBAR DESKTOP ─── */}
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                        <div className={`p-6 xl:p-8 rounded-[2rem] border sticky top-24 ${
                            isDark ? 'bg-[#161926] border-white/5 shadow-xl' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* ─── CONTENEUR PRODUITS ─── */}
                    <main className="flex-1 min-w-0">

                        <AnimatePresence mode="wait">
                            {filteredProducts.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`py-24 sm:py-32 text-center rounded-[2.5rem] border-2 border-dashed ${
                                        isDark ? 'border-white/5 bg-[#161926]/40' : 'border-slate-200 bg-white/50'
                                    }`}
                                >
                                    <Box size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                                    <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white">
                                        Aucun produit trouvé
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto mt-2">
                                        Essayez d'ajuster vos critères de recherche ou de réinitialiser vos filtres de prix et marques.
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`list-${viewMode}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={
                                        viewMode === 'list'
                                            ? "flex flex-col gap-4 sm:gap-5"
                                            : viewMode === 'large-grid'
                                                ? "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8"
                                                : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5 md:gap-6 xl:gap-8"
                                    }
                                >
                                    {filteredProducts.map((p, index) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                                        >
                                            <ProductCard product={p} viewMode={viewMode} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Catalog;