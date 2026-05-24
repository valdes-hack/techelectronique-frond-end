import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, FileText } from 'lucide-react';
import OrderService from '../../services/order.service';

const OrderDetail = ({ theme }) => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await OrderService.getOrderDetails(id);
                if (res.status === 'success') setOrder(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500">Chargement de la commande...</div>;
    if (!order) return <div className="p-20 text-center uppercase font-black">Commande introuvable</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* --- HEADER COMMANDE --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Commande #{order.orderNumber}<span className="text-indigo-500">.</span>
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
                        Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className={`px-6 py-3 rounded-2xl border font-black text-sm uppercase tracking-widest ${
                    order.status === 'LIVRE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                }`}>
                    {order.status}
                </div>
            </div>

            {/* --- STEPPER DE SUIVI (Style Apple) --- */}
            <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className="flex justify-between items-center relative">
                    <div className="absolute h-0.5 bg-gray-200 dark:bg-white/10 left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
                    <Step icon={<Clock />} label="Validée" active={true} />
                    <Step icon={<Package />} label="Préparation" active={['EN_PREPARATION', 'EXPEDIE', 'LIVRE'].includes(order.status)} />
                    <Step icon={<Truck />} label="En route" active={['EXPEDIE', 'LIVRE'].includes(order.status)} />
                    <Step icon={<CheckCircle />} label="Livrée" active={order.status === 'LIVRE'} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- ARTICLES --- */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className={`text-xl font-black italic ${isDark ? 'text-white' : 'text-slate-800'}`}>Articles commandés</h3>
                    <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
                        {order.items.map((item, index) => (
                            <div key={index} className="p-6 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center text-white font-black italic">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.productName}</p>
                                        <p className="text-xs text-gray-500">{item.unitPrice.toLocaleString()} F / unité</p>
                                    </div>
                                </div>
                                <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.subTotal.toLocaleString()} F</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RÉCAPITULATIF & ADRESSE --- */}
                <div className="space-y-8">
                    {/* ADRESSE */}
                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-slate-100'}`}>
                        <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-6 tracking-[0.2em]">Détails Livraison</h4>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex items-center gap-3 text-gray-500"><MapPin size={16}/> {order.shippingAddressLabel}</div>
                            <div className="flex items-center gap-3 text-gray-500"><Phone size={16}/> {order.customerPhone}</div>
                            <div className="flex items-center gap-3 text-gray-500"><Mail size={16}/> {order.customerEmail}</div>
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-indigo-600' : 'bg-slate-900'} text-white shadow-2xl shadow-indigo-500/20`}>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm opacity-60"><span>Sous-total</span> <span>{(order.totalAmount - (order.shippingCost || 0)).toLocaleString()} F</span></div>
                            <div className="flex justify-between text-sm opacity-60"><span>Livraison</span> <span>{order.shippingCost?.toLocaleString() || 0} F</span></div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-widest">Total</span>
                                <span className="text-3xl font-black tracking-tighter">{order.totalAmount.toLocaleString()} F</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step = ({ icon, label, active }) => (
    <div className={`relative z-10 flex flex-col items-center gap-2 ${active ? 'text-indigo-500' : 'text-gray-400 opacity-30'}`}>
        <div className={`p-4 rounded-2xl ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-gray-200 dark:bg-white/10'}`}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{label}</span>
    </div>
);

export default OrderDetail;