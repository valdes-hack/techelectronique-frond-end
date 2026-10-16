import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AdminService from '../../services/admin.service';
import IconEmojiPicker from '../../components/admin/IconEmojiPicker';

const CategoryForm = ({ category, onClose, onSave, theme }) => {
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [iconUrl, setIconUrl] = useState(category?.iconUrl || '🐔');
    const [loading, setLoading] = useState(false);

    // Génération automatique du slug à partir du nom si le slug n'a pas été personnalisé
    const handleNameChange = (val) => {
        setName(val);
        if (!category) {
            const autoSlug = val
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
                .replace(/[^a-z0-9]+/g, "-")      // Remplace les caractères spéciaux par des tirets
                .replace(/^-+|-+$/g, "");
            setSlug(autoSlug);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const categoryData = {
                name: name.trim(),
                slug: slug.trim(),
                iconUrl: iconUrl || '🐔',
                parentId: null // Pas de catégorie parente, toutes les catégories sont directes
            };

            let res;
            if (category) {
                res = await AdminService.updateCategory(category.id, categoryData);
            } else {
                res = await AdminService.createCategory(categoryData);
            }

            if (res.status === 'success' || res.code === 200 || res.code === 201) {
                onSave(); 
            }
        } catch (err) {
            console.error("Erreur API :", err.response?.data);
            alert("Erreur : " + (err.response?.data?.message || "Vérifiez les champs"));
        } finally {
            setLoading(false);
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className={`w-full max-w-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 my-8 ${isDark ? 'bg-[#111421] text-white border border-white/10' : 'bg-white text-slate-800'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-white/10">
                    <div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-indigo-400">
                            {category ? 'Modifier le Rayon' : 'Nouveau Rayon'}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Gestion des rayons et catégories de l'élevage
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className={`p-2.5 rounded-2xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    
                    {/* Nom du rayon */}
                    <Input 
                        label="NOM DU RAYON (EX: VOLAILLES FERMIÈRES, OEUFS, INTRANTS...)" 
                        value={name} 
                        onChange={e => handleNameChange(e.target.value)} 
                        placeholder="Ex: Poussins d'un jour, Porcs charcutiers..."
                        required 
                        theme={theme} 
                    />

                    {/* Slug */}
                    <Input 
                        label="URL SLUG (IDENTIFIANT UNIQUE DANS L'URL)" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value)} 
                        placeholder="Ex: poussins-un-jour"
                        required 
                        theme={theme} 
                    />

                    {/* Sélecteur d'icône / Emoji (Sans téléversement, avec onglets et collage libre) */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-2">
                            CHOISIR L'ICÔNE DU RAYON (BOXICON OU EMOJI)
                        </label>
                        <IconEmojiPicker 
                            value={iconUrl} 
                            onChange={setIconUrl} 
                            theme={theme} 
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={`w-1/3 py-4 rounded-2xl font-bold uppercase text-xs tracking-wider transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                            Annuler
                        </button>
                        <Button 
                            loading={loading} 
                            type="submit" 
                            className="w-2/3 py-4 text-base font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 rounded-2xl"
                        >
                            {category ? 'Enregistrer les modifications' : 'Créer le rayon'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;