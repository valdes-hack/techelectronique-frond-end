import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import { History, CheckCircle, Package, ShoppingBag, AlertTriangle, Info, Trash2, X, Calendar, Clock, Tag, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const HistoryPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { notifyAction, notifyError } = useToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getAllHistory(0, 100);
            if (response.status === 'success') {
                const list = response.data?.content || response.data || [];
                setHistory(list);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'STOCK_LOW': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'NEW_ORDER': return <ShoppingBag size={18} className="text-emerald-500" />;
            case 'ORDER_STATUS': return <ShoppingBag size={18} className="text-blue-500" />;
            case 'SUPPLY_RECEIVED': return <Package size={18} className="text-indigo-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    // GESTION DE LA SÉLECTION
    const handleToggleSelect = (id, e) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === history.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(history.map(item => item.id));
        }
    };

    const handleDeleteItem = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Supprimer cette entrée d'historique ?")) return;
        try {
            await AdminService.deleteNotification(id);
            notifyAction('delete', 'Activité', 'Entrée supprimée');
            setHistory(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (err) {
            console.error(err);
            notifyError("Erreur lors de la suppression", "Erreur");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`⚠️ Confirmer la suppression de ces ${selectedIds.length} entrée(s) d'historique ?`)) return;

        const count = selectedIds.length;
        const idsToDelete = [...selectedIds];
        setHistory(prev => prev.filter(item => !idsToDelete.includes(item.id)));
        setSelectedIds([]);
        if (selectedItem && idsToDelete.includes(selectedItem.id)) setSelectedItem(null);

        try {
            await AdminService.bulkDeleteNotifications(idsToDelete);
            notifyAction('delete', `${count} activité(s)`, 'Supprimée(s) de l\'historique');
            fetchHistory();
        } catch (err) {
            console.error("Erreur suppression groupée :", err);
            notifyError("Erreur lors de la suppression groupée", "Erreur");
            fetchHistory();
        }
    };

    const handleItemClick = async (item) => {
        setSelectedItem(item);
        if (!item.read) {
            try {
                await AdminService.markAsRead(item.id);
                setHistory(prev => prev.map(x => x.id === item.id ? { ...x, read: true } : x));
            } catch (err) {
                console.warn("Erreur marquage lecture:", err);
            }
        }
    };

    return (
        <AdminLayout filters={null}>
            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                            <History size={24} className="text-indigo-500" />
                        </div>
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Historique du Site<span className="text-indigo-500">.</span>
                            </h1>
                            <p className="text-xs text-gray-500">Trace de toutes les activités récentes avec détails et dates</p>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                    isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {selectedIds.length === history.length ? "Tout désélectionner" : "Tout sélectionner"}
                            </button>
                        </div>
                    )}
                </div>

                {/* BANDEAU D'ACTIONS GROUPÉES (SI SÉLECTION) */}
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/40">
                                {selectedIds.length}
                            </span>
                            <div>
                                <span className={`text-xs font-black uppercase tracking-wider block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {selectedIds.length} activité(s) sélectionnée(s)
                                </span>
                                <span className="text-[10px] text-gray-500">Actions groupées applicables à toute la sélection</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all border border-rose-500/30 active:scale-95 flex items-center gap-1.5"
                            >
                                <Trash2 size={14} />
                                <span>Supprimer ({selectedIds.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-2 rounded-xl text-xs font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                title="Tout désélectionner"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* LISTE DE L'HISTORIQUE */}
                <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-100'}`}>
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 font-bold">Chargement de l'historique...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Aucun historique disponible.</div>
                    ) : (
                        <div className="divide-y custom-scrollbar" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                            {history.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleItemClick(item)}
                                    className={`p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer ${
                                        selectedIds.includes(item.id) 
                                            ? (isDark ? 'bg-indigo-600/15' : 'bg-indigo-50/80')
                                            : !item.read 
                                                ? (isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/40') 
                                                : ''
                                    } hover:bg-black/5 dark:hover:bg-white/5`}
                                >
                                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={(e) => handleToggleSelect(item.id, e)}
                                            className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    <div className={`p-3 rounded-2xl shrink-0 ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                                        {getIcon(item.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {item.title}
                                            </h4>
                                            {!item.read && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="Non lu" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                                                <Calendar size={11} />
                                                {new Date(item.createdAt).toLocaleString('fr-FR', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            {item.type && (
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                    isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                                            className="p-2 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                            title="Voir les détails"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteItem(item.id, e)}
                                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALE DÉTAILS DE L'HISTORIQUE --- */}
            {selectedItem && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${isDark ? 'bg-[#111421] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    {getIcon(selectedItem.type)}
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black italic tracking-tight">Détails de l'activité</h3>
                                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                                        {selectedItem.type || 'GÉNÉRAL'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedItem(null)} 
                                className="p-2.5 bg-white/5 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-1">Titre</p>
                                <p className="text-sm font-bold">{selectedItem.title}</p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-1">Date et heure précises</p>
                                <p className="text-xs font-mono font-bold flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-400" />
                                    {new Date(selectedItem.createdAt).toLocaleString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2">Message complet</p>
                                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                                    {selectedItem.message}
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                                    selectedItem.read 
                                        ? 'bg-emerald-500/10 text-emerald-400' 
                                        : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                    {selectedItem.read ? "✓ Marqué comme lu" : "● Non lu"}
                                </span>

                                <button
                                    onClick={() => handleDeleteItem(selectedItem.id)}
                                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    <span>Supprimer cette entrée</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default HistoryPage;
