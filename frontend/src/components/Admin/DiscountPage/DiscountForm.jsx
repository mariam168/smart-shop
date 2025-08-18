import React, { useState } from 'react';
import { useDiscountForm } from '../../hooks/useDiscountForm';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import discountService from '../../../services/discountService';
import { Loader2, CheckCircle, X } from 'lucide-react';

const DiscountForm = ({ discountToEdit, onClose, onActionSuccess }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { discount, handleChange, getPayload } = useDiscountForm(discountToEdit);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!discount.code.trim()) { return showToast(t('discountAdmin.codeRequired'), 'error'); }
        if (!discount.percentage && !discount.fixedAmount) { return showToast(t('discountAdmin.amountRequired'), 'error'); }
        if (!discount.startDate || !discount.endDate) { return showToast(t('discountAdmin.datesRequired'), 'error'); }
        if (new Date(discount.startDate) > new Date(discount.endDate)) { return showToast(t('discountAdmin.endDateError'), 'error'); }
        
        setIsSubmitting(true);
        const payload = getPayload();
        
        try {
            if (discountToEdit) {
                await discountService.updateDiscount(discountToEdit._id, payload);
            } else {
                await discountService.createDiscount(payload);
            }
            showToast(t('general.savedSuccess'), 'success');
            onActionSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || t('general.error'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition";
    const labelClasses = "block text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-1.5";
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-zinc-800">
                <header className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{discountToEdit ? t('discountAdmin.editDiscountTitle') : t('discountAdmin.addDiscountTitle')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X /></button>
                </header>

                <form onSubmit={handleSubmit} id="discount-form" className="flex-grow overflow-y-auto p-6 space-y-5">
                    <div>
                        <label htmlFor="code" className={labelClasses}>{t('discountAdmin.codeLabel')}</label>
                        <input type="text" id="code" name="code" value={discount.code} onChange={handleChange} className={inputClasses} placeholder={t('discountAdmin.codePlaceholder')} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                         <div>
                            <label htmlFor="percentage" className={labelClasses}>{t('discountAdmin.percentageLabel')}</label>
                            <input type="number" id="percentage" name="percentage" value={discount.percentage} onChange={handleChange} className={inputClasses} min="0" max="100" step="0.01" disabled={!!discount.fixedAmount} placeholder="e.g., 20" />
                        </div>
                        <p className="text-sm font-semibold text-center text-gray-400 dark:text-zinc-500 my-2">{t('general.or').toUpperCase()}</p>
                         <div>
                            <label htmlFor="fixedAmount" className={labelClasses}>{t('discountAdmin.fixedAmountLabel')}</label>
                            <input type="number" id="fixedAmount" name="fixedAmount" value={discount.fixedAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" disabled={!!discount.percentage} placeholder={t('discountAdmin.fixedAmountPlaceholder')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="minOrderAmount" className={labelClasses}>{t('discountAdmin.minOrderAmountLabel')}</label>
                            <input type="number" id="minOrderAmount" name="minOrderAmount" value={discount.minOrderAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.minOrderAmountPlaceholder')} />
                        </div>
                        <div>
                            <label htmlFor="maxDiscountAmount" className={labelClasses}>{t('discountAdmin.maxDiscountAmountLabel')}</label>
                            <input type="number" id="maxDiscountAmount" name="maxDiscountAmount" value={discount.maxDiscountAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.maxDiscountAmountPlaceholder')} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className={labelClasses}>{t('discountAdmin.startDateLabel')}</label>
                            <input type="date" id="startDate" name="startDate" value={discount.startDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className={labelClasses}>{t('discountAdmin.endDateLabel')}</label>
                            <input type="date" id="endDate" name="endDate" value={discount.endDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="isActive" name="isActive" checked={discount.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t('discountAdmin.isActive')}</label>
                    </div>
                </form>

                <footer className="flex-shrink-0 flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button type="button" onClick={onClose} className="rounded-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-6 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-600">Cancel</button>
                    <button type="submit" form="discount-form" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-dark disabled:opacity-60">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Discount'}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DiscountForm;