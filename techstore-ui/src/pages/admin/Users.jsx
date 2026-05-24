import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFilter from '../../components/admin/AdminFilter';
import AdminService from '../../services/admin.service';
import UserForm from './UserForm'; 
import { 
    ShieldAlert, UserCheck, Mail, Award, Edit2, 
    UserMinus, UserPlus, RefreshCw, ChevronRight, Search 
} from 'lucide-react';

const AdminUsers = () => {
    // 1. ÉTATS DES DONNÉES
    const [users, setUsers] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. ÉTAT DU THÈME (Persistance)
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('admin_hub_theme');
        return savedTheme ? savedTheme : 'light';
    });

    // 3. ÉTATS DU FORMULAIRE ET FILTRES
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({ 
        searchTerm: "", 
        selCat: "Tous", // Utilisé pour le Rôle
        dispo: "Tous"   // Utilisé pour l'état (Vérifié/Bloqué)
    });

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getUsers();
            if (res && res.status === 'success') {
                setUsers(res.data || []);
            }
        } catch (e) { 
            console.error("Erreur chargement membres :", e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadUsers(); }, []);

    useEffect(() => {
        localStorage.setItem('admin_hub_theme', theme);
    }, [theme]);

    // ⚡ FILTRAGE INSTANTANÉ (C'EST ICI QUE J'AI CORRIGÉ LA RECHERCHE ✨)
    useEffect(() => {
        const filtered = users.filter(u => {
            // Sécurité : on s'assure que les données existent avant de mettre en minuscule
            const search = (filters.searchTerm || "").toLowerCase();
            const fName = (u.firstName || "").toLowerCase();
            const lName = (u.lastName || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const fullName = `${fName} ${lName}`;

            // Logique de recherche (Prénom, Nom, Email ou Nom Complet)
            const matchesSearch = fName.includes(search) || 
                                 lName.includes(search) || 
                                 email.includes(search) || 
                                 fullName.includes(search);
            
            // Filtrage par Rôle
            const matchesRole = filters.selCat === "Tous" || u.role === filters.selCat;
            
            // Filtrage par Statut
            const matchesStatus = filters.dispo === "Tous" || 
                (filters.dispo === "Vérifiés" ? u.verified : !u.verified);

            return matchesSearch && matchesRole && matchesStatus;
        });
        setFilteredList(filtered);
    }, [users, filters]);

    // --- FONCTION ACTIVER / DÉSACTIVER ---
    const handleToggleStatus = async (userId) => {
        if(window.confirm("Bébé, changer l'accès de ce membre ? 🔐")) {
            try {
                await AdminService.toggleUserStatus(userId);
                loadUsers(); 
            } catch (err) {
                alert("Erreur lors de la modification de l'accès.");
            }
        }
    };

    const handleSaveUser = async (updatedData) => {
        try {
            const res = await AdminService.updateUser(selectedUser.id, updatedData);
            if (res.status === 'success') {
                alert("Modifications enregistrées ! 👑");
                setShowForm(false);
                loadUsers();
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur de mise à jour.";
            alert(`Erreur : ${msg}`);
        }
    };

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0e14]' : 'bg-white'}`}>
            <RefreshCw className="animate-spin text-indigo-500 mr-3" />
            <span className="font-bold opacity-30 italic">CONTRÔLE DE L'ÉQUIPE...</span>
        </div>
    );

    const rolesList = ["Tous", "ADMIN", "CLIENT", "SAV_AGENT"];

    return (
        <AdminLayout 
            theme={theme} 
            toggleTheme={toggleTheme}
            filters={
                <AdminFilter 
                    context="users" 
                    theme={theme} 
                    categories={rolesList} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onReset={() => setFilters({searchTerm: "", selCat: "Tous", dispo: "Tous"})}
                />
            }
        >
            <div className="space-y-10">
                <header className="flex justify-between items-center">
                    <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-[#1e293b]'}`}>
                        Membres Hub<span className="text-indigo-500">.</span>
                    </h2>
                </header>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard theme={theme} title="DIRECTION" value={users.filter(u=>u.role==='ADMIN').length} sub="Administrateurs" icon={<ShieldAlert/>} color="#818cf8"/>
                    <StatCard theme={theme} title="RECRUES" value={users.filter(u=>u.role==='CLIENT').length} sub="Total Clients" icon={<UserCheck/>} color="#10b981"/>
                    <StatCard theme={theme} title="SANS VERIF" value={users.filter(u=>!u.verified).length} sub="À valider" icon={<Mail/>} color="#f43f5e"/>
                    <StatCard theme={theme} title="RECOMPENSES" value={users.reduce((acc, u) => acc + (u.loyaltyPoints || 0), 0)} sub="Points Fidelité" icon={<Award/>} color="#fbbf24" />
                </div>

                <div className={`rounded-3xl border overflow-hidden shadow-2xl ${
                    theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-gray-100 shadow-slate-200'
                }`}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className={`${theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-slate-400'} text-[11px] font-black uppercase tracking-widest`}>
                                <tr className="border-b border-inherit">
                                    <th className="p-6 text-center">ID</th>
                                    <th className="p-6">PROFIL ET INSCRIPTION</th>
                                    <th className="p-6 text-center">ROLE</th>
                                    <th className="p-6 text-center">POINTS</th>
                                    <th className="p-6 text-center">STATUT</th>
                                    <th className="p-6 text-center">ACTES</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {filteredList.map((u, idx) => (
                                    <tr key={u.id} className="hover:bg-[#6366f1]/5 transition-all group">
                                        <td className="p-6 text-center font-mono text-xs opacity-40"># {u.id}</td>
                                        <td className="p-6 flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-500/20">
                                                {u.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`font-black text-base ${theme==='dark'?'text-white':'text-slate-800'}`}>{u.firstName} {u.lastName}</p>
                                                <p className="text-[10px] opacity-40 italic">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center font-mono font-black text-indigo-500">
                                            {u.loyaltyPoints || 0}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${u.verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${u.verified ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-black uppercase">{u.verified ? 'Actif' : 'Bloqué'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center space-x-2">
                                            <button 
                                                onClick={() => { setSelectedUser(u); setShowForm(true); }}
                                                className={`p-2.5 rounded-xl border border-white/5 text-indigo-400 hover:border-indigo-400 transition-all shadow-sm ${theme === 'light' ? 'bg-gray-50 border-gray-200' : ''}`}
                                            >
                                                <Edit2 size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(u.id)}
                                                className={`p-2.5 rounded-xl border border-white/5 transition-all shadow-sm ${u.verified ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'} ${theme === 'light' ? 'bg-gray-50 border-gray-200' : ''}`}
                                            >
                                                {u.verified ? <UserMinus size={16}/> : <UserPlus size={16}/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <UserForm 
                    user={selectedUser} 
                    onClose={() => setShowForm(false)} 
                    onSave={handleSaveUser}
                    theme={theme}
                />
            )}
        </AdminLayout>
    );
};

// COMPOSANT STATCARD INTÉGRÉ
const StatCard = ({ title, value, sub, icon, color, unit="", theme }) => (
    <div className={`p-6 rounded-[2.2rem] border transition-all shadow-xl flex flex-col justify-between ${
        theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-gray-100 shadow-sm'
    }`}>
        <div className="flex justify-between items-start w-full">
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mb-1.5 truncate">{title}</p>
                <div className={`text-2xl md:text-3xl font-black tracking-tighter truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {value}<span className="text-sm ml-1 opacity-20">{unit}</span>
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

export default AdminUsers;