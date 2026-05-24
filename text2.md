import React, { createContext, useState, useContext, useEffect } from 'react';
import CartService from '../services/cart.service';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(() => {
        let id = localStorage.getItem('techstore_session_id');
        if (!id) {
            id = 'sess-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('techstore_session_id', id);
        }
        return id;
    });

    const refreshCart = async () => {
        try {
            const res = await CartService.getCart(sessionId);
            if (res && res.status === 'success') {
                setCart(res.data);
            }
        } catch (e) { console.error("Erreur de synchro", e); }
    };

    useEffect(() => { refreshCart(); }, [sessionId]);

    const addToCart = async (productId, variantId = null, quantity = 1) => {
        try {
            const res = await CartService.addToCart({ productId, variantId, quantity }, sessionId);
            if (res.status === 'success') {
                await refreshCart(); // On attend la synchro ✨
                setIsOpen(true);
            }
        } catch (e) { alert("Plus de stock !"); }
    };

    // LOGIQUE DE QUANTITÉ CORRIGÉE ✨
    const updateQty = async (itemId, newQty) => {
        if (newQty < 1) {
            await removeItem(itemId);
            return;
        }
        try {
            // On attend que le serveur dise OK
            const res = await CartService.updateQuantity(itemId, newQty, sessionId);
            if (res.status === 'success') {
                await refreshCart(); // On recharge les prix et le total
            }
        } catch (e) {
            console.error("Erreur de mise à jour quantité", e);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const res = await CartService.removeItem(itemId, sessionId);
            if (res.status === 'success') {
                await refreshCart();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeItem, updateQty, isOpen, setIsOpen, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

import React, { useState, useEffect } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/order.service';
import AddressService from '../../services/address.service';
import Button from '../common/Button';

const CartDrawer = () => {
    // 1. Accès aux cerveaux (Panier et Auth)
    const { cart, isOpen, setIsOpen, removeItem, updateQty, refreshCart } = useCart();
    const { isAuthenticated } = useAuth();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [userAddress, setUserAddress] = useState(null);
    const navigate = useNavigate();

    // Charger l'adresse par défaut si on est connecté et que le panier est ouvert
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            const loadAddr = async () => {
                try {
                    const res = await AddressService.getMyAddresses();
                    if (res && res.data && res.data.length > 0) {
                        setUserAddress(res.data[0]); 
                    }
                } catch (e) { console.error("Adresse introuvable."); }
            };
            loadAddr();
        }
    }, [isOpen, isAuthenticated]);

    // --- LOGIQUE DE VALIDATION --- ✨
    const handleCheckout = async () => {
        if (!isAuthenticated) {
            // alert("Bébé, connecte-toi d'abord pour passer commande ! 😊");
            setIsOpen(false);
            navigate('/login');
            return;
        }

        if (!userAddress) {
            alert("Il nous faut une adresse à Bafoussam (ou ailleurs) pour te livrer ! 🏠");
            setIsOpen(false);
            navigate('/profile');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                addressId: userAddress.id,
                paymentMethod: "CASH_ON_DELIVERY"
            };

            const res = await OrderService.createOrder(payload);

            if (res.status === 'success' || res.code === 201) {
                alert("BRAVO ! Ta commande est en route. 🥂🚀");
                setIsOpen(false);
                await refreshCart(); // Vide le sac après l'achat
                navigate('/profile');
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors de la validation.";
            alert("ECHEC : " + msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const formattedTotal = new Intl.NumberFormat('fr-FR').format(cart.totalAmount || 0) + " FCFA";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Fond flou noir */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
                    />

                    {/* Le Panier Coulissant */}
                    <motion.aside 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[210] flex flex-col"
                    >
                        {/* HEADER */}
                        <div className="p-8 border-b flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter text-slate-900">Mon Panier.</h2>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{cart.items?.length || 0} Sélectionnés</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        {/* LISTE DES ARTICLES - DYNAMIQUE ✨ */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {cart.items?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                    <ShoppingBag size={80} strokeWidth={1} />
                                    <p className="mt-4 font-bold text-center uppercase tracking-widest text-xs">Ton sac est vide, Valdes.</p>
                                </div>
                            ) : (
                                cart.items.map((item) => (
                                    <div key={item.id} className="flex space-x-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl">
                                        {/* Image Produit */}
                                        <div className="w-20 h-20 bg-white rounded-2xl p-2 border border-gray-100 flex items-center justify-center overflow-hidden">
                                            <img src={item.imageUrl || 'https://placehold.co/100'} alt="product" className="max-h-full object-contain" />
                                        </div>

                                        {/* Infos et Contrôles */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-800 truncate uppercase tracking-tight">{item.productName}</h4>
                                            <p className="text-xs font-black text-indigo-500 mt-0.5">{item.unitPrice?.toLocaleString()} F</p>
                                            
                                            <div className="flex items-center justify-between mt-3">
                                                {/* INCRÉMENT / DÉCRÉMENT ✨ */}
                                                <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                                                    <button 
                                                        onClick={() => updateQty(item.id, item.quantity - 1)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                                                    >
                                                        <Minus size={14}/>
                                                    </button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                                                    >
                                                        <Plus size={14}/>
                                                    </button>
                                                </div>

                                                {/* SUPPRIMER ✨ */}
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* FOOTER - ADRESSE ET PAIEMENT */}
                        <div className="p-8 border-t border-gray-100 bg-white">
                            {isAuthenticated ? (
                                userAddress ? (
                                    <div className="mb-6 flex items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-bottom-2">
                                        <MapPin className="text-indigo-600 mr-3" size={20} />
                                        <div className="overflow-hidden">
                                            <p className="text-[9px] font-black uppercase text-indigo-400">Expédier vers : {userAddress.label}</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{userAddress.street}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 flex items-center p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                                        <AlertCircle size={18} className="mr-2"/>
                                        <p className="text-[10px] font-bold uppercase">Aucune adresse trouvée !</p>
                                    </div>
                                )
                            ) : (
                                <div className="mb-6 p-4 bg-slate-100 rounded-2xl text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connectez-vous pour acheter</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-8 px-2">
                                <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Total</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">{formattedTotal}</span>
                            </div>

                            <Button 
                                onClick={handleCheckout} 
                                loading={isProcessing}
                                disabled={cart.items?.length === 0}
                                className="w-full py-5 text-base font-black shadow-2xl shadow-indigo-200 uppercase tracking-widest rounded-[1.5rem]"
                            >
                                {isProcessing ? "Création de commande..." : "Valider mes achats"}
                            </Button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;