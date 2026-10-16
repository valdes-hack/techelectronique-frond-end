import React, { useState } from 'react';
import { Sparkles, Smile, Box, Check, Copy } from 'lucide-react';

// --- LISTE DES BOXICONS (Icônes adaptées élevage / boutique / produits) ---
export const BOXICONS_LIST = [
    // Élevage, Volailles & Nature
    { name: "Oeuf / Couvoir", icon: "bx bx-egg", category: "Élevage" },
    { name: "Plume / Volaille", icon: "bx bx-feather", category: "Élevage" },
    { name: "Feuille / Pâturage", icon: "bx bx-leaf", category: "Élevage" },
    { name: "Goutte / Abreuvoir", icon: "bx bx-droplet", category: "Élevage" },
    { name: "Soleil / Couveuse", icon: "bx bx-sun", category: "Élevage" },
    { name: "Os / Aliment", icon: "bx bx-bone", category: "Élevage" },
    { name: "Santé / Soins", icon: "bx bx-heart", category: "Élevage" },
    { name: "Protection sanitaire", icon: "bx bx-shield-quarter", category: "Élevage" },
    { name: "Vétérinaire / Médical", icon: "bx bx-plus-medical", category: "Élevage" },

    // Produits & Alimentation
    { name: "Panier / Produits", icon: "bx bx-basket", category: "Produits" },
    { name: "Colis / Conditionnement", icon: "bx bx-package", category: "Produits" },
    { name: "Boîte / Alvéoles", icon: "bx bx-box", category: "Produits" },
    { name: "Restaurant / Viande", icon: "bx bx-restaurant", category: "Produits" },
    { name: "Nutrition / Menu", icon: "bx bx-food-menu", category: "Produits" },
    { name: "Bouteille / Vitamines", icon: "bx bx-cylinder", category: "Produits" },

    // Magasin, Vente & Commerce
    { name: "Boutique / Rayon", icon: "bx bx-store", category: "Commerce" },
    { name: "Boutique alt", icon: "bx bx-store-alt", category: "Commerce" },
    { name: "Sac de courses", icon: "bx bx-shopping-bag", category: "Commerce" },
    { name: "Caddie", icon: "bx bx-cart", category: "Commerce" },
    { name: "Caddie alt", icon: "bx bx-cart-alt", category: "Commerce" },
    { name: "Étiquette / Prix", icon: "bx bx-tag", category: "Commerce" },
    { name: "Promotions / Offres", icon: "bx bx-purchase-tag-alt", category: "Commerce" },
    { name: "Étoile / Vedette", icon: "bx bx-star", category: "Commerce" },
    { name: "Médaille / Qualité", icon: "bx bx-award", category: "Commerce" },
    { name: "Certifié", icon: "bx bx-badge-check", category: "Commerce" },
    { name: "Porte-monnaie", icon: "bx bx-wallet", category: "Commerce" },
    { name: "Pièce de monnaie", icon: "bx bx-coin", category: "Commerce" },

    // Matériel, Bâtiments & Transport
    { name: "Camion / Livraison", icon: "bx bx-truck", category: "Matériel" },
    { name: "Bâtiment / Ferme", icon: "bx bx-home-alt", category: "Matériel" },
    { name: "Hangar / Enclos", icon: "bx bx-buildings", category: "Matériel" },
    { name: "Clé / Maintenance", icon: "bx bx-wrench", category: "Matériel" },
    { name: "Outil / Réglage", icon: "bx bx-cog", category: "Matériel" },
    { name: "Grille / Grillage", icon: "bx bx-grid-alt", category: "Matériel" },
    { name: "Statistiques", icon: "bx bx-line-chart", category: "Matériel" },
    { name: "Énergie / Chauffage", icon: "bx bx-zap", category: "Matériel" },
    { name: "Rayon général", icon: "bx bx-layer", category: "Matériel" }
];

