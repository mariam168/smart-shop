import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Loader2, Info, CheckCircle, XCircle, Eye, Package, ListOrdered } from 'lucide-react';

const MyOrdersPage = () => {
    const { t, language } = useLanguage();
    const { token, API_BASE_URL } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
            setError(null);
        } catch (err) {
            const msg = t('myOrdersPage.fetchError');
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: 'EGP'
        }).format(Number(price || 0));
    };

    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4"><div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-red-200 dark:border-red-800"><Info size={40} className="mx-auto mb-4 text-red-500" /><h3 className="text-xl font-bold mb-2">Error</h3><p className="text-red-600">{error}</p><button onClick={fetchMyOrders} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Try Again</button></div></div>); }

    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Package size={28} />
                        {t('myOrdersPage.title')}
                    </h1>
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('myOrdersPage.description')}</p>
                </header>

                {orders.length === 0 ? (
                     <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <ListOrdered size={48} className="mx-auto mb-4 text-zinc-400" />
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-white">{t('myOrdersPage.noOrdersFound')}</h3>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('myOrdersPage.noOrdersDescription')}</p>
                        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                            {t('cartPage.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.orderID')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.date')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.total')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.paid')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.delivered')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-zinc-500" title={order._id}>
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">
                                            {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-green-600">
                                            {formatPrice(order.totalPrice)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.isPaid ?
                                                <CheckCircle className="text-green-500 inline-block h-5 w-5" /> :
                                                <XCircle className="text-red-500 inline-block h-5 w-5" />
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.isDelivered ?
                                                <CheckCircle className="text-green-500 inline-block h-5 w-5" /> :
                                                <XCircle className="text-red-500 inline-block h-5 w-5" />
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link to={`/order/${order._id}`} className="inline-block rounded-full p-2 text-gray-600 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light">
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;