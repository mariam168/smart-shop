import React, { useState, useRef, useEffect } from 'react';
import { useAdvertisementForm } from '../../hooks/useAdvertisementForm';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import advertisementService from '../../../services/advertisementService';
import { Loader2, CheckCircle, X, UploadCloud, Search } from 'lucide-react';

const Input = (props) => ( <input {...props} className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition" /> );
const Textarea = (props) => ( <textarea {...props} rows="3" className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition" /> );
const Select = ({ children, ...props }) => ( <select {...props} className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition">{children}</select> );
const Label = ({ children, ...props }) => ( <label {...props} className="block text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-1.5">{children}</label> );
const Fieldset = ({ legend, children }) => ( <fieldset className="space-y-4 rounded-xl border border-gray-200 dark:border-zinc-700/50 p-5"> <legend className="px-2 text-base font-semibold text-gray-800 dark:text-white">{legend}</legend> {children} </fieldset>);
const ImageUploadField = ({ preview, onImageChange, onRemoveImage, labelText, inputId, t }) => (
    <div className="md:col-span-2">
        <Label>{labelText}</Label>
        <div className="flex items-center gap-5 mt-1.5">
            {preview && (<div className="relative h-28 w-28 rounded-xl shadow-md"> <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-xl" /> <button type="button" onClick={onRemoveImage} className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"><X size={16} /></button> </div>)}
            <label htmlFor={inputId} className="relative flex-1 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6 text-center hover:border-primary-light dark:hover:border-primary transition-colors">
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-zinc-400"> <UploadCloud size={32} /> <span className="font-semibold">{preview ? t('general.changeImage') : t('general.uploadImage')}</span> <span className="text-xs">PNG, JPG, WEBP</span> </div>
                <input id={inputId} type="file" onChange={(e) => onImageChange(e.target.files[0])} className="sr-only" accept="image/png, image/jpeg, image/webp" />
            </label>
        </div>
    </div>
);


const AdvertisementForm = ({ advertisementToEdit, onClose, onActionSuccess }) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef(null);

    const {
        advertisement, handleChange,
        image, handleImageChange, handleRemoveImage,
        products, productSearchTerm, setProductSearchTerm, handleProductSelect,
        isLoading, error, prepareFormData
    } = useAdvertisementForm(advertisementToEdit);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!advertisement.title_en.trim() || !advertisement.title_ar.trim()) {
            return showToast(t('advertisementAdmin.titleRequired'), 'error');
        }
        setIsSubmitting(true);
        const formData = prepareFormData();
        try {
            if (advertisementToEdit) {
                await advertisementService.updateAdvertisement(advertisementToEdit._id, formData);
            } else {
                await advertisementService.createAdvertisement(formData);
            }
            showToast(t('general.savedSuccess'), 'success');
            onActionSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || t('general.error'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return ( <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"> <div className="flex items-center gap-4 text-white"> <Loader2 className="animate-spin text-primary-light" size={32} /> <span className="text-lg font-semibold">Loading Data...</span> </div> </div> );
    }
    
    const filteredProducts = products.filter(p => (p.name?.en?.toLowerCase() || '').includes(productSearchTerm.toLowerCase()) || (p.name?.ar?.toLowerCase() || '').includes(productSearchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-zinc-800">
                <header className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{advertisementToEdit ? t('advertisementAdmin.editAdvertisementTitle') : t('advertisementAdmin.addAdvertisementTitle')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X /></button>
                </header>

                <form onSubmit={handleSubmit} id="ad-form" className="flex-grow overflow-y-auto p-6 space-y-6">
                    {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</div>}
                    
                    <Fieldset legend={t('advertisementAdmin.basicInfo')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="title_en">{t('advertisementAdmin.titleEn')} <span className="text-red-500">*</span></Label><Input id="title_en" name="title_en" value={advertisement.title_en} onChange={handleChange} required /></div>
                            <div><Label htmlFor="title_ar" className="text-right">{t('advertisementAdmin.titleAr')} <span className="text-red-500">*</span></Label><Input id="title_ar" name="title_ar" value={advertisement.title_ar} onChange={handleChange} dir="rtl" className="text-right" required /></div>
                        </div>
                        <div><Label htmlFor="description_en">{t('advertisementAdmin.descriptionEn')}</Label><Textarea id="description_en" name="description_en" value={advertisement.description_en} onChange={handleChange} /></div>
                        <div><Label htmlFor="description_ar" className="text-right">{t('advertisementAdmin.descriptionAr')}</Label><Textarea id="description_ar" name="description_ar" value={advertisement.description_ar} onChange={handleChange} dir="rtl" className="text-right" /></div>
                        <ImageUploadField preview={image.preview} onImageChange={handleImageChange} onRemoveImage={handleRemoveImage} labelText={t('advertisementAdmin.imageLabel')} inputId="ad-image-upload" t={t} />
                    </Fieldset>
                    
                    <Fieldset legend={t('advertisementAdmin.linkingAndOffers')}>
                        <div className="relative" ref={productDropdownRef}>
                            <Label htmlFor="productRef">{t('advertisementAdmin.linkToProduct')} (Optional)</Label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                                <Input 
                                    type="text" 
                                    id="productRef" 
                                    value={productSearchTerm} 
                                    onChange={(e) => { setProductSearchTerm(e.target.value); setIsProductDropdownOpen(true); }} 
                                    onFocus={() => setIsProductDropdownOpen(true)} 
                                    placeholder={t('advertisementAdmin.searchProductPlaceholder')} 
                                    autoComplete="off"
                                    className="pl-10"
                                />
                            </div>
                            {isProductDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    <li className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer" onClick={() => { handleProductSelect(null); setIsProductDropdownOpen(false); }}>
                                        -- {t('advertisementAdmin.noProductLinked')} --
                                    </li>
                                    {filteredProducts.map(p => (
                                        <li 
                                            key={p._id} 
                                            className="px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-primary-light/10 hover:text-primary dark:hover:bg-zinc-700 cursor-pointer" 
                                            onClick={() => { handleProductSelect(p); setIsProductDropdownOpen(false); }}
                                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                                        >
                                            {/* --- (هذا هو التصحيح الحاسم) --- */}
                                            {p.name && (p.name[language] || p.name.en)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div><Label htmlFor="discountPercentage">{t('advertisementAdmin.discountPercentageLabel')} (%)</Label><Input type="number" id="discountPercentage" name="discountPercentage" value={advertisement.discountPercentage} onChange={handleChange} min="0" max="100" /></div>
                    </Fieldset>

                    <Fieldset legend={t('advertisementAdmin.settings')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="type">{t('advertisementAdmin.typeLabel')}</Label><Select id="type" name="type" value={advertisement.type} onChange={handleChange}><option value="slide">{t('advertisementAdmin.typeSlide')}</option><option value="sideOffer">{t('advertisementAdmin.typeSideOffer')}</option><option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer')}</option><option value="other">{t('advertisementAdmin.typeOther')}</option></Select></div>
                            <div><Label htmlFor="order">{t('advertisementAdmin.orderLabel')}</Label><Input type="number" id="order" name="order" value={advertisement.order} onChange={handleChange} min="0" /></div>
                            <div><Label htmlFor="startDate">{t('advertisementAdmin.startDate')}</Label><Input type="date" id="startDate" name="startDate" value={advertisement.startDate} onChange={handleChange} /></div>
                            <div><Label htmlFor="endDate">{t('advertisementAdmin.endDate')}</Label><Input type="date" id="endDate" name="endDate" value={advertisement.endDate} onChange={handleChange} /></div>
                            <div className="md:col-span-2"><Label htmlFor="link">{t('advertisementAdmin.linkLabel')}</Label><Input type="url" id="link" name="link" value={advertisement.link} onChange={handleChange} placeholder="https://example.com/offers" /></div>
                            <div className="flex items-center gap-3 pt-2">
                                <input type="checkbox" id="isActive" name="isActive" checked={advertisement.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <Label htmlFor="isActive" className="mb-0">{t('advertisementAdmin.isActive')}</Label>
                            </div>
                        </div>
                    </Fieldset>
                </form>

                <footer className="flex-shrink-0 flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button type="button" onClick={onClose} className="rounded-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-6 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-600">Cancel</button>
                    <button type="submit" form="ad-form" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-dark disabled:opacity-60">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Advertisement'}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AdvertisementForm;