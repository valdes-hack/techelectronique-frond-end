import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Save, Image as ImageIcon, Trash2, FileUp, Loader2, Plus, 
    Sparkles, Sliders, Layers, RefreshCw, Check, Tag, ChevronDown, 
    ChevronUp, Copy, AlertCircle, HardDrive, Cpu, Feather, ArrowRight
} from 'lucide-react';
import AdminService from '../../services/admin.service';
import Input from '../../components/common/Input';
import { getFullImageUrl } from '../../utils/imageUtils';

// Suggestions prédéfinies d'options selon le secteur (Élevage / Tech / Mode)
const OPTION_PRESETS = [
    {
        category: "🐔 Élevage & Nutrition (PEOC)",
        presets: [
            { name: "Conditionnement", values: ["5 kg", "25 kg", "50 kg", "Sac", "Alvéole de 30"] },
            { name: "Âge / Stade", values: ["1 jour", "21 jours", "45 jours", "Démarrage", "Croissance", "Finition"] },
            { name: "Race / Souche", values: ["Cobb 500", "Goliath", "Porc Piétrain", "Large White"] },
            { name: "Calibre", values: ["Moyen", "Gros", "Extra-Gros (XL)"] }
        ]
    },
    {
        category: "📱 High-Tech & Électronique",
        presets: [
            { name: "Couleur", values: ["Noir", "Blanc", "Titane", "Bleu nuit", "Gris sidéral"] },
            { name: "Stockage", values: ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"] },
            { name: "RAM", values: ["4 Go", "8 Go", "16 Go", "32 Go"] }
        ]
    },
    {
        category: "👟 Chaussures & Vêtements",
        presets: [
            { name: "Pointure", values: ["38", "39", "40", "41", "42", "43", "44", "45"] },
            { name: "Taille", values: ["S", "M", "L", "XL", "XXL"] }
        ]
    }
];

const SPEC_PRESETS = [
    "Origine", "Conditionnement", "Poids net", "Composition", 
    "Conseil d'utilisation", "Conservation", "Garantie", "Date de production"
];

const slugify = (text) => {
    return String(text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const ProductForm = ({ product, onClose, onSave, theme }) => {
    const isDark = theme === 'dark';
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

    // --- OPTIONS DYNAMIQUES (AXES DE VARIATION) ---
    // Structure: [{ id: 1, name: 'Conditionnement', values: ['5 kg', '25 kg'], inputVal: '' }]
    const [options, setOptions] = useState([]);
    const [showPresetMenu, setShowPresetMenu] = useState(false);
    const [bulkStockVal, setBulkStockVal] = useState('');
    const [bulkPriceVal, setBulkPriceVal] = useState('');

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

            // Extraction et reconstruction dynamique des options à partir des variantes existantes
            const existingVariants = product.variants || [];
            const reconstructedOptionsMap = {};
            const parsedVariants = existingVariants.map(v => {
                let attrs = {};
                try {
                    attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
                } catch (e) {
                    console.error("Erreur parsing variante attributes", e);
                }

                // Récupération des options pour reconstruire les axes
                Object.entries(attrs).forEach(([key, val]) => {
                    if (key && val) {
                        if (!reconstructedOptionsMap[key]) reconstructedOptionsMap[key] = new Set();
                        reconstructedOptionsMap[key].add(String(val));
                    }
                });

                return {
                    id: v.id || null,
                    skuVariant: v.skuVariant || '',
                    price: v.price != null ? v.price : product.basePrice,
                    stockQty: v.stockQty != null ? v.stockQty : 0,
                    attributes: attrs
                };
            });

            // Conversion de reconstructedOptionsMap vers l'état options
            const reconstructedOptions = Object.entries(reconstructedOptionsMap).map(([name, valuesSet], idx) => ({
                id: Date.now() + idx,
                name,
                values: Array.from(valuesSet),
                inputVal: ''
            }));

            setOptions(reconstructedOptions);

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
            // Nouveau produit : par défaut pas de variantes
            setOptions([]);
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

    // --- GESTION DES OPTIONS DYNAMIQUES & MATRICE CARTÉSIENNE ---

    // Ajouter un nouvel axe d'option vide
    const addOption = (name = '', defaultValues = []) => {
        setOptions(prev => [
            ...prev,
            { id: Date.now() + Math.random(), name, values: defaultValues, inputVal: '' }
        ]);
        setShowPresetMenu(false);
    };

    // Mettre à jour le nom d'une option
    const updateOptionName = (optionId, newName) => {
        setOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, name: newName } : opt));
    };

    // Mettre à jour la saisie temporaire d'un tag pour une option
    const updateOptionInputVal = (optionId, val) => {
        setOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, inputVal: val } : opt));
    };

    // Ajouter une valeur tag à une option
    const addValueToOption = (optionId) => {
        setOptions(prev => prev.map(opt => {
            if (opt.id === optionId) {
                const trimmed = (opt.inputVal || '').trim();
                if (!trimmed || opt.values.includes(trimmed)) return { ...opt, inputVal: '' };
                return {
                    ...opt,
                    values: [...opt.values, trimmed],
                    inputVal: ''
                };
            }
            return opt;
        }));
    };

    // Supprimer une valeur tag d'une option
    const removeValueFromOption = (optionId, valueIndex) => {
        setOptions(prev => prev.map(opt => {
            if (opt.id === optionId) {
                return {
                    ...opt,
                    values: opt.values.filter((_, idx) => idx !== valueIndex)
                };
            }
            return opt;
        }));
    };

    // Supprimer un axe d'option complet
    const removeOption = (optionId) => {
        setOptions(prev => prev.filter(opt => opt.id !== optionId));
    };

    // Algorithme de génération de la matrice cartésienne
    const generateMatrix = () => {
        const activeOptions = options.filter(opt => opt.name.trim() !== '' && opt.values.length > 0);
        
        if (activeOptions.length === 0) {
            setFormData(prev => ({ ...prev, variants: [] }));
            return;
        }

        // Calcul du produit cartésien
        const cartesian = (arrays) => {
            return arrays.reduce((acc, curr) => {
                return acc.flatMap(x => curr.map(y => [...x, y]));
            }, [[]]);
        };

        const valuesArrays = activeOptions.map(opt => opt.values);
        const combinations = cartesian(valuesArrays);

        const currentVariants = formData.variants || [];
        const baseSku = formData.sku || slugify(formData.name) || 'PROD';
        const defaultPrice = formData.basePrice ? parseFloat(formData.basePrice) : 0;

        const newVariants = combinations.map(combo => {
            // Création de l'objet d'attributs { "Conditionnement": "25 kg", "Race": "Goliath" }
            const attrs = {};
            activeOptions.forEach((opt, idx) => {
                attrs[opt.name] = combo[idx];
            });

            // Vérification si cette combinaison existait déjà pour conserver les prix/stocks saisis
            const existing = currentVariants.find(v => {
                const vAttrs = v.attributes || {};
                return activeOptions.every(opt => String(vAttrs[opt.name]) === String(attrs[opt.name]));
            });

            if (existing) {
                return {
                    ...existing,
                    attributes: attrs
                };
            }

            // Génération automatique du SKU de variante
            const suffix = combo.map(c => slugify(c)).join('-');
            const skuVariant = `${baseSku}-${suffix}`.toUpperCase();

            return {
                id: null,
                skuVariant,
                price: defaultPrice,
                stockQty: 0,
                attributes: attrs
            };
        });

        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    // Mettre à jour un champ d'une variante spécifique
    const updateVariantField = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.variants];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, variants: updated };
        });
    };

    // Supprimer une variante
    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, idx) => idx !== index)
        }));
    };

    // Ajouter une variante libre manuelle
    const addManualVariant = () => {
        const baseSku = formData.sku || slugify(formData.name) || 'PROD';
        const newSku = `${baseSku}-VAR-${formData.variants.length + 1}`.toUpperCase();
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    id: null,
                    skuVariant: newSku,
                    price: prev.basePrice ? parseFloat(prev.basePrice) : 0,
                    stockQty: 0,
                    attributes: { "Option": `Variante ${prev.variants.length + 1}` }
                }
            ]
        }));
    };

    // Actions en masse pour les variantes
    const applyBulkPrice = () => {
        if (!bulkPriceVal) return;
        const p = parseFloat(bulkPriceVal);
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => ({ ...v, price: p }))
        }));
        setBulkPriceVal('');
    };

    const applyBulkStock = () => {
        if (!bulkStockVal) return;
        const s = parseInt(bulkStockVal) || 0;
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => ({ ...v, stockQty: s }))
        }));
        setBulkStockVal('');
    };

    // --- GESTION DES SPÉCIFICATIONS TECHNIQUES (EAV) ---
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
            // Formatage des spécifications en objet JSON
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
                categoryId: parseInt(formData.categoryId),
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
                            <Sparkles size={20}/>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">
                                {product ? 'Éditer le Produit' : 'Nouveau Produit Dynamique'}
                            </h2>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Système d'attributs et de matrice de variantes PEOC
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
                                placeholder="Ex: Aliment Poussin Démarrage 25kg, Coq Goliath..." 
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

                        {/* PRIX ET STOCK */}
                        <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">3. Tarification & Stock Global</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input 
                                    label="Prix Vente (CFA)" 
                                    type="number" 
                                    required 
                                    value={formData.basePrice} 
                                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})} 
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
                                <Input 
                                    label="Stock en magasin (unités)" 
                                    type="number" 
                                    value={formData.stockQty} 
                                    onChange={(e) => setFormData({...formData, stockQty: e.target.value})} 
                                    theme={theme} 
                                />
                            ) : (
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between text-xs">
                                    <span className="text-indigo-400 font-bold">Stock total calculé :</span>
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
                                placeholder="Description détaillée du produit, vertus, conseils..." 
                                className={`w-full border p-4 rounded-2xl h-24 text-xs font-medium outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-slate-900'}`} 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            />
                        </div>

                        {/* ======================================================== */}
                        {/* FICHE TECHNIQUE DYNAMIQUE (ATTRIBUTS DESCRIPTIFS EAV)    */}
                        {/* ======================================================== */}
                        <div className={`p-5 rounded-3xl border space-y-4 transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowSpecsSection(!showSpecsSection)}>
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-indigo-400" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">
                                        Fiche Technique & Attributs Descriptifs ({specifications.length})
                                    </span>
                                </div>
                                <button type="button" className="text-slate-400">
                                    {showSpecsSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {showSpecsSection && (
                                <div className="space-y-4 pt-2">
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Définissez ici les caractéristiques techniques du produit (Origine, Conservation, Posologie...) visibles sur la fiche publique.
                                    </p>

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
                                        <Plus size={14} /> Ajouter un attribut personnalisé
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ======================================================== */}
                    {/* COLONNE DROITE (7 colonnes) : IMAGES & MATRICE VARIANTES */}
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
                        {/* SYSTÈME DYNAMIQUE DE VARIANTES & MATRICE CARTÉSIENNE    */}
                        {/* ======================================================== */}
                        <div className={`p-5 rounded-3xl border space-y-6 ${isDark ? 'bg-[#131726] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            
                            {/* TITRE DE SECTION ET BOUTON D'AJOUT D'AXE */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-white/5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sliders size={18} className="text-indigo-400" />
                                        <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">
                                            Matrice des Variantes Dynamiques
                                        </h3>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        Générez automatiquement toutes les combinaisons possibles (comme dans EVA SHOE).
                                    </p>
                                </div>

                                <div className="relative">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPresetMenu(!showPresetMenu)} 
                                        className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                                    >
                                        <Plus size={14} /> AJOUTER UNE OPTION
                                    </button>

                                    {/* MENU DÉROULANT DES PRESETS */}
                                    {showPresetMenu && (
                                        <div className={`absolute right-0 top-11 w-72 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 ${isDark ? 'bg-[#181d2e] border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'}`}>
                                            <div className="space-y-3">
                                                {OPTION_PRESETS.map((grp, i) => (
                                                    <div key={i} className="space-y-1">
                                                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block px-1">
                                                            {grp.category}
                                                        </span>
                                                        <div className="space-y-0.5">
                                                            {grp.presets.map(p => (
                                                                <button
                                                                    key={p.name}
                                                                    type="button"
                                                                    onClick={() => addOption(p.name, p.values)}
                                                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex justify-between items-center transition-all ${isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-slate-100 text-slate-700'}`}
                                                                >
                                                                    <span>{p.name}</span>
                                                                    <span className="text-[9px] opacity-40 font-normal">{p.values.length} vals</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="border-t pt-2 border-white/10">
                                                    <button
                                                        type="button"
                                                        onClick={() => addOption('', [])}
                                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-black text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5"
                                                    >
                                                        <Plus size={12} /> Autre option personnalisée...
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ÉTAPE 1 : DÉFINITION DES OPTIONS ET DE LEURS VALEURS */}
                            {options.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            Axes de variations définis ({options.length})
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={generateMatrix} 
                                            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-4"
                                        >
                                            <RefreshCw size={12} /> Calculer la matrice cartésienne
                                        </button>
                                    </div>

                                    {options.map((opt) => (
                                        <div key={opt.id} className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            <div className="flex items-center gap-2">
                                                <Tag size={14} className="text-indigo-400" />
                                                <input 
                                                    placeholder="Nom de l'option (ex: Conditionnement, Race, Couleur...)"
                                                    value={opt.name}
                                                    onChange={(e) => updateOptionName(opt.id, e.target.value)}
                                                    className={`flex-1 bg-transparent text-xs font-black outline-none border-b border-transparent focus:border-indigo-500 pb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeOption(opt.id)} 
                                                    className="p-1 text-rose-500 hover:scale-110 transition-transform"
                                                    title="Supprimer cette option"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Liste des tags de valeurs */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {opt.values.map((val, valIdx) => (
                                                    <span 
                                                        key={valIdx} 
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border animate-in zoom-in-95 ${isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
                                                    >
                                                        {val}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeValueFromOption(opt.id, valIdx)}
                                                            className="hover:text-rose-400"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}

                                                {/* Champ pour ajouter une valeur rapidement */}
                                                <div className="inline-flex items-center gap-1">
                                                    <input 
                                                        placeholder="+ valeur (puis Entrée)"
                                                        value={opt.inputVal || ''}
                                                        onChange={(e) => updateOptionInputVal(opt.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addValueToOption(opt.id);
                                                            }
                                                        }}
                                                        className={`p-1.5 px-2.5 rounded-xl text-[10px] border outline-none font-bold w-36 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addValueToOption(opt.id)}
                                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-1">
                                        <button 
                                            type="button" 
                                            onClick={generateMatrix}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                                        >
                                            <Sparkles size={16} /> Générer les combinaisons ({options.reduce((acc, o) => acc * (o.values.length || 1), 1)} variantes)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ÉTAPE 2 : MATRICE DES VARIANTES GÉNÉRÉES */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5">
                                        Lignes de Variantes ({formData.variants.length})
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={addManualVariant}
                                        className="text-[9px] font-black text-slate-400 hover:text-white uppercase flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Ajouter une ligne libre
                                    </button>
                                </div>

                                {/* BARRE D'ACTIONS RAPIDES EN MASSE */}
                                {formData.variants.length > 1 && (
                                    <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                        <span className="text-[9px] font-black uppercase text-slate-400">Actions de masse :</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number"
                                                placeholder="Prix commun"
                                                value={bulkPriceVal}
                                                onChange={e => setBulkPriceVal(e.target.value)}
                                                className={`w-24 p-1 px-2 rounded-lg text-[10px] font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200'}`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={applyBulkPrice} 
                                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[9px] font-black rounded-lg transition-all"
                                            >
                                                Appliquer Prix
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number"
                                                placeholder="Stock commun"
                                                value={bulkStockVal}
                                                onChange={e => setBulkStockVal(e.target.value)}
                                                className={`w-24 p-1 px-2 rounded-lg text-[10px] font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200'}`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={applyBulkStock} 
                                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[9px] font-black rounded-lg transition-all"
                                            >
                                                Appliquer Stock
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* LISTE DES VARIANTES */}
                                <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                                    {formData.variants.map((v, i) => {
                                        const attrs = v.attributes || {};
                                        return (
                                            <div 
                                                key={i} 
                                                className={`p-4 rounded-2xl border space-y-3 transition-all ${isDark ? 'bg-[#181d2e] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                                            >
                                                {/* En-tête de la variante : Badges d'attributs */}
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {Object.entries(attrs).map(([key, val]) => (
                                                            <span 
                                                                key={key} 
                                                                className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${isDark ? 'bg-white/5 border-white/10 text-indigo-300' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                                                            >
                                                                <span className="opacity-40">{key}:</span> {val}
                                                            </span>
                                                        ))}
                                                        {Object.keys(attrs).length === 0 && (
                                                            <span className="text-[9px] font-bold opacity-30 italic">Variante personnalisée #{i + 1}</span>
                                                        )}
                                                    </div>

                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeVariant(i)} 
                                                        className="text-rose-500 hover:scale-110 transition-transform p-1"
                                                        title="Supprimer cette combinaison"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* Champs de saisie : SKU, Prix, Stock */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase opacity-40 ml-1">SKU Variante</span>
                                                        <input 
                                                            placeholder="SKU"
                                                            value={v.skuVariant} 
                                                            onChange={e => updateVariantField(i, 'skuVariant', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-mono border outline-none ${isDark ? 'bg-black/30 border-white/5 text-slate-300 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase text-emerald-400 ml-1">Prix (CFA)</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Prix" 
                                                            value={v.price} 
                                                            onChange={e => updateVariantField(i, 'price', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-black border outline-none ${isDark ? 'bg-black/30 border-white/5 text-emerald-400 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase text-indigo-400 ml-1">Stock disponible</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Quantité" 
                                                            value={v.stockQty} 
                                                            onChange={e => updateVariantField(i, 'stockQty', e.target.value)} 
                                                            className={`w-full p-2 rounded-xl text-[11px] font-black border outline-none ${isDark ? 'bg-black/30 border-white/5 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {formData.variants.length === 0 && (
                                        <div className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-2 ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                            <p className="text-xs font-bold">Aucune variante générée.</p>
                                            <p className="text-[10px]">
                                                Cliquez sur <strong className="text-indigo-400">AJOUTER UNE OPTION</strong> ci-dessus pour définir les axes (ex: Conditionnement, Poids, Race...) ou laissez vide pour un produit sans déclinaison.
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
                        <span>{formData.variants.length} variante(s)</span>
                        <span>•</span>
                        <span>Stock total : {computedTotalStock}</span>
                        <span>•</span>
                        <span>{specifications.length} spécification(s)</span>
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