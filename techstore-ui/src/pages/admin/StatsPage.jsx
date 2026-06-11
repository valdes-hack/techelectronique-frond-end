import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminService from '../../services/admin.service';
import { BarChart3, TrendingUp, Package, Users, DollarSign, Activity } from 'lucide-react';

const StatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await AdminService.getDashboardStats();
                if (res.status === 'success') {
                    setStats(res.data);
                }
            } catch (error) {
                console.error("Erreur de chargement des stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout filters={null}>
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin text-indigo-500"><Activity size={40} /></div>
                </div>
            </AdminLayout>
        );
    }

    if (!stats) return null;

    return (
        <AdminLayout filters={null}>
            <div className="p-6 lg:p-8 animate-in fade-in duration-500">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Statistiques Détaillées</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Analyse des performances</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={<DollarSign/>} title="Chiffre d'Affaires" value={`${stats.totalRevenue.toLocaleString()} F`} color="bg-emerald-500" />
                    <StatCard icon={<TrendingUp/>} title="Commandes" value={stats.totalOrders} color="bg-indigo-500" />
                    <StatCard icon={<Users/>} title="Clients" value={stats.totalClients} color="bg-blue-500" />
                    <StatCard icon={<Package/>} title="Stock Critique" value={stats.lowStockItems?.length || 0} color="bg-red-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#161926] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Produits les plus vendus</h3>
                        {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                            <div className="space-y-4">
                                {stats.topSellingProducts.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                        <span className="font-bold">{p.name}</span>
                                        <span className="text-indigo-500 font-black">{p.soldQuantity} vendus</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-10 text-gray-400 font-bold italic">Pas assez de données</div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-[#161926] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Ruptures de Stock</h3>
                        {stats.lowStockItems && stats.lowStockItems.length > 0 ? (
                            <div className="space-y-4">
                                {stats.lowStockItems.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                                        <span className="font-bold text-red-900 dark:text-red-400">{p.name}</span>
                                        <span className="text-red-600 font-black">Reste : {p.stockQuantity}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-10 text-emerald-500 font-bold italic">Aucune rupture de stock 🎉</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-[#161926] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-all -mr-10 -mt-10`}></div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${color}`}>
            {icon}
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tighter">{value}</p>
    </div>
);

export default StatsPage;
