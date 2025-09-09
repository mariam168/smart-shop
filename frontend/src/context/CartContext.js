import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const { isAuthenticated, API_BASE_URL, token } = useAuth();
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setCartItems(JSON.parse(localStorage.getItem('cart')) || []);
            setLoadingCart(false);
            return;
        }
        setLoadingCart(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('CartContext: Failed to fetch cart:', error);
            setCartItems([]);
        } finally {
            setLoadingCart(false);
        }
    }, [isAuthenticated, API_BASE_URL, token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);
    
    const syncCart = useCallback(async (updatedCart) => {
        setCartItems(updatedCart);
        if (isAuthenticated) {
            try {
                const itemsToSync = updatedCart.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.originalPrice,
                    stock: item.stock,
                    selectedVariant: item.selectedVariant,
                    image: item.image,
                    variantDetailsText: item.variantDetailsText,
                    uniqueId: item.uniqueId
                }));
                const { data } = await axios.post(`${API_BASE_URL}/api/cart/sync`, 
                    { items: itemsToSync }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCartItems(data.items);
            } catch (error) {
                console.error('Failed to sync cart with DB:', error);
                showToast(t('cart.syncError'), 'error');
            }
        } else {
            localStorage.setItem('cart', JSON.stringify(updatedCart));
        }
    }, [isAuthenticated, token, API_BASE_URL, showToast, t]);

    const addToCart = async (product, quantity = 1, selectedOptionId = null) => {
        if (!isAuthenticated) { 
            showToast(t('cart.loginRequired'), 'info'); 
            navigate('/login'); 
            return; 
        }
        if (!product || !product._id) {
            showToast(t('cart.productDataIncomplete'), 'error');
            return;
        }
        setLoadingCart(true);
        try {
            const variant = selectedOptionId && product.variations
                ? product.variations.flatMap(v => v.options).find(o => o._id === selectedOptionId)
                : null;

            const originalPrice = variant?.price ?? product.basePrice;
            const finalImage = variant?.image || product.mainImage;
            const finalStock = variant?.stock;
            const uniqueId = `${product._id}-${selectedOptionId || 'default'}`;

            const updatedCart = [...cartItems];
            const existingItemIndex = updatedCart.findIndex(item => item.uniqueId === uniqueId);
            
            if (existingItemIndex > -1) {
                updatedCart[existingItemIndex].quantity += quantity;
            } else {
                 const variantDetailsText = variant 
                    ? product.variations.map(v => {
                        const opt = v.options.find(o => o._id === selectedOptionId);
                        return opt ? `${v.name_en}: ${opt.name_en}` : null;
                    }).filter(Boolean).join(', ')
                    : '';
                updatedCart.push({
                    product: product,
                    name: product.name,
                    originalPrice: originalPrice,
                    finalPrice: originalPrice,
                    quantity,
                    image: finalImage,
                    stock: finalStock,
                    selectedVariant: selectedOptionId,
                    uniqueId,
                    variantDetailsText
                });
            }
            await syncCart(updatedCart);
            showToast(t('cart.productAddedSuccess'), 'success');
        } catch (error) {
            showToast(error.response?.data?.message || t('cart.addError'), 'error');
        } finally {
            setLoadingCart(false);
        }
    };
    
    const updateCartItemQuantity = async (productId, quantity, selectedVariantId = null) => {
        const uniqueId = `${productId}-${selectedVariantId || 'default'}`;
        const updatedCart = cartItems.map(item =>
            item.uniqueId === uniqueId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0);
        await syncCart(updatedCart);
    };
    
    const removeFromCart = async (productId, selectedVariantId = null) => {
        await updateCartItemQuantity(productId, 0, selectedVariantId);
        showToast(t('cart.itemRemoved'), 'info');
    };

    const clearCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setCartItems([]);
        try {
            await axios.delete(`${API_BASE_URL}/api/cart/clear`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Failed to clear cart on server:", error);
            showToast(t('cart.clearError'), 'error');
            await fetchCart();
        }
    }, [API_BASE_URL, token, showToast, t, isAuthenticated, fetchCart]);

    const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + ((item.finalPrice || 0) * item.quantity), 0), [cartItems]);
    const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + ((item.originalPrice || 0) * item.quantity), 0), [cartItems]);
    const getCartCount = useMemo(() => cartItems.reduce((total, item) => total + (item.quantity || 0), 0), [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateCartItemQuantity, removeFromCart, clearCart, loadingCart, getCartCount, cartTotal, cartSubtotal, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};