import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Sprout, Tag } from 'lucide-react';
import CollectionService from '../../services/collection.service';

/**
 * PAGE PUBLIQUE : /collections
 * Liste de toutes les collections de la boutique, regroupées par type :
 *  - TYPE  : Rayons (Poussins, Couveuses, Aliments...)
 *  - USAGE : Modes d'élevage (Démarrage aviculture, Élevage porcin...)
 *  - PROMO : Marketing (Nouveautés, Meilleures ventes, Promotions)
 */
const GROUPS = [
    { type: 'TYPE', title: 'Nos rayons', subtitle: 'Explorez la boutique par type de produit', Icon: LayoutGrid, color: 'text-indigo-500' },
    { type: 'USAGE', title: "Par type d'élevage", subtitle: "Des solutions adaptées à chaque élevage", Icon: Sprout, color: 'text-emerald-500' },
    { type: 'PROMO', title: 'En ce moment', subtitle: 'Nouveautés, best-sellers et offres du moment', Icon: Tag, color: 'text-red-500' },
];

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await CollectionService.getAll();
            if (res && (res.status === 'success' || Array.isArray(res.data))) {
                setCollections(res.data || []);
            }
            setLoading(false);
        };
        load();
    }, []);

    const groupByType = (type) => collections.filter(c => (c.collectionType || 'TYPE') === type);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                <div className="h-10 bg-gray-200 dark:bg-white/5 rounded-2xl w-72 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-44 bg-gray-100 dark:bg-[#161926] rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <div className="text-6xl mb-6">🗂️</div>
                <h1 className="text-3xl font-black text-apple-dark dark:text-white mb-3">Aucune collection pour le moment</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Les rayons de la boutique seront bientôt disponibles.</p>
                <Link to="/catalog" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                    Voir la boutique <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-14">
            {/* ── En-tête ── */}
            <div className="text-center pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-3">PEOC • Boutique organisée</p>
                <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-apple-dark dark:text-white">
                    Nos collections.
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto font-medium">
                    Tout ce qu'il faut pour votre élevage, rangé par rayons. Un produit peut apparaître dans plusieurs collections — trouvez toujours ce que vous cherchez.
                </p>
            </div>

            {/* ── Groupes de collections ── */}
            {GROUPS.map(({ type, title, subtitle, Icon, color }) => {
                const items = groupByType(type);
                if (items.length === 0) return null;
                return (
                    <section key={type}>
                        <div className="flex items-end justify-between mb-6 px-1">
                            <div>
                                <h2 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-apple-dark dark:text-white">
                                    <Icon size={22} className={color} />
                                    {title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtitle}</p>
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                {items.length} collection{items.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {items.map((col) => (
                                <Link
                                    key={col.id}
                                    to={`/collections/${col.slug}`}
                                    className="group relative flex flex-col items-center text-center bg-white dark:bg-[#161926] rounded-[1.75rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 p-5 sm:p-7 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Halo au survol */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />

                                    {/* Icône / Emoji */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 border border-gray-100 dark:border-white/5 flex items-center justify-center text-3xl sm:text-4xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                        {col.iconUrl && col.iconUrl.startsWith('http') ? (
                                            <img src={col.iconUrl} alt={col.name} className="w-9 h-9 sm:w-10 sm:h-10 object-contain" loading="lazy" />
                                        ) : (
                                            (col.iconUrl || '📦')
                                        )}
                                    </div>

                                    {/* Nom */}
                                    <h3 className="text-sm sm:text-base font-black text-apple-dark dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {col.name}
                                    </h3>

                                    {/* Description (desktop) */}
                                    {col.description && (
                                        <p className="hidden sm:block text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed line-clamp-2">
                                            {col.description}
                                        </p>
                                    )}

                                    {/* Nb produits */}
                                    <span className="mt-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">
                                        {col.productCount ?? 0} produit{(col.productCount ?? 0) > 1 ? 's' : ''}
                                    </span>

                                    {/* CTA au survol */}
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Explorer <ArrowRight size={11} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default Collections;
