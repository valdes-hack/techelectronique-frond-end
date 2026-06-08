import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import { 
    TrendingUp, Users, Package, ShoppingCart, 
    Zap, Clock, Award, ArrowRight, AlertCircle, Box, CheckCircle, RefreshCw
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const isDark = theme === 'dark';

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await AdminService.getDashboardStats();
                if (res.status === 'success') {
                    setData(res.data);
                }
            } catch (e) {
                console.error("Erreur Dashboard", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#0b0e14]' : 'bg-[#f4f7fe]'}`}>
            <div className="text-center">
                <RefreshCw className="animate-spin text-indigo-500 mb-4 mx-auto" size={40} />
                <p className="text-indigo-500 italic font-black text-xl tracking-widest uppercase">Analyse en cours...</p>
            </div>
        </div>
    );

    return (
        <AdminLayout theme={theme} filters={null}>
            <div className="w-full flex flex-col gap-8 p-4 h-full overflow-y-auto custom-scrollbar pb-20">
                
                {/* --- HEADER --- */}
                <header className="flex justify-between items-end px-2">
                    <div>
                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Tableau de bord<span className="text-indigo-500">.</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Consolidation des données réelles</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className={`text-[10px] font-black uppercase ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`}>Mise à jour</p>
                        <p className={`font-mono text-xs ${isDark ? 'text-white' : 'text-slate-600'}`}>{new Date().toLocaleTimeString()}</p>
                    </div>
                </header>

                {/* --- CARTES KPI --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard 
                        theme={theme}
                        title="Revenus" 
                        value={`${data?.totalRevenue?.toLocaleString() || 0} F`} 
                        sub="Flux financier" 
                        icon={<TrendingUp />} 
                        color="#10b981" 
                        onClick={() => navigate('/admin/orders')}
                    />
                    <KpiCard 
                        theme={theme}
                        title="Commandes" 
                        value={data?.totalOrdersCount || 0} 
                        sub={`${data?.pendingOrdersCount || 0} en attente`} 
                        icon={<ShoppingCart />} 
                        color="#818cf8" 
                        onClick={() => navigate('/admin/orders')}
                    />
                    <KpiCard 
                        theme={theme}
                        title="Clients" 
                        value={data?.totalCustomersCount || 0} 
                        sub="Membres inscrits" 
                        icon={<Users />} 
                        color="#fbbf24" 
                        onClick={() => navigate('/admin/users')}
                    />
                    <KpiCard 
                        theme={theme}
                        title="Stock Alerte" 
                        value={data?.lowStockProductsCount || 0} 
                        sub="Produits à surveiller" 
                        icon={<AlertCircle />} 
                        color="#f43f5e" 
                        onClick={() => navigate('/admin/products')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- GRAPHIQUE VENTES PAR RAYON --- */}
                    <div className={`lg:col-span-8 border rounded-[3rem] p-8 shadow-2xl transition-all ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-slate-200'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className={`text-xl font-black italic ${isDark ? 'text-white' : 'text-slate-800'}`}>Performance des Rayons</h3>
                            <button onClick={() => navigate('/admin/categories')} className="text-[10px] font-black text-indigo-500 uppercase hover:underline tracking-widest">Voir détails</button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.salesBreakdownByCategory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                    <XAxis dataKey="categoryName" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} />
                                    <Tooltip 
                                        cursor={{fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}} 
                                        contentStyle={{ backgroundColor: isDark ? '#111421' : '#fff', borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                                    />
                                    <Bar dataKey="totalSales" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- TOP PRODUITS --- */}
                    <div className={`lg:col-span-4 border rounded-[3rem] p-8 shadow-2xl transition-all ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-slate-200'}`}>
                        <h3 className={`text-xl font-black italic mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <Award className="text-amber-500" size={20} /> Tops Ventes
                        </h3>
                        <div className="space-y-5">
                            {data?.topSellingProducts?.length > 0 ? data.topSellingProducts.slice(0, 5).map((prod, idx) => (
                                <div key={idx} onClick={() => navigate(`/admin/products`)} className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border border-transparent ${isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>{prod.productName}</p>
                                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter">{prod.quantitySold} vendus</p>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                                </div>
                            )) : <p className="text-center text-xs opacity-30 py-10 italic">Aucune vente enregistrée</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- PRODUITS À RAVITAILLER (CORRIGÉ) --- */}
                    <div className={`lg:col-span-5 border rounded-[3rem] p-8 shadow-2xl transition-all ${isDark ? 'bg-[#161926] border-red-500/20' : 'bg-white border-red-100 shadow-slate-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black italic flex items-center gap-2 text-red-500">
                                <Package size={20} /> Stock critique
                            </h3>
                            <button onClick={() => navigate('/admin/stock')} className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">RAVITAILLER</button>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                                data.lowStockProducts.map((prod, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-black text-xs">
                                                {prod.stockQty}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{prod.name}</p>
                                                <p className="text-[10px] text-gray-500 font-medium uppercase">{prod.brand}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/admin/stock')} className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-white text-slate-400 shadow-sm'}`}>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 opacity-30">
                                    <CheckCircle size={40} className="mx-auto mb-2 text-emerald-500" />
                                    <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Inventaire sous contrôle</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- ACTIVITÉ RÉCENTE --- */}
                    <div className={`lg:col-span-7 border rounded-[3rem] p-8 shadow-2xl transition-all ${isDark ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-200 shadow-slate-200'}`}>
                        <h3 className={`text-xl font-black italic mb-6 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-indigo-600'}`}>
                            <Clock size={20} /> Activité Récente
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                                    <tr>
                                        <th className="pb-4">N° COMMANDE</th>
                                        <th className="pb-4">CLIENT</th>
                                        <th className="pb-4 text-center">STATUT</th>
                                        <th className="pb-4 text-right">MONTANT</th>
                                    </tr>
                                </thead>
                                <tbody className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                                    {data?.recentOrders?.map((order, idx) => (
                                        <tr key={idx} className={`border-t transition-all ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}>
                                            <td className={`py-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>#{order.orderNumber}</td>
                                            <td className="py-4 font-medium">{order.customerName}</td>
                                            <td className="py-4 text-center">
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                                                    order.status === 'LIVRE' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    order.status === 'ANNULE' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className={`py-4 text-right font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.totalAmount.toLocaleString()} F</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

const KpiCard = ({ title, value, icon, color, sub, onClick, theme }) => {
    const isDark = theme === 'dark';
    return (
        <div 
            onClick={onClick}
            className={`border p-6 rounded-[2.5rem] shadow-xl flex flex-col justify-between group cursor-pointer transition-all active:scale-95 ${
                isDark ? 'bg-[#161926] border-white/5 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-slate-200'
            }`}
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl w-fit shadow-inner ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} style={{color}}>{icon}</div>
                <ArrowRight size={16} className={`${isDark ? 'text-gray-700' : 'text-slate-300'} group-hover:text-indigo-500 transition-colors`} />
            </div>
            <div className="mt-6">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'opacity-20 text-white' : 'text-slate-400'}`}>{title}</p>
                <h4 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h4>
                <p className={`text-[10px] font-bold mt-1 italic uppercase ${isDark ? 'text-gray-500' : 'text-indigo-500'}`}>{sub}</p>
            </div>
        </div>
    );
};

export default Dashboard;