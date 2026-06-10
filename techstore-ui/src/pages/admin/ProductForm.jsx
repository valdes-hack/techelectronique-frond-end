import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Trash2, FileUp, Loader2, Plus, Globe, HardDrive, Cpu } from 'lucide-react';
import AdminService from '../../services/admin.service';
import Input from '../../components/common/Input';
import { getFullImageUrl } from '../../utils/imageUtils';

const ProductForm = ({ product, onClose, onSave, theme }) => {
    const isDark = theme === 'dark';
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    
    // --- GESTION DES IMAGES ---
    const [files, setFiles] = useState([]); // Fichiers binaires réels (upload local)
    const [imageUrls, setImageUrls] = useState([]); // URLs (existantes ou saisies via lien)
    const [previews, setPreviews] = useState([]); // Ce qui est affiché à l'écran (mélange Blob et HTTP)
    const [tempUrl, setTempUrl] = useState(''); 
    const [imageInputMode, setImageInputMode] = useState('file'); // 'file' ou 'url'

    const [formData, setFormData] = useState({
        id: null, name: '', slug: '', sku: '', brand: '',
        basePrice: '', costPrice: '', categoryId: '',
        defaultSupplierId: '', description: '', variants: []
    });

    // 1. Initialisation et synchronisation au chargement du produit (Modification)
    useEffect(() => {
        if (product) {
            // On parse les attributs JSON vers les champs Couleur/Stockage/RAM pour l'UI
            const parsedVariants = product.variants?.map(v => {
                let attrs = { color: '', storage: '', ram: '' };
                try {
                    const obj = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
                    // On cherche les clés de ta BD (Couleur / Stockage / RAM)
                    attrs.color = obj?.Couleur || obj?.couleur || '';
                    attrs.storage = obj?.Stockage || obj?.stockage || '';
                    attrs.ram = obj?.RAM || obj?.ram || '';
                } catch (e) { console.error("Erreur parsing variantes", e); }
                return { ...v, color: attrs.color, storage: attrs.storage, ram: attrs.ram };
            }) || [];

            setFormData({
                id: product.id,
                name: product.name || '',
                slug: product.slug || '',
                sku: product.sku || '',
                brand: product.brand || '',
                basePrice: product.basePrice || '',
                costPrice: product.costPrice || '',
                categoryId: product.categoryId || product.category?.id || '',
                defaultSupplierId: product.defaultSupplierId || '',
                description: product.description || '',
                variants: parsedVariants
            });

            // On sépare les images existantes pour ne pas les uploader à nouveau
            const existing = product.images?.map(img => img.url) || [];
            setImageUrls(existing);
            // On utilise getFullImageUrl pour l'affichage de la miniature, afin d'éviter les erreurs Mixed Content sur les URLs localhost
            setPreviews(existing.map(url => getFullImageUrl(url)));
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

    // --- LOGIQUE DES IMAGES ---
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        setFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        e.target.value = null; // Reset input
    };

    const addUrlImage = () => {
        if (tempUrl.trim()) {
            setImageUrls(prev => [...prev, tempUrl]);
            setPreviews(prev => [...prev, tempUrl]);
            setTempUrl('');
        }
    };

    const removeImage = (index) => {
        const itemToRemove = previews[index];
        setPreviews(prev => prev.filter((_, i) => i !== index));

        if (imageUrls.includes(itemToRemove)) {
            // C'était une URL existante
            setImageUrls(prev => prev.filter(u => u !== itemToRemove));
        } else {
            // C'était un fichier local, on doit trouver son index dans le tableau 'files'
            const localPreviews = previews.filter(p => !imageUrls.includes(p));
            const fileIdx = localPreviews.indexOf(itemToRemove);
            if (fileIdx !== -1) {
                setFiles(prev => prev.filter((_, i) => i !== fileIdx));
            }
            URL.revokeObjectURL(itemToRemove);
        }
    };

    // --- LOGIQUE DES VARIANTES ---
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { skuVariant: '', price: prev.basePrice, color: '', storage: '', ram: '', stockQty: 0 }]
        }));
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    // --- SOUMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Transformation des champs plats vers le JSON attendu par le Backend
            const formattedVariants = formData.variants.map(v => ({
                id: v.id || null,
                skuVariant: v.skuVariant || `${formData.sku}-${v.color || 'V'}`,
                price: parseFloat(v.price),
                stockQty: parseInt(v.stockQty || 0),
                attributes: JSON.stringify({ Couleur: v.color, Stockage: v.storage, RAM: v.ram })
            }));

            const payload = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                categoryId: parseInt(formData.categoryId),
                defaultSupplierId: formData.defaultSupplierId ? parseInt(formData.defaultSupplierId) : null,
                imageUrls: imageUrls, // URLs à conserver/ajouter
                variants: formattedVariants
            };
            
            await onSave(payload, files); // Envoi Multipart vers AdminProducts.jsx
        } catch (error) { 
            console.error(error); 
        } finally { 
            setSubmitting(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className={`w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#111421] border-white/10 text-white' : 'bg-white border-gray-200 text-slate-800'}`}>
                
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white"><ImageIcon size={20}/></div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                            {product ? 'Éditer le Produit' : 'Nouveau Produit'}
                        </h2>
                    </div>
                    <button type="button" onClick={onClose} className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}><X /></button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* SECTION GAUCHE : INFOS */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-2">Identité</label>
                            <Input required placeholder="Nom du produit" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} theme={theme} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input required placeholder="Marque" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} theme={theme} />
                                <Input required placeholder="SKU Principal" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} theme={theme} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Rayon</label>
                                <select className={`w-full border p-4 rounded-2xl font-bold outline-none ${isDark ? 'bg-[#1a1c2e] border-white/10 text-white focus:border-indigo-500' : 'bg-gray-100 border-transparent text-slate-900'}`} value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required>
                                    <option value="">Choisir...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 ml-2 text-amber-500">Fournisseur</label>
                                <select className={`w-full border p-4 rounded-2xl font-bold outline-none ${isDark ? 'bg-[#1a1c2e] border-white/10 text-white focus:border-indigo-500' : 'bg-gray-100 border-transparent text-slate-900'}`} value={formData.defaultSupplierId} onChange={(e) => setFormData({...formData, defaultSupplierId: e.target.value})}>
                                    <option value="">Par défaut...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Prix Vente" type="number" required value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} theme={theme} />
                            <Input label="Prix Achat" type="number" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} theme={theme} />
                        </div>
                        <textarea placeholder="Description du produit..." className={`w-full border p-5 rounded-[2rem] h-24 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-gray-100 border-transparent text-slate-900'}`} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    {/* SECTION DROITE : IMAGES & VARIANTES */}
                    <div className="space-y-8">
                        {/* GALERIE IMAGES */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Images du produit</label>
                                <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5">
                                    <button type="button" onClick={() => setImageInputMode('file')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${imageInputMode === 'file' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>FICHIER</button>
                                    <button type="button" onClick={() => setImageInputMode('url')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${imageInputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>URL</button>
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto p-2 bg-black/40 rounded-2xl border border-white/5 min-h-[100px] custom-scrollbar">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/20 group">
                                        <img src={src} className="w-full h-full object-cover" alt="" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {imageInputMode === 'file' && (
                                    <label className="w-16 h-16 shrink-0 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-500/10 transition-all">
                                        <FileUp className="text-indigo-500" />
                                        <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                )}
                            </div>
                            
                            {imageInputMode === 'url' && (
                                <div className="flex gap-2 animate-in slide-in-from-right-2">
                                    <input value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="Coller une URL d'image..." className={`flex-1 border p-3 rounded-xl text-xs outline-none focus:border-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-transparent text-slate-800'}`} />
                                    <button type="button" onClick={addUrlImage} className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-500 transition-all"><Plus/></button>
                                </div>
                            )}
                        </div>

                        {/* VARIANTES AVEC STOCKAGE & RAM */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Variantes (Stockage & RAM)</label>
                                <button type="button" onClick={addVariant} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">+ AJOUTER</button>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {formData.variants.map((v, i) => (
                                    <div key={i} className={`p-5 rounded-3xl border space-y-4 shadow-inner ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-slate-100'}`}>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase opacity-40 ml-1">Couleur</span>
                                                <input placeholder="Ex: Titane" className={`bg-transparent text-xs border-b w-full outline-none p-1 ${isDark ? 'text-white border-white/10 focus:border-indigo-500' : 'text-slate-800 border-slate-200'}`} value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase opacity-40 ml-1">Prix (CFA)</span>
                                                <input type="number" placeholder="Prix" className={`bg-transparent text-xs font-black border-b w-full outline-none p-1 ${isDark ? 'text-emerald-400 border-white/10' : 'text-emerald-600 border-slate-200'}`} value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 items-center">
                                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                                                <HardDrive size={14} className="text-indigo-500"/>
                                                <input placeholder="Stockage Go" className="bg-transparent text-xs text-white outline-none w-full" value={v.storage} onChange={e => updateVariant(i, 'storage', e.target.value)} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                                                    <Cpu size={14} className="text-emerald-500"/>
                                                    <input placeholder="RAM Go" className="bg-transparent text-xs text-white outline-none w-full" value={v.ram} onChange={e => updateVariant(i, 'ram', e.target.value)} />
                                                </div>
                                                <button type="button" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, idx) => idx !== i)})} className="text-red-500 hover:scale-110 transition-transform ml-2"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {formData.variants.length === 0 && <p className="text-center py-6 text-xs opacity-20 italic">Aucune variante définie</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={`p-8 border-t flex justify-end gap-6 ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                    <button type="button" onClick={onClose} className="px-6 py-3 text-white/50 font-bold uppercase text-xs hover:text-white">Annuler</button>
                    <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-500 disabled:opacity-50 transition-all uppercase shadow-xl shadow-indigo-500/20 active:scale-95">
                        {submitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                        {product ? 'METTRE À JOUR' : 'PUBLIER LE PRODUIT'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;