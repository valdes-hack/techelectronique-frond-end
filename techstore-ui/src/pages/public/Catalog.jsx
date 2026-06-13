import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductService from '../../services/product.service';
import ProductCard from '../../components/product/ProductCard';
import { Search, SlidersHorizontal, Box, X, ChevronDown } from 'lucide-react';

const Catalog = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();

    // États des filtres
    const [priceMax, setPriceMax] = useState(2500000);
    const [selectedBrand, setSelectedBrand] = useState("Toutes");
    const [sortBy, setSortBy] = useState("default");
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
    const filteredProducts = products
        .filter(p => {
            const price = p.basePrice || 0;
            const nameMatch = p.name?.toLowerCase().includes(localQuery.toLowerCase());
            const brandMatch = p.brand?.toLowerCase().includes(localQuery.toLowerCase());
            const categoryMatch = selectedBrand === "Toutes" || p.brand === selectedBrand;
            return (nameMatch || brandMatch) && price <= priceMax && categoryMatch;
        })
        .sort((a, b) => {
            if (sortBy === "priceAsc") return a.basePrice - b.basePrice;
            if (sortBy === "priceDesc") return b.basePrice - a.basePrice;
            return 0;
        });

    const brands = ["Toutes", ...new Set(products.map(p => p.brand).filter(b => b))];

    const resetFilters = () => {
        setPriceMax(2500000);
        setSelectedBrand("Toutes");
        setLocalQuery("");
    };

    const hasActiveFilters = priceMax < 2500000 || selectedBrand !== "Toutes" || localQuery !== "";

    const isDark = theme === 'dark';

    // ─── Contenu sidebar (réutilisé mobile + desktop) ───
    const SidebarContent = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-black italic text-base sm:text-lg tracking-tight flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-indigo-500" />
                    Filtres
                </h3>
                <button
                    onClick={resetFilters}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* PRIX */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Budget Max</label>
                    <span className="text-xs font-black text-indigo-500">{Number(priceMax).toLocaleString()} F</span>
                </div>
                <input
                    type="range" min="1000" max="3000000" step="10000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] opacity-30 font-bold">
                    <span>0 F</span>
                    <span>3 000 000 F</span>
                </div>
            </div>

            {/* MARQUES */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Marque</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {brands.map(b => (
                        <button
                            key={b}
                            onClick={() => setSelectedBrand(b)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                selectedBrand === b
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : isDark
                                        ? 'bg-white/5 opacity-60 hover:opacity-100'
                                        : 'bg-slate-100 opacity-60 hover:opacity-100'
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
            <p className="mt-4 font-black italic tracking-tighter opacity-20 uppercase text-xs">TechStore Loading...</p>
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
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        />

                        {/* Drawer */}
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
                            {/* Header drawer */}
                            <div className="flex items-center justify-between mb-6 pt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Options</span>
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

                            {/* Bouton appliquer */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all"
                            >
                                Voir {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* ══════════════════════════════════════
                    HEADER
                ══════════════════════════════════════ */}
                <header className="pt-10 sm:pt-14 pb-8 sm:pb-10 border-b border-black/5 dark:border-white/5">
                    <div className="flex flex-col gap-5">

                        {/* Titre + badge */}
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 px-3 sm:px-4 py-1.5 rounded-full">
                                <SparkleIcon />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                    {filteredProducts.length} Modèle{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-none capitalize">
                                {slug?.replace(/-/g, ' ') || 'Le Store'}
                                <span className="text-indigo-600">.</span>
                            </h1>
                        </div>

                        {/* Barre recherche + bouton filtres mobile */}
                        <div className="flex items-center gap-3">

                            {/* Bouton filtres — mobile & tablette uniquement */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className={`lg:hidden flex items-center gap-2 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shrink-0 transition-all active:scale-95 ${
                                    hasActiveFilters
                                        ? 'bg-indigo-600 text-white'
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

                            {/* Barre de recherche */}
                            <div className="relative flex-1 group">
                                <Search
                                    className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                                    size={17}
                                />
                                <input
                                    type="text"
                                    placeholder="iPhone, MacBook, AirPods..."
                                    className={`w-full py-3.5 sm:py-4 pl-11 sm:pl-14 pr-4 rounded-2xl outline-none transition-all font-bold text-sm border-2 ${
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                                        aria-label="Effacer la recherche"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtres actifs — pills */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2">
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
                                {priceMax < 2500000 && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                                        ≤ {Number(priceMax).toLocaleString()} F
                                        <button onClick={() => setPriceMax(2500000)}><X size={10} /></button>
                                    </span>
                                )}
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                                >
                                    Tout effacer
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
                            isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* ─── GRILLE PRODUITS ─── */}
                    <main className="flex-1 min-w-0">

                        {/* Tri rapide tablette (visible entre sm et lg) */}
                        <div className="flex items-center justify-between mb-5 sm:mb-6 lg:hidden">
                            <span className={`text-xs font-bold opacity-50`}>
                                {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={`rounded-xl pl-3 pr-8 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer ${
                                        isDark ? 'bg-white/5 text-white' : 'bg-white text-slate-900 shadow-sm'
                                    }`}
                                >
                                    <option value="default">Pertinence</option>
                                    <option value="priceAsc">Prix ↑</option>
                                    <option value="priceDesc">Prix ↓</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {filteredProducts.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`py-24 sm:py-32 text-center rounded-[2rem] sm:rounded-[3rem] border-4 border-dashed ${
                                        isDark ? 'border-white/5' : 'border-slate-100 bg-white/50'
                                    }`}
                                >
                                    <Box size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                                    <p className="text-lg sm:text-2xl font-black italic tracking-tighter opacity-20 uppercase">
                                        Aucun résultat trouvé.
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-6 text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5 md:gap-6 xl:gap-8"
                                >
                                    {filteredProducts.map((p, index) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index * 0.04, 0.4) }}
                                        >
                                            <ProductCard product={p} />
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

const SparkleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
);

export default Catalog;