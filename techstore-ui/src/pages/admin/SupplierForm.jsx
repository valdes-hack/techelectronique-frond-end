import React, { useState } from 'react';
import AdminService from '../../services/admin.service';
import { X, Save, Building2, Loader2 } from 'lucide-react';

const SupplierForm = ({ supplier, onClose, onSave, theme }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        contactName: supplier?.contactName || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
        city: supplier?.city || '',
        country: supplier?.country || 'Cameroun',
        active: supplier ? supplier.active : true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (supplier) {
                await AdminService.updateSupplier(supplier.id, formData);
            } else {
                await AdminService.createSupplier(formData);
            }
            onSave();
        } catch (err) { 
            console.error(err);
            const msg = err.response?.data?.message || "Une erreur est survenue.";
            alert(err.response?.status === 409 ? "Doublon détecté : Le nom ou l'email est déjà utilisé." : msg);
        } finally { setSubmitting(false); }
    };

    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`${isDark ? 'bg-[#161926] border-white/10' : 'bg-white border-slate-200'} w-full max-w-2xl rounded-[3rem] border overflow-hidden shadow-2xl`}>
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500"><Building2 size={28}/></div>
                            <h3 className={`text-3xl font-black italic tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {supplier ? 'Édition' : 'Nouveau Partenaire'}
                            </h3>
                        </div>
                        <button onClick={onClose} className={`p-3 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                            <X size={24}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-widest">Nom de l'entreprise</label>
                            <input required className={`w-full border p-5 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-widest">Contact (Nom)</label>
                            <input required className={`w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-widest">Email Pro</label>
                            <input required type="email" className={`w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-widest">Téléphone</label>
                            <input required className={`w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-30 ml-2 tracking-widest">Ville</label>
                            <input required className={`w-full border p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>

                        <div className={`md:col-span-2 flex items-center gap-4 p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <input type="checkbox" className="w-6 h-6 accent-indigo-500 rounded-lg" checked={formData.active} 
                                onChange={e => setFormData({...formData, active: e.target.checked})} />
                            <label className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Partenaire Actif</label>
                        </div>

                        <button disabled={submitting} type="submit" className="md:col-span-2 mt-6 w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 disabled:opacity-50">
                            {submitting ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} 
                            {supplier ? 'Mettre à jour' : 'Enregistrer le Partenaire'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupplierForm;