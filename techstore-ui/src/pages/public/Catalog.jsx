import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductService from '../../services/product.service';
import ProductCard from '../../components/product/ProductCard';
import { 
    Search, SlidersHorizontal, Box, X, ChevronDown, 
    LayoutGrid, Grid2X2, Grid3X3, StretchHorizontal, List, Sparkles, Check, RefreshCw
} from 'lucide-react';

const Catalog = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Cache local pour les produits afin d'éviter tout écran blanc au chargement
    const [products, setProducts] = useState(() => {
        try {
            const cached = sessionStorage.getItem('techstore_catalog_cache');
            return cached ? JSON.parse(cached).filter(p => p.isActive !== false) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(products.length === 0);
    const { theme } = useTheme();

    // 5 modes d'affichage :
    // 1. 'grid'       : Grille standard (3-4 colonnes)
    // 2. 'large-grid' : Grande grille (2 colonnes)
    // 3. 'compact'    : Grille compacte / dense (4-5 colonnes)
    // 4. 'editorial'  : Grille 1 colonne large (fiche détaillée)
    // 5. 'list'       : Vue liste horizontale classique
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
        if (products.length === 0) setLoading(true);
        try {
            let res;
            if (slug) {
                res = await ProductService.getByCategory(slug);
            } else {
                res = await ProductService.getAll(0, 100);
            }

            if (res && res.status === 'success') {
                const list = res.data?.content || res.data || [];
                const validList = Array.isArray(list) ? list.filter(p => p.isActive !== false) : [];
                setProducts(validList);
                try {
                    sessionStorage.setItem('techstore_catalog_cache', JSON.stringify(validList));
                } catch (e) {
                    console.error("Cache save error", e);
                }
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
                if (p.isActive === false) return false;
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
    }, [products, localQuery, selectedBrand, priceMax, sortBy, inStockOnly]);

    // Liste unique des marques disponibles
    const brands = useMemo(() => {
        const set = new Set(products.map(p => p.brand).filter(Boolean));
        return ["Toutes", ...Array.from(set)];
    }, [products]);

    const resetFilters = () => {
        setPriceMax(3000000);
        setSelectedBrand("Toutes");
        setSortBy("default");
        setInStockOnly(false);
        setLocalQuery("");
    };

    const hasActiveFilters = priceMax < 3000000 || selectedBrand !== "Toutes" || inStockOnly || localQuery !== "";
    const isDark = theme === 'dark';

    // ─── COMPOSANT DU CONTENU DES FILTRES (Partagé Mobile & Desktop) ───
    const SidebarContent = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <span className="font-black italic text-sm tracking-wider uppercase flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-indigo-600" /> Filtres
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline"
                    >
                        Effacer
                    </button>
                )}
            </div>

            {/* STOCK */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Disponibilité</label>
                <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
                        inStockOnly
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : isDark
                                ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <span>En stock seulement</span>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                        inStockOnly ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-current'
                    }`}>
                        {inStockOnly && <Check size={12} strokeWidth={3} />}
                    </span>
                </button>
            </div>

            {/* PRIX MAX */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                    <span>Budget Max</span>
                    <span className="text-indigo-500 opacity-100 font-black">{Number(priceMax).toLocaleString()} F</span>
                </div>
                <input
                    type="range"
                    min="5000"
                    max="3000000"
                    step="10000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-black opacity-30">
                    <span>5 000 F</span>
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

    // Détermination de la classe de grille selon les 5 modes d'affichage
    const getGridClassName = () => {
        switch (viewMode) {
            case 'compact':
                // 1. Grille compacte dense (4-5 colonnes)
                return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5";
            case 'large-grid':
                // 2. Grande grille aérée (2 colonnes)
                return "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8";
            case 'editorial':
                // 3. Vue éditoriale / Fiche 1 colonne pleine largeur
                return "grid grid-cols-1 gap-6 max-w-4xl mx-auto";
            case 'list':
                // 4. Vue liste horizontale
                return "flex flex-col gap-3.5 sm:gap-4";
            case 'grid':
            default:
                // 5. Grille standard (3 colonnes)
                return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5 md:gap-6 xl:gap-8";
        }
    };

    return (
        <div className={`min-h-screen pb-20 transition-colors duration-500 ${isDark ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>

            {/* OVERLAY SIDEBAR MOBILE */}
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
                            key="sidebar"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 p-6 overflow-y-auto custom-scrollbar lg:hidden ${
                                isDark ? 'bg-[#161926] text-white border-r border-white/10' : 'bg-white text-slate-900 shadow-2xl'
                            }`}
                        >
                            <div className="flex items-center justify-between pb-6 mb-6 border-b border-black/5 dark:border-white/5">
                                <h3 className="font-black text-lg italic tracking-tight">Filtres de recherche</h3>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                    aria-label="Fermer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <SidebarContent />
                            <div className="pt-8">
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/30"
                                >
                                    Voir {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

                {/* HEADER BOUTIQUE */}
                <header className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 block mb-1">
                                {slug ? `Rayon : ${slug}` : 'Catalogue Complet'}
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                                La Boutique<span className="text-indigo-600">.</span>
                            </h1>
                        </div>

                        {/* COMPTEUR & SÉLECTEUR D'AFFICHAGE AVEC 5 DISPOSITIONS */}
                        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 flex-wrap">
                            <span className="text-xs font-bold text-gray-400">
                                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                            </span>

                            {/* ── SWITCHER D'AFFICHAGE AVEC 5 MODES COMPLETS ── */}
                            <div className="flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-2xl shadow-sm">
                                {/* 1. Grille Compacte (4-5 colonnes) */}
                                <button
                                    type="button"
                                    onClick={() => handleViewChange('compact')}
                                    title="Grille Compacte (Dense)"
                                    className={`p-2 rounded-xl transition-all ${
                                        viewMode === 'compact'
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Grid3X3 size={15} />
                                </button>

                                {/* 2. Grille Standard (3 colonnes) */}
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
                                    <LayoutGrid size={15} />
                                </button>

                                {/* 3. Grande Grille (2 colonnes) */}
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
                                    <Grid2X2 size={15} />
                                </button>

                                {/* 4. Vue Éditoriale (1 colonne large) */}
                                <button
                                    type="button"
                                    onClick={() => handleViewChange('editorial')}
                                    title="Vue Éditoriale (Détaillée)"
                                    className={`p-2 rounded-xl transition-all ${
                                        viewMode === 'editorial'
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <StretchHorizontal size={15} />
                                </button>

                                {/* 5. Vue Liste Horizontale */}
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
                                    <List size={15} />
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
                                        ? 'bg-white/5 text-gray-300 border border-white/5'
                                        : 'bg-white text-slate-700 shadow-sm'
                            }`}
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

                    {/* Filtres actifs */}
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
                </header>

                {/* LAYOUT PRINCIPAL */}
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 mt-8 sm:mt-10">

                    {/* SIDEBAR DESKTOP */}
                    <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                        <div className={`p-6 xl:p-8 rounded-[2rem] border sticky top-24 ${
                            isDark ? 'bg-[#161926] border-white/5 shadow-xl' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* CONTENEUR PRODUITS */}
                    <main className="flex-1 min-w-0">
                        {loading && products.length === 0 ? (
                            /* SKELETON CARDS AU LIEU DU ROND QUI TOURNE (STYLE YOUTUBE) */
                            <div className={getGridClassName()}>
                                {[...Array(8)].map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`rounded-3xl p-4 space-y-4 border animate-pulse ${
                                            isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100'
                                        }`}
                                    >
                                        <div className="aspect-square bg-gray-200 dark:bg-white/5 rounded-2xl" />
                                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-3/4" />
                                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-xl w-1/2" />
                                        <div className="h-6 bg-gray-200 dark:bg-white/5 rounded-xl w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`py-24 sm:py-32 text-center rounded-[2.5rem] border-2 border-dashed ${
                                    isDark ? 'border-white/5 bg-[#161926]/40' : 'border-slate-200 bg-white/50'
                                }`}
                            >
                                <Box size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                                <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white">
                                    Aucun produit trouvé
                                </h3>
                                <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto mt-2">
                                    Essayez d'ajuster vos critères de recherche ou de réinitialiser vos filtres.
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
                                transition={{ duration: 0.2 }}
                                className={getGridClassName()}
                            >
                                {filteredProducts.map((p, index) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.02, 0.25) }}
                                    >
                                        <ProductCard product={p} viewMode={viewMode} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Catalog;