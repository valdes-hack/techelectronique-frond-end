import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Save, Image as ImageIcon, Trash2, FileUp, Loader2, Plus, 
    Layers, Tag, ChevronDown, ChevronUp, AlertCircle, Lock
} from 'lucide-react';
import AdminService from '../../services/admin.service';
import Input from '../../components/common/Input';
import { getFullImageUrl } from '../../utils/imageUtils';
import { useStockConfig } from '../../context/StockConfigContext';

const slugify = (text) => {
    return String(text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const SPEC_PRESETS = [
    "Origine", "Conditionnement", "Poids net", "Composition", 
    "Conseil d'utilisation", "Conservation", "Garantie", "Date de production"
];

const ProductForm = ({ product, onClose, onSave, theme }) => {
    const isDark = theme === 'dark';
    const { stockConfig } = useStockConfig();
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    
    // --- GESTION DES IMAGES ---
    const [files, setFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [tempUrl, setTempUrl] = useState(''); 
    const [imageInputMode, setImageInputMode] = useState('file');

    // --- FORMULAIRE PRINCIPAL ---
    const [formData, setFormData] = useState({
        id: null, name: '', slug: '', sku: '', brand: '',
        basePrice: '', costPrice: '', discountPrice: '', stockQty: 0,
        categoryId: '', defaultSupplierId: '', description: '', 
        variants: []
    });

    // --- SPÉCIFICATIONS TECHNIQUES DYNAMIQUES (EAV) ---
    const [specifications, setSpecifications] = useState([]);
    const [showSpecsSection, setShowSpecsSection] = useState(false);

    // --- ÉTAT DU FORMULAIRE DE NOUVELLE VARIABLE ---
    const [varInput, setVarInput] = useState({
        name: '',
        value: '',
        unit: '',
        price: '',
        stockQty: ''
    });

    // 1. Initialisation au montage ou modification
    useEffect(() => {
        if (product) {
            // Extraction des spécifications
            let parsedSpecs = [];
            if (product.specifications) {
                try {
                    const obj = typeof product.specifications === 'string' 
                        ? JSON.parse(product.specifications) 
                        : product.specifications;
                    if (obj && typeof obj === 'object') {
                        parsedSpecs = Object.entries(obj).map(([key, value]) => ({ key, value }));
                    }
                } catch (e) {
                    console.error("Erreur parsing specifications", e);
                }
            }
            setSpecifications(parsedSpecs);
            if (parsedSpecs.length > 0) setShowSpecsSection(true);

            // Extraction des variantes existantes
            const parsedVariants = (product.variants || []).map(v => {
                let attrs = {};
                try {
                    attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                } catch (e) {
                    console.error("Erreur parsing variante attributes", e);
                }

                return {
                    id: v.id || null,
                    skuVariant: v.skuVariant || '',
                    price: v.price != null ? v.price : product.basePrice,
                    stockQty: v.stockQty != null ? v.stockQty : 0,
                    attributes: attrs
                };
            });

            setFormData({
                id: product.id,
                name: product.name || '',
                slug: product.slug || '',
                sku: product.sku || '',
                brand: product.brand || '',
                basePrice: product.basePrice || '',
                costPrice: product.costPrice || '',
                discountPrice: product.discountPrice != null ? product.discountPrice : '',
                stockQty: product.stockQty != null ? product.stockQty : 0,
                categoryId: product.categoryId || product.category?.id || '',
                defaultSupplierId: product.defaultSupplierId || '',
                description: product.description || '',
                variants: parsedVariants
            });

            // Images
            const existing = product.images?.map(img => img.url) || [];
            setImageUrls(existing);
            setPreviews(existing.map(url => getFullImageUrl(url)));
        } else {
            setSpecifications([]);
        }
        
        const loadInitialData = async () => {
            try {
                const [catRes, suppRes] = await Promise.all([
                    AdminService.getAllAdminCategories(),
                    AdminService.getSuppliers()
                ]);
                setCategories(catRes.data || []);
                setSuppliers(suppRes.data || []);
            } catch (e) { console.error("Erreur chargement listes", e); }
        };
        loadInitialData();
    }, [product]);

    // --- AJOUT D'UNE VARIABLE / DÉCLINAISON SELON LE BESOIN DE L'UTILISATEUR ---
    const handleAddVariable = (e) => {
        if (e) e.preventDefault();
        
        const varName = varInput.name.trim();
        const varVal = varInput.value.trim();
        const varUnit = varInput.unit.trim();

        if (!varName || !varVal) {
            alert("Veuillez renseigner au moins le nom de la variable (ex: Poids) et sa valeur (ex: 25).");
            return;
        }

        // Si l'unité est renseignée, on l'associe à la valeur (ex: "25 kg")
        const fullDisplayVal = varUnit ? `${varVal} ${varUnit}` : varVal;

        // Prix de la variante : valeur saisie ou prix de base
        const finalPrice = varInput.price !== '' ? parseFloat(varInput.price) : (parseFloat(formData.basePrice) || 0);
        const finalStock = stockConfig.manageStockDirectly 
            ? (varInput.stockQty !== '' ? parseInt(varInput.stockQty) : 0)
            : 0;

        // SKU variante auto-généré
        const baseSku = formData.sku || slugify(formData.name) || 'PROD';
        const skuVariant = `${baseSku}-${slugify(varName)}-${slugify(fullDisplayVal)}`.toUpperCase();

        const newVariant = {
            id: null,
            skuVariant,
            price: finalPrice,
            stockQty: finalStock,
            attributes: { [varName]: fullDisplayVal }
        };

        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, newVariant]
        }));

        // Reset partiel du champ valeur pour faciliter la saisie suivante (garde le nom de la variable)
        setVarInput(prev => ({
            ...prev,
            value: '',
            price: formData.basePrice || '',
            stockQty: ''
        }));
    };

    // Mettre à jour un champ d'une variante dans le tableau
    const updateVariantField = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.variants];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, variants: updated };
        });
    };

    // Supprimer une variante du tableau
    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, idx) => idx !== index)
        }));
    };

    // --- SPÉCIFICATIONS DESCRIPTIVES (FICHE TECHNIQUE) ---
    const addSpecification = (key = '', value = '') => {
        setSpecifications(prev => [...prev, { key, value }]);
    };

    const updateSpecification = (index, field, val) => {
        setSpecifications(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: val };
            return updated;
        });
    };

    const removeSpecification = (index) => {
        setSpecifications(prev => prev.filter((_, i) => i !== index));
    };

    // --- GESTION DES IMAGES ---
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;
        setFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        e.target.value = null;
    };

    const addUrlImage = () => {
        if (tempUrl.trim()) {
            setImageUrls(prev => [...prev, tempUrl.trim()]);
            setPreviews(prev => [...prev, tempUrl.trim()]);
            setTempUrl('');
        }
    };

    const removeImage = (index) => {
        const itemToRemove = previews[index];
        setPreviews(prev => prev.filter((_, i) => i !== index));

        if (imageUrls.includes(itemToRemove)) {
            setImageUrls(prev => prev.filter(u => u !== itemToRemove));
        } else {
            const localPreviews = previews.filter(p => !imageUrls.includes(p));
            const fileIdx = localPreviews.indexOf(itemToRemove);
            if (fileIdx !== -1) {
                setFiles(prev => prev.filter((_, i) => i !== fileIdx));
            }
            URL.revokeObjectURL(itemToRemove);
        }
    };

    // --- CALCUL DU STOCK TOTAL EN TEMPS RÉEL ---
    const computedTotalStock = useMemo(() => {
        if (formData.variants && formData.variants.length > 0) {
            return formData.variants.reduce((acc, v) => acc + (parseInt(v.stockQty) || 0), 0);
        }
        return parseInt(formData.stockQty) || 0;
    }, [formData.variants, formData.stockQty]);

    // --- SOUMISSION DU FORMULAIRE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Formatage des spécifications
            const specsObject = {};
            specifications.forEach(spec => {
                if (spec.key.trim()) {
                    specsObject[spec.key.trim()] = spec.value.trim();
                }
            });

            // Formatage des variantes
            const formattedVariants = formData.variants.map((v, i) => {
                const attrs = v.attributes || {};
                const autoSuffix = Object.values(attrs).join('-') || `V${i + 1}`;
                return {
                    id: v.id || null,
                    skuVariant: v.skuVariant || `${formData.sku || 'PROD'}-${slugify(autoSuffix)}`.toUpperCase(),
                    price: parseFloat(v.price) || parseFloat(formData.basePrice) || 0,
                    stockQty: parseInt(v.stockQty) || 0,
                    attributes: JSON.stringify(attrs)
                };
            });

            const payload = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                discountPrice: formData.discountPrice !== '' && formData.discountPrice !== null ? parseFloat(formData.discountPrice) : null,
                stockQty: computedTotalStock,
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                defaultSupplierId: formData.defaultSupplierId ? parseInt(formData.defaultSupplierId) : null,
                specifications: Object.keys(specsObject).length > 0 ? JSON.stringify(specsObject) : null,
                imageUrls: imageUrls,
                variants: formattedVariants
            };
            
            await onSave(payload, files);
        } catch (error) { 
            console.error("Erreur soumission produit :", error); 
        } finally { 
            setSubmitting(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250] flex items-center justify-center p-2 sm:p-4">
            <form onSubmit={handleSubmit} className={`w-full max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#0f121d] border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'}`}>
                
                {/* HEADER */}
                <div className={`p-5 sm:p-6 border-b flex justify-between items-center ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/80'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                            <Tag size={20}/>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">
                                {product ? 'Éditer le Produit' : 'Nouveau Produit PEOC'}
                            </h2>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Gestion des informations, prix, stock et déclinaisons variables
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className={`p-2.5 rounded-2xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* CORPS DU FORMULAIRE */}
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ======================================================== */}
                    {/* COLONNE GAUCHE (5 colonnes) : INFOS GÉNÉRALES & SPECS    */}
                    {/* ======================================================== */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* IDENTITÉ */}
                        <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">1. Identité du Produit</span>
                            <Input 
                                required 
                                label="Nom du produit"
                                placeholder="Ex: Aliment Poussin Démarrage, Coq Goliath, Alvéole d'oeufs..." 
                                value={formData.name} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({
                                        ...formData, 
                                        name: val, 
                                        slug: formData.slug || slugify(val),
                                        sku: formData.sku || slugify(val).substring(0, 10).toUpperCase()
                                    });
                                }} 
                                theme={theme} 
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Input 
                                    required 
                                    label="Marque / Origine"
                                    placeholder="Ex: PEOC, Koudijs, Ferme Ouest..." 
                                    value={formData.brand} 
                                    onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                                    theme={theme} 
                                />
                                <Input 
                                    required 
                                    label="SKU Principal"
                                    placeholder="Ex: PEOC-ALI-01" 
                                    value={formData.sku} 
                                    onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})} 
                                    theme={theme} 
                                />
                            </div>
                        </div>

                        {/* RAYON & FOURNISSEUR */}
                        <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">2. Classification</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Rayon / Catégorie</label>
                                    <select 
                                        className={`w-full border p-3.5 rounded-2xl font-bold text-xs outline-none transition-all ${isDark ? 'bg-[#161a29] border-white/10 text-white focus:border-indigo-500' : 'bg-white border-gray-200 text-slate-900'}`} 
                                        value={formData.categoryId} 
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})} 
                                        required
                                    >
                                        <option value="">Sélectionner un rayon...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-amber-400 ml-1">Fournisseur</label>
                                    <select 
                                        className={`w-full border p-3.5 rounded-2xl font-bold text-xs outline-none transition-all ${isDark ? 'bg-[#161a29] border-white/10 text-white focus:border-indigo-500' : 'bg-white border-gray-200 text-slate-900'}`} 
                                        value={formData.defaultSupplierId} 
                                        onChange={(e) => setFormData({...formData, defaultSupplierId: e.target.value})}
                                    >
                                        <option value="">Par défaut / Aucun...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* PRIX ET STOCK DE BASE */}
                        <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">3. Prix de base & Stock Standard</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input 
                                    label="Prix Base (CFA)" 
                                    type="number" 
                                    required 
                                    value={formData.basePrice} 
                                    onChange={(e) => {
                                        setFormData({...formData, basePrice: e.target.value});
                                        if (!varInput.price) setVarInput(prev => ({...prev, price: e.target.value}));
                                    }} 
                                    theme={theme} 
                                />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Prix Promo 🔥</label>
                                        {formData.basePrice && formData.discountPrice && parseFloat(formData.discountPrice) < parseFloat(formData.basePrice) && (
                                            <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                                -{Math.round((1 - parseFloat(formData.discountPrice) / parseFloat(formData.basePrice)) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <Input 
                                        placeholder="Optionnel" 
                                        type="number" 
                                        value={formData.discountPrice} 
                                        onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} 
                                        theme={theme} 
                                    />
                                </div>
                                <Input 
                                    label="Prix Achat" 
                                    type="number" 
                                    value={formData.costPrice} 
                                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})} 
                                    theme={theme} 
                                />
                            </div>

                            {/* Stock global si aucune variante */}
                            {formData.variants.length === 0 ? (
                                !stockConfig.manageStockDirectly ? (
                                    <div className={`p-4 rounded-2xl border space-y-1.5 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                                <Lock size={13} /> Stock Magasin (Verrouillé)
                                            </span>
                                            <span className="text-xs font-black px-2.5 py-0.5 bg-amber-500/20 text-amber-500 rounded-lg">
                                                {formData.stockQty || 0} unité(s)
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">
                                            La saisie directe du stock est désactivée. Ce produit doit être approvisionné via l'onglet <strong>Ravitaillement</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <Input 
                                        label="Stock en magasin (unités)" 
                                        type="number" 
                                        value={formData.stockQty} 
                                        onChange={(e) => setFormData({...formData, stockQty: e.target.value})} 
                                        theme={theme} 
                                    />
                                )
                            ) : (
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between text-xs">
                                    <span className="text-indigo-400 font-bold">Stock total calculé (variantes) :</span>
                                    <span className="font-black text-sm px-2 py-0.5 bg-indigo-600 text-white rounded-lg">
                                        {computedTotalStock} unités
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
                            <textarea 
                                placeholder="Description détaillée du produit..." 
                                className={`w-full border p-4 rounded-2xl h-24 text-xs font-medium outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-slate-900'}`} 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            />
                        </div>

                        {/* FICHE TECHNIQUE DYNAMIQUE */}
                        <div className={`p-5 rounded-3xl border space-y-4 transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowSpecsSection(!showSpecsSection)}>
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-indigo-400" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                                        Fiche Technique & Caractéristiques ({specifications.length})
                                    </span>
                                </div>
                                <button type="button" className="text-slate-400">
                                    {showSpecsSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {showSpecsSection && (
                                <div className="space-y-4 pt-2">
                                    {/* Suggestions rapides */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {SPEC_PRESETS.map(preset => (
                                            <button 
                                                key={preset}
                                                type="button" 
                                                onClick={() => addSpecification(preset, '')}
                                                className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-indigo-600 hover:text-white' : 'bg-white border-gray-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                                            >
                                                + {preset}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Liste des spécifications */}
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                        {specifications.map((spec, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input 
                                                    placeholder="Attribut (ex: Origine)"
                                                    value={spec.key}
                                                    onChange={(e) => updateSpecification(idx, 'key', e.target.value)}
                                                    className={`w-1/2 p-2.5 rounded-xl text-xs font-bold border outline-none ${isDark ? 'bg-[#161a29] border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'}`}
                                                />
                                                <input 
                                                    placeholder="Valeur (ex: Ouest-Cameroun)"
                                                    value={spec.value}
                                                    onChange={(e) => updateSpecification(idx, 'value', e.target.value)}
                                                    className={`w-1/2 p-2.5 rounded-xl text-xs border outline-none ${isDark ? 'bg-[#161a29] border-white/10 text-emerald-400' : 'bg-white border-gray-200 text-emerald-700'}`}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeSpecification(idx)} 
                                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => addSpecification('', '')}
                                        className="w-full py-2 border-2 border-dashed border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Plus size={14} /> Ajouter une caractéristique
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ======================================================== */}
                    {/* COLONNE DROITE (7 colonnes) : IMAGES & VARIABLES / DÉCLINAISONS */}
                    {/* ======================================================== */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* GALERIE IMAGES */}
                        <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    Galerie Photos ({previews.length})
                                </label>
                                <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5">
                                    <button 
                                        type="button" 
                                        onClick={() => setImageInputMode('file')} 
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${imageInputMode === 'file' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                                    >
                                        FICHIER LOCAL
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setImageInputMode('url')} 
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${imageInputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                                    >
                                        URL WEB
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2.5 overflow-x-auto p-3 bg-black/30 rounded-2xl border border-white/5 min-h-[90px] items-center custom-scrollbar">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-white/20 group shadow-md">
                                        <img src={src} className="w-full h-full object-cover" alt="" />
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(i)} 
                                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                                {imageInputMode === 'file' && (
                                    <label className="w-16 h-16 shrink-0 border-2 border-dashed border-indigo-400/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/10 transition-all text-indigo-400">
                                        <FileUp size={18} />
                                        <span className="text-[8px] font-black mt-1 uppercase">Upload</span>
                                        <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                )}
                            </div>
                            
                            {imageInputMode === 'url' && (
                                <div className="flex gap-2">
                                    <input 
                                        value={tempUrl} 
                                        onChange={e => setTempUrl(e.target.value)} 
                                        placeholder="Coller l'adresse URL de l'image (https://...)" 
                                        className={`flex-1 border p-3 rounded-xl text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'}`} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={addUrlImage} 
                                        className="bg-indigo-600 text-white px-5 rounded-xl hover:bg-indigo-500 font-bold transition-all"
                                    >
                                        <Plus size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ======================================================== */}
                        {/* SECTION DÉCLINAISONS & VARIABLES DYNAMIQUES DU PRODUIT   */}
                        {/* ======================================================== */}
                        <div className={`p-5 rounded-3xl border space-y-5 ${isDark ? 'bg-[#131726] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            
                            {/* TITRE ET EXPLICATION */}
                            <div className="border-b pb-3 border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                                    <Tag size={16} /> Déclinaisons & Variables du Produit
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Ajoutez librement vos variables (ex: Nom: <strong>Poids</strong>, Valeur: <strong>25</strong>, Unité: <strong>kg</strong>) avec leurs prix et stocks respectifs.
                                </p>
                            </div>

                            {/* 1. BARRE DE SAISIE DE NOUVELLE VARIABLE */}
                            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-black/25 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">
                                    + Ajouter une déclinaison
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                        <span className="text-[8px] font-bold uppercase opacity-50 ml-1">Nom de la variable</span>
                                        <input 
                                            placeholder="Ex: Poids, Taille, Race..."
                                            value={varInput.name}
                                            onChange={e => setVarInput({...varInput, name: e.target.value})}
                                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-bold uppercase opacity-50 ml-1">Valeur</span>
                                        <input 
                                            placeholder="Ex: 5, 25, Blanc, XL..."
                                            value={varInput.value}
                                            onChange={e => setVarInput({...varInput, value: e.target.value})}
                                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-bold uppercase opacity-50 ml-1">Unité (optionnel)</span>
                                        <input 
                                            placeholder="Ex: kg, g, jours..."
                                            value={varInput.unit}
                                            onChange={e => setVarInput({...varInput, unit: e.target.value})}
                                            className={`w-full p-2.5 rounded-xl text-xs font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                    <div>
                                        <span className="text-[8px] font-black uppercase text-emerald-400 ml-1">Prix spécifique (CFA)</span>
                                        <input 
                                            type="number"
                                            placeholder={formData.basePrice ? `Ex: ${formData.basePrice}` : 'Prix'}
                                            value={varInput.price}
                                            onChange={e => setVarInput({...varInput, price: e.target.value})}
                                            className={`w-full p-2.5 rounded-xl text-xs font-black border outline-none ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black uppercase text-indigo-400 ml-1">
                                            Stock déclinaison {!stockConfig.manageStockDirectly && '(Verrouillé)'}
                                        </span>
                                        <input 
                                            type={stockConfig.manageStockDirectly ? "number" : "text"}
                                            placeholder={stockConfig.manageStockDirectly ? "Quantité" : "0 (Via Ravitaillement)"}
                                            disabled={!stockConfig.manageStockDirectly}
                                            value={stockConfig.manageStockDirectly ? varInput.stockQty : '0 (Via Ravitaillement)'}
                                            onChange={e => setVarInput({...varInput, stockQty: e.target.value})}
                                            className={`w-full p-2.5 rounded-xl text-xs font-black border outline-none ${
                                                !stockConfig.manageStockDirectly 
                                                    ? (isDark ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed')
                                                    : (isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900')
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <button 
                                            type="button" 
                                            onClick={handleAddVariable}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                        >
                                            <Plus size={16} /> Ajouter au tableau
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. TABLEAU RÉCAPITULATIF DES VARIANTES ENREGISTRÉES */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Tableau des déclinaisons ({formData.variants.length})
                                    </span>
                                    {formData.variants.length > 0 && (
                                        <span className="text-[10px] font-bold text-indigo-400">
                                            Stock cumulé : {computedTotalStock}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                                    {formData.variants.map((v, i) => {
                                        const attrs = v.attributes || {};
                                        return (
                                            <div 
                                                key={i} 
                                                className={`p-3.5 rounded-2xl border transition-all ${isDark ? 'bg-[#181d2e] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                                    {/* Badges des attributs */}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {Object.entries(attrs).map(([key, val]) => (
                                                            <span 
                                                                key={key} 
                                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
                                                            >
                                                                {key} : <span className="font-bold underline ml-0.5">{val}</span>
                                                            </span>
                                                        ))}
                                                        {Object.keys(attrs).length === 0 && (
                                                            <span className="text-[10px] opacity-40 italic">Déclinaison #{i + 1}</span>
                                                        )}
                                                    </div>

                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeVariant(i)} 
                                                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                                                        title="Supprimer cette déclinaison"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                                    <div>
                                                        <span className="text-[8px] font-bold uppercase opacity-40 ml-1">SKU</span>
                                                        <input 
                                                            value={v.skuVariant} 
                                                            onChange={e => updateVariantField(i, 'skuVariant', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-mono border outline-none ${isDark ? 'bg-black/30 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black uppercase text-emerald-400 ml-1">Prix (CFA)</span>
                                                        <input 
                                                            type="number" 
                                                            value={v.price} 
                                                            onChange={e => updateVariantField(i, 'price', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-black border outline-none ${isDark ? 'bg-black/30 border-white/5 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] font-black uppercase text-indigo-400 ml-1">
                                                            Stock {!stockConfig.manageStockDirectly && '(Verrouillé)'}
                                                        </span>
                                                        <input 
                                                            type="number" 
                                                            disabled={!stockConfig.manageStockDirectly}
                                                            title={!stockConfig.manageStockDirectly ? "Stock géré uniquement par le module de ravitaillement" : "Quantité en stock"}
                                                            value={v.stockQty} 
                                                            onChange={e => updateVariantField(i, 'stockQty', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-black border outline-none ${
                                                                !stockConfig.manageStockDirectly
                                                                    ? (isDark ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed')
                                                                    : (isDark ? 'bg-black/30 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {formData.variants.length === 0 && (
                                        <div className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-1 ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                            <p className="text-xs font-bold">Aucune variable définie.</p>
                                            <p className="text-[10px]">
                                                Utilisez le formulaire ci-dessus pour ajouter des déclinaisons (ex: Poids 25 kg, Poids 50 kg...) avec leurs prix et stocks respectifs.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className={`p-5 sm:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/80'}`}>
                    <div className="flex items-center gap-4 text-xs font-bold opacity-50">
                        <span>{formData.variants.length} déclinaison(s)</span>
                        <span>•</span>
                        <span>Stock total : {computedTotalStock}</span>
                        <span>•</span>
                        <span>{specifications.length} caractéristique(s)</span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 sm:flex-none px-6 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="flex-1 sm:flex-none bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 hover:bg-indigo-500 disabled:opacity-50 transition-all uppercase shadow-xl shadow-indigo-600/25 active:scale-95 text-xs"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                            {product ? 'ENREGISTRER LES MODIFICATIONS' : 'PUBLIER LE PRODUIT'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;