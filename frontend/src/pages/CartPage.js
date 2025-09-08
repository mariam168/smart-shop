import React, { useCallback, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ImageOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const CartPage = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { cartItems, loadingCart, updateCartItemQuantity, removeFromCart, cartTotal, cartSubtotal } = useCart();

    const validCartItems = useMemo(() => cartItems.filter(item => item.product), [cartItems]);

    const getLocalizedText = useCallback((field) => {
        if (!field) return '';
        return field[language] || field.en || '';
    }, [language]);

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable', 'N/A');
        const currencyCode = 'EGP';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: currencyCode }).format(Number(price));
    }, [language, t]);

    const handleQuantityChange = (item, newQuantity) => {
        const numQuantity = Number(newQuantity);
        if (isNaN(numQuantity) || numQuantity < 1) return;

        const stock = item.stock;
        if (stock !== undefined && numQuantity > stock) {
            showToast(t('cartPage.notEnoughStockForUpdate', { quantity: stock }), 'warning');
            updateCartItemQuantity(item.product._id, stock, item.selectedVariant);
            return;
        }
        updateCartItemQuantity(item.product._id, numQuantity, item.selectedVariant);
    };

    const handleRemoveItem = (item) => {
        removeFromCart(item.product._id, item.selectedVariant);
    };

    const handleProceedToCheckout = () => navigate('/checkout');

    if (loadingCart && validCartItems.length === 0) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-white dark:bg-black">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!validCartItems || validCartItems.length === 0) {
        return (
            <div className="flex min-h-[90vh] flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
                <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light/10 dark:bg-primary/10 mb-6">
                        <ShoppingCart className="h-8 w-8 text-primary dark:text-primary-light" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('cartPage.cartEmpty')}</h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t('cartPage.cartEmptyDesc')}</p>
                    <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                        {t('cartPage.continueShopping')}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    const totalSavings = cartSubtotal - cartTotal;

    return (
        <section className="bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900 min-h-screen py-12 sm:py-16">
            <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
                        {t('cartPage.shoppingCart')}
                    </h1>
                </header>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {validCartItems.map(item => {
                                const hasDiscount = item.originalPrice && item.finalPrice < item.originalPrice;
                                return (
                                <div key={item.uniqueId || `${item.product._id}-${item.selectedVariant}`} className="flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <Link to={`/shop/${item.product._id}`} className="flex-shrink-0">
                                        <div className="h-32 w-32 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                            {item.image ? <img src={item.image} alt={getLocalizedText(item.name)} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center"><ImageOff className="text-zinc-400"/></div>}
                                        </div>
                                    </Link>
                                    <div className="flex flex-1 flex-col justify-between self-stretch gap-4">
                                        <div>
                                            <Link to={`/shop/${item.product._id}`} className="text-base font-bold text-zinc-800 hover:text-primary dark:text-white dark:hover:text-primary-light line-clamp-2">{getLocalizedText(item.name)}</Link>
                                            {item.variantDetailsText && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.variantDetailsText}</p>}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-l-md disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={16}/></button>
                                                <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item, e.target.value)} className="w-12 border-x border-zinc-200 bg-transparent text-center text-sm font-bold text-zinc-800 dark:border-zinc-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-r-md disabled:opacity-50" disabled={item.stock !== undefined && item.quantity >= item.stock}><Plus size={16}/></button>
                                            </div>
                                             <div className="text-right">
                                                <p className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-zinc-900 dark:text-white'}`}>{formatPrice(item.finalPrice * item.quantity)}</p>
                                                {hasDiscount && <p className="text-xs text-zinc-500 dark:text-zinc-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item)} className="p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 self-start sm:self-center"><Trash2 size={18} /></button>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{t('cartPage.orderSummary')}</h2>
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300"><p>{t('cartPage.subtotal')}</p><p>{formatPrice(cartSubtotal)}</p></div>
                                {totalSavings > 0 && <div className="flex justify-between text-sm text-green-600"><p>{t('cartPage.discounts')}</p><p>-{formatPrice(totalSavings)}</p></div>}
                                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300"><p>{t('cartPage.shipping')}</p><p className="font-medium text-green-600">{t('cartPage.freeShipping')}</p></div>
                                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                    <div className="flex items-center justify-between text-base font-bold text-zinc-900 dark:text-white"><p>{t('cartPage.cartTotal')}</p><p>{formatPrice(cartTotal)}</p></div>
                                </div>
                                <button onClick={handleProceedToCheckout} className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary-dark flex items-center justify-center gap-2">
                                    <span>{t('cartPage.proceedToCheckout')}</span><ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CartPage;