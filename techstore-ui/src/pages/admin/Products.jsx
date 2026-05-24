import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFilter from '../../components/admin/AdminFilter';
import ProductService from '../../services/product.service';
import AdminService from '../../services/admin.service';
import ProductForm from './ProductForm';
import {
    Plus, Edit2, Trash2, Box, AlertTriangle, 
    Wallet, RefreshCw, ChevronRight, Truck
} from 'lucide-react';

const AdminProducts = () => {
    // 1. ÉTATS DES DONNÉES
    const [products, setProducts] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. ÉTAT DU THÈME
    const [theme, setTheme] = useState(() => localStorage.getItem('admin_hub_theme') || 'dark');
    
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
            
            const dispoMatch = filters.dispo === "Tous" || (filters.dispo === "En stock" ? p.stockQty > 0 : p.stockQty <= 0);
            
            return nameMatch && categoryMatch && priceMatch && dispoMatch;
        });
        setFilteredList(filtered);
    }, [products, filters]);

    const categoriesList = ["Toutes", ...new Set(products.map(p => p.categoryName).filter(c => c))];

    const handleDelete = async (id) => {
        if (window.confirm("Bébé, confirmer la suppression de ce produit ? 🥺")) {
            try {
                await AdminService.deleteProduct(id);
                loadData();
            } catch (err) {
                alert("Erreur lors de la suppression");
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
                    <h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Produits<span className="text-indigo-500">.</span>
                    </h2>
                    <button 
                        onClick={() => { setSelectedProduct(null); setShowForm(true); }} 
                        className="bg-[#10b981] text-[#0b0e14] px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-lg text-xs uppercase whitespace-nowrap"
                    >
                        + Ajouter au catalogue
                    </button>
                </header>

                {/* STATS RESPONSIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard theme={theme} title="TOTAL" value={filteredList.length} sub="Catalogue" icon={<Box size={22}/>} color="#818cf8"/>
                    <StatCard theme={theme} title="VALEUR" value={(filteredList.reduce((a,b)=>a+(b.basePrice*(b.stockQty||0)),0)).toLocaleString()} unit="F" sub="Prix vente" icon={<Wallet size={22}/>} color="#fbbf24" />
                    <StatCard theme={theme} title="RUPTURE" value={filteredList.filter(x => x.stockQty <= 0).length} sub="Alertes stock" icon={<AlertTriangle size={22}/>} color="#f43f5e"/>
                    <StatCard theme={theme} title="SOURCES" value={new Set(products.map(p => p.defaultSupplierId)).size} sub="Fournisseurs" icon={<Truck size={22}/>} color="#10b981"/>
                </div>

                {/* TABLEAU AVEC SCROLLBAR */}
                <div className={`flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDark ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left min-w-[1000px] border-collapse">
                            <thead className={`sticky top-0 z-20 ${isDark ? 'bg-[#1a1e2e]' : 'bg-slate-50'} text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <tr>
                                    <th className="p-6">RÉFÉRENCE</th>
                                    <th className="p-6 text-center">VISUEL</th>
                                    <th className="p-6">NOM DU PRODUIT</th>
                                    <th className="p-6 text-center">CATÉGORIE</th>
                                    <th className="p-6 text-center">PRIX</th>
                                    <th className="p-6 text-center">STOCK</th>
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
                                                    src={p.images?.[imgIdxMap[p.id]]?.url?.startsWith('http') 
                                                        ? p.images[imgIdxMap[p.id]].url 
                                                        : `http://localhost:8080/uploads/products/${p.images?.[imgIdxMap[p.id]]?.url}`} 
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
                                        <td className="p-6 text-right space-x-2">
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

            {/* FORMULAIRE (MODALE) */}
            {showForm && (
                <ProductForm 
                    product={selectedProduct} 
                    theme={theme} 
                    onClose={() => setShowForm(false)} 
                    onSave={async (payload, files) => {
                        try {
                            if (selectedProduct) {
                                // MODIFICATION : On utilise le format multipart (JSON + Fichiers)
                                await AdminService.updateProduct(selectedProduct.id, payload, files);
                                alert("✅ Produit mis à jour avec succès !");
                            } else {
                                // CRÉATION : Multipart (JSON + Fichiers)
                                await AdminService.createProduct(payload, files);
                                alert("✅ Nouveau produit ajouté !");
                            }
                            loadData();
                            setShowForm(false);
                        } catch (err) {
                            console.error(err);
                            alert("❌ Erreur lors de l'enregistrement. Vérifiez vos données.");
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
        <div className={`p-6 rounded-[2.2rem] border transition-all shadow-xl flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-100'}`}>
            <div className="flex justify-between items-start w-full">
                <div className="min-w-0">
                    <p className={`text-[10px] font-black uppercase opacity-30 tracking-widest mb-1.5 ${isDark ? 'text-white' : 'text-slate-500'}`}>{title}</p>
                    <div className={`text-2xl md:text-3xl font-black tracking-tighter truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {value}<span className="text-sm ml-1 opacity-20">{unit}</span>
                    </div>
                </div>
                <div className={`flex-shrink-0 p-4 rounded-2xl ml-4 flex items-center justify-center shadow-inner ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} style={{color}}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-bold opacity-30 mt-4 flex items-center uppercase tracking-tight">
                <ChevronRight size={14} className="mr-1 text-indigo-500 flex-shrink-0" /> {sub}
            </p>
        </div>
    );
};

export default AdminProducts;