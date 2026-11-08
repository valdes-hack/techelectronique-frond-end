import React from 'react';
import { Search, ListFilter, X, Calendar, Settings2, BarChart, Globe, UserCheck, ShieldCheck, Truck } from 'lucide-react';

const AdminFilter = ({ theme, onClose, categories, filters, setFilters, onReset, context = "products" }) => {
    
    // --- LOGIQUE DYNAMIQUE PAR CONTEXTE ---
    const config = {
        products: {
            title: "Filtres Produits",
            placeholder: "Nom, SKU, marque...",
            catLabel: "CATÉGORIE",
            priceLabel: "FOURCHETTE DE PRIX",
            statusLabel: "DISPONIBILITÉ",
            statusTabs: ["Tous", "En stock", "Épuisé"]
        },
        orders: {
            title: "Filtres Commandes",
            placeholder: "N° commande, client...",
            catLabel: "STATUT COMMANDE",
            priceLabel: "MONTANT (CFA)",
            statusLabel: "FLUX LOGISTIQUE",
            statusTabs: ["Tous", "Payé", "Expédié", "Livré"]
        },
        users: {
            title: "Filtres Membres",
            placeholder: "Nom, email, téléphone...",
            catLabel: "RÔLE SYSTÈME",
            priceLabel: "POINTS FIDÉLITÉ",
            statusLabel: "VÉRIFICATION",
            statusTabs: ["Tous", "Vérifiés", "Bannis"]
        },
        categories: {
            title: "Filtres Rayons",
            placeholder: "Nom du rayon, slug...",
            catLabel: "TYPE DE RAYON",
            priceLabel: "ORDRE D'AFFICHAGE",
            statusLabel: "VISIBILITÉ",
            statusTabs: ["Tous", "En ligne", "Hors ligne"]
        },
        suppliers: {
            title: "Filtres Partenaires",
            placeholder: "Nom, contact, email...",
            catLabel: "VILLE / SIÈGE",
            priceLabel: "CAPACITÉ / RATING",
            statusLabel: "ÉTAT DU CONTRAT",
            statusTabs: ["Tous", "Actifs", "Inactifs"]
        }
    };

    const current = config[context] || config.products;
    const isDark = theme === 'dark';

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* --- HEADER AVEC BOUTON FERMER --- */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-600/20 rounded-xl text-indigo-500">
                        <ListFilter size={20} />
                    </div>
                    <h3 className={`text-xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {current.title}
                    </h3>
                </div>
                {/* Bouton de fermeture (Visible sur mobile et pratique sur desktop) */}
                <button 
                    onClick={onClose} 
                    className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-slate-200 text-slate-400'}`}
                >
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. RECHERCHE TEXTUELLE */}
                <FilterGroup label="RECHERCHER">
                    <div className="relative group">
                        <Search className={`absolute left-4 top-4 transition-colors ${isDark ? 'opacity-20 group-focus-within:text-indigo-500' : 'text-slate-400'}`} size={16}/>
                        <input 
                            value={filters.searchTerm} 
                            onChange={e => setFilters({...filters, searchTerm: e.target.value})}
                            className={`w-full p-4 pl-12 rounded-2xl text-xs font-bold outline-none border transition-all ${
                                isDark ? 'bg-black/40 border-white/5 text-white focus:border-indigo-500' : 'bg-slate-100 border-transparent text-slate-900 focus:bg-white focus:border-indigo-400'
                            }`} 
                            placeholder={current.placeholder} 
                        />
                    </div>
                </FilterGroup>

                {/* 2. SÉLECTEUR DE CATÉGORIE / VILLE / RÔLE */}
                <FilterGroup label={current.catLabel}>
                    <div className="relative">
                        <select 
                            value={filters.selCat} 
                            onChange={e => setFilters({...filters, selCat: e.target.value})}
                            className={`w-full p-4 rounded-2xl text-xs font-black outline-none border appearance-none cursor-pointer transition-all ${
                                isDark ? 'bg-black/40 border-white/5 text-white focus:border-indigo-500' : 'bg-slate-100 border-transparent text-slate-900 focus:border-indigo-400'
                            }`}
                        >
                            {categories.map(c => <option key={c} value={c} className={isDark ? "bg-[#1a1e2e]" : ""}>{c}</option>)}
                        </select>
                        <Settings2 size={16} className="absolute right-4 top-4 opacity-30 pointer-events-none text-indigo-500" />
                    </div>
                </FilterGroup>

                {/* 3. TRANCHE NUMÉRIQUE (PRIX / POINTS) */}
                <FilterGroup label={current.priceLabel}>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            placeholder="Minimum" 
                            value={filters.minPrice} 
                            onChange={e => setFilters({...filters, minPrice: e.target.value})}
                            className={`w-full p-4 rounded-2xl text-xs font-bold outline-none border ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-100 border-transparent'}`} 
                        />
                        <input 
                            placeholder="Maximum" 
                            value={filters.maxPrice} 
                            onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                            className={`w-full p-4 rounded-2xl text-xs font-bold outline-none border ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-100 border-transparent'}`} 
                        />
                    </div>
                </FilterGroup>

                {/* 4. ONGLETS DE STATUT (DISPO / ÉTAT) */}
                <FilterGroup label={current.statusLabel}>
                    <div className={`p-1.5 flex rounded-2xl ${isDark ? 'bg-black/40 border border-white/5' : 'bg-gray-200'}`}>
                        {current.statusTabs.map(btn => (
                            <button 
                                key={btn} 
                                type="button" 
                                onClick={() => setFilters({...filters, dispo: btn})}
                                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${
                                    filters.dispo === btn 
                                    ? 'bg-[#6366f1] text-white shadow-xl shadow-indigo-500/40 translate-y-[-1px]' 
                                    : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                                }`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                </FilterGroup>

                {/* 5. SÉLECTEUR DE DATE */}
                <FilterGroup label="PÉRIODE">
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-4 opacity-30 text-indigo-500" size={16} />
                        <input 
                            type="date" 
                            className={`w-full p-4 pl-12 rounded-2xl text-xs font-bold border outline-none transition-all ${
                                isDark ? 'bg-black/40 border-white/5 text-gray-400' : 'bg-slate-100 border-transparent'
                            }`} 
                        />
                    </div>
                </FilterGroup>
            </div>

            {/* --- FOOTER : RESET --- */}
            <div className="pt-8 mt-auto">
                <button 
                    onClick={onReset} 
                    className={`w-full py-5 text-[11px] font-black uppercase border rounded-[1.5rem] transition-all active:scale-95 flex items-center justify-center space-x-3 shadow-lg ${
                        isDark 
                        ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white shadow-indigo-500/10' 
                        : 'bg-slate-800 text-white shadow-slate-300 hover:bg-slate-900'
                    }`}
                >
                    <BarChart size={16} className="rotate-90" />
                    <span>Réinitialiser les filtres</span>
                </button>
            </div>
        </div>
    );
};

// --- COMPOSANT INTERNE : GROUPE DE FILTRE ---
const FilterGroup = ({ label, children }) => (
    <div className="space-y-4 group">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.25em] block italic group-hover:text-indigo-500 transition-colors">
            {label}
        </label>
        {children}
    </div>
);

export default AdminFilter;