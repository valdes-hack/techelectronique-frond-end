import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import CategoryForm from './CategoryForm'; 
import AdminFilter from '../../components/admin/AdminFilter';

// Import des icônes Lucide
import { 
    Layers, Plus, Edit2, Trash2, FolderTree, 
    LayoutGrid, List, Search, AlertCircle,
    Smartphone, Laptop, Monitor, Cpu, Watch, Gamepad2, Zap, 
    HardDrive, Speaker, Headphones, Camera, RefreshCw, ChevronRight 
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

    // --- ÉTAT DES FILTRES DYNAMIQUES ---
    const [filters, setFilters] = useState({
        searchTerm: "", 
        selCat: "Tous", // Gère Hiérarchie : Tous, Racine, Sous-rayon
        dispo: "Tous"   // Gère Visibilité : Tous, Online, Offline
    });

    // Options pour le sélecteur de hiérarchie dans le filtre
    const hierarchyOptions = ["Tous", "Racine", "Sous-rayon"];

    // --- LOGIQUE D'ICÔNES PAR DÉFAUT ---
    const getIconBySlug = (slug) => {
        const s = slug?.toLowerCase() || "";
        if (s.includes('phone')) return <Smartphone size={28}/>;
        if (s.includes('lap')) return <Laptop size={28}/>;
        if (s.includes('monit')) return <Monitor size={28}/>;
        if (s.includes('cpu')) return <Cpu size={28}/>;
        if (s.includes('watch')) return <Watch size={28}/>;
        if (s.includes('game')) return <Gamepad2 size={28}/>;
        if (s.includes('electro')) return <Zap size={28}/>;
        return <Layers size={28}/>;
    };

    // --- CHARGEMENT DES DONNÉES DEPUIS L'API ---
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllAdminCategories();
            if (res.status === 'success') {
                setCategories(res.data || []);
            }
        } catch (e) { 
            console.error("Erreur lors du chargement des rayons:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- 🏆 LOGIQUE DE FILTRAGE HYPER-DYNAMIQUE ---
    useEffect(() => {
        const filtered = categories.filter(c => {
            // 1. Filtre par texte (Nom ou Slug)
            const search = filters.searchTerm.toLowerCase();
            const matchesText = c.name.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search);

            // 2. Filtre par Hiérarchie (Racine vs Sous-rayon)
            const isRoot = !c.parentId;
            const matchesHierarchy = filters.selCat === "Tous" || 
                (filters.selCat === "Racine" ? isRoot : !isRoot);

            // 3. Filtre par Visibilité (is_active)
            const matchesStatus = filters.dispo === "Tous" || 
                (filters.dispo === "Online" ? c.is_active : !c.is_active);

            return matchesText && matchesHierarchy && matchesStatus;
        });
        setFilteredList(filtered);
    }, [categories, filters]);

    const handleDelete = async (id) => {
        if(window.confirm("Bébé, confirmer la suppression de ce rayon ? 🥺")) {
            try { 
                await AdminService.deleteCategory(id); 
                loadData(); 
            } catch (e) { 
                console.error(e); 
            }
        }
    };

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0e14]' : 'bg-white'}`}>
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
                    categories={hierarchyOptions} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onReset={() => setFilters({searchTerm: "", selCat: "Tous", dispo: "Tous"})}
                />
            }
        >
            <div className="w-full flex flex-col gap-8 p-2 h-full">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                    <h2 className={`text-5xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        Rayons<span className="text-indigo-500">.</span>
                    </h2>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* TOGGLE VUE GRILLE / LISTE */}
                        <div className={`flex p-1 rounded-2xl ${theme === 'dark' ? 'bg-[#161926]' : 'bg-slate-100'}`}>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-xl transition-all ${viewType === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-xl transition-all ${viewType === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><List size={20}/></button>
                        </div>

                        <button 
                            onClick={() => { setSelectedCategory(null); setShowForm(true); }} 
                            className="bg-[#10b981] text-[#0b0e14] px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl text-xs uppercase tracking-widest whitespace-nowrap"
                        >
                            + NOUVEAU
                        </button>
                    </div>
                </header>

                {/* --- STATS DYNAMIQUES --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <StatCard theme={theme} title="TOTAL" value={categories.length} sub="Arborescence" icon={<Layers size={20}/>} color="#818cf8"/>
                    <StatCard theme={theme} title="ONLINE" value={categories.filter(c=>c.is_active).length} sub="En ligne" icon={<FolderTree size={20}/>} color="#10b981"/>
                    <StatCard theme={theme} title="SOUS-RAYONS" value={categories.filter(c=>c.parentId).length} sub="Déclinaisons" icon={<Plus size={20}/>} color="#fbbf24"/>
                    <StatCard theme={theme} title="ARCHIVE" value={categories.filter(c=>!c.is_active).length} sub="Désactivés" icon={<AlertCircle size={20}/>} color="#f43f5e"/>
                </div>

                {/* --- AFFICHAGE DES DONNÉES --- */}
                <div className="w-full">
                    {viewType === 'grid' ? (
                        /* --- MODE GRILLE --- */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 w-full pb-20">
                            <AnimatePresence mode='popLayout'>
                                {filteredList.map(c => (
                                    <motion.div 
                                        layout 
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        key={c.id} 
                                        className={`group p-8 rounded-[2.5rem] border transition-all relative flex flex-col items-center text-center ${
                                            theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-lg' : 'bg-white border-slate-100 shadow-sm'
                                        }`}
                                    >
                                        {/* Actions flottantes */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => { setSelectedCategory(c); setShowForm(true); }} className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600"><Edit2 size={14}/></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600"><Trash2 size={14}/></button>
                                        </div>

                                        {/* Visuel icône/image */}
                                        <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center mb-6 shrink-0 transition-transform group-hover:scale-110 ${
                                            theme === 'dark' ? 'bg-black/30 text-indigo-400' : 'bg-slate-50 text-indigo-600'
                                        }`}>
                                            {c.iconUrl ? (
                                                <img 
                                                    src={c.iconUrl.startsWith('http') ? c.iconUrl : `${import.meta.env.VITE_API_URL}/uploads/categories/${c.iconUrl}`} 
                                                    className="w-full h-full object-cover p-2 rounded-[2.2rem]" 
                                                    alt={c.name}
                                                />
                                            ) : getIconBySlug(c.slug)}
                                        </div>

                                        <h4 className={`text-xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{c.name}</h4>
                                        <p className="text-[10px] font-mono mt-1 opacity-30 uppercase tracking-widest">/{c.slug}</p>
                                        
                                        <div className={`mt-6 pt-6 border-t w-full flex justify-center ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                !c.parentId ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {!c.parentId ? 'Principal' : 'Sous-rayon'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* --- MODE TABLEAU --- */
                        <div className={`w-full rounded-[2.5rem] border overflow-hidden mb-20 ${theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-slate-400'}`}>
                                        <tr>
                                            <th className="p-8">Image</th>
                                            <th className="p-8">Nom du Rayon</th>
                                            <th className="p-8">Slug</th>
                                            <th className="p-8 text-center">Type</th>
                                            <th className="p-8 text-center">Statut</th>
                                            <th className="p-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                                        {filteredList.map((c) => (
                                            <tr key={c.id} className="hover:bg-indigo-600/5 transition-all group">
                                                <td className="p-8">
                                                    <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                                                        {c.iconUrl ? <img src={c.iconUrl} className="w-full h-full object-cover" alt=""/> : getIconBySlug(c.slug)}
                                                    </div>
                                                </td>
                                                <td className={`p-8 font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{c.name}</td>
                                                <td className="p-8 font-mono text-xs opacity-40">/{c.slug}</td>
                                                <td className="p-8 text-center">
                                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${!c.parentId ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                                                        {!c.parentId ? 'Racine' : 'Sous-rayon'}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-center">
                                                    <div className={`mx-auto w-fit px-3 py-1.5 rounded-full flex items-center gap-2 ${c.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`} />
                                                        <span className="text-[9px] font-black uppercase">{c.is_active ? 'ONLINE' : 'OFF'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right space-x-2">
                                                    <button onClick={() => { setSelectedCategory(c); setShowForm(true); }} className="p-3 rounded-xl border border-white/5 text-indigo-400 hover:border-indigo-400 transition-all"><Edit2 size={16}/></button>
                                                    <button onClick={() => handleDelete(c.id)} className="p-3 rounded-xl border border-white/5 text-red-400 hover:border-red-400 transition-all"><Trash2 size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
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
                    categories={categories} 
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
    <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-between transition-all shadow-xl ${
        theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/20' : 'bg-white border-slate-100'
    }`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-2">{title}</p>
                <div className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{value}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5" style={{color}}>{icon}</div>
        </div>
        <p className="text-[10px] font-bold opacity-30 mt-6 flex items-center uppercase">
            <ChevronRight size={14} className="mr-1 text-indigo-500" /> {sub}
        </p>
    </div>
);

export default Categories;