import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import { 
    Tag, Percent, Sparkles, Search, Check, X, ArrowUpRight, 
    TrendingDown, AlertCircle, RefreshCw, Plus, Edit3, Trash2, 
    Box, Flame, SlidersHorizontal, ArrowLeft
} from 'lucide-react';
import { getFullImageUrl } from '../../utils/imageUtils';

const AdminPromotions = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { notifyAction, notifyError } = useToast();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

    // Modal pour éditer / ajouter une promotion
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [discountType, setDiscountType] = useState('PERCENT'); // 'PERCENT' | 'FIXED'
    const [discountValue, setDiscountValue] = useState('');
    const [saving, setSaving] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAdminProducts();
            if (res.status === 'success') {
                const list = res.data?.content || res.data || [];
                setProducts(list);
            }
        } catch (e) {
            console.error("Erreur chargement produits pour promos", e);
            notifyError("Impossible de récupérer la liste des produits", "Erreur");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Statistiques des promotions
    const stats = useMemo(() => {
        const total = products.length;
        const onPromo = products.filter(p => p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.basePrice));
        const totalSavings = onPromo.reduce((acc, p) => acc + (Number(p.basePrice) - Number(p.discountPrice)), 0);
        const avgDiscount = onPromo.length > 0 
            ? Math.round(onPromo.reduce((acc, p) => acc + Math.round((1 - Number(p.discountPrice) / Number(p.basePrice)) * 100), 0) / onPromo.length)
            : 0;
        return {
            total,
            promoCount: onPromo.length,
            totalSavings,
            avgDiscount
        };
    }, [products]);

    // Filtrage dynamique
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                                p.sku?.toLowerCase().includes(search.toLowerCase()) || 
                                p.brand?.toLowerCase().includes(search.toLowerCase());
            
            const matchCat = filterCategory === 'ALL' || p.categoryName === filterCategory;

            const hasPromo = p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.basePrice);
            const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' ? hasPromo : !hasPromo);

            return matchSearch && matchCat && matchStatus;
        });
    }, [products, search, filterCategory, filterStatus]);

    const categoriesList = useMemo(() => {
        return ['ALL', ...new Set(products.map(p => p.categoryName).filter(Boolean))];
    }, [products]);

    // Ouverture modal pour configurer un produit spécifique
    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        if (product.discountPrice && Number(product.discountPrice) > 0) {
            const base = Number(product.basePrice);
            const disc = Number(product.discountPrice);
            const percent = Math.round((1 - disc / base) * 100);
            setDiscountType('PERCENT');
            setDiscountValue(percent.toString());
        } else {
            setDiscountType('PERCENT');
            setDiscountValue('15'); // 15% par défaut
        }
        setShowModal(true);
    };

    // Ouverture modal pour ajouter une promotion (avec sélecteur de produit)
    const handleOpenNewPromoModal = () => {
        setSelectedProduct(null);
        setPickerSearch('');
        setDiscountType('PERCENT');
        setDiscountValue('15');
        setShowModal(true);
    };

    const handleSelectProductForPromo = (product) => {
        setSelectedProduct(product);
        if (product.discountPrice && Number(product.discountPrice) > 0) {
            const base = Number(product.basePrice);
            const disc = Number(product.discountPrice);
            const percent = Math.round((1 - disc / base) * 100);
            setDiscountType('PERCENT');
            setDiscountValue(percent.toString());
        } else {
            setDiscountType('PERCENT');
            setDiscountValue('15');
        }
    };

    // Calcul du nouveau prix remisé en temps réel
    const calculatedNewPrice = useMemo(() => {
        if (!selectedProduct || !discountValue) return 0;
        const base = Number(selectedProduct.basePrice || 0);
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'PERCENT') {
            const disc = base * (val / 100);
            return Math.max(0, Math.round(base - disc));
        } else {
            return Math.max(0, Math.round(val));
        }
    }, [selectedProduct, discountType, discountValue]);

    const calculatedDiscountPercent = useMemo(() => {
        if (!selectedProduct || calculatedNewPrice <= 0) return 0;
        const base = Number(selectedProduct.basePrice || 0);
        return Math.round((1 - calculatedNewPrice / base) * 100);
    }, [selectedProduct, calculatedNewPrice]);

    // Enregistrement de la promotion
    const handleSavePromo = async () => {
        if (!selectedProduct) return;
        if (calculatedNewPrice <= 0 || calculatedNewPrice >= Number(selectedProduct.basePrice)) {
            alert("Le prix de promotion doit être inférieur au prix de base et supérieur à 0.");
            return;
        }

        setSaving(true);
        try {
            await AdminService.updateProductDiscount(selectedProduct.id, selectedProduct, calculatedNewPrice);
            notifyAction('update', selectedProduct.name, `Promotion appliquée (-${calculatedDiscountPercent}%) : ${calculatedNewPrice.toLocaleString()} F`);
            await loadProducts();
            setShowModal(false);
        } catch (e) {
            console.error(e);
            notifyError("Erreur lors de l'application de la promotion", "Erreur");
        } finally {
            setSaving(false);
        }
    };

    // Suppression de la promotion (remise à zéro)
    const handleRemovePromo = async (product) => {
        if (!window.confirm(`Retirer la promotion pour "${product.name}" ? Le produit reprendra son prix standard de ${Number(product.basePrice).toLocaleString()} F.`)) {
            return;
        }

        try {
            await AdminService.updateProductDiscount(product.id, product, null);
            notifyAction('delete', product.name, "Promotion retirée (Prix standard rétabli)");
            await loadProducts();
        } catch (e) {
            console.error(e);
            notifyError("Erreur lors du retrait de la promotion", "Erreur");
        }
    };

    return (
        <AdminLayout filters={null}>
            <div className="w-full flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
                
                {/* ── HEADER ── */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 text-xs font-black uppercase tracking-widest mb-1">
                            <Flame size={16} className="text-red-500 fill-red-500" /> Gestionnaire des Ventes Flash
                        </div>
                        <h2 className={`text-4xl sm:text-5xl font-black italic tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Promotions<span className="text-red-500">.</span>
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">
                            Appliquez des remises, réductions en pourcentage ou montants fixes en temps réel sur vos articles.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleOpenNewPromoModal}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Ajouter une Promotion</span>
                        </button>
                        
                        <button
                            onClick={loadProducts}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 font-black text-xs uppercase tracking-wider transition-all"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Actualiser</span>
                        </button>
                    </div>
                </header>

                {/* ── STATS CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">En Promotion</span>
                            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500"><Flame size={18} /></div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-red-500">{stats.promoCount}</h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">sur {stats.total} produits au total</p>
                        </div>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Remise Moyenne</span>
                            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500"><Percent size={18} /></div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-indigo-400">-{stats.avgDiscount}%</h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">Taux moyen appliqué</p>
                        </div>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Économie Client</span>
                            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500"><TrendingDown size={18} /></div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
                                {stats.totalSavings.toLocaleString()} <span className="text-xs">F</span>
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">Avantage total généré</p>
                        </div>
                    </div>

                    <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Prix Standard</span>
                            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500"><Box size={18} /></div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-amber-400">
                                {stats.total - stats.promoCount}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">Produits sans réduction</p>
                        </div>
                    </div>
                </div>

                {/* ── FILTRES ET RECHERCHE ── */}
                <div className={`p-4 sm:p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-4 ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, référence ou marque..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Filtre statut promo */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 md:flex-none bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-900 dark:text-white cursor-pointer"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="ACTIVE">En Promotion 🔥</option>
                            <option value="INACTIVE">Prix Standard</option>
                        </select>

                        {/* Filtre catégorie */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="flex-1 md:flex-none bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-bold outline-none text-slate-900 dark:text-white cursor-pointer"
                        >
                            {categoriesList.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'ALL' ? 'Tous les Rayons' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── TABLEAU DES PRODUITS & PROMOTIONS ── */}
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-[#1a1e2e] text-gray-400' : 'bg-slate-50 text-slate-500'} border-b border-black/5 dark:border-white/5`}>
                                <tr>
                                    <th className="p-5">Produit</th>
                                    <th className="p-5 text-center">Rayon</th>
                                    <th className="p-5 text-right">Prix Initial</th>
                                    <th className="p-5 text-right">Prix Remisé</th>
                                    <th className="p-5 text-center">Réduction</th>
                                    <th className="p-5 text-center">Statut Promo</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y text-xs font-bold ${isDark ? 'divide-white/5 text-gray-300' : 'divide-slate-100 text-slate-700'}`}>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-gray-400">
                                            <Tag size={36} className="mx-auto mb-2 opacity-30 text-indigo-500" />
                                            <p className="font-bold uppercase tracking-wider text-xs mb-3">Aucun produit trouvé</p>
                                            <button
                                                onClick={handleOpenNewPromoModal}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs uppercase"
                                            >
                                                <Plus size={14} /> Mettre un produit en promotion
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(p => {
                                        const hasPromo = p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.basePrice);
                                        const basePrice = Number(p.basePrice || 0);
                                        const discPrice = Number(p.discountPrice || 0);
                                        const percent = hasPromo ? Math.round((1 - discPrice / basePrice) * 100) : 0;
                                        const firstImg = p.images?.[0]?.url || p.imageUrl;

                                        return (
                                            <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                                {/* Produit info */}
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                            <img
                                                                src={getFullImageUrl(firstImg)}
                                                                alt={p.name}
                                                                className="max-h-full max-w-full object-contain"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=100&q=80";
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`font-black text-sm truncate uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                {p.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-medium">
                                                                Réf : #{p.sku || p.id} • {p.brand || 'PEOC'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rayon */}
                                                <td className="p-5 text-center">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {p.categoryName || 'Standard'}
                                                    </span>
                                                </td>

                                                {/* Prix Initial */}
                                                <td className="p-5 text-right font-black">
                                                    <span className={hasPromo ? 'line-through text-gray-400 text-xs' : 'text-slate-900 dark:text-white'}>
                                                        {basePrice.toLocaleString()} F
                                                    </span>
                                                </td>

                                                {/* Prix Remisé */}
                                                <td className="p-5 text-right font-black">
                                                    {hasPromo ? (
                                                        <span className="text-red-500 text-sm font-black">
                                                            {discPrice.toLocaleString()} F
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Réduction */}
                                                <td className="p-5 text-center">
                                                    {hasPromo ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500 text-white shadow-md shadow-red-500/20">
                                                            -{percent}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Statut Promo */}
                                                <td className="p-5 text-center">
                                                    {hasPromo ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            EN LIGNE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400">
                                                            Standard
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-5 text-right space-x-2">
                                                    {hasPromo ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenModal(p)}
                                                                className={`p-2.5 rounded-xl border transition-all text-indigo-400 hover:border-indigo-400 ${
                                                                    isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'
                                                                }`}
                                                                title="Modifier la promotion"
                                                            >
                                                                <Edit3 size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleRemovePromo(p)}
                                                                className={`p-2.5 rounded-xl border transition-all text-red-400 hover:border-red-400 ${
                                                                    isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'
                                                                }`}
                                                                title="Retirer la promotion"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenModal(p)}
                                                            className="px-3 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white shadow-sm inline-flex ml-auto"
                                                            title="Mettre en promotion"
                                                        >
                                                            <Flame size={13} className="fill-red-500 group-hover:fill-white" />
                                                            <span>+ Promo</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ── MODAL DE GESTION DE PROMOTION ── */}
            {showModal && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 border shadow-2xl animate-in zoom-in-95 duration-200 ${
                        isDark ? 'bg-[#111421] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30">
                                    <Flame size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black italic text-lg uppercase tracking-tight">
                                        {selectedProduct ? 'Configurer la Promotion' : 'Choisir un Produit'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold truncate max-w-xs">
                                        {selectedProduct ? selectedProduct.name : 'Sélectionnez un article du catalogue à solder'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Contenu Formulaire Promo */}
                        {!selectedProduct ? (
                            /* ÉTAPE 1 : CHOISIR UN PRODUIT */
                            <div className="py-6 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Rechercher le produit à solder (nom, marque)..."
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-red-500 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                    {products
                                        .filter(p => !pickerSearch || p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) || p.brand?.toLowerCase().includes(pickerSearch.toLowerCase()) || p.sku?.toLowerCase().includes(pickerSearch.toLowerCase()))
                                        .map(p => {
                                            const hasPromo = p.discountPrice && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.basePrice);
                                            const firstImg = p.images?.[0]?.url || p.imageUrl;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => handleSelectProductForPromo(p)}
                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        isDark 
                                                            ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-red-500/50' 
                                                            : 'bg-slate-50 hover:bg-red-50/50 border-slate-200 hover:border-red-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                            <img
                                                                src={getFullImageUrl(firstImg)}
                                                                alt={p.name}
                                                                className="max-h-full max-w-full object-contain"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=100&q=80";
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-black text-xs uppercase truncate text-slate-900 dark:text-white">
                                                                {p.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-bold">
                                                                {Number(p.basePrice).toLocaleString()} FCFA • {p.brand || 'PEOC'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 flex items-center gap-2">
                                                        {hasPromo && (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                                                                En promo
                                                            </span>
                                                        )}
                                                        <span className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-500/20">
                                                            <Check size={12} /> Choisir
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        ) : (
                            /* ÉTAPE 2 : APPLIQUER LA RÉDUCTION AU PRODUIT SÉLECTIONNÉ */
                            <div className="py-6 space-y-5">
                                
                                {/* Rappel Produit & Changement */}
                                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                                    isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                                }`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                            <img
                                                src={getFullImageUrl(selectedProduct.images?.[0]?.url || selectedProduct.imageUrl)}
                                                alt={selectedProduct.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black uppercase truncate text-slate-900 dark:text-white">
                                                {selectedProduct.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-indigo-400">
                                                Prix standard : {Number(selectedProduct.basePrice).toLocaleString()} FCFA
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl text-gray-400 hover:text-white bg-black/10 dark:bg-white/10 shrink-0 transition-colors"
                                    >
                                        Changer
                                    </button>
                                </div>

                                {/* Choix du mode : Pourcentage ou Prix Direct */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Mode de calcul de la remise
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setDiscountType('PERCENT')}
                                            className={`p-3 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                                discountType === 'PERCENT'
                                                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/25'
                                                    : isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <Percent size={15} /> Pourcentage (%)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDiscountType('FIXED');
                                                setDiscountValue(selectedProduct.discountPrice ? selectedProduct.discountPrice.toString() : '');
                                            }}
                                            className={`p-3 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                                discountType === 'FIXED'
                                                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/25'
                                                    : isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <Tag size={15} /> Prix Fixe (FCFA)
                                        </button>
                                    </div>
                                </div>

                                {/* Boutons rapides de % si mode Pourcentage */}
                                {discountType === 'PERCENT' && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                        {[5, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => setDiscountValue(pct.toString())}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all shrink-0 ${
                                                    discountValue === pct.toString()
                                                        ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                                                        : isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                -{pct}%
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Valeur de la réduction */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {discountType === 'PERCENT' ? 'Taux de réduction' : 'Nouveau prix promotionnel final'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={discountType === 'PERCENT' ? '99' : selectedProduct.basePrice}
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            placeholder={discountType === 'PERCENT' ? 'Ex: 20' : 'Ex: 150000'}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl p-4 text-lg font-black outline-none focus:border-red-500 text-slate-900 dark:text-white"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                                            {discountType === 'PERCENT' ? '%' : 'FCFA'}
                                        </span>
                                    </div>
                                </div>

                                {/* Résultat simulé en direct */}
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-orange-500/10 border border-red-500/20 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-red-400 uppercase tracking-wider">
                                        <span>Prix Promotionnel Final</span>
                                        <span>-{calculatedDiscountPercent}%</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-3xl font-black text-red-500 tracking-tight">
                                            {calculatedNewPrice.toLocaleString()} <small className="text-xs">FCFA</small>
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 line-through">
                                            {Number(selectedProduct.basePrice).toLocaleString()} FCFA
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-400">
                                        Économie client : {(Number(selectedProduct.basePrice) - calculatedNewPrice).toLocaleString()} FCFA
                                    </p>
                                </div>

                                {/* Boutons d'action */}
                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSavePromo}
                                        disabled={saving || calculatedNewPrice <= 0 || calculatedNewPrice >= Number(selectedProduct.basePrice)}
                                        className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                                        <span>{saving ? 'Application...' : 'Appliquer la Promotion'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPromotions;
