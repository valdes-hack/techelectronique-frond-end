import React, { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, X, Search, Package, PackagePlus, PackageMinus,
    LayoutGrid, GripVertical, Eye, EyeOff, Loader2
} from 'lucide-react';
import CollectionService from '../../services/collection.service';
import ProductService from '../../services/product.service';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import AdminLayout from '../../components/admin/AdminLayout';

const TYPE_LABELS = {
    TYPE: { label: 'Type de produit', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    USAGE: { label: "Usage d'élevage", badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PROMO: { label: 'Promotion', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const EMPTY_FORM = {
    name: '',
    slug: '',
    description: '',
    iconUrl: '',
    collectionType: 'TYPE',
    sortOrder: 0,
    isActive: true,
};

/**
 * PAGE ADMIN : /admin/collections
 * Gestion complète des collections (rayons) :
 *  - Créer / modifier / supprimer une collection
 *  - Activer / désactiver
 *  - Lier et délier des produits (table de liaison Shopify-like)
 */
const CollectionsAdminContent = () => {
    const { showToast } = useToast();

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null); // collection en cours d'édition ou null
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Panneau de gestion des produits d'une collection
    const [manageCollection, setManageCollection] = useState(null);
    const [linkedProducts, setLinkedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // ── Chargement initial ──
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await CollectionService.adminGetAll();
            if (res && res.status === 'success') setCollections(res.data || []);
        } catch (e) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les collections." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── Formulaire ──
    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (col) => {
        setEditing(col);
        setForm({
            name: col.name || '',
            slug: col.slug || '',
            description: col.description || '',
            iconUrl: col.iconUrl || '',
            collectionType: col.collectionType || 'TYPE',
            sortOrder: col.sortOrder ?? 0,
            isActive: col.isActive !== false,
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast({ type: 'error', title: 'Champ requis', message: "Le nom de la collection est obligatoire." });
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await CollectionService.adminUpdate(editing.id, form);
                showToast({ type: 'success', title: 'Collection modifiée', message: form.name });
            } else {
                await CollectionService.adminCreate(form);
                showToast({ type: 'success', title: 'Collection créée', message: form.name });
            }
            setShowForm(false);
            await loadData();
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
            showToast({ type: 'error', title: 'Échec', message: String(msg) });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (col) => {
        try {
            await CollectionService.adminUpdate(col.id, { isActive: !col.isActive });
            setCollections(prev => prev.map(c => c.id === col.id ? { ...c, isActive: !col.isActive } : c));
            showToast({ type: 'success', title: !col.isActive ? 'Collection activée' : 'Collection désactivée', message: col.name });
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de changer le statut." });
        }
    };

    const handleDelete = async (col) => {
        if (!window.confirm(`Supprimer la collection "${col.name}" ?\n\nLes produits ne seront PAS supprimés — ils seront simplement retirés de cette collection.`)) return;
        try {
            await CollectionService.adminDelete(col.id);
            showToast({ type: 'success', title: 'Collection supprimée', message: col.name });
            if (manageCollection?.id === col.id) closeManage();
            await loadData();
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de supprimer la collection." });
        }
    };

    // ── Gestion des produits d'une collection ──
    const openManage = async (col) => {
        setManageCollection(col);
        setLinkedProducts([]);
        setSearchQuery('');
        setSearchResults([]);
        setLoadingProducts(true);
        try {
            const res = await CollectionService.adminGetProducts(col.id, 0, 200);
            if (res && res.status === 'success') {
                setLinkedProducts(res.data?.content || []);
            }
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les produits de la collection." });
        } finally {
            setLoadingProducts(false);
        }
    };

    const closeManage = () => {
        setManageCollection(null);
        setLinkedProducts([]);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await ProductService.search(searchQuery.trim(), 0, 15);
            if (res && res.status === 'success') {
                const all = res.data?.content || [];
                // On exclut ceux déjà dans la collection
                const linkedIds = new Set(linkedProducts.map(p => p.id));
                setSearchResults(all.filter(p => !linkedIds.has(p.id)));
            } else {
                setSearchResults([]);
            }
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "La recherche a échoué." });
        } finally {
            setSearching(false);
        }
    };

    const handleAddProduct = async (product) => {
        try {
            await CollectionService.adminAddProduct(manageCollection.id, product.id);
            setLinkedProducts(prev => [...prev, product]);
            setSearchResults(prev => prev.filter(p => p.id !== product.id));
            showToast({ type: 'success', title: 'Produit ajouté', message: `${product.name} → ${manageCollection.name}` });
            loadData(); // rafraîchir les compteurs
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible d'ajouter ce produit." });
        }
    };

    const handleRemoveProduct = async (product) => {
        try {
            await CollectionService.adminRemoveProduct(manageCollection.id, product.id);
            setLinkedProducts(prev => prev.filter(p => p.id !== product.id));
            showToast({ type: 'success', title: 'Produit retiré', message: product.name });
            loadData(); // rafraîchir les compteurs
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de retirer ce produit." });
        }
    };

    const productImage = (p) => {
        if (p.images?.length > 0) {
            const primary = p.images.find(img => img.isPrimary) || p.images[0];
            if (primary?.url) return getFullImageUrl(primary.url);
        }
        return null;
    };

    const ProductRow = ({ product, onRemove }) => (
        <div className="flex items-center gap-3 bg-[#111421] border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-colors">
            <GripVertical size={14} className="text-gray-600 shrink-0" />
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                {productImage(product) ? (
                    <img src={productImage(product)} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <Package size={16} className="text-gray-600" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{product.name}</p>
                <p className="text-[10px] text-gray-500 font-medium">
                    {product.isActive ? `${product.stockQty ?? 0} en stock` : 'Désactivé'}
                    {' • '}
                    {new Intl.NumberFormat('fr-FR').format(product.discountPrice > 0 ? product.discountPrice : product.basePrice || 0)} F
                </p>
            </div>
            <button
                onClick={onRemove}
                className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all shrink-0"
                title="Retirer de la collection"
            >
                <PackageMinus size={14} />
            </button>
        </div>
    );

    // ═══════════════════════════════════════════════
    // RENDU
    // ═══════════════════════════════════════════════
    if (manageCollection) {
        return (
            <div className="p-6 sm:p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={closeManage} className="text-gray-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors">
                        <X size={16} /> Fermer
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                        {linkedProducts.length} produit{linkedProducts.length > 1 ? 's' : ''} dans la collection
                    </span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl">
                        {manageCollection.iconUrl && manageCollection.iconUrl.startsWith('http')
                            ? <img src={manageCollection.iconUrl} alt="" className="w-8 h-8 object-contain" />
                            : (manageCollection.iconUrl || '📦')}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">{manageCollection.name}</h1>
                        <p className="text-xs text-gray-500 font-medium">/collections/{manageCollection.slug}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Produits déjà dans la collection */}
                    <section>
                        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
                            <Package size={14} /> Produits de la collection
                        </h2>
                        {loadingProducts ? (
                            <div className="flex items-center justify-center py-12 text-gray-500">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        ) : linkedProducts.length === 0 ? (
                            <div className="text-center py-10 bg-[#111421] border border-white/5 rounded-3xl text-gray-500 text-sm">
                                Aucun produit. Utilisez la recherche à droite pour en ajouter.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {linkedProducts.map(p => (
                                    <ProductRow key={p.id} product={p} onRemove={() => handleRemoveProduct(p)} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recherche + ajout */}
                    <section>
                        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
                            <PackagePlus size={14} /> Ajouter des produits
                        </h2>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un produit…"
                                className="flex-1 bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={searching}
                                className="px-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
                            >
                                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                        </form>

                        <div className="space-y-2.5">
                            {searchQuery.trim() && !searching && searchResults.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm bg-[#111421] border border-white/5 rounded-3xl">
                                    Aucun résultat. Les produits déjà liés sont exclus.
                                </div>
                            )}
                            {searchResults.map(p => (
                                <div key={p.id} className="flex items-center gap-3 bg-[#111421] border border-white/5 rounded-2xl p-3">
                                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                        {productImage(p) ? (
                                            <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <Package size={16} className="text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            {p.stockQty ?? 0} en stock • {new Intl.NumberFormat('fr-FR').format(p.discountPrice > 0 ? p.discountPrice : p.basePrice || 0)} F
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddProduct(p)}
                                        className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-90 transition-all shrink-0"
                                        title="Ajouter à la collection"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // ── Vue liste des collections ──
    return (
        <div className="p-6 sm:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <LayoutGrid size={26} className="text-indigo-500" /> Collections
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Les rayons de la boutique — un produit peut appartenir à plusieurs collections.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} /> Nouvelle collection
                </button>
            </div>

            {/* Formulaire (inline) */}
            {showForm && (
                <form onSubmit={handleSave} className="bg-[#161926] border border-white/5 rounded-3xl p-6 mb-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white">{editing ? 'Modifier la collection' : 'Nouvelle collection'}</h2>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Nom *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Ex : Couveuses"
                                className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Slug (URL) — auto si vide</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                placeholder="couveuses"
                                className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Décrivez cette collection en une phrase…"
                            rows={2}
                            className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Icône (emoji ou URL)</label>
                            <input
                                type="text"
                                value={form.iconUrl}
                                onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                                placeholder="🐣 ou https://…"
                                className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Type</label>
                            <select
                                value={form.collectionType}
                                onChange={(e) => setForm({ ...form, collectionType: e.target.value })}
                                className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="TYPE">Type de produit</option>
                                <option value="USAGE">Usage d'élevage</option>
                                <option value="PROMO">Promotion</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Ordre d'affichage</label>
                            <input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                                className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                className={`w-11 h-6 rounded-full relative transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-6' : 'left-1'}`} />
                            </button>
                            <span className="text-sm text-gray-300 font-bold">{form.isActive ? 'Active sur le site' : 'Masquée'}</span>
                        </label>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </form>
            )}

            {/* Liste */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-[#161926] border border-white/5 rounded-3xl animate-pulse" />)}
                </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-20 bg-[#161926] border border-white/5 rounded-3xl">
                    <div className="text-5xl mb-4">🗂️</div>
                    <h3 className="text-lg font-black text-white mb-2">Aucune collection</h3>
                    <p className="text-gray-500 text-sm mb-6">Créez votre première collection pour organiser la boutique.</p>
                    <button onClick={openCreate} className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                        Créer une collection
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((col) => {
                        const badge = TYPE_LABELS[col.collectionType] || TYPE_LABELS.TYPE;
                        return (
                            <div key={col.id} className="group bg-[#161926] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl">
                                        {col.iconUrl && col.iconUrl.startsWith('http')
                                            ? <img src={col.iconUrl} alt="" className="w-7 h-7 object-contain" />
                                            : (col.iconUrl || '📦')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleActive(col)}
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all ${col.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}
                                            title={col.isActive ? 'Masquer du site' : 'Afficher sur le site'}
                                        >
                                            {col.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={() => openEdit(col)}
                                            className="w-8 h-8 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center hover:text-white active:scale-90 transition-all"
                                            title="Modifier"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(col)}
                                            className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-90 transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-base font-black text-white leading-tight mb-1">{col.name}</h3>
                                <p className="text-[11px] text-gray-500 font-mono mb-3">/collections/{col.slug}</p>

                                <div className="flex flex-wrap items-center gap-2 mt-auto">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${badge.badge}`}>
                                        {badge.label}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                                        {col.productCount ?? 0} produit{(col.productCount ?? 0) > 1 ? 's' : ''}
                                    </span>
                                    {!col.isActive && (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                                            Masquée
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => openManage(col)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all"
                                >
                                    <Package size={13} /> Gérer les produits
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Enveloppe la page dans le layout admin (sidebar + en-tête), comme toutes les autres pages /admin
const CollectionsAdmin = () => (
    <AdminLayout>
        {/* Cette page est stylée "sombre" : on garde un fond sombre même si le thème global est clair */}
        <div className="bg-[#0b0e14] text-gray-300 rounded-[2rem] min-h-full">
            <CollectionsAdminContent />
        </div>
    </AdminLayout>
);

export default CollectionsAdmin;
