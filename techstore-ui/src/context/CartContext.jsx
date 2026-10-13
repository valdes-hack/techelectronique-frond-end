import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import CartService from '../services/cart.service';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    // Initialise avec le cache local pour affichage instantané
    const [cart, setCart] = useState(() => {
        try {
            const cached = localStorage.getItem('techstore_cart_cache');
            return cached ? JSON.parse(cached) : { items: [], totalAmount: 0, totalItems: 0 };
        } catch {
            return { items: [], totalAmount: 0, totalItems: 0 };
        }
    });

    const [isOpen, setIsOpen] = useState(false);

    const [sessionId] = useState(() => {
        let id = localStorage.getItem('techstore_session_id');
        if (!id) {
            id = 'sess-' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('techstore_session_id', id);
        }
        return id;
    });

    // Sauvegarde en cache local à chaque mise à jour du panier
    const updateLocalCart = (newCart) => {
        setCart(newCart);
        try {
            localStorage.setItem('techstore_cart_cache', JSON.stringify(newCart));
        } catch (e) {
            console.error("Erreur cache panier", e);
        }
    };

    const refreshCart = useCallback(async () => {
        try {
            const res = await CartService.getCart(sessionId);
            if (res && res.status === 'success' && res.data) {
                updateLocalCart(res.data);
            }
        } catch (e) {
            console.error("Erreur de synchro panier", e);
        }
    }, [sessionId]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = async (productId, variantId = null, quantity = 1) => {
        try {
            const res = await CartService.addToCart({ productId, variantId, quantity }, sessionId);
            if (res && res.status === 'success') {
                if (res.data) {
                    updateLocalCart(res.data);
                } else {
                    await refreshCart();
                }
                setIsOpen(true);
                return { success: true };
            }
            await refreshCart();
            setIsOpen(true);
            return { success: true };
        } catch (e) {
            const msg = e.response?.data?.message || "Stock insuffisant ou indisponible.";
            console.warn("Erreur panier:", msg);
            alert(msg);
            return { success: false, error: msg };
        }
    };

    const updateQty = async (itemId, newQty) => {
        if (newQty < 1) {
            await removeItem(itemId);
            return;
        }

        // Mise à jour optimiste dans l'UI immédiatement pour fluidité max
        setCart(prev => {
            const updatedItems = (prev.items || []).map(item => {
                if (item.id === itemId) {
                    return { ...item, quantity: newQty, subTotal: item.unitPrice * newQty };
                }
                return item;
            });
            const newTotal = updatedItems.reduce((acc, it) => acc + (it.subTotal || (it.unitPrice * it.quantity)), 0);
            return { ...prev, items: updatedItems, totalAmount: newTotal };
        });

        try {
            const res = await CartService.updateQuantity(itemId, newQty, sessionId);
            if (res && res.status === 'success' && res.data) {
                updateLocalCart(res.data);
            } else {
                await refreshCart();
            }
        } catch (e) {
            console.error("Erreur de mise à jour quantité", e);
            await refreshCart(); // Rollback en cas d'erreur
        }
    };

    const removeItem = async (itemId) => {
        // Suppression optimiste immédiate
        setCart(prev => {
            const updatedItems = (prev.items || []).filter(item => item.id !== itemId);
            const newTotal = updatedItems.reduce((acc, it) => acc + (it.subTotal || (it.unitPrice * it.quantity)), 0);
            return { ...prev, items: updatedItems, totalAmount: newTotal, totalItems: updatedItems.length };
        });

        try {
            const res = await CartService.removeItem(itemId, sessionId);
            if (res && res.status === 'success' && res.data) {
                updateLocalCart(res.data);
            } else {
                await refreshCart();
            }
        } catch (e) {
            console.error(e);
            await refreshCart();
        }
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