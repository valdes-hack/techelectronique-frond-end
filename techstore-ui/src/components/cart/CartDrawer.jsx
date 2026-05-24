import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const CartDrawer = () => {
    const { cart, isOpen, setIsOpen, removeItem, updateQty } = useCart();
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
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{cart.items?.length || 0} Articles</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        {/* LISTE DES ARTICLES */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {cart.items?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                    <ShoppingBag size={80} strokeWidth={1} />
                                    <p className="mt-4 font-bold text-center uppercase tracking-widest text-xs">Ton sac est vide.</p>
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

                        {/* FOOTER */}
                        <div className="p-8 border-t border-gray-100 bg-white">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Sous-total</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">{formattedTotal}</span>
                            </div>

                            <Button 
                                onClick={handleGoToCart} 
                                disabled={cart.items?.length === 0}
                                className="w-full py-5 text-base font-black shadow-2xl shadow-indigo-200 uppercase tracking-widest rounded-[1.5rem]"
                            >
                                Voir le panier
                            </Button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;