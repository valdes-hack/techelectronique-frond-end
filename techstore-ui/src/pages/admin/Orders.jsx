import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFilter from '../../components/admin/AdminFilter';
import AdminService from '../../services/admin.service';
import { 
    ShoppingCart, Clock, DollarSign, Eye, Truck, 
    RefreshCw, ChevronRight, Printer, X, FileText, 
    MapPin, Phone, Mail, MessageCircle, CreditCard, Calendar, User
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    const navigate = useNavigate();
    const invoiceRef = useRef();
    const [theme] = useState(() => localStorage.getItem('admin_hub_theme') || 'dark');
    const isDark = theme === 'dark';

    const [filters, setFilters] = useState({ searchTerm: "", selCat: "Tous", dispo: "Tous" });

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getOrders();
            if (res?.status === 'success') setOrders(res.data || []);
        } catch (e) { 
            console.error("Erreur API:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { loadOrders(); }, []);

    useEffect(() => {
        const filtered = orders.filter(o => {
            const search = filters.searchTerm.toLowerCase();
            const matchesSearch = (o.orderNumber || "").toLowerCase().includes(search) || 
                                 (o.customerName || "").toLowerCase().includes(search);
            const matchesStatus = filters.selCat === "Tous" || o.status === filters.selCat;
            return matchesSearch && matchesStatus;
        });
        setFilteredList(filtered);
    }, [orders, filters]);

    // ✨ CONFIGURATION IMPRESSION OPTIMALE ✨
    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        documentTitle: `Facture_${selectedOrder?.orderNumber || 'TechStore'}`,
    });

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await AdminService.updateOrderStatus(orderId, newStatus);
            loadOrders(); 
        } catch (e) { 
            alert("Erreur lors de la mise à jour du statut"); 
        }
    };

    const openWhatsApp = (phone, orderNum) => {
        const cleanPhone = (phone || "").replace(/\D/g, '');
        const message = encodeURIComponent(`Bonjour, je vous contacte depuis TechStore concernant votre commande #${orderNum}.`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const statusList = ["Tous", "EN_ATTENTE", "PAIEMENT_CONFIRME", "EN_PREPARATION", "EXPEDIE", "LIVRE", "ANNULE"];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'LIVRE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'EN_ATTENTE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'EXPEDIE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ANNULE': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading) return (
        <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#0b0e14]' : 'bg-white'}`}>
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <AdminLayout 
            theme={theme} 
            filters={<AdminFilter theme={theme} context="orders" categories={statusList} filters={filters} setFilters={setFilters} onReset={() => setFilters({searchTerm: "", selCat: "Tous", dispo: "Tous"})} />}
        >
            <div className="flex flex-col gap-8 h-full pb-10">
                <header><h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Commandes<span className="text-indigo-500">.</span></h2></header>

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard theme={theme} title="REVENUS" value={orders.reduce((a,b)=>a+(b.totalAmount||0),0).toLocaleString()} unit="F" icon={<DollarSign/>} color="#10b981" sub="CA Global"/>
                    <StatCard theme={theme} title="EN ATTENTE" value={orders.filter(o => o.status === 'EN_ATTENTE').length} icon={<Clock/>} color="#fbbf24" sub="À traiter"/>
                    <StatCard theme={theme} title="EXPÉDITIONS" value={orders.filter(o => o.status === 'EXPEDIE').length} icon={<Truck/>} color="#818cf8" sub="En route"/>
                    <StatCard theme={theme} title="GLOBAL" value={orders.length} icon={<ShoppingCart/>} color="#f43f5e" sub="Commandes"/>
                </div>

                {/* TABLEAU PRINCIPAL */}
                <div className={`flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDark ? 'bg-[#161926] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[1000px] border-collapse">
                            <thead className={`sticky top-0 z-20 ${isDark ? 'bg-[#1a1e2e]' : 'bg-gray-50'} text-[11px] font-black uppercase tracking-widest text-slate-500`}>
                                <tr>
                                    <th className="p-6">RÉFÉRENCE</th>
                                    <th className="p-6">CLIENT</th>
                                    <th className="p-6 text-center">MONTANT</th>
                                    <th className="p-6 text-center">STATUT</th>
                                    <th className="p-6 text-right">ACTES</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {filteredList.map((o) => (
                                    <tr key={o.id} className="hover:bg-indigo-600/5 transition-all group">
                                        <td className="p-6 font-mono text-xs text-indigo-400 font-bold">#{o.orderNumber}</td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{o.customerName}</span>
                                                <span className="text-[10px] opacity-30 font-bold tracking-tighter">{o.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className={`p-6 text-center font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{o.totalAmount?.toLocaleString()} F</td>
                                        <td className="p-6 text-center">
                                            <select 
                                                value={o.status}
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                className={`mx-auto block px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase outline-none cursor-pointer transition-all ${getStatusStyle(o.status)}`}
                                            >
                                                {statusList.filter(s => s !== "Tous").map(s => (
                                                    <option key={s} value={s} className={isDark ? "bg-[#111421] text-white" : "bg-white text-black"}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => openWhatsApp(o.customerPhone, o.orderNumber)} className="p-2.5 rounded-xl border border-white/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><MessageCircle size={16}/></button>
                                            <button onClick={() => { setSelectedOrder(o); setShowDetails(true); }} className="p-2.5 rounded-xl border border-white/5 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"><Eye size={16}/></button>
                                            <button onClick={() => { setSelectedOrder(o); setShowInvoice(true); }} className="p-2.5 rounded-xl border border-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"><FileText size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODALE DÉTAILS --- */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`w-full max-w-3xl rounded-[3rem] p-10 border shadow-2xl ${isDark ? 'bg-[#111421] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-500 rounded-2xl text-white"><ShoppingCart size={24}/></div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Commande #{selectedOrder.orderNumber}</h3>
                            </div>
                            <button onClick={() => setShowDetails(false)} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-red-500"><X size={24}/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <DetailItem icon={<User size={18}/>} label="Nom du client" value={selectedOrder.customerName} />
                            <DetailItem icon={<Calendar size={18}/>} label="Date de commande" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                            <DetailItem icon={<MapPin size={18}/>} label="Adresse de livraison" value={selectedOrder.shippingAddressLabel} />
                            <DetailItem icon={<CreditCard size={18}/>} label="Paiement" value={selectedOrder.paymentMethod || 'Manuel'} />
                        </div>
                        <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-4">Articles du panier</p>
                            {selectedOrder.items?.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                    <span className="text-sm font-bold">{item.quantity}x {item.productName}</span>
                                    <span className="font-black text-indigo-400">{item.subTotal.toLocaleString()} F</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALE FACTURE --- */}
            {showInvoice && selectedOrder && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[3rem] bg-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 z-50 flex justify-between items-center p-6 border-b bg-white/90 backdrop-blur-md">
                            <span className="font-black uppercase text-xs text-slate-500 tracking-widest italic">TechStore Billing System</span>
                            <div className="flex gap-4">
                                <button onClick={handlePrint} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">
                                    <Printer size={16} className="inline mr-2"/> Imprimer
                                </button>
                                <button onClick={() => setShowInvoice(false)} className="p-3 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm"><X size={20}/></button>
                            </div>
                        </div>
                        <div className="p-10 flex justify-center">
                             <div ref={invoiceRef} className="bg-white w-full max-w-[800px] p-20 shadow-2xl text-black font-sans min-h-[1100px]">
                                <div className="flex justify-between items-start mb-20">
                                    <div>
                                        <h1 className="text-5xl font-black tracking-tighter italic text-indigo-600 mb-2">TechStore.</h1>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Premium Electronics Store</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter">FACTURE</h2>
                                        <p className="text-sm font-mono font-bold">N° {selectedOrder.orderNumber}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-20 mb-20 border-y-2 border-slate-50 py-12">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Client</p>
                                        <p className="font-black text-2xl mb-1">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-slate-500">{selectedOrder.customerEmail}</p>
                                        <p className="text-sm text-slate-500">{selectedOrder.customerPhone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Expédition</p>
                                        <p className="font-bold text-sm text-slate-700 uppercase mb-2">{selectedOrder.shippingType}</p>
                                        <p className="text-sm text-slate-500 italic max-w-[200px] ml-auto">{selectedOrder.shippingAddressLabel}</p>
                                    </div>
                                </div>

                                <table className="w-full mb-20">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="py-5 px-2">Description</th>
                                            <th className="py-5 px-2 text-center">Qté</th>
                                            <th className="py-5 px-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedOrder.items?.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-8 px-2 font-black text-lg text-slate-800">{item.productName}</td>
                                                <td className="py-8 px-2 text-center font-mono font-bold text-slate-600">x {item.quantity}</td>
                                                <td className="py-8 px-2 text-right font-black text-xl text-slate-900">{item.subTotal?.toLocaleString()} F</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end pt-10 border-t-4 border-slate-50">
                                    <div className="w-72 space-y-4 text-right">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400 uppercase text-[10px] tracking-widest">Sous-total</span>
                                            <span className="text-slate-800">{(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0)).toLocaleString()} F</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400 uppercase text-[10px] tracking-widest">Livraison</span>
                                            <span className="text-slate-800">{selectedOrder.shippingCost?.toLocaleString() || 0} F</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl">
                                            <span className="font-black uppercase text-xs tracking-widest">Net à payer</span>
                                            <span className="text-3xl font-black tracking-tighter">{selectedOrder.totalAmount?.toLocaleString()} F</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl shadow-sm">{icon}</div>
        <div>
            <p className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-1">{label}</p>
            <p className="text-base font-bold leading-tight">{value}</p>
        </div>
    </div>
);

const StatCard = ({ title, value, sub, icon, color, theme }) => {
    const isDark = theme === 'dark';
    return (
        <div className={`p-6 rounded-[2.2rem] border transition-all shadow-xl flex flex-col justify-between ${isDark ? 'bg-[#161926] border-white/5 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-100'}`}>
            <div className="flex justify-between items-start w-full">
                <div>
                    <p className={`text-[10px] font-black uppercase opacity-20 tracking-widest mb-1.5 ${isDark ? 'text-white' : 'text-slate-500'}`}>{title}</p>
                    <div className={`text-2xl md:text-3xl font-black tracking-tighter truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
                </div>
                <div className="flex-shrink-0 p-4 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner" style={{color}}>{icon}</div>
            </div>
            <p className="text-[10px] font-bold opacity-30 mt-4 flex items-center uppercase tracking-tight"><ChevronRight size={14} className="mr-1 text-indigo-500" /> {sub}</p>
        </div>
    );
};

export default AdminOrders;