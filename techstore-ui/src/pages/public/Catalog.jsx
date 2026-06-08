import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductService from '../../services/product.service';
import ProductCard from '../../components/product/ProductCard';
import { Search, SlidersHorizontal, Box, ArrowUpDown, X, LayoutGrid } from 'lucide-react';

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

    // Logique de filtrage et tri ✨
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

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
            <p className="mt-4 font-black italic tracking-tighter opacity-20 uppercase text-xs">TechStore Loading...</p>
        </div>
    );

    return (
        <div className={`min-h-screen pb-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                {/* --- SECTION TITRE (STYLE APPLE) --- */}
                <header className="pt-16 pb-12 border-b border-black/5 dark:border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 px-4 py-1.5 rounded-full">
                                <SparkleIcon />
                                <span className="text-[10px] font-black uppercase tracking-widest">{filteredProducts.length} Modèles trouvés</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none capitalize">
                                {slug?.replace('-', ' ') || 'Le Store'}<span className="text-indigo-600">.</span>
                            </h1>
                        </div>

                        {/* BARRE DE RECHERCHE DYNAMIQUE */}
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Chercher un iPhone, un Mac..." 
                                className={`w-full py-5 pl-14 pr-6 rounded-[2rem] outline-none transition-all font-bold text-sm border-2 ${theme === 'dark' ? 'bg-white/5 border-white/5 focus:bg-white/10' : 'bg-white border-transparent shadow-sm focus:shadow-xl focus:ring-4 focus:ring-indigo-500/5'}`}
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-12 mt-12">
                    
                    {/* --- SIDEBAR FILTRES --- */}
                    <aside className="w-full lg:w-72 space-y-10">
                        <div className={`p-8 rounded-[2.5rem] border sticky top-28 ${theme === 'dark' ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black italic text-lg tracking-tight flex items-center">
                                    <SlidersHorizontal size={18} className="mr-2 text-indigo-500" /> Filtres
                                </h3>
                                <button onClick={resetFilters} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Reset</button>
                            </div>

                            <div className="space-y-10">
                                {/* PRIX */}
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Budget Max</label>
                                        <span className="text-xs font-black text-indigo-500">{priceMax.toLocaleString()} F</span>
                                    </div>
                                    <input 
                                        type="range" min="1000" max="3000000" step="10000" 
                                        value={priceMax} 
                                        onChange={(e) => setPriceMax(e.target.value)} 
                                        className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                    />
                                </div>

                                {/* MARQUES */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Marque favorite</label>
                                    <div className="flex flex-wrap gap-2">
                                        {brands.map(b => (
                                            <button 
                                                key={b} 
                                                onClick={() => setSelectedBrand(b)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedBrand === b ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 dark:bg-white/5 opacity-60 hover:opacity-100'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* TRI */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Trier par</label>
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl p-4 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="default">Pertinence</option>
                                        <option value="priceAsc">Prix croissant</option>
                                        <option value="priceDesc">Prix décroissant</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* --- GRILLE DE PRODUITS --- */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            {filteredProducts.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className={`py-32 text-center rounded-[3rem] border-4 border-dashed ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-white/50'}`}
                                >
                                    <Box size={60} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-2xl font-black italic tracking-tighter opacity-20 uppercase">Aucun résultat, mon Valdes.</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12"
                                >
                                    {filteredProducts.map((p, index) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
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