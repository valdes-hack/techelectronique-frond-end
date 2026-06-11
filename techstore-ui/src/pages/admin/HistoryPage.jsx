import React, { useState, useEffect } from 'react';
import AdminService from '../../services/admin.service';
import { History, CheckCircle, Package, ShoppingBag, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/admin/AdminLayout';

const HistoryPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await AdminService.getAllHistory(0, 50); // Get first 50 for now
            if (response.status === 'success') {
                setHistory(response.data.content || []);
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
            case 'SUPPLY_RECEIVED': return <Package size={18} className="text-indigo-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    return (
        <AdminLayout filters={null}>
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <History size={24} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black italic">Historique du Site</h1>
                    <p className="text-sm text-gray-500">Trace de toutes les activités récentes</p>
                </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#111421] border-white/5' : 'bg-white border-gray-100'}`}>
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Chargement de l'historique...</div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Aucun historique disponible.</div>
                ) : (
                    <div className="divide-y custom-scrollbar" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                        {history.map((item) => (
                            <div key={item.id} className={`p-4 flex items-start gap-4 transition-colors ${!item.read ? (isDark ? 'bg-indigo-500/5' : 'bg-indigo-50') : ''} hover:bg-black/5 dark:hover:bg-white/5`}>
                                <div className={`p-3 rounded-2xl ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.message}</p>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-2 block">
                                        {new Date(item.createdAt).toLocaleString('fr-FR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {item.read && (
                                    <div className="flex items-center text-emerald-500 opacity-50" title="Lu">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </AdminLayout>
    );
};

export default HistoryPage;
