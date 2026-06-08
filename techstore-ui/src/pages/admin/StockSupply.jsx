import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import { 
    PackagePlus, Truck, 
    Database, Banknote, RefreshCw, Layers, ChevronRight 
} from 'lucide-react';

const StockSupply = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- FORMULAIRE ---
    const [formData, setFormData] = useState({
        productId: '',
        variantId: '', 
        supplierId: '1', // Par défaut : ID 1 (TechStore Stock)
        quantity: '',
        purchasePrice: ''
    });

    const { theme, toggleTheme } = useTheme();

    // --- CHARGEMENT DES DONNÉES ---
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [resProds, resSupps] = await Promise.all([
                AdminService.getAdminProducts(),
                AdminService.getSuppliers()
            ]);

            // Correction : Le backend renvoie souvent un objet Pageable (data.content)
            const productList = resProds.data?.content || resProds.data || [];
            setProducts(productList);
            setSuppliers(resSupps.data || []);
        } catch (e) {
            console.error("Erreur lors du chargement des données", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // --- GESTION DU CHANGEMENT DE PRODUIT ---
    const handleProductChange = (e) => {
        const prodId = e.target.value;
        const prod = products.find(p => p.id === Number(prodId));
        
        setSelectedProduct(prod);
        setFormData({ 
            ...formData, 
            productId: prodId, 
            variantId: '' // On réinitialise la variante à chaque nouveau produit
        });
    };

    // --- SOUMISSION DU FORMULAIRE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Vérification cruciale : si le produit a des variantes, on force le choix
        if (selectedProduct?.variants?.length > 0 && !formData.variantId) {
            alert("⚠️ Veuillez sélectionner une variante spécifique (Couleur/Taille) pour ce produit.");
            return;
        }

        setSubmitting(true);

        const payload = {
            productId: parseInt(formData.productId),
            supplierId: parseInt(formData.supplierId),
            quantity: parseInt(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
            // Si pas de variante sélectionnée, on envoie null
            variantId: formData.variantId ? parseInt(formData.variantId) : null 
        };

        try {
            await AdminService.supplyStock(payload);
            alert("✅ Ravitaillement réussi ! Le stock et le prix d'achat ont été mis à jour.");
            // On vide juste la quantité et le prix pour permettre un nouvel enregistrement rapide
            setFormData({ ...formData, quantity: '', purchasePrice: '' });
        } catch (err) {
            console.error(err);
            alert("❌ Erreur serveur : vérifiez les données ou votre connexion.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#0b0e14]">
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <AdminLayout theme={theme} filters={null}>
            <div className="w-full flex flex-col gap-10 p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
                
                <header>
                    <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">
                        Ravitaillement<span className="text-indigo-500">.</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-2 text-white">
                        Entrée de stock physique & Historisation des coûts
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                    
                    {/* --- COLONNE FORMULAIRE (7/12) --- */}
                    <div className="lg:col-span-7 bg-[#161926] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* 1. Produit */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2">1. Article reçu</label>
                                <select 
                                    required
                                    className="w-full bg-black/30 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-indigo-500 font-bold transition-all appearance-none"
                                    value={formData.productId}
                                    onChange={handleProductChange}
                                >
                                    <option value="">Sélectionner un produit du catalogue...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} — (Ref: {p.sku})</option>
                                    ))}
                                </select>
                            </div>

                            {/* 1.5 Variante (Apparaît seulement si nécessaire) */}
                            {selectedProduct?.variants?.length > 0 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-2">Déclinaison spécifique (Obligatoire)</label>
                                    <div className="relative">
                                        <Layers className="absolute left-5 top-5 text-amber-500/50" size={20} />
                                        <select 
                                            required
                                            className="w-full bg-black/30 border border-amber-500/20 p-5 pl-14 rounded-2xl text-white outline-none focus:border-amber-500 font-bold appearance-none"
                                            value={formData.variantId}
                                            onChange={(e) => setFormData({...formData, variantId: e.target.value})}
                                        >
                                            <option value="">Choisir la variante...</option>
                                            {selectedProduct.variants.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.skuVariant} — Stock actuel : {v.stockQty || 0}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* 2. Fournisseur */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2">2. Provenance</label>
                                <div className="relative">
                                    <Truck className="absolute left-5 top-5 text-gray-500" size={20} />
                                    <select 
                                        required
                                        className="w-full bg-black/30 border border-white/10 p-5 pl-14 rounded-2xl text-white outline-none focus:border-indigo-500"
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                                    >
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 3. Chiffres */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2">Quantité</label>
                                    <div className="relative">
                                        <Database className="absolute left-5 top-5 text-gray-500" size={20} />
                                        <input 
                                            type="number" required min="1" placeholder="Ex: 50"
                                            className="w-full bg-black/30 border border-white/10 p-5 pl-14 rounded-2xl text-white outline-none focus:border-indigo-500 font-black text-xl"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-2">Prix d'achat Unitaire</label>
                                    <div className="relative">
                                        <Banknote className="absolute left-5 top-5 text-gray-500" size={20} />
                                        <input 
                                            type="number" required min="0" placeholder="Prix HT"
                                            className="w-full bg-black/30 border border-white/10 p-5 pl-14 rounded-2xl text-white outline-none focus:border-indigo-500 font-black text-xl"
                                            value={formData.purchasePrice}
                                            onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
                            >
                                {submitting ? <RefreshCw className="animate-spin" size={20}/> : <PackagePlus size={24}/>}
                                VALIDER L'ENTRÉE EN STOCK
                            </button>
                        </form>
                    </div>

                    {/* --- RÉSUMÉ & CALCULS (DROITE 5/12) --- */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-xl shadow-emerald-500/5">
                            <h4 className="text-emerald-500 font-black text-xl mb-4 italic uppercase tracking-tighter">Récapitulatif</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valeur totale</span>
                                    <span className="text-white text-4xl font-black tracking-tighter">
                                        {(Number(formData.quantity) * Number(formData.purchasePrice) || 0).toLocaleString()} <small className="text-xs opacity-40">CFA</small>
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                    Note : La validation déclenche la procédure SQL <code className="text-indigo-400">add_stock</code>. Le stock physique et la valeur d'inventaire seront mis à jour instantanément.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex-1">
                            <h4 className="text-white font-black text-xl mb-4 italic uppercase tracking-tighter opacity-20">Guide d'utilisation</h4>
                            <ul className="space-y-5">
                                {[
                                    { t: "Produit Parent", d: "Sélectionnez l'article principal pour charger ses options." },
                                    { t: "Variante", d: "Si des couleurs/tailles existent, le ravitaillement se fait par variante." },
                                    { t: "Fournisseur", d: "Indiquez le partenaire auprès duquel vous avez acheté ce lot." },
                                    { t: "Prix Unitaire", d: "C'est ce prix qui servira de base au calcul de votre marge brute." }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="bg-indigo-500/20 p-1.5 rounded-lg mt-0.5"><ChevronRight size={12} className="text-indigo-500" /></div>
                                        <div>
                                            <p className="text-xs font-black text-gray-300 uppercase mb-1">{item.t}</p>
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default StockSupply;