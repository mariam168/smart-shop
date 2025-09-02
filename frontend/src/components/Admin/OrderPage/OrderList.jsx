import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../../services/orderService';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmationModal from '../../common/ConfirmationModal';
import { Loader2, Info, CheckCircle, XCircle, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const OrderList = () => {
    const { t, language } = useLanguage();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchOrders = useCallback(async (currentPage) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await orderService.getAllOrders(token, currentPage);
            setOrders(response.data.orders);
            setPage(response.data.page);
            setTotalPages(response.data.totalPages);
            setTotalOrders(response.data.totalOrders);
            setError(null);
        } catch (err) {
            const msg = t('adminOrdersPage.errorFetchingOrdersToast');
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    }, [token, t, showToast]);

    useEffect(() => {
        fetchOrders(page);
    }, [fetchOrders, page]);

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true);
        try {
            await orderService.deleteOrder(orderToDelete._id, token);
            showToast(t('adminOrdersPage.deleteSuccess'), 'success');
            fetchOrders(page);
        } catch (err) {
            showToast(t('adminOrdersPage.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
            setOrderToDelete(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency', currency: t('general.currencyCode')
        }).format(Number(price || 0));
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading && orders.length === 0) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4"><div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-red-200 dark:border-red-800"><Info size={40} className="mx-auto mb-4 text-red-500" /><h3 className="text-xl font-bold mb-2">Error</h3><p className="text-red-600">{error}</p><button onClick={() => fetchOrders(1)} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Try Again</button></div></div>); }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('adminOrdersPage.allOrders')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('general.manageItemsMessage', { count: totalOrders, itemName: t('general.orders') })}</p>
                </div>
            </header>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.user')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.date')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{t('adminOrdersPage.total')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.paid')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.delivered')}</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">{t('adminOrdersPage.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-zinc-500" title={order._id}>
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                                    {order.user?.name || t('general.notAvailable')}
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
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs shadow-sm">
                                        <Link to={`/admin/orders/${order._id}`} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light rounded-l-full">
                                            <Eye size={16} />
                                        </Link>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700"></div>
                                        <button onClick={() => handleDeleteClick(order)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 rounded-r-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                    Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
             <ConfirmationModal 
                isOpen={!!orderToDelete} 
                onClose={() => setOrderToDelete(null)} 
                onConfirm={handleConfirmDelete} 
                isConfirming={isDeleting} 
                title={t('adminOrdersPage.deleteConfirmTitle')} 
                message={t('adminOrdersPage.deleteConfirmMessage', { orderId: orderToDelete?._id.slice(-6).toUpperCase() || '' })} 
            />
        </div>
    );
};

export default OrderList;