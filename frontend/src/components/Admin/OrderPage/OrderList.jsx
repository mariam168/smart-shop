import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../../services/orderService';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Loader2, Info, CheckCircle, XCircle, Eye } from 'lucide-react';

const OrderList = () => {
    const { t, language } = useLanguage();
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async (authToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getAllOrders(authToken);
            setOrders(response.data);
        } catch (err) {
            const msg = err.response?.data?.message || t('adminOrdersPage.errorFetchingOrdersToast');
            setError(msg);
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (token) {
            fetchOrders(token);
        } else {
            setLoading(false);
        }
    }, [token, fetchOrders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode')
        }).format(Number(price || 0));
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                    <Info size={40} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                    <button onClick={() => fetchOrders(token)} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg">
            <header className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('adminOrdersPage.allOrders')}</h2>
            </header>
            
            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-left">ID</th>
                            <th className="px-4 py-3 font-semibold text-left">{t('adminOrdersPage.user')}</th>
                            <th className="px-4 py-3 font-semibold text-left">{t('adminOrdersPage.date')}</th>
                            <th className="px-4 py-3 font-semibold text-left">{t('adminOrdersPage.total')}</th>
                            <th className="px-4 py-3 font-semibold text-center">{t('adminOrdersPage.paid')}</th>
                            <th className="px-4 py-3 font-semibold text-center">{t('adminOrdersPage.delivered')}</th>
                            <th className="px-4 py-3 font-semibold text-center">{t('adminOrdersPage.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <td className="px-4 py-3 font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="px-4 py-3 font-medium">{order.user?.name || 'N/A'}</td>
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-semibold text-green-600">{formatPrice(order.totalPrice)}</td>
                                <td className="px-4 py-3 text-center">
                                    {order.isPaid ? <CheckCircle className="text-green-500 inline-block h-5 w-5" /> : <XCircle className="text-red-500 inline-block h-5 w-5" />}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {order.isDelivered ? <CheckCircle className="text-green-500 inline-block h-5 w-5" /> : <XCircle className="text-red-500 inline-block h-5 w-5" />}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link to={`/admin/orders/${order._id}`} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                                        <Eye size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;