// --- LISTE DES EMOJIS (Volailles, Élevage, Produits frais, Outils) ---
export const EMOJIS_LIST = [
    // Volailles & Oeufs
    { emoji: "🐔", name: "Poule" },
    { emoji: "🐓", name: "Coq" },
    { emoji: "🐣", name: "Poussin éclos" },
    { emoji: "🐤", name: "Poussin" },
    { emoji: "🐥", name: "Poussin face" },
    { emoji: "🥚", name: "Oeuf frais" },
    { emoji: "🪺", name: "Nid d'oeufs" },
    { emoji: "🦃", name: "Dinde" },
    { emoji: "🦆", name: "Canard" },

    // Animaux d'élevage
    { emoji: "🐖", name: "Porc" },
    { emoji: "🐷", name: "Tête de cochon" },
    { emoji: "🐐", name: "Chèvre" },
    { emoji: "🐑", name: "Brebis" },
    { emoji: "🐏", name: "Bélier" },
    { emoji: "🐂", name: "Boeuf" },
    { emoji: "🐄", name: "Vache" },
    { emoji: "🐮", name: "Tête de vache" },
    { emoji: "🐇", name: "Lapin" },
    { emoji: "🐟", name: "Poisson" },

    // Viandes, Aliments & Produits
    { emoji: "🥩", name: "Viande fraîche" },
    { emoji: "🍗", name: "Cuisse de poulet" },
    { emoji: "🍖", name: "Viande sur os" },
    { emoji: "🥓", name: "Bacon" },
    { emoji: "🥛", name: "Lait frais" },
    { emoji: "🍯", name: "Miel pur" },
    { emoji: "🧀", name: "Fromage" },
    { emoji: "🌽", name: "Maïs (aliment)" },
    { emoji: "🌾", name: "Céréales / Blé" },
    { emoji: "🌿", name: "Herbe / Pâturage" },
    { emoji: "🥕", name: "Carotte" },
    { emoji: "🥬", name: "Légumes verts" },
    { emoji: "🫘", name: "Soja / Tourteau" },

    // Matériel, Ferme & Logistique
    { emoji: "🚜", name: "Tracteur" },
    { emoji: "🏡", name: "Ferme" },
    { emoji: "🛖", name: "Poulailler / Bâtiment" },
    { emoji: "📦", name: "Carton / Emballage" },
    { emoji: "🛒", name: "Chariot / Vente" },
    { emoji: "🏷️", name: "Étiquette prix" },
    { emoji: "🚚", name: "Livraison" },
    { emoji: "⚖️", name: "Pesée / Balance" },
    { emoji: "🌡️", name: "Thermomètre couveuse" },
    { emoji: "💉", name: "Vaccination / Soin" },
    { emoji: "🩺", name: "Suivi vétérinaire" },
    { emoji: "💧", name: "Eau / Abreuvement" },
    { emoji: "☀️", name: "Chaleur / Éclairage" },

    // Badges & Qualité
    { emoji: "⭐", name: "Vedette" },
    { emoji: "🏆", name: "Top Qualité" },
    { emoji: "🥇", name: "Premier choix" },
    { emoji: "💰", name: "Prix promo" },
    { emoji: "🟢", name: "Disponible" },
    { emoji: "✨", name: "Nouveauté" }
];

/**
 * Composant de sélection d'icône (Boxicon SVG ou Emoji) ou saisie libre
 */
