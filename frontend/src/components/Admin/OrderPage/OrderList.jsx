import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import orderService from '../../../services/orderService';
import { Loader2, Info, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToast } from '../../../context/ToastContext';

const OrderList = () => {
    const { t, language } = useLanguage();
    const { token, loadingAuth } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getAdminOrderList(token);
            setOrders(response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            const errorMessage = err.response?.data?.message || t('adminOrdersPage.errorFetchingOrders');
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, t, showToast]);

    useEffect(() => {
        if (!loadingAuth) {
            fetchOrders();
        }
    }, [loadingAuth, fetchOrders]);

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true);
        try {
            await orderService.deleteOrder(orderToDelete._id, token);
            showToast(t('adminOrdersPage.deleteSuccess'), 'success');
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
            fetchOrders();
        } catch (err) {
            showToast(err.response?.data?.message || t('adminOrdersPage.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: t('general.currencyCode') }).format(Number(price || 0));
    };

    if (loadingAuth || loading) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t('adminOrdersPage.errorLoadingOrders')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchOrders} className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-light">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{t('adminOrdersPage.orderList')}</h1>
            </header>

            <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.orderId')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.customer')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.date')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.total')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.paidStatus')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('adminOrdersPage.deliveryStatus')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    {t('general.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                                            {order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                            {order.user ? order.user.name : t('general.deletedUser')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                            {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                            {formatPrice(order.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                {order.isPaid ? t('adminOrdersPage.paid') : t('adminOrdersPage.notPaid')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                                                {order.isDelivered ? t('adminOrdersPage.delivered') : t('adminOrdersPage.pending')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/admin/orders/${order._id}`} className="text-primary hover:text-primary-dark dark:hover:text-primary-light mr-3">
                                                <Edit size={18} className="inline" />
                                            </Link>
                                            <button onClick={() => handleDeleteClick(order)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                                                <Trash2 size={18} className="inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                        {t('adminOrdersPage.noOrdersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isConfirming={isDeleting}
                title={t('adminOrdersPage.deleteConfirmTitle')}
                message={t('adminOrdersPage.deleteConfirmMessage', { orderId: orderToDelete?._id.slice(-6).toUpperCase() || '' })}
            />
        </div>
    );
};

export default OrderList;