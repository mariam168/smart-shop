import React, { useState, useEffect, useCallback } from 'react';
import discountService from '../../../services/discountService';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmationModal from '../../common/ConfirmationModal';
import DiscountForm from './DiscountForm';
import { Loader2, Info, Edit, Trash2, Plus } from 'lucide-react';

const DiscountList = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discountToEdit, setDiscountToEdit] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };

    const fetchDiscounts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await discountService.getAllDiscounts();
            setDiscounts(response.data);
        } catch (err) {
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

    const handleOpenEditForm = (discount) => { setDiscountToEdit(discount); setIsFormOpen(true); };
    const handleOpenAddForm = () => { setDiscountToEdit(null); setIsFormOpen(true); };
    const handleActionSuccess = () => { setIsFormOpen(false); setDiscountToEdit(null); fetchDiscounts(); };
    const handleDeleteClick = (discount) => { setDiscountToDelete(discount); setIsModalOpen(true); };

    const handleConfirmDelete = async () => {
        if (!discountToDelete) return;
        setIsDeleting(true);
        try {
            await discountService.deleteDiscount(discountToDelete._id);
            showToast(t('general.deletedSuccess'), 'success');
            fetchDiscounts();
        } catch (err) {
            showToast(err.response?.data?.message || t('general.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
            setDiscountToDelete(null);
        }
    };
    
    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4">{/*...Error JSX...*/}</div>); }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('discountAdmin.discountListTitle')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('general.manageItemsMessage', { count: discounts.length, itemName: t('general.discounts') })}</p>
                </div>
                <button onClick={handleOpenAddForm} className="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900">
                    <Plus size={18} />
                    <span>{t('discountAdmin.addDiscountButton')}</span>
                </button>
            </header>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Code</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Value</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Min. Order</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Validity</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">Status</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {discounts.map(d => (
                            <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 font-mono font-semibold text-primary dark:text-primary-light">{d.code}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{d.percentage ? `${d.percentage}%` : `${d.fixedAmount?.toFixed(2)} ${t('general.currency')}`}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{d.minOrderAmount > 0 ? `${d.minOrderAmount.toFixed(2)} ${t('general.currency')}` : '—'}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-zinc-400 text-xs">{formatDate(d.startDate)} - {formatDate(d.endDate)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                        <span className={`h-2 w-2 rounded-full ${d.isActive ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                                        {d.isActive ? t('general.active') : t('general.inactive')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs shadow-sm">
                                        <button onClick={() => handleOpenEditForm(d)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light rounded-l-full">
                                            <Edit size={16} />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700"></div>
                                        <button onClick={() => handleDeleteClick(d)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 rounded-r-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isFormOpen && ( <DiscountForm discountToEdit={discountToEdit} onClose={() => setIsFormOpen(false)} onActionSuccess={handleActionSuccess} /> )}
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} isConfirming={isDeleting} message={t('discountAdmin.confirmDelete', { discountCode: discountToDelete?.code || '' })}/>
        </div>
    );
};

export default DiscountList;