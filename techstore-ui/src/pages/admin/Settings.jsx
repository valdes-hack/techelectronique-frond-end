import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import baseApi from '../../api/axiosConfig';
import { 
    Save, Loader, Settings as SettingsIcon, Image as ImageIcon, Video, 
    Plus, X, Upload, Building2, PhoneCall, Sparkles, CheckCircle2, 
    AlertCircle, Eye, Globe, Mail, MapPin, Phone, Bell, Check, Flame, Percent,
    LayoutGrid, RotateCcw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getFullImageUrl } from '../../utils/imageUtils';

const Settings = () => {
    const { settings: currentSettings, reloadSettings } = useAppContext();
    const { theme } = useTheme();
    const { notificationConfig, updateNotificationConfig, notifySuccess } = useToast();
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'contact' | 'hero' | 'bento' | 'promotions' | 'notifications'
    const [formData, setFormData] = useState({
        siteName: '',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        logoUrl: '',
        bentoPoultryImageUrl: '',
        bentoIncubatorImageUrl: '',
        bentoFeedImageUrl: '',
        bentoHealthImageUrl: '',
    });

    // Paramètres locaux pour les promotions
    const [promoSettings, setPromoSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('techstore_promo_settings');
            return saved ? JSON.parse(saved) : {
                autoBadge: true,
                bannerEnabled: true,
                flashSaleTimerHours: 24,
                minDiscountPercent: 5
            };
        } catch {
            return { autoBadge: true, bannerEnabled: true, flashSaleTimerHours: 24, minDiscountPercent: 5 };
        }
    });

    const updatePromoSettings = (newSettings) => {
        setPromoSettings(prev => {
            const updated = { ...prev, ...newSettings };
            try {
                localStorage.setItem('techstore_promo_settings', JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
            return updated;
        });
    };

    // List of URLs for the hero slider & video
    const [heroImagesUrls, setHeroImagesUrls] = useState([]);
    const [heroVideoUrl, setHeroVideoUrl] = useState('');
    
    const [newImageLink, setNewImageLink] = useState('');
    const [newVideoLink, setNewVideoLink] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

    const imageInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const bentoPoultryRef = useRef(null);
    const bentoIncubatorRef = useRef(null);
    const bentoFeedRef = useRef(null);
    const bentoHealthRef = useRef(null);

    useEffect(() => {
        if (currentSettings) {
            setFormData({
                siteName: currentSettings.siteName || 'PEOC (Petit Éleveur de l\'Ouest Cameroun)',
                contactEmail: currentSettings.contactEmail || 'contact@peoc.cm',
                contactPhone: currentSettings.contactPhone || '+237 686 669 222',
                contactAddress: currentSettings.contactAddress || 'Bafoussam, Ouest - Cameroun',
                logoUrl: currentSettings.logoUrl || '',
                bentoPoultryImageUrl: currentSettings.bentoPoultryImageUrl || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80',
                bentoIncubatorImageUrl: currentSettings.bentoIncubatorImageUrl || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
                bentoFeedImageUrl: currentSettings.bentoFeedImageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
                bentoHealthImageUrl: currentSettings.bentoHealthImageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
            });
            setHeroImagesUrls(currentSettings.heroImagesUrls || []);
            setHeroVideoUrl(currentSettings.heroVideoUrl || '');
        }
    }, [currentSettings]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddImageLink = () => {
        if (newImageLink.trim()) {
            setHeroImagesUrls([...heroImagesUrls, newImageLink.trim()]);
            setNewImageLink('');
            showToast('success', 'Image ajoutée à la liste du Hero Slider');
        }
    };

    const handleRemoveImage = (index) => {
        setHeroImagesUrls(heroImagesUrls.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e, type) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingFile(true);

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await baseApi.post('/settings/upload-media', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.data;
            
            if (type === 'image') {
                setHeroImagesUrls(prev => [...prev, url]);
                showToast('success', 'Image ajoutée au slider avec succès !');
            } else if (type === 'logo') {
                setFormData(prev => ({ ...prev, logoUrl: url }));
                showToast('success', 'Logo mis à jour avec succès !');
            } else if (type === 'video') {
                setHeroVideoUrl(url);
                showToast('success', 'Vidéo d\'accueil mise à jour !');
            } else if (type === 'bentoPoultry') {
                setFormData(prev => ({ ...prev, bentoPoultryImageUrl: url }));
                showToast('success', 'Visuel "Volailles & Poussins" mis à jour !');
            } else if (type === 'bentoIncubator') {
                setFormData(prev => ({ ...prev, bentoIncubatorImageUrl: url }));
                showToast('success', 'Visuel "Couveuses Auto" mis à jour !');
            } else if (type === 'bentoFeed') {
                setFormData(prev => ({ ...prev, bentoFeedImageUrl: url }));
                showToast('success', 'Visuel "Aliments & Granulés" mis à jour !');
            } else if (type === 'bentoHealth') {
                setFormData(prev => ({ ...prev, bentoHealthImageUrl: url }));
                showToast('success', 'Visuel "Soins Vétérinaires" mis à jour !');
            }
        } catch (error) {
            console.error(error);
            showToast('error', 'Échec de l\'envoi du fichier.');
        } finally {
            setUploadingFile(false);
            if (e.target) e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                heroImagesUrls: heroImagesUrls,
                heroVideoUrl: heroVideoUrl
            };
            
            await baseApi.put('/settings', dataToSave);
            await reloadSettings();
            showToast('success', 'Tous les paramètres ont été enregistrés avec succès !');
        } catch (error) {
            console.error(error);
            showToast('error', 'Erreur lors de la mise à jour des paramètres.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'Boutique & Identité', icon: Building2, desc: 'Nom, marque et logo' },
        { id: 'contact', label: 'Contact & Support', icon: PhoneCall, desc: 'Email, téléphone et adresse' },
        { id: 'hero', label: 'Médias d\'Accueil', icon: ImageIcon, desc: 'Bannières et vidéo hero' },
        { id: 'bento', label: '4 Cartes Bento Accueil', icon: LayoutGrid, desc: 'Les 4 visuels clés sous la bannière' },
        { id: 'promotions', label: 'Promos & Remises', icon: Flame, desc: 'Comportement des offres et badges' },
        { id: 'notifications', label: 'Alertes & Actions', icon: Bell, desc: 'Activer/Désactiver les alertes d\'actions' },
    ];

    return (
        <AdminLayout filters={null}>
            <div className="max-w-6xl mx-auto py-6 px-2 sm:px-4 space-y-8">
                
                {/* ── HEADER ── */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 text-xs font-black uppercase tracking-widest mb-1">
                            <Sparkles size={14} /> Centre de Configuration
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">
                            Paramètres du Site<span className="text-indigo-500">.</span>
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">
                            Configurez la marque, vos coordonnées et l'expérience visuelle publique.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploadingFile}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/25 disabled:opacity-50 text-xs uppercase tracking-widest shrink-0"
                    >
                        {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{loading ? 'Enregistrement...' : 'Sauvegarder tout'}</span>
                    </button>
                </header>

                {/* ── TOAST MESSAGE ── */}
                {toast && (
                    <div className={`p-4 rounded-2xl font-bold text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg ${
                        toast.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* ── ONGLETS DE NAVIGATION RESPONSIVES ── */}
                <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border text-left transition-all shrink-0 sm:shrink min-w-[210px] sm:min-w-0 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20'
                                        : isDark
                                            ? 'bg-[#161926] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                                            : 'bg-white border-gray-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
                                }`}
                            >
                                <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                                    isActive 
                                        ? 'bg-white/20 text-white' 
                                        : isDark ? 'bg-white/5 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide truncate">{tab.label}</h4>
                                    <p className={`text-[10px] sm:text-[11px] font-medium truncate mt-0.5 ${
                                        isActive ? 'text-white/80' : 'text-gray-400'
                                    }`}>
                                        {tab.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── CONTENU DE L'ONGLET SÉLECTIONNÉ ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* COLONNE GAUCHE : FORMULAIRE */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#161926] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-white/5 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* 1. ONGLET IDENTITÉ */}
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Identité de la Boutique
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Le nom et le logo apparaissent dans la barre de navigation, le pied de page et les factures.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Nom officiel du site *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            name="siteName"
                                            value={formData.siteName}
                                            onChange={handleChange}
                                            placeholder="Ex: PEOC (Petit Éleveur de l'Ouest Cameroun)"
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                                        />
                                    </div>

                                    {/* LOGO */}
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            Logo de la Boutique
                                        </label>
                                        
                                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0">
                                                {formData.logoUrl ? (
                                                    <img src={getFullImageUrl(formData.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-2xl font-black text-indigo-500">
                                                        {(formData.siteName || 'P').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <input
                                                    type="text"
                                                    name="logoUrl"
                                                    value={formData.logoUrl}
                                                    onChange={handleChange}
                                                    placeholder="URL du logo (https://...)"
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={logoInputRef}
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, 'logo')}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => logoInputRef.current?.click()}
                                                        disabled={uploadingFile}
                                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 py-1"
                                                    >
                                                        <Upload size={12} /> {uploadingFile ? 'Envoi...' : 'Uploader depuis l\'ordinateur'}
                                                    </button>
                                                    {formData.logoUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                                                            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 ml-auto"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. ONGLET CONTACT */}
                            {activeTab === 'contact' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Coordonnées & Assistance
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ces détails permettent aux clients de vous joindre facilement par e-mail, appel et WhatsApp.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Email de contact & Commandes *
                                        </label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="email"
                                                name="contactEmail"
                                                value={formData.contactEmail}
                                                onChange={handleChange}
                                                placeholder="contact@peoc.cm"
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Numéro de téléphone / WhatsApp *
                                        </label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="text"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleChange}
                                                placeholder="+237 600 000 000"
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Adresse physique de la boutique *
                                        </label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="text"
                                                name="contactAddress"
                                                value={formData.contactAddress}
                                                onChange={handleChange}
                                                placeholder="Bafoussam, Ouest - Cameroun"
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. ONGLET MÉDIAS HERO */}
                            {activeTab === 'hero' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Bannières & Ambiance de l'Accueil
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Gérez les images du slider d'accueil haute définition et la vidéo de présentation.
                                        </p>
                                    </div>

                                    {/* IMAGES DU SLIDER */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                Images du Slider d'accueil ({heroImagesUrls.length})
                                            </label>
                                            <span className="text-[10px] text-gray-400 font-bold">Recommandé : 1920x800 ou 16:9</span>
                                        </div>

                                        {/* Galerie des slides actuels */}
                                        {heroImagesUrls.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {heroImagesUrls.map((url, i) => (
                                                    <div key={i} className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 shadow-sm">
                                                        <img src={getFullImageUrl(url)} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                                                            Slide #{i + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(i)}
                                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            aria-label="Supprimer l'image"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                                                <ImageIcon size={32} className="mx-auto text-gray-400 mb-2 opacity-50" />
                                                <p className="text-xs font-bold text-gray-400 uppercase">Aucune image dans le slider</p>
                                            </div>
                                        )}

                                        {/* Ajouter une image (URL ou upload) */}
                                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newImageLink}
                                                    onChange={(e) => setNewImageLink(e.target.value)}
                                                    placeholder="Coller l'URL d'une image (https://...)"
                                                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddImageLink}
                                                    disabled={!newImageLink.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl font-bold flex items-center disabled:opacity-50 text-xs shrink-0"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={imageInputRef}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'image')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => imageInputRef.current?.click()}
                                                disabled={uploadingFile}
                                                className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
                                            >
                                                <Upload size={14} /> {uploadingFile ? 'Envoi...' : 'Uploader image'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* VIDÉO HERO */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                Vidéo de Fond Hero (Optionnel)
                                            </label>
                                            {heroVideoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setHeroVideoUrl('')}
                                                    className="text-[10px] font-black uppercase text-red-500 hover:underline"
                                                >
                                                    Retirer la vidéo
                                                </button>
                                            )}
                                        </div>

                                        {heroVideoUrl ? (
                                            <div className="relative group rounded-2xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                                                <video src={heroVideoUrl} className="w-full h-full object-cover" controls playsInline />
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 p-6">
                                                <Video size={32} className="mb-2 opacity-40 text-indigo-500" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Aucune vidéo active</span>
                                                <span className="text-[10px] text-gray-400 mt-1">Le slider d'images sera affiché par défaut.</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newVideoLink}
                                                    onChange={(e) => setNewVideoLink(e.target.value)}
                                                    placeholder="Lien vidéo direct (ex: https://.../video.mp4)"
                                                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newVideoLink.trim()) {
                                                            setHeroVideoUrl(newVideoLink.trim());
                                                            setNewVideoLink('');
                                                            showToast('success', 'Lien vidéo configuré');
                                                        }
                                                    }}
                                                    disabled={!newVideoLink.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl font-bold flex items-center disabled:opacity-50 text-xs"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm"
                                                ref={videoInputRef}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => videoInputRef.current?.click()}
                                                disabled={uploadingFile}
                                                className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
                                            >
                                                <Upload size={14} /> {uploadingFile ? 'Envoi...' : 'Uploader vidéo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. BIS. ONGLET LES 4 CARTES BENTO DE L'ACCUEIL */}
                            {activeTab === 'bento' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-2 text-indigo-500 text-xs font-black uppercase tracking-widest mb-1">
                                            <LayoutGrid size={16} /> Vitrine Bento Grid
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                            Les 4 Cartes Sous-Bannière Accueil
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Personnalisez les 4 visuels phares affichés sur la page d'accueil juste sous la bannière principale.
                                        </p>
                                    </div>

                                    {/* SCHÉMA VISUEL DE DISPOSITION */}
                                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-500/20">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-3">
                                            📐 Disposition sur la Page d'Accueil :
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-bold text-center">
                                            <div className="sm:col-span-2 p-3 rounded-xl bg-indigo-600 text-white flex flex-col justify-center items-center h-20 shadow-sm">
                                                <span className="uppercase text-[10px] opacity-75">Carte 1 (Grand Format)</span>
                                                <span className="text-xs font-black">Volailles & Poussins</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-amber-500 text-white flex flex-col justify-center items-center h-20 shadow-sm">
                                                <span className="uppercase text-[10px] opacity-75">Carte 2 (Haut Droite)</span>
                                                <span className="text-xs font-black">Couveuses Auto</span>
                                            </div>
                                            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                                                <div className="p-3 rounded-xl bg-emerald-600 text-white flex flex-col justify-center items-center h-16 shadow-sm">
                                                    <span className="uppercase text-[10px] opacity-75">Carte 3 (Bas Milieu)</span>
                                                    <span className="text-xs font-black">Aliments & Granulés</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-teal-600 text-white flex flex-col justify-center items-center h-16 shadow-sm">
                                                    <span className="uppercase text-[10px] opacity-75">Carte 4 (Bas Droite)</span>
                                                    <span className="text-xs font-black">Soins Vétérinaires</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ CARTE 1 : VOLAILLES & POUSSINS ══ */}
                                    <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                                    Carte 1 — Grand Format Gauche
                                                </span>
                                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                    Volailles & Poussins
                                                </h4>
                                                <p className="text-xs text-gray-400">Occupe 2 colonnes sur grand écran avec un affichage immersif.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bentoPoultryImageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80' }))}
                                                className="text-[10px] font-bold text-gray-500 hover:text-indigo-500 flex items-center gap-1 self-start sm:self-auto"
                                            >
                                                <RotateCcw size={12} /> Image par défaut
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-5 aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/40 relative">
                                                <img 
                                                    src={getFullImageUrl(formData.bentoPoultryImageUrl || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80')} 
                                                    alt="Volailles" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-black text-white uppercase">Aperçu direct</span>
                                            </div>
                                            <div className="md:col-span-7 space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Lien URL ou Téléversement</label>
                                                <input
                                                    type="text"
                                                    name="bentoPoultryImageUrl"
                                                    value={formData.bentoPoultryImageUrl || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://.../poulet.jpg"
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={bentoPoultryRef}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'bentoPoultry')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => bentoPoultryRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-white/5 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-white/10 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Upload size={14} /> Téléverser une image depuis mon ordinateur
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ CARTE 2 : COUVEUSES AUTO ══ */}
                                    <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                                    Carte 2 — Haut Droite
                                                </span>
                                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                    Couveuses Auto & Éclosion
                                                </h4>
                                                <p className="text-xs text-gray-400">Positionnée en haut à droite du Bento Grid.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bentoIncubatorImageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80' }))}
                                                className="text-[10px] font-bold text-gray-500 hover:text-indigo-500 flex items-center gap-1 self-start sm:self-auto"
                                            >
                                                <RotateCcw size={12} /> Image par défaut
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-5 aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/40 relative">
                                                <img 
                                                    src={getFullImageUrl(formData.bentoIncubatorImageUrl || 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80')} 
                                                    alt="Couveuses" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-black text-white uppercase">Aperçu direct</span>
                                            </div>
                                            <div className="md:col-span-7 space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Lien URL ou Téléversement</label>
                                                <input
                                                    type="text"
                                                    name="bentoIncubatorImageUrl"
                                                    value={formData.bentoIncubatorImageUrl || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://.../couveuse.jpg"
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={bentoIncubatorRef}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'bentoIncubator')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => bentoIncubatorRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className="w-full bg-amber-50 hover:bg-amber-100 dark:bg-white/5 dark:hover:bg-white/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-white/10 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Upload size={14} /> Téléverser une image depuis mon ordinateur
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ CARTE 3 : ALIMENTS & GRANULÉS ══ */}
                                    <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                                    Carte 3 — Bas Milieu
                                                </span>
                                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                    Aliments & Granulés
                                                </h4>
                                                <p className="text-xs text-gray-400">Positionnée au milieu inférieur du Bento Grid.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bentoFeedImageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80' }))}
                                                className="text-[10px] font-bold text-gray-500 hover:text-indigo-500 flex items-center gap-1 self-start sm:self-auto"
                                            >
                                                <RotateCcw size={12} /> Image par défaut
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-5 aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/40 relative">
                                                <img 
                                                    src={getFullImageUrl(formData.bentoFeedImageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80')} 
                                                    alt="Aliments" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-black text-white uppercase">Aperçu direct</span>
                                            </div>
                                            <div className="md:col-span-7 space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Lien URL ou Téléversement</label>
                                                <input
                                                    type="text"
                                                    name="bentoFeedImageUrl"
                                                    value={formData.bentoFeedImageUrl || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://.../aliment.jpg"
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={bentoFeedRef}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'bentoFeed')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => bentoFeedRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-white/5 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-white/10 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Upload size={14} /> Téléverser une image depuis mon ordinateur
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ CARTE 4 : SOINS VÉTÉRINAIRES ══ */}
                                    <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider mb-1">
                                                    Carte 4 — Bas Droite
                                                </span>
                                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                    Soins Vétérinaires & Hygiène
                                                </h4>
                                                <p className="text-xs text-gray-400">Positionnée en bas à droite du Bento Grid.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bentoHealthImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' }))}
                                                className="text-[10px] font-bold text-gray-500 hover:text-indigo-500 flex items-center gap-1 self-start sm:self-auto"
                                            >
                                                <RotateCcw size={12} /> Image par défaut
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-5 aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/40 relative">
                                                <img 
                                                    src={getFullImageUrl(formData.bentoHealthImageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80')} 
                                                    alt="Soins" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-black text-white uppercase">Aperçu direct</span>
                                            </div>
                                            <div className="md:col-span-7 space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Lien URL ou Téléversement</label>
                                                <input
                                                    type="text"
                                                    name="bentoHealthImageUrl"
                                                    value={formData.bentoHealthImageUrl || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://.../soins.jpg"
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                                />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={bentoHealthRef}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'bentoHealth')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => bentoHealthRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className="w-full bg-teal-50 hover:bg-teal-100 dark:bg-white/5 dark:hover:bg-white/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-white/10 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Upload size={14} /> Téléverser une image depuis mon ordinateur
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. ONGLET ALERTES & NOTIFICATIONS D'ACTIONS */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                            <Bell size={20} className="text-indigo-500" /> Notifications & Alertes d'Actions
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Activez ou désactivez les notifications en temps réel pour chaque action (ajout, modification, suppression, ravitaillement, commandes).
                                        </p>
                                    </div>

                                    {/* INTERRUPTEUR GÉNÉRAL */}
                                    <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                                        notificationConfig.enabled
                                            ? 'bg-indigo-600/10 border-indigo-500/30'
                                            : isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div>
                                            <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                Système global de notifications
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Active ou désactive complètement toutes les bulles d'alerte.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateNotificationConfig({ enabled: !notificationConfig.enabled })}
                                            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                                                notificationConfig.enabled ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                                                notificationConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* LISTE DES OPTIONS PAR ACTION */}
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Alertes par type d'action
                                        </label>

                                        {[
                                            { key: 'create', title: 'Ajouts (Créations)', desc: 'Nouveau produit, nouveau rayon, nouveau fournisseur ajouté' },
                                            { key: 'update', title: 'Modifications', desc: 'Produit édité, prix ajusté, paramètres enregistrés' },
                                            { key: 'delete', title: 'Suppressions', desc: 'Produit supprimé, rayon retiré, partenaire archivé' },
                                            { key: 'supply', title: 'Ravitaillements de stock', desc: 'Entrée physique de stock et calcul du nouveau stock total' },
                                            { key: 'order', title: 'Mise à jour des commandes', desc: 'Changement de statut (payé, expédié, livré)' },
                                        ].map((item) => {
                                            const isChecked = notificationConfig[item.key] !== false;
                                            return (
                                                <div 
                                                    key={item.key}
                                                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                                        !notificationConfig.enabled 
                                                            ? 'opacity-40 pointer-events-none' 
                                                            : isChecked 
                                                                ? isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-gray-200' 
                                                                : isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'
                                                    }`}
                                                >
                                                    <div className="min-w-0 pr-4">
                                                        <h5 className="font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white">
                                                            {item.title}
                                                        </h5>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                            {item.desc}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateNotificationConfig({ [item.key]: !isChecked })}
                                                        className={`w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
                                                            isChecked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                                            isChecked ? 'translate-x-5' : 'translate-x-0'
                                                        }`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 5. ONGLET PARAMÈTRES DES PROMOTIONS */}
                            {activeTab === 'promotions' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                                            <Flame size={20} className="text-red-500 fill-red-500" /> Paramètres des Promotions & Ventes Flash
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Personnalisez les badges de remise, le bandeau d'accueil et le seuil minimal de promotion.
                                        </p>
                                    </div>

                                    {/* BADGE AUTOMATIQUE */}
                                    <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                                        promoSettings.autoBadge
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div>
                                            <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                Affichage automatique des Badges "-X%"
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Affiche automatiquement un macaron rouge avec le pourcentage de remise calculé sur les fiches produits.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updatePromoSettings({ autoBadge: !promoSettings.autoBadge })}
                                            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                                                promoSettings.autoBadge ? 'bg-red-500' : 'bg-gray-400 dark:bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                                                promoSettings.autoBadge ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* BANNIÈRE PROMOTION SUR L'ACCUEIL */}
                                    <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                                        promoSettings.bannerEnabled
                                            ? 'bg-indigo-600/10 border-indigo-500/30'
                                            : isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div>
                                            <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                                Section Ventes Flash sur la Page d'Accueil
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Met en avant le carrousel des meilleures promotions dès la page d'accueil.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updatePromoSettings({ bannerEnabled: !promoSettings.bannerEnabled })}
                                            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                                                promoSettings.bannerEnabled ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-white/20'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                                                promoSettings.bannerEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* SEUIL MINIMAL DE REMISE (%) */}
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Pourcentage minimum pour considérer un article comme "En Promotion"
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={promoSettings.minDiscountPercent || 5}
                                                onChange={(e) => updatePromoSettings({ minDiscountPercent: Number(e.target.value) })}
                                                className="w-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-sm font-black outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                            />
                                            <span className="text-xs font-bold text-gray-400">% de réduction requise</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BOUTON ENREGISTRER DANS LE FORMULAIRE */}
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                <span className="text-[11px] text-gray-400 font-medium text-center sm:text-left">
                                    Modifications enregistrées instantanément dans la base de données.
                                </span>
                                <button
                                    type="submit"
                                    disabled={loading || uploadingFile}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 text-xs uppercase tracking-wider disabled:opacity-50"
                                >
                                    {loading ? <Loader className="animate-spin" size={15} /> : <Save size={15} />}
                                    <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* COLONNE DROITE : APERÇU EN DIRECT (LIVE PREVIEW) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-[#161926] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-white/5 shadow-xl">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                                    <Eye size={12} /> Aperçu Public
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Temps Réel</span>
                            </div>

                            {/* Header simulation */}
                            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/30">
                                        {formData.logoUrl ? (
                                            <img src={getFullImageUrl(formData.logoUrl)} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            (formData.siteName || 'T').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-sm text-slate-900 dark:text-white truncate uppercase">
                                            {formData.siteName || 'TechStore'}
                                        </p>
                                        <p className="text-[9px] text-gray-400 truncate">techstore.cm</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact simulation */}
                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
                                    <Mail size={13} className="text-indigo-500 shrink-0" />
                                    <span className="truncate">{formData.contactEmail || 'Non configuré'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
                                    <Phone size={13} className="text-emerald-500 shrink-0" />
                                    <span className="truncate">{formData.contactPhone || 'Non configuré'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
                                    <MapPin size={13} className="text-red-500 shrink-0" />
                                    <span className="truncate">{formData.contactAddress || 'Non configuré'}</span>
                                </div>
                            </div>

                            {/* Hero summary */}
                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Visuel d'accueil</p>
                                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-gray-300">
                                    <span>Slider ({heroImagesUrls.length} slides)</span>
                                    <span className={heroVideoUrl ? 'text-indigo-500' : 'text-gray-400'}>
                                        {heroVideoUrl ? '🎬 Vidéo activée' : 'Photos uniquement'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
