import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import baseApi from '../../api/axiosConfig';
import { Save, Loader, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
    const { settings: currentSettings, reloadSettings } = useAppContext();
    const [formData, setFormData] = useState(currentSettings);
    const [heroFile, setHeroFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setFormData(currentSettings);
    }, [currentSettings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setHeroFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await baseApi.put('/settings', formData);
            if (heroFile) {
                const imgData = new FormData();
                imgData.append('file', heroFile);
                await baseApi.post('/settings/hero-image', imgData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            await reloadSettings();
            setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès.' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout filters={null}>
            <div className="max-w-4xl mx-auto py-8">
                <header className="mb-8">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                        <SettingsIcon size={32} className="text-indigo-500" /> Paramètres du Site
                    </h2>
                    <p className="text-sm opacity-50 font-medium mt-2">Gérez les informations publiques de TechStore.</p>
                </header>

                {message && (
                    <div className={`p-4 mb-6 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white dark:bg-[#161926] rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-white/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Nom du site</label>
                                <input required type="text" name="siteName" value={formData?.siteName || ''} onChange={handleChange} 
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Email de contact</label>
                                <input required type="email" name="contactEmail" value={formData?.contactEmail || ''} onChange={handleChange} 
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Téléphone de contact</label>
                                <input required type="text" name="contactPhone" value={formData?.contactPhone || ''} onChange={handleChange} 
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Adresse physique</label>
                                <input required type="text" name="contactAddress" value={formData?.contactAddress || ''} onChange={handleChange} 
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">URL du Logo (Optionnel)</label>
                                <input type="text" name="logoUrl" value={formData?.logoUrl || ''} onChange={handleChange} placeholder="https://..."
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Image d'accueil (Hero)</label>
                                {formData?.heroImageUrl && (
                                    <div className="mb-2">
                                        <img src={formData.heroImageUrl} alt="Hero" className="h-16 rounded-lg object-cover" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50">
                                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
