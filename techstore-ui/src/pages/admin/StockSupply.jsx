import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useStockConfig } from '../../context/StockConfigContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import { 
    PackagePlus, Truck, 
    Database, Banknote, RefreshCw, Layers, ChevronRight,
    Lock, AlertCircle, Settings as SettingsIcon
} from 'lucide-react';

const StockSupply = () => {
    const { stockConfig, updateStockConfig } = useStockConfig();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- NOTIFICATIONS & THÈME ---
    const { theme, toggleTheme } = useTheme();
    const { notifyAction, notifyError } = useToast();

    // --- FORMULAIRE ---
    const [formData, setFormData] = useState({
        productId: '',
        variantId: '', 
        supplierId: '1', // Par défaut : ID 1 (TechStore Stock)
        quantity: '',
        purchasePrice: ''
    });

    // --- CHARGEMENT DES DONNÉES ---
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [resProds, resSupps] = await Promise.all([
                AdminService.getAdminProducts(),
                AdminService.getSuppliers()
            ]);

            // Le backend renvoie un objet Pageable (data.content)
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
            variantId: '', 
            purchasePrice: prod ? prod.costPrice : '' 
        });
    };

    // --- SOUMISSION DU FORMULAIRE ---
    const handleSubmit = async (e) => {
        e.preventDefault();

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
            variantId: formData.variantId ? parseInt(formData.variantId) : null 
        };

        try {
            await AdminService.supplyStock(payload);
            notifyAction('supply', selectedProduct?.name || 'Produit', `+${formData.quantity} unités ajoutées au stock`);
            setFormData({ ...formData, quantity: '', purchasePrice: '' });
        } catch (err) {
            console.error(err);
            notifyError("Erreur lors du ravitaillement. Vérifiez les données ou votre connexion.", "Erreur");
        } finally {
            setSubmitting(false);
        }
    };

    // VÉRIFICATION RÉACTIVE : SI LE RAVITAILLEMENT EST DÉSACTIVÉ DANS LES PARAMÈTRES
    if (!stockConfig.manageStockViaSupply) {
        return (
            <AdminLayout theme={theme} filters={null}>
                <div className="w-full flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="max-w-lg w-full bg-[#161926] border border-rose-500/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-inner">
                            <Lock size={36} className="animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Onglet Verrouillé
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white mt-4 uppercase">
                            Ravitaillement Bloqué<span className="text-rose-500">.</span>
                        </h2>

                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                            La gestion du stock par ravitaillement a été désactivée dans vos paramètres.
                            Votre boutique est actuellement configurée pour gérer les stocks directement lors de la création ou modification des fiches produits.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    updateStockConfig({ manageStockViaSupply: true });
                                    notifyAction('update', 'Stock', 'Module Ravitaillement réactivé avec succès !');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={15} />
                                <span>Débloquer maintenant</span>
                            </button>
                            <a
                                href="/admin/settings"
                                className="bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase px-6 py-3.5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <SettingsIcon size={15} />
                                <span>Paramètres du stock</span>
                            </a>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (loading) return (
        <AdminLayout theme={theme} filters={null}>
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <RefreshCw className="animate-spin text-indigo-500 mb-4" size={32} />
                <span className="text-xs font-bold text-slate-400">Chargement des approvisionnements...</span>
            </div>
        </AdminLayout>
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

                            {/* 1.5 Variante */}
                            {selectedProduct?.variants?.length > 0 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2">Variante spécifique</label>
                                    <div className="relative">
                                        <Layers className="absolute left-5 top-5 text-gray-500" size={20} />
                                        <select 
                                            required
                                            className="w-full bg-black/30 border border-white/10 p-5 pl-14 rounded-2xl text-white outline-none focus:border-indigo-500 font-bold"
                                            value={formData.variantId}
                                            onChange={(e) => setFormData({...formData, variantId: e.target.value})}
                                        >
                                            <option value="">Sélectionner la variante...</option>
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