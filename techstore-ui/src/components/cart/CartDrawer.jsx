import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../../utils/imageUtils';
import Button from '../common/Button';

const CartDrawer = () => {
    const { cart, isOpen, setIsOpen, removeItem, updateQty } = useCart();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    // Redirection vers la page de finalisation (Checkout)
    const handleGoToCart = () => {
        setIsOpen(false); // Ferme le tiroir
        navigate('/checkout'); // Redirige vers la grande page panier/paiement
    };

    const formattedTotal = new Intl.NumberFormat('fr-FR').format(cart.totalAmount || 0) + " FCFA";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Fond flou noir */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200]"
                    />

                    {/* Le Panier Coulissant */}
                    <motion.aside 
                        initial={{ x: '100%' }} 
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed right-0 top-0 h-screen w-full max-w-md shadow-2xl z-[210] flex flex-col transition-colors duration-300 ${
                            isDark ? 'bg-[#111421] text-white border-l border-white/10' : 'bg-white text-slate-900 border-l border-gray-100'
                        }`}
                    >
                        {/* HEADER */}
                        <div className={`p-6 sm:p-8 border-b flex justify-between items-center ${
                            isDark ? 'border-white/5 bg-[#161926]/50' : 'border-gray-100 bg-white'
                        }`}>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter">Mon Panier<span className="text-indigo-500">.</span></h2>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">
                                    {cart.items?.length || 0} Article{cart.items?.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className={`p-2.5 rounded-full transition-all ${
                                    isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                                }`}
                                aria-label="Fermer"
                            >
                                <X size={18}/>
                            </button>
                        </div>

                        {/* LISTE DES ARTICLES */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
                            {!cart.items || cart.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-16">
                                    <ShoppingBag size={80} strokeWidth={1} className={isDark ? 'text-white' : 'text-slate-800'} />
                                    <p className="mt-4 font-black text-center uppercase tracking-widest text-xs">Votre panier est vide</p>
                                    <button
                                        onClick={() => { setIsOpen(false); navigate('/catalog'); }}
                                        className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors"
                                    >
                                        Parcourir la boutique
                                    </button>
                                </div>
                            ) : (
                                cart.items.map((item) => {
                                    const imgSource = item.imageUrl 
                                        ? getFullImageUrl(item.imageUrl) 
                                        : 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=200&q=80';

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex space-x-4 p-4 rounded-3xl border group transition-all ${
                                                isDark 
                                                    ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' 
                                                    : 'bg-gray-50/70 border-gray-100 hover:bg-white hover:shadow-xl'
                                            }`}
                                        >
                                            {/* Image Produit */}
                                            <div className={`w-20 h-20 rounded-2xl p-2 border flex items-center justify-center overflow-hidden shrink-0 ${
                                                isDark ? 'bg-black/30 border-white/5' : 'bg-white border-gray-100'
                                            }`}>
                                                <img 
                                                    src={imgSource} 
                                                    alt={item.productName} 
                                                    className="max-h-full max-w-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=200&q=80';
                                                    }}
                                                />
                                            </div>

                                            {/* Infos et Contrôles */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-sm truncate uppercase tracking-tight">
                                                        {item.productName}
                                                    </h4>
                                                    {item.variantAttributes && item.variantAttributes !== 'Standard' && (
                                                        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                                                            {item.variantAttributes}
                                                        </p>
                                                    )}
                                                    <p className="text-xs font-black text-indigo-500 mt-1">
                                                        {Number(item.unitPrice || 0).toLocaleString()} F
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                                                    <div className={`flex items-center space-x-2 border rounded-full px-2 py-0.5 shadow-sm ${
                                                        isDark ? 'bg-black/40 border-white/10' : 'bg-white border-gray-200'
                                                    }`}>
                                                        <button 
                                                            onClick={() => updateQty(item.id, item.quantity - 1)}
                                                            className="p-1 hover:opacity-70 rounded-full transition-opacity"
                                                            aria-label="Diminuer"
                                                        >
                                                            <Minus size={12}/>
                                                        </button>
                                                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQty(item.id, item.quantity + 1)}
                                                            className="p-1 hover:opacity-70 rounded-full transition-opacity"
                                                            aria-label="Augmenter"
                                                        >
                                                            <Plus size={12}/>
                                                        </button>
                                                    </div>

                                                    <button 
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1.5 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                                                        title="Supprimer"
                                                        aria-label="Supprimer"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className={`p-6 sm:p-8 border-t ${
                            isDark ? 'border-white/5 bg-[#161926]/50' : 'border-gray-100 bg-white'
                        }`}>
                            <div className="flex justify-between items-center mb-6 px-1">
                                <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Total</span>
                                <span className="text-2xl sm:text-3xl font-black text-indigo-500 tracking-tighter">{formattedTotal}</span>
                            </div>

                            <button 
                                onClick={handleGoToCart} 
                                disabled={!cart.items || cart.items.length === 0}
                                className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl ${
                                    !cart.items || cart.items.length === 0
                                        ? 'bg-gray-300 dark:bg-white/10 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 active:scale-98'
                                }`}
                            >
                                <span>Commander</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;