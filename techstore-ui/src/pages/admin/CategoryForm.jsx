import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AdminService from '../../services/admin.service';

const CategoryForm = ({ category, categories, onClose, onSave, theme }) => {
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [parentId, setParentId] = useState(category?.parentId || '');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            
            // On prépare l'objet selon le schéma p. 58
            const categoryData = {
                name: name,
                slug: slug,
                parentId: parentId === "" ? null : parseInt(parentId)
            };

            // ✨ CLÉS SWAGGER (Page 3 et 7) : "category" et "file" ✨
            formData.append('category', new Blob([JSON.stringify(categoryData)], {
                type: 'application/json'
            }));

            if (file) {
                formData.append('file', file);
            }

            let res;
            if (category) {
                res = await AdminService.updateCategory(category.id, formData);
            } else {
                res = await AdminService.createCategory(formData);
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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className={`w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#111421] text-white border border-white/5' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Configuration Rayon</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <Input label="NOM DU RAYON" value={name} onChange={e=>setName(e.target.value)} required theme={theme} />
                    <Input label="URL SLUG" value={slug} onChange={e=>setSlug(e.target.value)} required theme={theme} />
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase ml-4 opacity-40 italic text-indigo-500">Rayon Parent (Optionnel)</label>
                        <select value={parentId} onChange={e=>setParentId(e.target.value)} className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <option value="">-- Aucun (Rayon Principal) --</option>
                            {categories.filter(c => c.id !== category?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <label className={`flex flex-col items-center p-6 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:border-indigo-500/50 transition-all ${file ? 'border-indigo-500 bg-indigo-500/5' : ''}`}>
                        <Upload className={`opacity-20 mb-2 ${file ? 'text-indigo-500 opacity-100' : ''}`}/>
                        <span className="text-[10px] font-black uppercase opacity-40">{file ? file.name : "Sélectionner une icône"}</span>
                        <input type="file" className="hidden" onChange={e=>setFile(e.target.files[0])} />
                    </label>

                    <div className="flex space-x-4">
                        <button type="button" onClick={onClose} className={`w-1/4 py-5 rounded-2xl font-bold uppercase text-[10px] ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Annuler</button>
                        <Button loading={loading} type="submit" className="w-3/4 py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20">Enregistrer</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;