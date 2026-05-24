import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    const [theme] = useState(() => localStorage.getItem('admin_hub_theme') || 'light');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        label: 'Livraison TechStore', street: '', city: 'Douala', region: 'Littoral'
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
        e.preventDefault();
        setLoading(true);
        try {
            const sessionId = localStorage.getItem('techstore_session_id');
            const orderPayload = { 
                guestName: formData.firstName, guestLastName: formData.lastName,
                guestEmail: formData.email, guestPhone: formData.phone,
                shippingType: deliveryMode === 'delivery' ? 'LIVRAISON' : 'RETRAIT',
                shippingZoneId: 1, sessionId: sessionId, paymentMethod: "CASH_ON_DELIVERY" 
            };

            const orderRes = await OrderService.createOrder(orderPayload);

            if (orderRes.status === 'success') {
                setIsSuccess(true);
                const orderNum = orderRes.data.orderNumber;
                setTimeout(() => {
                    refreshCart();
                    sendWhatsAppInvoice(orderNum);
                }, 2000);
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.message || "Erreur" });
            setLoading(false);
        }
    };

    if (isSuccess) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-500 p-6 rounded-full mb-8 shadow-2xl">
                <CheckCircle size={80} className="text-white" />
            </motion.div>
            <h2 className="text-5xl font-black italic tracking-tighter">SUCCÈS !</h2>
            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs">Redirection vers WhatsApp...</p>
        </div>
    );

    return (
        <div className={`min-h-screen pt-28 pb-20 px-4 transition-all ${theme === 'dark' ? 'bg-[#0b0e14] text-white' : 'bg-[#F5F5F7] text-slate-900'}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* --- PANIER DÉTAILLÉ (GAUCHE) --- */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex justify-between items-end">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">Votre Sac.</h3>
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase italic">Check-out express</span>
                    </div>

                    <div className="space-y-4">
                        {cart.items?.map(item => (
                            <div key={item.id} className={`p-6 rounded-[2.5rem] border transition-all ${theme === 'dark' ? 'bg-[#161926] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex space-x-6">
                                    <div className="w-24 h-24 bg-slate-50 rounded-3xl p-2 flex items-center justify-center">
                                        <img src={item.imageUrl} className="max-h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <h4 className="font-black text-sm uppercase tracking-tighter truncate max-w-[180px]">{item.productName}</h4>
                                            <button onClick={() => removeItem(item.id)} className="text-red-500/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                        <p className="text-[10px] font-bold text-green-500 uppercase">En Stock ✔</p>
                                        
                                        <div className="flex justify-between items-center pt-2">
                                            {/* CONTRÔLE QUANTITÉ ✨ */}
                                            <div className="flex items-center space-x-4 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-100 dark:border-white/5">
                                                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="hover:text-indigo-600 transition-colors"><Minus size={14} strokeWidth={4}/></button>
                                                <span className="text-xs font-black">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="hover:text-indigo-600 transition-colors"><Plus size={14} strokeWidth={4}/></button>
                                            </div>
                                            <span className="font-black text-indigo-600 tracking-tighter">{(item.unitPrice * item.quantity).toLocaleString()} F</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- APERÇU FACTURE DYNAMIQUE ✨ --- */}
                    <div className={`p-8 rounded-[3rem] border-2 border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center space-x-3 mb-6 opacity-30 uppercase font-black text-[10px] tracking-[0.2em]">
                            <FileText size={16}/> <span>Aperçu de la Facture</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="opacity-40">Sous-total articles</span>
                                <span>{cart.totalAmount?.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="opacity-40">Taxes (TVA 19.2%)</span>
                                <span>Incluses</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight border-b border-slate-100 pb-4">
                                <span className="opacity-40">Frais de livraison</span>
                                <span className="text-green-500">{deliveryMode === 'delivery' ? 'Calculé au départ' : 'Gratuit'}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-4">
                                <span className="text-sm font-black italic tracking-tighter">TOTAL NET</span>
                                <span className="text-5xl font-black text-indigo-600 tracking-tighter">{cart.totalAmount?.toLocaleString()} <span className="text-sm">F</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FORMULAIRE (DROITE) --- */}
                <div className="lg:col-span-7">
                    <div className={`p-8 md:p-14 rounded-[3.5rem] shadow-2xl border transition-all sticky top-28 ${theme === 'dark' ? 'bg-[#161926] border-white/5 shadow-black' : 'bg-white border-transparent'}`}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10">
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase underline decoration-indigo-500 underline-offset-8">Identité.</h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Prénom" name="firstName" value={formData.firstName} onChange={handleInputChange} theme={theme}/>
                                        <Input label="Nom" name="lastName" value={formData.lastName} onChange={handleInputChange} theme={theme}/>
                                    </div>
                                    <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} theme={theme} placeholder="Ex: valdes@gmail.com"/>
                                    <Input label="WhatsApp" name="phone" value={formData.phone} onChange={handleInputChange} theme={theme} placeholder="6xx xxx xxx"/>
                                    <Button onClick={()=>setStep(2)} className="w-full py-6 text-xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-100">Étape suivante <ChevronLeft className="rotate-180 ml-2"/></Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-8">
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase underline decoration-indigo-500 underline-offset-8">Mode.</h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <button onClick={() => setDeliveryMode('delivery')} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center ${deliveryMode === 'delivery' ? 'border-indigo-600 bg-indigo-500/10' : 'border-slate-100 opacity-40 grayscale'}`}>
                                            <Truck size={40} className="text-indigo-600"/><span className="font-black text-[10px] mt-4 uppercase">Livraison</span>
                                        </button>
                                        <button onClick={() => setDeliveryMode('pickup')} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center ${deliveryMode === 'pickup' ? 'border-indigo-600 bg-indigo-500/10' : 'border-slate-100 opacity-40 grayscale'}`}>
                                            <Store size={40} className="text-indigo-600"/><span className="font-black text-[10px] mt-4 uppercase">Boutique</span>
                                        </button>
                                    </div>

                                    {deliveryMode === 'delivery' && (
                                        <div className="space-y-6 pt-6 animate-in fade-in zoom-in-95">
                                            <div className="flex justify-between items-center px-4">
                                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest leading-none flex items-center">
                                                    <ShieldCheck size={14} className="mr-2"/> Sécurité GPS activée
                                                </span>
                                                <button onClick={handleGeoLocate} className="text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-full flex items-center shadow-lg hover:scale-105 transition-all">
                                                    {isLocating ? <Loader2 className="animate-spin mr-2" size={12}/> : <Navigation size={12} className="mr-2"/>} Me localiser
                                                </button>
                                            </div>
                                            <Input placeholder="Rue, Quartier..." value={formData.street} name="street" onChange={handleInputChange} theme={theme}/>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Ville" value={formData.city} readOnly={true} theme={theme}/>
                                                <Input label="Région" value={formData.region} readOnly={true} theme={theme}/>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex space-x-4">
                                        <Button onClick={()=>setStep(1)} className="w-1/4 py-6 bg-slate-100 !text-slate-900 shadow-none hover:bg-slate-200 uppercase font-black text-[10px]"><ChevronLeft size={16}/></Button>
                                        <Button onClick={()=>setStep(3)} className="w-3/4 py-6 text-lg font-black uppercase tracking-widest shadow-2xl shadow-indigo-100">Dernière étape</Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10 text-center">
                                    <div className="space-y-2">
                                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Confirmer.</h2>
                                        <p className="opacity-50 text-xs font-bold uppercase tracking-widest">Une facture sera générée pour {formData.firstName}.</p>
                                    </div>

                                    <div className={`p-8 rounded-[3rem] border-2 border-indigo-600/20 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} space-y-6 text-left shadow-inner`}>
                                        <div className="flex justify-between border-b border-indigo-600/10 pb-4">
                                            <span className="text-[10px] font-black opacity-40 uppercase">Mode</span>
                                            <span className="font-black italic text-indigo-600 uppercase text-xs">{deliveryMode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-black opacity-40 uppercase">Articles</span>
                                            <span className="font-black italic text-xs">{cart.items?.length} Sélectionnés</span>
                                        </div>
                                        <div className="flex justify-between items-baseline pt-4 border-t border-indigo-600/10">
                                            <span className="text-sm font-black italic tracking-tighter">À PAYER :</span>
                                            <span className="text-4xl font-black text-indigo-500 tracking-tighter leading-none">{cart.totalAmount?.toLocaleString()} F</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button onClick={()=>setStep(2)} className="w-1/4 py-6 bg-slate-100 !text-slate-900 shadow-none hover:bg-slate-200"><ChevronLeft size={20}/></Button>
                                        <Button loading={loading} onClick={handleSubmit} className="w-3/4 py-6 text-lg font-black uppercase shadow-2xl shadow-green-500/30 tracking-widest bg-green-600 hover:bg-green-700 flex items-center justify-center">
                                            <MessageCircle size={24} className="mr-3" fill="white"/> <span>COMMANDER SUR WHATSAPP</span>
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