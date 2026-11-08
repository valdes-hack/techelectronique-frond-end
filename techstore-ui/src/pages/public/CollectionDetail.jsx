import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import CollectionService from '../../services/collection.service';
import ProductCard from '../../components/product/ProductCard';

/**
 * PAGE PUBLIQUE : /collections/:slug
 * Affiche tous les produits d'une collection (paginés).
 * Exemple : /collections/couveuses
 */
const PAGE_SIZE = 12;

const CollectionDetail = () => {
    const { slug } = useParams();
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const loadPage = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await CollectionService.getProducts(slug, p, PAGE_SIZE);
            if (res && res.status === 'success' && res.data) {
                setProducts(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
                setPage(res.data.number ?? p);
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error("Erreur chargement produits de la collection", e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const res = await CollectionService.getBySlug(slug);
            if (cancelled) return;
            if (res && res.status === 'success' && res.data) {
                setCollection(res.data);
                await loadPage(0);
            } else {
                setNotFound(true);
                setLoading(false);
            }
        };
        load();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return () => { cancelled = true; };
    }, [slug, loadPage]);

    if (notFound) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <div className="text-6xl mb-6">🧭</div>
                <h1 className="text-3xl font-black text-apple-dark dark:text-white mb-3">Collection introuvable</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Cette collection n'existe pas ou n'est plus disponible.</p>
                <Link to="/collections" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                    Voir toutes les collections
                </Link>
            </div>
        );
    }

    const renderProductGrid = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-[#161926] rounded-[2rem] overflow-hidden animate-pulse">
                            <div className="aspect-square bg-gray-200 dark:bg-white/5" />
                            <div className="p-4 space-y-3">
                                <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div className="text-center py-20 bg-white dark:bg-[#161926] rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-black text-apple-dark dark:text-white mb-2">Aucun produit pour l'instant</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Cette collection sera bientôt remplie. Revenez bientôt !</p>
                    <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                        Explorer toute la boutique
                    </Link>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            {/* ── Fil d'Ariane ── */}
            <nav className="flex items-center gap-2 py-6 text-xs font-bold text-gray-400">
                <Link to="/" className="hover:text-indigo-500 transition-colors">Accueil</Link>
                <span>/</span>
                <Link to="/collections" className="hover:text-indigo-500 transition-colors">Collections</Link>
                <span>/</span>
                <span className="text-apple-dark dark:text-white truncate">{collection?.name || '…'}</span>
            </nav>

            {/* ── Bannière de la collection avec Background ── */}
            {collection && (
                <header className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 sm:p-14 mb-10 min-h-[220px] flex items-center shadow-xl">
                    {/* Background de la collection */}
                    {collection.bannerUrl ? (
                        <>
                            <img
                                src={collection.bannerUrl}
                                alt={collection.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 backdrop-blur-[2px]" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#161926] to-[#0e111a]" />
                    )}

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-2xl">
                            {collection.iconUrl && collection.iconUrl.startsWith('http') ? (
                                <img src={collection.iconUrl} alt={collection.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                            ) : (
                                (collection.iconUrl || '📦')
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Rayon PEOC</p>
                            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white leading-none">
                                {collection.name}
                            </h1>
                            {collection.description && (
                                <p className="text-gray-200 mt-3 max-w-2xl font-medium text-sm sm:text-base leading-relaxed">
                                    {collection.description}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                                    <Package size={11} className="text-indigo-400" />
                                    {totalElements} produit{totalElements > 1 ? 's' : ''} disponible{totalElements > 1 ? 's' : ''}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                                    <Sparkles size={11} />
                                    Qualité PEOC Garantie
                                </span>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ── Grille des produits ── */}
            {renderProductGrid()}

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                        onClick={() => loadPage(page - 1)}
                        disabled={page === 0}
                        className="w-11 h-11 rounded-2xl bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 flex items-center justify-center text-apple-dark dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-500 transition-all active:scale-95"
                        aria-label="Page précédente"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => loadPage(i)}
                                className={`w-11 h-11 rounded-2xl text-sm font-black transition-all active:scale-95 ${
                                    i === page
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 text-apple-dark dark:text-white hover:border-indigo-300 dark:hover:border-indigo-500/30'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => loadPage(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="w-11 h-11 rounded-2xl bg-white dark:bg-[#161926] border border-gray-100 dark:border-white/5 flex items-center justify-center text-apple-dark dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-500 transition-all active:scale-95"
                        aria-label="Page suivante"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CollectionDetail;
