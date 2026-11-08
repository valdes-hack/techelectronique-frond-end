import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus, Pencil, Trash2, X, Search, Package, PackagePlus, PackageMinus,
    LayoutGrid, Eye, EyeOff, Loader2, Image as ImageIcon, Sparkles,
    Filter, Check, ArrowRight, Layers, Tag, HelpCircle, Upload
} from 'lucide-react';
import CollectionService from '../../services/collection.service';
import AdminService from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';
import AdminLayout from '../../components/admin/AdminLayout';

const TYPE_LABELS = {
    TYPE: { label: 'Type de produit', icon: '🐣', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    USAGE: { label: "Usage d'élevage", icon: '🌿', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PROMO: { label: 'Promotion', icon: '🔥', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const SUGGESTED_EMOJIS = ['🐣', '🥚', '🐔', '🦆', '🌾', '💉', '💡', '🌡️', '📦', '🔥', '🏆', '⭐'];

const SUGGESTED_BANNERS = [
    { label: 'Couveuses & Incubation', url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=1200&q=80' },
    { label: 'Volailles & Élevage', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80' },
    { label: 'Nutrition & Aliments', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80' },
    { label: 'Soins Vétérinaires', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80' }
];

const EMPTY_FORM = {
    name: '',
    slug: '',
    description: '',
    iconUrl: '🐣',
    bannerUrl: '',
    collectionType: 'TYPE',
    sortOrder: 0,
    isActive: true,
};

const CollectionsAdminContent = () => {
    const { showToast } = useToast();

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);

    const bannerFileInputRef = useRef(null);
    const iconFileInputRef = useRef(null);

    const handleBannerFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBanner(true);
        try {
            const url = await AdminService.uploadMedia(file);
            setForm(prev => ({ ...prev, bannerUrl: url }));
            showToast({ type: 'success', title: 'Photo uploadée', message: 'Photo d\'arrière-plan enregistrée avec succès !' });
        } catch (err) {
            showToast({ type: 'error', title: 'Échec upload', message: "Impossible d'uploader l'image depuis l'ordinateur." });
        } finally {
            setUploadingBanner(false);
            if (e.target) e.target.value = null;
        }
    };

    const handleIconFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingIcon(true);
        try {
            const url = await AdminService.uploadMedia(file);
            setForm(prev => ({ ...prev, iconUrl: url }));
            showToast({ type: 'success', title: 'Icône uploadée', message: 'Icône de collection enregistrée avec succès !' });
        } catch (err) {
            showToast({ type: 'error', title: 'Échec upload', message: "Impossible d'uploader l'icône depuis l'ordinateur." });
        } finally {
            setUploadingIcon(false);
            if (e.target) e.target.value = null;
        }
    };

    // ── Filtres de la liste des collections ──
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'TYPE' | 'USAGE' | 'PROMO'
    const [searchCollection, setSearchCollection] = useState('');

    // ── Modal de Gestion des Produits de la Collection ──
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [activeCollection, setActiveCollection] = useState(null);
    const [linkedProducts, setLinkedProducts] = useState([]);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [loadingLinked, setLoadingLinked] = useState(false);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');
    const [manageTab, setManageTab] = useState('linked'); // 'linked' | 'available' (pour vue responsive mobile)

    // ── Chargement des collections ──
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await CollectionService.adminGetAll();
            if (res && res.status === 'success') {
                setCollections(res.data || []);
            }
        } catch (e) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les collections." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ── Filtrage dynamique des collections ──
    const filteredCollections = useMemo(() => {
        return collections.filter(col => {
            // Filtre statut
            if (statusFilter === 'ACTIVE' && !col.isActive) return false;
            if (statusFilter === 'INACTIVE' && col.isActive) return false;

            // Filtre type
            if (typeFilter !== 'ALL' && col.collectionType !== typeFilter) return false;

            // Recherche texte
            if (searchCollection.trim()) {
                const q = searchCollection.toLowerCase().trim();
                const matchName = (col.name || '').toLowerCase().includes(q);
                const matchSlug = (col.slug || '').toLowerCase().includes(q);
                const matchDesc = (col.description || '').toLowerCase().includes(q);
                if (!matchName && !matchSlug && !matchDesc) return false;
            }

            return true;
        });
    }, [collections, statusFilter, typeFilter, searchCollection]);

    // ── Formulaire Modal (Création / Édition) ──
    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowFormModal(true);
    };

    const openEdit = (col) => {
        setEditing(col);
        setForm({
            name: col.name || '',
            slug: col.slug || '',
            description: col.description || '',
            iconUrl: col.iconUrl || '🐣',
            bannerUrl: col.bannerUrl || '',
            collectionType: col.collectionType || 'TYPE',
            sortOrder: col.sortOrder ?? 0,
            isActive: col.isActive !== false,
        });
        setShowFormModal(true);
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
            setShowFormModal(false);
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
            showToast({ type: 'success', title: !col.isActive ? 'Collection activée' : 'Collection masquée', message: col.name });
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de changer le statut." });
        }
    };

    const handleDelete = async (col) => {
        if (!window.confirm(`Supprimer la collection "${col.name}" ?\n\nLes produits ne seront PAS supprimés de la boutique, mais simplement dissociés de cette collection.`)) return;
        try {
            await CollectionService.adminDelete(col.id);
            showToast({ type: 'success', title: 'Collection supprimée', message: col.name });
            if (activeCollection?.id === col.id) {
                setManageModalOpen(false);
                setActiveCollection(null);
            }
            await loadData();
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de supprimer la collection." });
        }
    };

    // ── Gestion des Produits de la Collection ──
    const openManageProducts = async (col) => {
        setActiveCollection(col);
        setManageModalOpen(true);
        setLinkedProducts([]);
        setCatalogProducts([]);
        setCatalogSearch('');
        setManageTab('linked');
        setLoadingLinked(true);
        setLoadingCatalog(true);

        try {
            // 1. Charger les produits de cette collection
            const linkedRes = await CollectionService.adminGetProducts(col.id, 0, 300);
            const linked = linkedRes?.data?.content || [];
            setLinkedProducts(linked);
        } catch (err) {
            console.error(err);
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de charger les produits de la collection." });
        } finally {
            setLoadingLinked(false);
        }

        try {
            // 2. Charger le catalogue global pour pouvoir ajouter facilement
            const catalogRes = await AdminService.getAdminProducts();
            const cat = catalogRes?.data?.content || catalogRes?.data || [];
            setCatalogProducts(Array.isArray(cat) ? cat : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleAddProductToCollection = async (product) => {
        if (!activeCollection) return;
        try {
            await CollectionService.adminAddProduct(activeCollection.id, product.id);
            setLinkedProducts(prev => {
                if (prev.some(p => p.id === product.id)) return prev;
                return [product, ...prev];
            });
            showToast({ type: 'success', title: 'Produit ajouté', message: `« ${product.name} » ajouté à ${activeCollection.name}` });
            setCollections(prev => prev.map(c => c.id === activeCollection.id ? { ...c, productCount: (c.productCount || 0) + 1 } : c));
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible d'ajouter ce produit." });
        }
    };

    const handleRemoveProductFromCollection = async (product) => {
        if (!activeCollection) return;
        try {
            await CollectionService.adminRemoveProduct(activeCollection.id, product.id);
            setLinkedProducts(prev => prev.filter(p => p.id !== product.id));
            showToast({ type: 'success', title: 'Produit retiré', message: `« ${product.name} » retiré de ${activeCollection.name}` });
            setCollections(prev => prev.map(c => c.id === activeCollection.id ? { ...c, productCount: Math.max(0, (c.productCount || 1) - 1) } : c));
        } catch (err) {
            showToast({ type: 'error', title: 'Erreur', message: "Impossible de retirer ce produit." });
        }
    };

    const getImgUrl = (product) => {
        if (product?.images && product.images.length > 0) {
            const prim = product.images.find(i => i.isPrimary) || product.images[0];
            return prim?.url ? getFullImageUrl(prim.url) : null;
        }
        return null;
    };

    // Produits disponibles filtrés par recherche
    const availableCatalogProducts = useMemo(() => {
        const linkedIds = new Set(linkedProducts.map(p => p.id));
        let list = catalogProducts.filter(p => !linkedIds.has(p.id));
        if (catalogSearch.trim()) {
            const q = catalogSearch.toLowerCase().trim();
            list = list.filter(p => 
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q) ||
                (p.categoryName || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [catalogProducts, linkedProducts, catalogSearch]);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
                        <Sparkles size={14} /> Organisation du Catalogue
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                        <LayoutGrid size={32} className="text-indigo-500" /> Collections & Rayons<span className="text-indigo-500">.</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
                        Créez des rayons personnalisés, ajoutez des bannières d'arrière-plan et gérez intuitivement les produits rattachés.
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/25 shrink-0"
                >
                    <Plus size={18} /> Nouvelle Collection
                </button>
            </div>

            {/* ── BARRE DE FILTRES DYNAMIQUES (ACTIVABLES / DÉSACTIVABLES) ── */}
            <div className="bg-[#161926] border border-white/5 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Recherche texte */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchCollection}
                            onChange={(e) => setSearchCollection(e.target.value)}
                            placeholder="Filtrer par nom de collection, slug..."
                            className="w-full bg-[#111421] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                        {searchCollection && (
                            <button
                                onClick={() => setSearchCollection('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filtres par Statut (Activables/Désactivables) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1 flex items-center gap-1">
                            <Filter size={11} /> Statut :
                        </span>
                        {[
                            { id: 'ALL', label: 'Toutes' },
                            { id: 'ACTIVE', label: 'Actives' },
                            { id: 'INACTIVE', label: 'Masquées' }
                        ].map(st => (
                            <button
                                key={st.id}
                                onClick={() => setStatusFilter(st.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    statusFilter === st.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'bg-[#111421] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtres par Type de collection (Activables/Désactivables) */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1">
                        Types :
                    </span>
                    {[
                        { id: 'ALL', label: 'Tous les types', icon: '🗂️' },
                        { id: 'TYPE', label: 'Type de produit', icon: '🐣' },
                        { id: 'USAGE', label: "Usage d'élevage", icon: '🌿' },
                        { id: 'PROMO', label: 'Promotions', icon: '🔥' }
                    ].map(tp => (
                        <button
                            key={tp.id}
                            onClick={() => setTypeFilter(tp.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                typeFilter === tp.id
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-[#111421] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <span>{tp.icon}</span>
                            <span>{tp.label}</span>
                        </button>
                    ))}

                    <div className="ml-auto text-[11px] font-bold text-gray-500">
                        {filteredCollections.length} collection{filteredCollections.length > 1 ? 's' : ''} affichée{filteredCollections.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* ── GRILLE DES COLLECTIONS ── */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-[#161926] border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredCollections.length === 0 ? (
                <div className="text-center py-20 bg-[#161926] border border-white/5 rounded-3xl p-8">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-4">
                        🗂️
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Aucune collection trouvée</h3>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                        {searchCollection || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                            ? "Aucune collection ne correspond à vos filtres actuels. Modifiez vos critères ou réinitialisez la recherche."
                            : "Créez votre première collection pour organiser vos couveuses, volailles, aliments et matériels."}
                    </p>
                    {searchCollection || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? (
                        <button
                            onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setSearchCollection(''); }}
                            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                        >
                            Réinitialiser tous les filtres
                        </button>
                    ) : (
                        <button
                            onClick={openCreate}
                            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Créer une collection
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCollections.map(col => {
                        const badge = TYPE_LABELS[col.collectionType] || TYPE_LABELS.TYPE;
                        const hasBanner = Boolean(col.bannerUrl);

                        return (
                            <div
                                key={col.id}
                                className="group relative bg-[#161926] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-indigo-500/30 transition-all flex flex-col"
                            >
                                {/* Photo d'Arrière-Plan (Bannière) */}
                                <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
                                    {hasBanner ? (
                                        <img
                                            src={col.bannerUrl}
                                            alt={col.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-30 text-white text-xs font-bold uppercase tracking-widest">
                                            Bannière par défaut
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#161926] via-[#161926]/40 to-transparent" />

                                    {/* Actions rapides en haut à droite */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                                        <button
                                            onClick={() => handleToggleActive(col)}
                                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                col.isActive ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-gray-400 hover:bg-white/10'
                                            }`}
                                            title={col.isActive ? 'Collection visible en ligne' : 'Collection masquée'}
                                        >
                                            {col.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={() => openEdit(col)}
                                            className="w-7 h-7 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                                            title="Modifier la collection"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(col)}
                                            className="w-7 h-7 rounded-xl text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Contenu Carte */}
                                <div className="p-5 pt-0 flex-1 flex flex-col relative">
                                    {/* Icône flottante */}
                                    <div className="-mt-9 mb-3 w-14 h-14 rounded-2xl bg-[#111421] border-2 border-white/10 shadow-xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
                                        {col.iconUrl && col.iconUrl.startsWith('http') ? (
                                            <img src={col.iconUrl} alt="" className="w-8 h-8 object-contain" />
                                        ) : (
                                            col.iconUrl || '🐣'
                                        )}
                                    </div>

                                    {/* Titre & Slug */}
                                    <h3 className="text-lg font-black text-white leading-snug mb-1 group-hover:text-indigo-400 transition-colors">
                                        {col.name}
                                    </h3>
                                    <p className="text-[11px] font-mono text-gray-500 mb-3 truncate">
                                        /collections/{col.slug}
                                    </p>

                                    {col.description && (
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 font-normal">
                                            {col.description}
                                        </p>
                                    )}

                                    {/* Badges de statut et type */}
                                    <div className="flex flex-wrap items-center gap-2 mt-auto mb-4">
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.badge}`}>
                                            {badge.icon} {badge.label}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                                            {col.productCount ?? 0} produit{(col.productCount ?? 0) > 1 ? 's' : ''}
                                        </span>
                                        {!col.isActive && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                                                Masquée
                                            </span>
                                        )}
                                    </div>

                                    {/* Bouton de Gestion des Produits */}
                                    <button
                                        onClick={() => openManageProducts(col)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-indigo-500/20 hover:border-indigo-600 shadow-lg shadow-indigo-600/10"
                                    >
                                        <Package size={14} /> Gérer les Produits ({col.productCount ?? 0})
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* MODAL 1 : FORMULAIRE CRÉATION / MODIFICATION COLLECTION           */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {showFormModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#161926] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        
                        {/* Header Modal */}
                        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight">
                                        {editing ? 'Modifier la Collection' : 'Nouvelle Collection'}
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        Définissez les informations, l'arrière-plan et le type de rayon.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Corps Modal Déroulant */}
                        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                            
                            {/* Nom & Slug */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                        Nom de la collection *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex : Couveuses Automatiques"
                                        required
                                        className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                        Slug (URL) — automatique si vide
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        placeholder="couveuses-automatiques"
                                        className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Présentation courte du rayon pour les éleveurs..."
                                    rows={2}
                                    className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>

                            {/* ── PHOTO D'ARRIÈRE-PLAN (BANNIÈRE) ── */}
                            <div className="bg-[#111421] border border-white/5 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                        <ImageIcon size={14} /> Photo / Image d'arrière-plan de la collection
                                    </label>
                                    
                                    {/* Bouton Upload en Local */}
                                    <div>
                                        <input
                                            type="file"
                                            ref={bannerFileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleBannerFileUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => bannerFileInputRef.current?.click()}
                                            disabled={uploadingBanner}
                                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border border-indigo-500/30"
                                        >
                                            {uploadingBanner ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                            <span>{uploadingBanner ? 'Upload...' : 'Uploader en local'}</span>
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={form.bannerUrl}
                                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                                    placeholder="https://... (URL ou cliquez sur 'Uploader en local')"
                                    className="w-full bg-[#161926] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                                />
                                
                                {/* Suggestions rapides de bannières */}
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">
                                        Suggestions rapides de bannières pro :
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_BANNERS.map((sb, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setForm({ ...form, bannerUrl: sb.url })}
                                                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                                    form.bannerUrl === sb.url
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white/5 text-gray-400 hover:text-white border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                {sb.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Prévisualisation bannière */}
                                {form.bannerUrl && (
                                    <div className="h-28 rounded-xl overflow-hidden relative border border-white/10 group/prev">
                                        <img src={form.bannerUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3">
                                            <span className="text-white text-[11px] font-bold">
                                                Aperçu de la bannière d'arrière-plan
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, bannerUrl: '' })}
                                                className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Icône & Emojis rapides */}
                            <div className="grid sm:grid-cols-3 gap-4 items-start">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Icône (Emoji ou URL)
                                        </label>
                                        <input
                                            type="file"
                                            ref={iconFileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleIconFileUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => iconFileInputRef.current?.click()}
                                            disabled={uploadingIcon}
                                            className="text-[9px] font-black uppercase text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            <Upload size={10} /> Local
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={form.iconUrl}
                                        onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                                        placeholder="🐣 ou https://..."
                                        className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    {/* Sélecteur emojis */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {SUGGESTED_EMOJIS.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => setForm({ ...form, iconUrl: em })}
                                                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                                    form.iconUrl === em ? 'bg-indigo-600 scale-110' : 'bg-white/5 hover:bg-white/15'
                                                }`}
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                        Type de collection
                                    </label>
                                    <select
                                        value={form.collectionType}
                                        onChange={(e) => setForm({ ...form, collectionType: e.target.value })}
                                        className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="TYPE">🐣 Type de produit (Couveuse, Poussin...)</option>
                                        <option value="USAGE">🌿 Usage d'élevage (Démarrage, Engraissement...)</option>
                                        <option value="PROMO">🔥 Promotion / Offre spéciale</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full bg-[#111421] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Statut Toggle */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${
                                            form.isActive ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                                            form.isActive ? 'left-7' : 'left-1'
                                        }`} />
                                    </button>
                                    <div>
                                        <span className="text-xs sm:text-sm text-white font-bold block">
                                            {form.isActive ? 'Visible sur la boutique' : 'Masquée du public'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {form.isActive ? 'Les clients peuvent parcourir ce rayon.' : 'Accessible seulement en admin.'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Footer boutons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer la collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* MODAL 2 : GESTION DES PRODUITS DE LA COLLECTION (RÉSOLU & INTUITIF) */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {manageModalOpen && activeCollection && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#121522] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* En-tête du Modal de Gestion */}
                        <div className="p-4 sm:p-6 border-b border-white/5 bg-[#161926] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
                                    {activeCollection.iconUrl && activeCollection.iconUrl.startsWith('http') ? (
                                        <img src={activeCollection.iconUrl} alt="" className="w-7 h-7 object-contain" />
                                    ) : (
                                        activeCollection.iconUrl || '📦'
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-base sm:text-xl font-black text-white truncate">
                                            {activeCollection.name}
                                        </h2>
                                        <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
                                            /collections/{activeCollection.slug}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className="text-indigo-400 font-bold">
                                            {linkedProducts.length} produit{linkedProducts.length > 1 ? 's' : ''} lié{linkedProducts.length > 1 ? 's' : ''}
                                        </span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-gray-400 text-[11px]">
                                            Ajoutez ou retirez des articles en 1 clic
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setManageModalOpen(false)}
                                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Onglets Responsive pour Mobile */}
                        <div className="lg:hidden flex border-b border-white/5 bg-[#161926] px-4 shrink-0">
                            <button
                                onClick={() => setManageTab('linked')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
                                    manageTab === 'linked'
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                Dans la collection ({linkedProducts.length})
                            </button>
                            <button
                                onClick={() => setManageTab('available')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${
                                    manageTab === 'available'
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                + Ajouter depuis le catalogue ({availableCatalogProducts.length})
                            </button>
                        </div>

                        {/* Corps en 2 colonnes (Desktop) ou Onglets (Mobile) */}
                        <div className="flex-1 overflow-hidden grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                            
                            {/* ── COLONNE GAUCHE : PRODUITS DE LA COLLECTION ── */}
                            <div className={`lg:col-span-5 h-full flex flex-col p-4 sm:p-6 overflow-hidden ${
                                manageTab !== 'linked' ? 'hidden lg:flex' : 'flex'
                            }`}>
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <Package size={15} className="text-indigo-400" />
                                        Produits dans ce rayon ({linkedProducts.length})
                                    </h3>
                                </div>

                                {loadingLinked ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-indigo-500" />
                                    </div>
                                ) : linkedProducts.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                                        <PackageMinus size={36} className="text-gray-600 mb-3" />
                                        <p className="text-sm font-bold text-white mb-1">Aucun produit dans ce rayon</p>
                                        <p className="text-xs text-gray-500 max-w-xs mb-4">
                                            Choisissez des produits dans le catalogue à droite et cliquez sur <strong className="text-emerald-400">+ Ajouter</strong>.
                                        </p>
                                        <button
                                            onClick={() => setManageTab('available')}
                                            className="lg:hidden px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                                        >
                                            Voir le catalogue disponible
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                        {linkedProducts.map(prod => (
                                            <div
                                                key={prod.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl bg-[#161926] border border-white/5 hover:border-white/10 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                                                    {getImgUrl(prod) ? (
                                                        <img src={getImgUrl(prod)} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-white truncate">{prod.name}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-indigo-400 font-bold">
                                                            {new Intl.NumberFormat('fr-FR').format(prod.discountPrice > 0 ? prod.discountPrice : prod.basePrice || 0)} FCFA
                                                        </span>
                                                        <span>•</span>
                                                        <span>Stock: {prod.stockQty ?? 0}</span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveProductFromCollection(prod)}
                                                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all active:scale-90 shrink-0"
                                                    title="Retirer de la collection"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── COLONNE DROITE : CATALOGUE GLOBAL (POUR AJOUTER) ── */}
                            <div className={`lg:col-span-7 h-full flex flex-col p-4 sm:p-6 overflow-hidden ${
                                manageTab !== 'available' ? 'hidden lg:flex' : 'flex'
                            }`}>
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                        <PackagePlus size={15} className="text-emerald-400" />
                                        Catalogue de la boutique ({availableCatalogProducts.length} disponibles)
                                    </h3>
                                </div>

                                {/* Recherche instantanée dans le catalogue */}
                                <div className="relative mb-3 shrink-0">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={catalogSearch}
                                        onChange={(e) => setCatalogSearch(e.target.value)}
                                        placeholder="Rechercher par nom, référence SKU..."
                                        className="w-full bg-[#161926] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                    />
                                    {catalogSearch && (
                                        <button
                                            onClick={() => setCatalogSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {loadingCatalog ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-indigo-500" />
                                    </div>
                                ) : availableCatalogProducts.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                                        <Check size={32} className="text-emerald-400 mb-2" />
                                        <p className="text-xs sm:text-sm font-bold text-white">
                                            {catalogSearch ? "Aucun produit ne correspond à la recherche" : "Tous les produits du catalogue sont déjà dans ce rayon !"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                        {availableCatalogProducts.map(prod => (
                                            <div
                                                key={prod.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl bg-[#161926] border border-white/5 hover:border-white/10 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                                                    {getImgUrl(prod) ? (
                                                        <img src={getImgUrl(prod)} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-white truncate">{prod.name}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-indigo-400 font-bold">
                                                            {new Intl.NumberFormat('fr-FR').format(prod.discountPrice > 0 ? prod.discountPrice : prod.basePrice || 0)} FCFA
                                                        </span>
                                                        <span>•</span>
                                                        <span>{prod.categoryName || 'Catalogue'}</span>
                                                        <span>•</span>
                                                        <span className={prod.stockQty > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                            {prod.stockQty > 0 ? `${prod.stockQty} en stock` : 'Rupture'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleAddProductToCollection(prod)}
                                                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-black tracking-wider flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-500/20 hover:border-emerald-600 shrink-0"
                                                >
                                                    <Plus size={14} />
                                                    <span className="hidden sm:inline">Ajouter</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer modal */}
                        <div className="p-4 border-t border-white/5 bg-[#161926] flex items-center justify-between shrink-0">
                            <span className="text-xs text-gray-400">
                                Modifications enregistrées en temps réel.
                            </span>
                            <button
                                onClick={() => setManageModalOpen(false)}
                                className="px-6 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all"
                            >
                                Terminé
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CollectionsAdmin = () => (
    <AdminLayout>
        <div className="bg-[#0b0e14] text-gray-300 rounded-[2.5rem] min-h-full">
            <CollectionsAdminContent />
        </div>
    </AdminLayout>
);

export default CollectionsAdmin;