const IconEmojiPicker = ({ value, onChange, theme = 'dark' }) => {
    const [tab, setTab] = useState('boxicons'); // 'boxicons' | 'emojis'
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');

    const isDark = theme === 'dark';

    // Catégories Boxicons disponibles
    const boxiconCategories = ['Tous', 'Élevage', 'Produits', 'Commerce', 'Matériel'];

    // Filtrage Boxicons
    const filteredBoxicons = BOXICONS_LIST.filter(item => {
        const matchesCategory = activeCategory === 'Tous' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.icon.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Filtrage Emojis
    const filteredEmojis = EMOJIS_LIST.filter(item => {
        return item.name.toLowerCase().includes(search.toLowerCase()) || item.emoji.includes(search);
    });

    // Helper pour afficher le preview
    const renderPreview = (val) => {
        if (!val) return <span className="text-3xl opacity-30">❓</span>;
        if (val.startsWith('bx')) {
            return <i className={`${val} text-4xl text-indigo-400`} />;
        }
        if (val.startsWith('http://') || val.startsWith('https://')) {
            return <img src={val} className="w-12 h-12 object-cover rounded-xl" alt="" />;
        }
        return <span className="text-4xl select-none">{val}</span>;
    };

    return (
        <div className={`space-y-4 rounded-3xl p-5 border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            
            {/* --- APERÇU DE L'ICÔNE ACTUELLE ET CHAMP DE SAISIE LIBRE --- */}
            <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${isDark ? 'bg-[#0b0e14] border border-white/10' : 'bg-slate-100'}`}>
                    {renderPreview(value)}
                </div>

                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                        Icône ou Emoji sélectionné
                    </label>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Ex: 🐔 ou bx bx-egg ou collez votre emoji..."
                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold border-none outline-none ${isDark ? 'bg-white/5 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-800'}`}
                    />
                    <p className="text-[9px] text-slate-400 mt-1">
                        Sélectionnez dans la liste ci-dessous ou collez n'importe quel emoji ou classe d'icône.
                    </p>
                </div>
            </div>

            {/* --- ONGLETS BOXICONS / EMOJIS --- */}
            <div className="flex items-center gap-2 border-b pb-3 border-white/10">
                <button
                    type="button"
                    onClick={() => { setTab('boxicons'); setSearch(''); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        tab === 'boxicons'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                >
                    <Box size={16} />
                    Boxicons / SVG ({BOXICONS_LIST.length})
                </button>

                <button
                    type="button"
                    onClick={() => { setTab('emojis'); setSearch(''); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        tab === 'emojis'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                >
                    <Smile size={16} />
                    Emojis Élevage ({EMOJIS_LIST.length})
                </button>
            </div>

            {/* --- RECHERCHE ET SOUS-CATÉGORIES --- */}
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={tab === 'boxicons' ? 'Rechercher une icône (ex: oeuf, panier, camion)...' : 'Rechercher un emoji (ex: poule, poussin, maïs)...'}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium border-none outline-none ${isDark ? 'bg-white/5 text-white placeholder-slate-500' : 'bg-white text-slate-800 border border-slate-200'}`}
                />

                {tab === 'boxicons' && (
                    <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {boxiconCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    activeCategory === cat
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                                        : isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- GRILLE DE SÉLECTION (HAUTEUR FIXÉE SCROLLABLE) --- */}
            <div className="max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {tab === 'boxicons' ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {filteredBoxicons.map((item, idx) => {
                            const isSelected = value === item.icon;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onChange(item.icon)}
                                    title={item.name}
                                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-400'
                                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    <i className={`${item.icon} text-2xl transition-transform group-hover:scale-125`} />
                                    <span className="text-[9px] font-bold line-clamp-1 leading-tight opacity-75">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {filteredEmojis.map((item, idx) => {
                            const isSelected = value === item.emoji;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onChange(item.emoji)}
                                    title={item.name}
                                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white shadow-lg scale-110 ring-2 ring-emerald-400'
                                            : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    <span className="text-3xl transition-transform group-hover:scale-125 select-none">
                                        {item.emoji}
                                    </span>
                                    <span className="text-[8px] font-semibold text-slate-400 line-clamp-1 text-center">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {((tab === 'boxicons' && filteredBoxicons.length === 0) || (tab === 'emojis' && filteredEmojis.length === 0)) && (
                    <div className="text-center py-8 text-xs text-slate-400">
                        Aucun résultat pour "{search}". Vous pouvez coller directement votre emoji ou code d'icône ci-dessus !
                    </div>
                )}
            </div>
        </div>
    );
};

export default IconEmojiPicker;
