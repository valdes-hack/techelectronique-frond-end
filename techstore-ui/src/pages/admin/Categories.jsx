import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import CategoryForm from './CategoryForm'; 
import AdminFilter from '../../components/admin/AdminFilter';
import { getFullImageUrl } from '../../utils/imageUtils';

// Import des icônes Lucide
import { 
    Layers, Plus, Edit2, Trash2, LayoutGrid, List, RefreshCw, ChevronRight, AlertTriangle, Sparkles, Smile, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
    // --- ÉTATS DES DONNÉES ---
    const [categories, setCategories] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('grid');
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // --- ÉTAT DU THÈME ---
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // --- ÉTAT DES FILTRES ---
    const [filters, setFilters] = useState({
        searchTerm: "", 
        dispo: "Tous"   // Tous, Online, Offline
    });

    // --- HELPER D'AFFICHAGE D'ICÔNE OU D'EMOJI ---
    const renderCategoryVisual = (iconUrl, name) => {
        if (!iconUrl) return <span className="text-4xl select-none">📦</span>;
        
        // 1. Boxicon CSS class (ex: "bx bx-egg")
        if (iconUrl.startsWith('bx')) {
            return <i className={`${iconUrl} text-4xl text-indigo-400 group-hover:scale-125 transition-transform`} />;
        }
        
        // 2. Image URL valide
        if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://') || iconUrl.startsWith('data:') || iconUrl.startsWith('/uploads')) {
            return (
                <img 
                    src={getFullImageUrl(iconUrl)} 
                    className="w-full h-full object-cover p-2 rounded-[2.2rem] group-hover:scale-110 transition-transform" 
                    alt={name || ""}
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            );
        }

        // 3. Emoji ou caractère spécial
        return (
            <span className="text-4xl select-none group-hover:scale-125 transition-transform">
                {iconUrl}
            </span>
        );
    };

    // --- CHARGEMENT DES DONNÉES DEPUIS L'API ---
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllAdminCategories();
            if (res.status === 'success' || Array.isArray(res)) {
                const list = res.data || (Array.isArray(res) ? res : []);
                setCategories(list);
            }
        } catch (e) { 
            console.error("Erreur lors du chargement des rayons:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- FILTRAGE DYNAMIQUE ---
    useEffect(() => {
        const filtered = categories.filter(c => {
            const search = filters.searchTerm.toLowerCase();
            const matchesText = (c.name || "").toLowerCase().includes(search) || (c.slug || "").toLowerCase().includes(search);
            const isOnline = c.isActive !== false && c.is_active !== false;
            const matchesStatus = filters.dispo === "Tous" || 
                (filters.dispo === "Online" ? isOnline : !isOnline);

            return matchesText && matchesStatus;
        });
        setFilteredList(filtered);
    }, [categories, filters]);

    // --- SUPPRESSION INDIVIDUELLE ---
    const handleDelete = async (id, name) => {
        if (window.confirm(`Confirmer la suppression définitive du rayon "${name || ''}" ?`)) {
            try { 
                await AdminService.deleteCategory(id); 
                await loadData(); 
            } catch (e) { 
                console.error(e);
                alert("Erreur lors de la suppression : " + (e.response?.data?.message || e.message));
            }
        }
    };

    // --- PURGE GLOBALE DE TOUTES LES CATÉGORIES ---
    const handlePurgeAll = async () => {
        if (categories.length === 0) {
            alert("Aucune catégorie à supprimer.");
            return;
        }
        if (window.confirm(`⚠️ ATTENTION : Voulez-vous supprimer DÉFINITIVEMENT les ${categories.length} catégories existantes ?\nCette action est irréversible.`)) {
            setLoading(true);
            try {
                await AdminService.purgeCategories();
                await loadData();
                alert("Toutes les catégories ont été supprimées avec succès !");
            } catch (e) {
                console.error("Erreur purge globale :", e);
                // Fallback si le endpoint global n'est pas encore actif
                try {
                    for (const cat of categories) {
                        await AdminService.deleteCategory(cat.id);
                    }
                    await loadData();
                    alert("Toutes les catégories ont été supprimées !");
                } catch (err2) {
                    alert("Erreur lors de la suppression des catégories : " + (err2.response?.data?.message || err2.message));
                }
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#0b0e14]' : 'bg-white'}`}>
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <AdminLayout 
            theme={theme} 
            toggleTheme={toggleTheme}
            filters={
                <AdminFilter 
                    context="categories" 
                    theme={theme}
                    categories={["Tous"]} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onReset={() => setFilters({searchTerm: "", dispo: "Tous"})}
                />
            }
        >
            <div className="w-full flex flex-col gap-8 p-2 h-full">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                    <div>
                        <h2 className={`text-4xl sm:text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Rayons & Catégories<span className="text-indigo-500">.</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                            Organisation des produits d'élevage (Boxicons & Emojis)
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        {/* TOGGLE VUE GRILLE / LISTE */}
                        <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-[#161926]' : 'bg-slate-100'}`}>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-xl transition-all ${viewType === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-xl transition-all ${viewType === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><List size={20}/></button>
                        </div>

                        {/* BOUTON PURGE (VIDER TOUT) */}
                        {categories.length > 0 && (
                            <button 
                                onClick={handlePurgeAll}
                                title="Supprimer toutes les catégories de la liste"
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 px-5 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                <span>Vider les catégories ({categories.length})</span>
                            </button>
                        )}

                        {/* BOUTON CRÉER NOUVEAU */}
                        <button 
                            onClick={() => { setSelectedCategory(null); setShowForm(true); }} 
                            className="bg-[#10b981] hover:bg-[#059669] text-[#0b0e14] px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl text-xs uppercase tracking-widest whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus size={16} />
                            <span>NOUVEAU RAYON</span>
                        </button>
                    </div>
                </header>

                {/* --- STATS DYNAMIQUES --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 w-full">
                    <StatCard theme={theme} title="TOTAL" value={categories.length} sub="Rayons existants" icon={<Layers size={20}/>} color="#818cf8"/>
                    <StatCard theme={theme} title="EN LIGNE" value={categories.filter(c => c.isActive !== false && c.is_active !== false).length} sub="Actifs sur boutique" icon={<Sparkles size={20}/>} color="#10b981"/>
                    <StatCard theme={theme} title="AVEC EMOJI" value={categories.filter(c => c.iconUrl && !c.iconUrl.startsWith('bx') && !c.iconUrl.startsWith('http')).length} sub="Format visuel" icon={<Smile size={20}/>} color="#fbbf24"/>
                    <StatCard theme={theme} title="AVEC BOXICON" value={categories.filter(c => c.iconUrl && c.iconUrl.startsWith('bx')).length} sub="Icônes vectorielles" icon={<Box size={20}/>} color="#f43f5e"/>
                </div>

                {/* --- AFFICHAGE DES DONNÉES --- */}
                <div className="w-full">
                    {categories.length === 0 ? (
                        <div className={`p-16 rounded-[2.5rem] border text-center flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-4xl">
                                🐔
                            </div>
                            <h3 className={`text-2xl font-black italic ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Aucun rayon configuré
                            </h3>
                            <p className="text-xs text-slate-400 max-w-md font-medium">
                                Les anciens rayons ont été retirés. Vous pouvez créer maintenant vos nouveaux rayons pour l'élevage (Volailles, Oeufs, Poussins, Aliments...).
                            </p>
                            <button
                                onClick={() => { setSelectedCategory(null); setShowForm(true); }}
                                className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                            >
                                <Plus size={16} />
                                <span>Créer un premier rayon</span>
                            </button>
                        </div>
                    ) : viewType === 'grid' ? (
                        /* --- MODE GRILLE --- */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 w-full pb-20">
                            <AnimatePresence mode='popLayout'>
                                {filteredList.map(c => {
                                    const isOnline = c.isActive !== false && c.is_active !== false;
                                    return (
                                        <motion.div 
                                            layout 
                                            initial={{ opacity: 0, scale: 0.9 }} 
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            key={c.id} 
                                            className={`group p-8 rounded-[2.5rem] border transition-all relative flex flex-col items-center text-center ${
                                                isDark ? 'bg-[#161926] border-white/5 shadow-lg hover:border-white/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                                            }`}
                                        >
                                            {/* Actions flottantes */}
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-10">
                                                <button 
                                                    onClick={() => { setSelectedCategory(c); setShowForm(true); }} 
                                                    title="Modifier"
                                                    className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition-all hover:scale-110"
                                                >
                                                    <Edit2 size={14}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(c.id, c.name)} 
                                                    title="Supprimer définitivement"
                                                    className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                                                >
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>

                                            {/* Visuel icône / emoji */}
                                            <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center mb-6 shrink-0 transition-transform group-hover:scale-110 shadow-inner ${
                                                isDark ? 'bg-black/30 border border-white/5' : 'bg-slate-50 border border-slate-100'
                                            }`}>
                                                {renderCategoryVisual(c.iconUrl, c.name)}
                                            </div>

                                            <h4 className={`text-xl font-black italic tracking-tighter line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {c.name}
                                            </h4>
                                            <p className="text-[10px] font-mono mt-1 opacity-40 uppercase tracking-widest">
                                                /{c.slug}
                                            </p>
                                            
                                            <div className={`mt-6 pt-6 border-t w-full flex justify-center ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                                    isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-red-400'}`} />
                                                    {isOnline ? 'EN LIGNE' : 'DÉSACTIVÉ'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* --- MODE TABLEAU --- */
                        <div className={`w-full rounded-[2.5rem] border overflow-hidden mb-20 ${isDark ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-slate-500'}`}>
                                        <tr>
                                            <th className="p-8">Icône</th>
                                            <th className="p-8">Nom du Rayon</th>
                                            <th className="p-8">Slug URL</th>
                                            <th className="p-8 text-center">Statut</th>
                                            <th className="p-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                        {filteredList.map((c) => {
                                            const isOnline = c.isActive !== false && c.is_active !== false;
                                            return (
                                                <tr key={c.id} className="hover:bg-indigo-600/5 transition-all group">
                                                    <td className="p-8">
                                                        <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                                                            {renderCategoryVisual(c.iconUrl, c.name)}
                                                        </div>
                                                    </td>
                                                    <td className={`p-8 font-black text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                        {c.name}
                                                    </td>
                                                    <td className="p-8 font-mono text-xs opacity-50">
                                                        /{c.slug}
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        <div className={`mx-auto w-fit px-3 py-1.5 rounded-full flex items-center gap-2 ${
                                                            isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-red-400'}`} />
                                                            <span className="text-[9px] font-black uppercase">
                                                                {isOnline ? 'ONLINE' : 'OFF'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-right space-x-2">
                                                        <button 
                                                            onClick={() => { setSelectedCategory(c); setShowForm(true); }} 
                                                            className="p-3 rounded-xl border border-white/10 text-indigo-400 hover:border-indigo-400 transition-all hover:scale-105"
                                                        >
                                                            <Edit2 size={16}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(c.id, c.name)} 
                                                            className="p-3 rounded-xl border border-white/10 text-red-400 hover:border-red-400 transition-all hover:scale-105"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALE DU FORMULAIRE */}
            {showForm && (
                <CategoryForm 
                    category={selectedCategory} 
                    onClose={() => setShowForm(false)} 
                    onSave={() => { loadData(); setShowForm(false); }} 
                    theme={theme} 
                />
            )}
        </AdminLayout>
    );
};

// --- COMPOSANT STATCARD UNIFIÉ ---
const StatCard = ({ title, value, sub, icon, color, theme }) => (
    <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between transition-all shadow-lg ${
        theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/20' : 'bg-white border-slate-100'
    }`}>
        <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-black uppercase opacity-40 tracking-widest mb-1 truncate">{title}</p>
                <div className={`text-base sm:text-2xl md:text-3xl font-black italic tracking-tight truncate leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{value}</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/5 shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5" style={{color}}>{icon}</div>
        </div>
        <p className="text-[9px] sm:text-[10px] font-bold opacity-40 mt-3 sm:mt-5 flex items-center uppercase truncate">
            <ChevronRight size={12} className="mr-0.5 text-indigo-500 shrink-0" /> {sub}
        </p>
    </div>
);

export default Categories;