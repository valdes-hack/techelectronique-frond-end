import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
    CheckCircle, Loader2, ShoppingBag, Store, Truck, Navigation, 
    MessageCircle, ChevronLeft, AlertCircle, Plus, Minus, Trash2, 
    FileText, Printer, ShieldCheck
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OrderService from '../../services/order.service';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
    const { cart, refreshCart, removeItem, updateQty } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState('delivery');
    const [step, setStep] = useState(1);
    const { theme, toggleTheme } = useTheme();
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        label: 'Livraison PEOC', street: '', city: 'Douala', region: 'Littoral'
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({ 
                ...prev, 
                firstName: user.firstName || '', 
                lastName: user.lastName || '', 
                email: user.email || '', 
                phone: user.phone || '' 
            }));
        }
    }, [isAuthenticated, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGeoLocate = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                const addr = data.address;
                setFormData(prev => ({ 
                    ...prev, 
                    street: addr.road || addr.suburb || "Position détectée", 
                    city: addr.city || addr.town || "Douala",
                    region: addr.state || "Littoral"
                }));
            } catch (e) { console.error(e); }
            finally { setIsLocating(false); }
        });
    };

    // --- GÉNÉRATEUR DE MESSAGE WHATSAPP DÉTAILLÉ --- ✨
    const sendWhatsAppInvoice = (orderNumber) => {
        const phoneNumber = "237686669222";
        let message = `*🧾 FACTURE COMMANDE : #${orderNumber}*\n`;
        message += `------------------------------------------\n`;
        message += `*CLIENT :* ${formData.firstName.toUpperCase()} ${formData.lastName.toUpperCase()}\n`;
        message += `*TEL :* ${formData.phone}\n`;
        message += `*LIVRAISON :* ${deliveryMode === 'delivery' ? 'À domicile ('+formData.street+')' : 'Retrait boutique'}\n`;
        message += `------------------------------------------\n\n`;
        message += `*DÉTAILS DES ARTICLES :*\n`;
        
        cart.items.forEach((item, index) => {
            message += `${index + 1}. ${item.productName}\n`;
            message += `   _Qté : ${item.quantity} x ${item.unitPrice.toLocaleString()} F_\n`;
            message += `   *Sous-total : ${(item.unitPrice * item.quantity).toLocaleString()} F*\n\n`;
        });

        message += `------------------------------------------\n`;
        message += `*TOTAL GÉNÉRAL : ${cart.totalAmount?.toLocaleString()} FCFA*\n`;
        message += `------------------------------------------\n\n`;
        message += `Je confirme mon intérêt pour cet achat. Merci ! 🍎`;

        window.location.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setStatusMsg({ type: '', text: '' });
        try {
            const sessionId = localStorage.getItem('techstore_session_id');
            const orderPayload = { 
                guestName: formData.firstName, 
                guestLastName: formData.lastName,
                guestEmail: formData.email, 
                guestPhone: formData.phone,
                shippingType: deliveryMode === 'delivery' ? 'LIVRAISON' : 'RETRAIT',
                shippingZoneId: 1, 
                sessionId: sessionId, 
                paymentMethod: "CASH_ON_DELIVERY",
                street: formData.street,
                city: formData.city,
                region: formData.region
            };

            const orderRes = await OrderService.createOrder(orderPayload);

            if (orderRes && (orderRes.status === 'success' || orderRes.code === 201 || orderRes.data)) {
                setIsSuccess(true);
                const orderNum = orderRes.data?.orderNumber || (orderRes.data?.id ? orderRes.data.id.toString() : 'CMD');
                setTimeout(() => {
                    refreshCart();
                    sendWhatsAppInvoice(orderNum);
                }, 1500);
            } else {
                setStatusMsg({ type: 'error', text: orderRes?.message || "Erreur lors de la commande" });
            }
        } catch (err) {
            console.error("Erreur commande:", err);
            setStatusMsg({ 
                type: 'error', 
                text: err.response?.data?.message || err.message || "Erreur de connexion au serveur. Vérifiez vos informations et réessayez." 
            });
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) return (
        <div className={`min-h-screen flex flex-col items-center justify-center text-center px-4 ${theme === 'dark' ? 'bg-[#0b0e14] text-white' : 'bg-white text-slate-900'}`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500 p-5 sm:p-6 rounded-full mb-6 shadow-2xl">
                <CheckCircle size={64} className="text-white" />
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase">Commande Validée !</h2>
            <p className="text-slate-400 mt-3 font-bold uppercase tracking-widest text-xs">Redirection vers WhatsApp pour finaliser l'échange...</p>
        </div>
    );

    return (
        <div className={`min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-20 px-3 sm:px-6 transition-all ${theme === 'dark' ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                
                {/* --- PANIER DÉTAILLÉ (GAUCHE) --- */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase">Votre Panier.</h3>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Commande express</span>
                    </div>

                    <div className="space-y-3">
                        {cart.items?.map(item => (
                            <div key={item.id} className={`p-4 rounded-2xl sm:rounded-3xl border transition-all ${theme === 'dark' ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-white/5 rounded-2xl p-2 flex items-center justify-center shrink-0">
                                        <img src={item.imageUrl} className="max-h-full max-w-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight truncate">{item.productName}</h4>
                                            <button onClick={() => removeItem(item.id)} className="text-red-400/50 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16}/></button>
                                        </div>
                                        <p className="text-[9px] font-bold text-emerald-500 uppercase">En Stock ✔</p>
                                        
                                        <div className="flex justify-between items-center pt-1">
                                            {/* CONTRÔLE QUANTITÉ ✨ */}
                                            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                                                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="hover:text-indigo-600 transition-colors"><Minus size={12} strokeWidth={3}/></button>
                                                <span className="text-xs font-black">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="hover:text-indigo-600 transition-colors"><Plus size={12} strokeWidth={3}/></button>
                                            </div>
                                            <span className="font-black text-xs sm:text-sm text-indigo-600 tracking-tight">{(item.unitPrice * item.quantity).toLocaleString()} F</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- APERÇU FACTURE DYNAMIQUE ✨ --- */}
                    <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center space-x-2.5 mb-5 opacity-40 uppercase font-black text-[10px] tracking-[0.2em]">
                            <FileText size={15}/> <span>Récapitulatif de Commande</span>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="opacity-50">Articles ({cart.items?.length || 0})</span>
                                <span>{cart.totalAmount?.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="opacity-50">Taxes incluses</span>
                                <span>TVA comprise</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight border-b border-gray-200 dark:border-white/5 pb-3">
                                <span className="opacity-50">Livraison</span>
                                <span className="text-emerald-500">{deliveryMode === 'delivery' ? 'À convenir' : 'Retrait gratuit'}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-3">
                                <span className="text-xs sm:text-sm font-black italic tracking-tighter uppercase">Total Net</span>
                                <span className="text-3xl sm:text-4xl font-black text-indigo-500 tracking-tighter">{cart.totalAmount?.toLocaleString()} <span className="text-sm">FCFA</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FORMULAIRE (DROITE) --- */}
                <div className="lg:col-span-7">
                    <div className={`p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl border transition-all sticky top-24 ${theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black' : 'bg-white border-slate-100'}`}>
                        
                        {/* MESSAGE D'ERREUR */}
                        {statusMsg.text && (
                            <div className="mb-6 p-4 rounded-xl font-bold text-xs flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{statusMsg.text}</span>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Étape 1 sur 3</span>
                                        <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase mt-1">Vos Coordonnées.</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input label="Prénom" name="firstName" value={formData.firstName} onChange={handleInputChange} theme={theme} placeholder="Ex: Valdès"/>
                                        <Input label="Nom" name="lastName" value={formData.lastName} onChange={handleInputChange} theme={theme} placeholder="Ex: Kamga"/>
                                    </div>
                                    <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} theme={theme} placeholder="Ex: client@gmail.com"/>
                                    <Input label="Numéro WhatsApp / Téléphone" name="phone" value={formData.phone} onChange={handleInputChange} theme={theme} placeholder="Ex: 686 669 222"/>
                                    <Button onClick={()=>setStep(2)} className="w-full py-4 sm:py-5 text-sm sm:text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Étape suivante <ChevronLeft className="rotate-180 ml-2"/></Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Étape 2 sur 3</span>
                                        <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase mt-1">Mode de Réception.</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setDeliveryMode('delivery')} className={`p-4 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center ${deliveryMode === 'delivery' ? 'border-indigo-600 bg-indigo-500/10' : 'border-gray-200 dark:border-white/5 opacity-60'}`}>
                                            <Truck size={32} className="text-indigo-600"/><span className="font-black text-[11px] mt-2 uppercase">Livraison</span>
                                        </button>
                                        <button onClick={() => setDeliveryMode('pickup')} className={`p-4 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center ${deliveryMode === 'pickup' ? 'border-indigo-600 bg-indigo-500/10' : 'border-gray-200 dark:border-white/5 opacity-60'}`}>
                                            <Store size={32} className="text-indigo-600"/><span className="font-black text-[11px] mt-2 uppercase">Retrait sur Place</span>
                                        </button>
                                    </div>

                                    {deliveryMode === 'delivery' && (
                                        <div className="space-y-4 pt-2">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center">
                                                    <ShieldCheck size={14} className="mr-1.5"/> Localisation de livraison
                                                </span>
                                                <button onClick={handleGeoLocate} className="text-[10px] font-black text-white bg-indigo-600 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 w-fit hover:bg-indigo-700 transition-all">
                                                    {isLocating ? <Loader2 className="animate-spin" size={12}/> : <Navigation size={12}/>} Me localiser
                                                </button>
                                            </div>
                                            <Input label="Rue / Quartier / Repère" placeholder="Ex: Quartier Djeleng, Face Pharmacie" value={formData.street} name="street" onChange={handleInputChange} theme={theme}/>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Input label="Ville" value={formData.city} readOnly={true} theme={theme}/>
                                                <Input label="Région" value={formData.region} readOnly={true} theme={theme}/>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button onClick={()=>setStep(1)} className="w-1/4 py-4 bg-slate-100 !text-slate-900 shadow-none hover:bg-slate-200 uppercase font-black text-xs"><ChevronLeft size={16}/></Button>
                                        <Button onClick={()=>setStep(3)} className="w-3/4 py-4 sm:py-5 text-sm sm:text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Dernière étape</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6 text-center">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Étape 3 sur 3</span>
                                        <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase leading-none">Confirmer la Commande.</h2>
                                        <p className="opacity-50 text-xs font-bold uppercase tracking-widest pt-1">Une facture WhatsApp sera générée pour {formData.firstName || 'le client'}.</p>
                                    </div>

                                    <div className={`p-5 sm:p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} space-y-4 text-left shadow-inner`}>
                                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-3">
                                            <span className="text-[10px] font-black opacity-50 uppercase">Mode</span>
                                            <span className="font-black italic text-indigo-500 uppercase text-xs">{deliveryMode === 'delivery' ? 'Livraison' : 'Retrait Boutique'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-3">
                                            <span className="text-[10px] font-black opacity-50 uppercase">Articles</span>
                                            <span className="font-black italic text-xs">{cart.items?.length} Sélectionnés</span>
                                        </div>
                                        <div className="flex justify-between items-baseline pt-2">
                                            <span className="text-xs font-black italic tracking-tighter uppercase">Montant Total :</span>
                                            <span className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tight leading-none">{cart.totalAmount?.toLocaleString()} FCFA</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={()=>setStep(2)} className="w-1/4 py-4 bg-slate-100 !text-slate-900 shadow-none hover:bg-slate-200"><ChevronLeft size={20}/></Button>
                                        <Button disabled={loading} loading={loading} onClick={handleSubmit} className="w-3/4 py-4 sm:py-5 text-xs sm:text-sm font-black uppercase shadow-xl shadow-emerald-500/20 tracking-wider bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center">
                                            <MessageCircle size={20} className="mr-2" fill="white"/> <span>COMMANDER SUR WHATSAPP</span>
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;