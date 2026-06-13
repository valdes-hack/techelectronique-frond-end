import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import baseApi from '../../api/axiosConfig';
import { Save, Loader, Settings as SettingsIcon, Image as ImageIcon, Video, Plus, X, Upload } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const Settings = () => {
    const { settings: currentSettings, reloadSettings } = useAppContext();
    const [formData, setFormData] = useState(currentSettings || {});
    
    // List of URLs for the slider
    const [heroImagesUrls, setHeroImagesUrls] = useState(currentSettings?.heroImagesUrls || []);
    const [heroVideoUrl, setHeroVideoUrl] = useState(currentSettings?.heroVideoUrl || '');
    
    const [newImageLink, setNewImageLink] = useState('');
    const [newVideoLink, setNewVideoLink] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [message, setMessage] = useState(null);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        if (currentSettings) {
            setFormData(currentSettings);
            setHeroImagesUrls(currentSettings.heroImagesUrls || []);
            setHeroVideoUrl(currentSettings.heroVideoUrl || '');
        }
    }, [currentSettings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddImageLink = () => {
        if (newImageLink.trim()) {
            setHeroImagesUrls([...heroImagesUrls, newImageLink.trim()]);
            setNewImageLink('');
        }
    };

    const handleRemoveImage = (index) => {
        setHeroImagesUrls(heroImagesUrls.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e, type) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingFile(true);
        setMessage(null);

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await baseApi.post('/settings/upload-media', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.data;
            
            if (type === 'image') {
                setHeroImagesUrls([...heroImagesUrls, url]);
            } else if (type === 'video') {
                setHeroVideoUrl(url);
            }
            setMessage({ type: 'success', text: 'Fichier uploadé avec succès !' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'upload du fichier.' });
        } finally {
            setUploadingFile(false);
            if (e.target) e.target.value = null; // reset input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const dataToSave = {
                ...formData,
                heroImagesUrls: heroImagesUrls,
                heroVideoUrl: heroVideoUrl
            };
            
            await baseApi.put('/settings', dataToSave);
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
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* INFOS DE BASE */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-white/5 pb-2">Informations Générales</h3>
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
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">URL du Logo (Optionnel)</label>
                                    <input type="text" name="logoUrl" value={formData?.logoUrl || ''} onChange={handleChange} placeholder="https://..."
                                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION MEDIA HERO */}
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-white/5 pb-2 flex items-center gap-2">
                                <ImageIcon size={20} /> Médias d'Accueil (Hero Section)
                            </h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* IMAGES SLIDER */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Images du Slider ({heroImagesUrls.length})</label>
                                    
                                    {/* Liste des images existantes */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {heroImagesUrls.map((url, i) => (
                                            <div key={i} className="relative group rounded-xl overflow-hidden aspect-[16/9] border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                                                <img src={getFullImageUrl(url)} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemoveImage(i)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ajouter une image */}
                                    <div className="flex gap-2">
                                        <input type="text" value={newImageLink} onChange={(e) => setNewImageLink(e.target.value)} placeholder="Coller un lien d'image..."
                                            className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                                        <button type="button" onClick={handleAddImageLink} disabled={!newImageLink.trim()}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded-xl font-bold flex items-center disabled:opacity-50">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Ou</span>
                                    </div>
                                    <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                                    <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingFile}
                                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-apple-dark dark:text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                        <Upload size={18} /> {uploadingFile ? 'Upload en cours...' : 'Uploader une image'}
                                    </button>
                                </div>

                                {/* VIDEO BACKGROUND */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Vidéo d'Accueil (Optionnel)</label>
                                    
                                    {heroVideoUrl ? (
                                        <div className="relative group rounded-xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                                            <video src={heroVideoUrl} className="w-full h-full object-cover" muted playsInline />
                                            <button type="button" onClick={() => setHeroVideoUrl('')}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-gray-400">
                                            <Video size={32} className="mb-2 opacity-50" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Aucune vidéo</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input type="text" value={newVideoLink} onChange={(e) => setNewVideoLink(e.target.value)} placeholder="Coller un lien vidéo (mp4)..."
                                            className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold dark:text-white" />
                                        <button type="button" onClick={() => { if(newVideoLink) { setHeroVideoUrl(newVideoLink); setNewVideoLink(''); } }} disabled={!newVideoLink.trim()}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded-xl font-bold flex items-center disabled:opacity-50">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Ou</span>
                                    </div>
                                    <input type="file" accept="video/mp4,video/webm" ref={videoInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingFile}
                                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-apple-dark dark:text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                        <Upload size={18} /> {uploadingFile ? 'Upload en cours...' : 'Uploader une vidéo (MP4)'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-white/5">
                            <button type="submit" disabled={loading || uploadingFile} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50">
                                {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
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
