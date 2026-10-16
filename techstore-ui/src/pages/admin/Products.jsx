import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFilter from '../../components/admin/AdminFilter';
import ProductService from '../../services/product.service';
import AdminService from '../../services/admin.service';
import ProductForm from './ProductForm';
import {
    Plus, Edit2, Trash2, Box, AlertTriangle, 
    Wallet, RefreshCw, ChevronRight, Truck, Eye, EyeOff
} from 'lucide-react';
import { getFullImageUrl } from '../../utils/imageUtils';

const AdminProducts = () => {
    // 1. ÉTATS DES DONNÉES
    const [products, setProducts] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. ÉTAT DU THÈME & NOTIFICATIONS
    const { theme, toggleTheme } = useTheme();
    const { notifyAction, notifyError } = useToast();
    
    // 3. ÉTAT DES FILTRES
    const [filters, setFilters] = useState({
        searchTerm: "", 
        selCat: "Toutes", 
        minPrice: "", 
        maxPrice: "", 
        dispo: "Tous"
    });

    const [imgIdxMap, setImgIdxMap] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const isDark = theme === 'dark';

    // FONCTION DE CHARGEMENT
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAdminProducts();
            if (res.status === 'success') {
                // Gestion de la pagination (Page.content)
                const data = res.data.content || res.data || [];
                setProducts(data);
                
                // Init pour le changement d'image au clic
                const idxs = {}; 
                data.forEach(p => idxs[p.id] = 0);
                setImgIdxMap(idxs);
            }
        } catch (e) { 
            console.error("Erreur serveur :", e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadData(); }, []);

    // LOGIQUE DE FILTRAGE
    useEffect(() => {
        const filtered = products.filter(p => {
            const search = filters.searchTerm.toLowerCase();
            const nameMatch = (p.name || "").toLowerCase().includes(search) || 
                             (p.sku || "").toLowerCase().includes(search);
            
            const categoryMatch = filters.selCat === "Toutes" || p.categoryName === filters.selCat;
            
            const price = p.basePrice || 0;
            const minP = filters.minPrice === "" ? 0 : parseFloat(filters.minPrice);
            const maxP = filters.maxPrice === "" ? Infinity : parseFloat(filters.maxPrice);
            const priceMatch = price >= minP && price <= maxP;
            
            const dispoMatch = filters.dispo === "Tous" 
                || (filters.dispo === "En stock" ? p.stockQty > 0 : false)
                || (filters.dispo === "Rupture" ? p.stockQty <= 0 : false)
                || (filters.dispo === "En ligne" ? p.isActive !== false : false)
                || (filters.dispo === "Hors ligne" ? p.isActive === false : false);
            
            return nameMatch && categoryMatch && priceMatch && dispoMatch;
        });
        setFilteredList(filtered);
    }, [products, filters]);

    const categoriesList = ["Toutes", ...new Set(products.map(p => p.categoryName).filter(c => c))];

    const handleToggleStatus = async (product) => {
        const isCurrentlyActive = product.isActive !== false;
        const nextStatus = !isCurrentlyActive;
        
        // Mise à jour optimiste immédiate dans l'UI
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: nextStatus } : p));
        
        try {
            await AdminService.toggleProductStatus(product.id);
            notifyAction('update', product.name, nextStatus ? 'Produit mis en ligne' : 'Produit retiré de la ligne (hors ligne)');
        } catch (err) {
            console.error(err);
            // Rollback en cas d'erreur
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: isCurrentlyActive } : p));
            notifyError("Erreur lors de la modification de visibilité", "Erreur");
        }
    };

    const handleDelete = async (id) => {
        const productToDelete = products.find(p => p.id === id);
        if (window.confirm(`Confirmer la suppression définitive de "${productToDelete?.name || 'ce produit'}" ?`)) {
            try {
                try {
                    await AdminService.hardDeleteProduct(id);
                } catch {
                    await AdminService.deleteProduct(id);
                }
                notifyAction('delete', productToDelete?.name || 'Produit', 'Supprimé du catalogue');
                loadData();
            } catch (err) {
                notifyError("Erreur lors de la suppression du produit", "Erreur");
            }
        }
    };

    const handlePurgeAll = async () => {
        if (products.length === 0) {
            alert("Le catalogue est déjà vide.");
            return;
        }
        if (window.confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT tous les ${products.length} produits du catalogue ?\nCette action est irréversible.`)) {
            setLoading(true);
            try {
                await AdminService.purgeProducts();
                await loadData();
                notifyAction('delete', 'Catalogue', 'Tous les produits ont été supprimés');
            } catch (e) {
                console.error("Erreur purge globale :", e);
                try {
                    for (const p of products) {
                        try {
                            await AdminService.hardDeleteProduct(p.id);
                        } catch {
                            await AdminService.deleteProduct(p.id);
                        }
                    }
                    await loadData();
                    notifyAction('delete', 'Catalogue', 'Produits supprimés');
                } catch (err2) {
                    notifyError("Erreur lors de la suppression des produits", "Erreur");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#0b0e14]' : 'bg-slate-50'}`}>
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <AdminLayout 
            theme={theme} 
            filters={
                <AdminFilter 
                    context="products" 
                    theme={theme} 
                    categories={categoriesList} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onReset={() => setFilters({searchTerm: "", selCat: "Toutes", minPrice: "", maxPrice: "", dispo: "Tous"})}
                />
            }
        >
            <div className="flex flex-col gap-8 h-full">
                {/* HEADER */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                    <div>
                        <h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Produits<span className="text-indigo-500">.</span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Gérez l'inventaire, le stock et les prix du catalogue PEOC.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {products.length > 0 && (
                            <button
                                onClick={handlePurgeAll}
                                className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 active:scale-95 flex items-center gap-2"
                                title="Supprimer tous les produits existants"
                            >
                                <Trash2 size={16} />
                                <span>Vider le catalogue</span>
                            </button>
                        )}
                        <button 
                            onClick={() => { setSelectedProduct(null); setShowForm(true); }} 
                            className="bg-[#10b981] text-[#0b0e14] px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-lg text-xs uppercase whitespace-nowrap"
                        >
                            + Ajouter au catalogue
                        </button>
                    </div>
                </header>

                {/* STATS RESPONSIVE */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <StatCard theme={theme} title="TOTAL" value={filteredList.length} sub="Catalogue" icon={<Box size={22}/>} color="#818cf8"/>
                    <StatCard theme={theme} title="VALEUR" value={(filteredList.reduce((a,b)=>a+(b.basePrice*(b.stockQty||0)),0)).toLocaleString()} unit="F" sub="Prix vente" icon={<Wallet size={22}/>} color="#fbbf24" />
                    <StatCard theme={theme} title="RUPTURE" value={filteredList.filter(x => x.stockQty <= 0).length} sub="Alertes stock" icon={<AlertTriangle size={22}/>} color="#f43f5e"/>
                    <StatCard theme={theme} title="SOURCES" value={new Set(products.map(p => p.defaultSupplierId)).size} sub="Fournisseurs" icon={<Truck size={22}/>} color="#10b981"/>
                </div>

                {/* TABLEAU AVEC SCROLLBAR */}
                <div className={`w-full max-w-full rounded-[2.5rem] border flex flex-col ${isDark ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="overflow-x-auto w-full custom-scrollbar rounded-[2.5rem]">
                        <table className="w-full text-left min-w-[1000px] border-collapse">
                            <thead className={`sticky top-0 z-20 ${isDark ? 'bg-[#1a1e2e]' : 'bg-slate-50'} text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <tr>
                                    <th className="p-6">RÉFÉRENCE</th>
                                    <th className="p-6 text-center">VISUEL</th>
                                    <th className="p-6">NOM DU PRODUIT</th>
                                    <th className="p-6 text-center">CATÉGORIE</th>
                                    <th className="p-6 text-center">PRIX</th>
                                    <th className="p-6 text-center">STOCK</th>
                                    <th className="p-6 text-center">STATUT (EN LIGNE)</th>
                                    <th className="p-6 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                {filteredList.map((p) => (
                                    <tr key={p.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all group`}>
                                        <td className="p-6 font-mono text-xs text-indigo-400 font-bold">#{p.sku || p.id}</td>
                                        <td className="p-6">
                                            <div onClick={() => setImgIdxMap({...imgIdxMap, [p.id]: (imgIdxMap[p.id] + 1) % (p.images?.length || 1)})}
                                                className="w-14 h-14 mx-auto bg-black/10 rounded-2xl p-1 relative border border-white/5 cursor-pointer overflow-hidden group-hover:scale-110 transition-transform">
                                                <img 
                                                    src={getFullImageUrl(p.images?.[imgIdxMap[p.id]]?.url)} 
                                                    className="w-full h-full object-contain" 
                                                    alt={p.name} 
                                                />
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{p.brand}</p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {p.categoryName}
                                            </span>
                                        </td>
                                        <td className={`p-6 text-center font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {p.basePrice?.toLocaleString()} F
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${p.stockQty > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {p.stockQty || 0} UNITÉS
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleToggleStatus(p)}
                                                title={p.isActive !== false ? "Cliquer pour masquer (retirer de la ligne)" : "Cliquer pour publier (mettre en ligne)"}
                                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-sm border ${
                                                    p.isActive !== false 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20' 
                                                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${p.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {p.isActive !== false ? 'En ligne' : 'Hors ligne'}
                                            </button>
                                        </td>
                                        <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                            <button 
                                                type="button"
                                                onClick={() => handleToggleStatus(p)} 
                                                title={p.isActive !== false ? "Retirer de la ligne" : "Mettre en ligne"}
                                                className={`p-2.5 rounded-xl border transition-all ${
                                                    p.isActive !== false 
                                                        ? (isDark ? 'border-white/5 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10' : 'border-slate-200 text-emerald-600 hover:bg-emerald-50')
                                                        : (isDark ? 'border-white/5 text-slate-400 hover:border-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50')
                                                }`}
                                            >
                                                {p.isActive !== false ? <Eye size={16}/> : <EyeOff size={16}/>}
                                            </button>
                                            <button onClick={() => { setSelectedProduct(p); setShowForm(true); }} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-indigo-400 hover:border-indigo-400' : 'border-slate-200 text-indigo-600 hover:bg-indigo-50'}`}><Edit2 size={16}/></button>
                                            <button onClick={() => handleDelete(p.id)} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/5 text-red-400 hover:border-red-400' : 'border-slate-200 text-red-600 hover:bg-red-50'}`}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <ProductForm 
                    product={selectedProduct} 
                    theme={theme} 
                    onClose={() => setShowForm(false)} 
                    onSave={async (payload, files) => {
                        try {
                            if (selectedProduct) {
                                // MODIFICATION : Multipart (JSON + Fichiers)
                                await AdminService.updateProduct(selectedProduct.id, payload, files);
                                notifyAction('update', payload.name || 'Produit', 'Informations et prix mis à jour');
                            } else {
                                // CRÉATION : Multipart (JSON + Fichiers)
                                await AdminService.createProduct(payload, files);
                                notifyAction('create', payload.name || 'Nouveau Produit', 'Ajouté au catalogue');
                            }
                            loadData();
                            setShowForm(false);
                        } catch (err) {
                            console.error(err);
                            notifyError("Erreur lors de l'enregistrement. Vérifiez vos données.", "Erreur");
                        }
                    }} 
                />
            )}
        </AdminLayout>
    );
};

// COMPOSANT STATCARD UNIFIÉ
const StatCard = ({ title, value, sub, icon, color, unit="", theme }) => {
    const isDark = theme === 'dark';
    return (
        <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.2rem] border transition-all shadow-xl flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-100'}`}>
            <div className="flex justify-between items-start w-full">
                <div className="min-w-0">
                    <p className={`text-[9px] sm:text-[10px] font-black uppercase opacity-30 tracking-widest mb-1.5 ${isDark ? 'text-white' : 'text-slate-500'}`}>{title}</p>
                    <div className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tighter truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {value}<span className="text-[10px] sm:text-sm ml-1 opacity-20">{unit}</span>
                    </div>
                </div>
                <div className={`hidden sm:flex flex-shrink-0 p-3 sm:p-4 rounded-2xl ml-2 sm:ml-4 items-center justify-center shadow-inner ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} style={{color}}>
                    {icon}
                </div>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold opacity-30 mt-3 sm:mt-4 flex items-center uppercase tracking-tight">
                <ChevronRight size={14} className="mr-1 text-indigo-500 flex-shrink-0 hidden sm:block" /> {sub}
            </p>
        </div>
    );
};

export default AdminProducts;