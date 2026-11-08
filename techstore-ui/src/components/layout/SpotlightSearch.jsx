import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader, Package, ChevronRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import baseApi from '../../api/axiosConfig';

const SpotlightSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            setQuery('');
            setResults([]);
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                // Pagination de base pour récupérer les premiers résultats
                const res = await baseApi.get(`/products/search?q=${encodeURIComponent(query)}&page=0&size=5`);
                if (res.data && res.data.data && res.data.data.content) {
                    setResults(res.data.data.content);
                }
            } catch (err) {
                console.error('Erreur recherche', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (slug) => {
        onClose();
        navigate(`/product/${slug}`);
    };

    const handleSearchAll = () => {
        if (query.trim()) {
            onClose();
            navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') handleSearchAll();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] px-4 sm:px-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-apple-dark/60 dark:bg-[#050505]/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div 
                className="relative w-full max-w-2xl bg-white dark:bg-[#161926] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header / Input */}
                <div className="relative flex items-center px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <Search className="text-gray-400" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Rechercher des produits, catégories..."
                        className="flex-1 bg-transparent border-none outline-none text-xl font-bold px-4 text-apple-dark dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                    <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body / Results */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {loading && (
                        <div className="p-8 flex justify-center items-center opacity-50">
                            <Loader className="animate-spin text-indigo-500" size={32} />
                        </div>
                    )}
                    
                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <p className="font-bold text-lg">Aucun résultat trouvé pour "{query}"</p>
                            <p className="text-sm opacity-50">Essayez d'autres mots-clés.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-500 opacity-70">
                                Produits ({results.length})
                            </div>
                            {results.map((product) => (
                                <div 
                                    key={product.id}
                                    onClick={() => handleSelect(product.slug)}
                                    className="flex items-center gap-4 p-4 mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-black/50 overflow-hidden flex items-center justify-center shrink-0 p-1">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <Package size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-apple-dark dark:text-white truncate">{product.name}</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.categoryName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-indigo-500">{product.price.toLocaleString()} F</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && query.trim().length < 2 && (
                        <div className="p-12 text-center opacity-30 flex flex-col items-center">
                            <Search size={48} className="mb-4" />
                            <p className="font-black tracking-widest uppercase text-sm">Prêt à trouver</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-[#111421]">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-white/10 px-2 py-1 rounded-md shadow-sm border dark:border-white/5">ESC</kbd> Fermer</span>
                        <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-white/10 px-2 py-1 rounded-md shadow-sm border dark:border-white/5"><CornerDownLeft size={10}/></kbd> Sélectionner</span>
                    </div>
                    {results.length > 0 && (
                        <button onClick={handleSearchAll} className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                            Voir tout <ChevronRight size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpotlightSearch;
