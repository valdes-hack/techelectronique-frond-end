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

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
    }
    return context;
};