import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFilter from '../../components/admin/AdminFilter';
import AdminService from '../../services/admin.service';
import SupplierForm from './SupplierForm'; 
import { 
    Truck, Building2, Globe, Mail, Phone, MapPin,
    Edit2, Trash2, Search, RefreshCw, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // --- ÉTAT DES FILTRES ---
    const [filters, setFilters] = useState({
        searchTerm: "", 
        selCat: "Toutes Villes", // selCat servira pour la ville ici
        dispo: "Tous" // Tous, Actifs, Inactifs
    });

    const { theme, toggleTheme } = useTheme();

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getSuppliers();
            if (res.status === 'success') {
                setSuppliers(res.data || []);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    // --- LOGIQUE DE FILTRAGE AVANCÉE ---
    useEffect(() => {
        const filtered = suppliers.filter(s => {
            const nameMatch = (s.name || "").toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
                             (s.contactName || "").toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            const cityMatch = filters.selCat === "Toutes Villes" || s.city === filters.selCat;
            
            const statusMatch = filters.dispo === "Tous" || 
                               (filters.dispo === "Actifs" ? s.active : !s.active);
            
            return nameMatch && cityMatch && statusMatch;
        });
        setFilteredList(filtered);
    }, [suppliers, filters]);

    // Extraire la liste des villes pour le filtre
    const citiesList = ["Toutes Villes", ...new Set(suppliers.map(s => s.city).filter(c => c))];

    const handleDelete = async (id) => {
        if(window.confirm("Bébé, supprimer ce partenaire ? 🚚")) {
            try { await AdminService.deleteSupplier(id); loadData(); } catch (e) { console.error(e); }
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
                    theme={theme} 
                    context="suppliers" 
                    categories={citiesList} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onReset={() => setFilters({searchTerm: "", selCat: "Toutes Villes", dispo: "Tous"})}
                />
            }
        >
            <div className="w-full flex flex-col gap-8 p-2 h-full">
                
                <header className="flex justify-between items-center">
                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        Partenaires<span className="text-indigo-500">.</span>
                    </h2>
                    <button 
                        onClick={() => { setSelectedSupplier(null); setShowForm(true); }} 
                        className="bg-[#10b981] text-[#0b0e14] px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs uppercase"
                    >
                        + Ajouter
                    </button>
                </header>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard theme={theme} title="TOTAL" value={suppliers.length} sub="Répertoire" icon={<Building2 size={20}/>} color="#818cf8"/>
                    <StatCard theme={theme} title="ACTIFS" value={suppliers.filter(s=>s.active).length} sub="Opérationnels" icon={<CheckCircle2 size={20}/>} color="#10b981"/>
                    <StatCard theme={theme} title="CAMEROUN" value={suppliers.filter(s => s.country?.toLowerCase() === 'cameroun').length} sub="Locaux" icon={<MapPin size={20}/>} color="#fbbf24"/>
                    <StatCard theme={theme} title="ARCHIVE" value={suppliers.filter(s=>!s.active).length} sub="Suspendus" icon={<XCircle size={20}/>} color="#f43f5e"/>
                </div>

                {/* TABLEAU */}
                <div className={`w-full max-w-full rounded-[2.5rem] border flex flex-col ${theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[1000px] border-collapse">
                            <thead className={`sticky top-0 z-20 ${theme === 'dark' ? 'bg-[#1a1e2e]' : 'bg-gray-50'} text-[11px] font-black uppercase tracking-widest text-slate-500`}>
                                <tr>
                                    <th className="p-6">PARTENAIRE</th>
                                    <th className="p-6">COORDONNÉES</th>
                                    <th className="p-6">LOCALISATION</th>
                                    <th className="p-6 text-center">STATUT</th>
                                    <th className="p-6 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {filteredList.map((s) => (
                                    <tr key={s.id} className="hover:bg-indigo-600/5 transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-black/40 text-indigo-400' : 'bg-slate-100 text-indigo-600'}`}>
                                                    <Truck size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{s.name}</span>
                                                    <span className="text-[10px] opacity-30 font-mono tracking-tighter">REF: SUP-{s.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex items-center gap-2 text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                                                    <Mail size={12} className="text-indigo-500" /> {s.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-medium opacity-50">
                                                    <Phone size={12} /> {s.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Globe size={16} className="text-amber-500" />
                                                <span className={`font-bold text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                                                    {s.city || 'Inconnue'}, {s.country || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`mx-auto w-fit px-4 py-1.5 rounded-full flex items-center gap-2 ${s.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-black uppercase">{s.active ? 'ACTIF' : 'OFF'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => { setSelectedSupplier(s); setShowForm(true); }} className="p-2.5 rounded-xl border border-white/5 text-indigo-400 hover:border-indigo-400 transition-all"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDelete(s.id)} className="p-2.5 rounded-xl border border-white/5 text-red-400 hover:border-red-400 transition-all"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <SupplierForm 
                    supplier={selectedSupplier} 
                    onClose={() => setShowForm(false)} 
                    onSave={() => { loadData(); setShowForm(false); }} 
                    theme={theme}
                />
            )}
        </AdminLayout>
    );
};

const StatCard = ({ title, value, sub, icon, color, theme }) => (
    <div className={`p-6 rounded-[2.2rem] border transition-all shadow-xl flex flex-col justify-between ${
        theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-white shadow-slate-200'
    }`}>
        <div className="flex justify-between items-start w-full">
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-1.5 truncate">{title}</p>
                <div className={`text-2xl md:text-3xl font-black tracking-tighter truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {value}
                </div>
            </div>
            <div className="flex-shrink-0 p-4 rounded-2xl bg-white/5 ml-4 flex items-center justify-center shadow-inner" style={{color}}>
                {icon}
            </div>
        </div>
        <p className="text-[10px] font-bold opacity-30 mt-4 flex items-center uppercase tracking-tight">
            <ChevronRight size={14} className="mr-1 text-indigo-500 flex-shrink-0" /> {sub}
        </p>
    </div>
);

export default Suppliers;