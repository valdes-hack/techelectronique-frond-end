import React, { useState } from 'react';
import { X, Save, ShieldCheck, Layout, Box, Users, Settings } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const UserForm = ({ user, onClose, onSave, theme }) => {
    const isDark = theme === 'dark';

    // Les permissions disponibles dans ton système
    const permissionList = [
        { id: 'VIEW_DASHBOARD', label: 'Accès au Dashboard', icon: <Layout size={16}/> },
        { id: 'MANAGE_PRODUCTS', label: 'Gérer le catalogue (CRUD)', icon: <Box size={16}/> },
        { id: 'MANAGE_USERS', label: 'Gérer les membres', icon: <Users size={16}/> },
        { id: 'MANAGE_SETTINGS', label: 'Modifier les paramètres site', icon: <Settings size={16}/> }
    ];

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        role: user?.role || 'CLIENT',
        // On récupère les permissions actuelles ou on met un tableau vide
        permissions: user?.permissions || [] 
    });

    // Switch On/Off pour une permission
    const togglePermission = (permId) => {
        setFormData(prev => {
            const hasIt = prev.permissions.includes(permId);
            return {
                ...prev,
                permissions: hasIt 
                    ? prev.permissions.filter(id => id !== permId) 
                    : [...prev.permissions, permId]
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-[#111421] text-white border border-white/10' : 'bg-white text-slate-800'}`}>
                
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white"><ShieldCheck size={20}/></div>
                        <h2 className="text-2xl font-black italic">Droits d'accès.</h2>
                    </div>
                    <button type="button" onClick={onClose} className="opacity-50 hover:opacity-100"><X size={24}/></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    {/* INFOS DE BASE */}
                    <div className="grid grid-cols-2 gap-6">
                        <Input label="PRÉNOM" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} theme={theme} />
                        <Input label="NOM" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} theme={theme} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 block">RÔLE GLOBAL</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className={`w-full p-4 rounded-2xl font-bold outline-none border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-100'}`}
                        >
                            <option value="CLIENT">CLIENT</option>
                            <option value="ADMIN">ADMINISTRATEUR</option>
                            <option value="SAV_AGENT">AGENT SAV</option>
                        </select>
                    </div>

                    {/* SECTION PERMISSIONS (Tes cases à cocher !) ✨ */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 block italic">Privilèges spécifiques</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissionList.map((perm) => {
                                const active = formData.permissions.includes(perm.id);
                                return (
                                    <div 
                                        key={perm.id}
                                        onClick={() => togglePermission(perm.id)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${active ? 'border-indigo-600 bg-indigo-600/10' : 'border-white/5 opacity-50'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`${active ? 'text-indigo-500' : ''}`}>{perm.icon}</div>
                                            <span className="text-sm font-bold">{perm.label}</span>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 flex justify-center bg-white/5">
                    <Button type="submit" className="w-full py-4 shadow-xl shadow-indigo-500/20">
                        <Save size={20} className="mr-2"/> Valider les accès de {formData.firstName}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;