import React, { useState } from 'react';
import { useProductForm } from '../../hooks/useProductForm';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import productService from '../../../services/productService';
import { X, Loader2, CheckCircle, Plus, Trash2, ChevronsRight, UploadCloud } from 'lucide-react';
const Fieldset = ({ legend, children }) => ( <fieldset className="border border-gray-200 dark:border-zinc-700/50 p-4 rounded-xl"> <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-white">{legend}</legend> <div className="space-y-4 pt-2">{children}</div> </fieldset> );
const Input = (props) => ( <input {...props} className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition" /> );
const Textarea = (props) => ( <textarea {...props} rows="3" className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition" /> );
const Select = ({ children, ...props }) => ( <select {...props} className="w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition">{children}</select> );
const Label = ({ children, ...props }) => ( <label {...props} className="block text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-1.5">{children}</label> );
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


const ProductForm = ({ productToEdit, onClose, onActionSuccess }) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        product, handleProductChange,
        attributes, addAttribute, removeAttribute, handleAttributeChange,
        variations, addVariation, removeVariation, handleVariationNameChange,
        addOptionToVariation, removeOption, handleOptionNameChange, handleOptionImageChange,
        addSkuToOption, removeSku, handleSkuChange,
        mainImage, handleMainImageChange, handleRemoveMainImage,
        categories, isLoading, error,
        prepareFormData
    } = useProductForm(productToEdit);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = prepareFormData();
        try {
            if (productToEdit) {
                await productService.updateProduct(productToEdit._id, formData);
            } else {
                await productService.createProduct(formData);
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
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="flex items-center gap-4 text-white">
                    <Loader2 className="animate-spin text-primary-light" size={32} />
                    <span className="text-lg font-semibold">Loading Product Data...</span>
                </div>
            </div>
        );
    }
    
    const getDisplayName = (item) => item?.name?.[language] || item?.name?.en || '';
    const selectedCategoryData = categories.find(c => c._id === product.category);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 md:pt-16">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-zinc-800">
                <header className="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{productToEdit ? t('productAdmin.editProductTitle') : t('productAdmin.addNewProduct')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X /></button>
                </header>
                
                <form onSubmit={handleSubmit} id="product-form" className="flex-grow overflow-y-auto p-6 space-y-6">
                    {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</div>}
                    
                    <Fieldset legend={t('productAdmin.basicInfo')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div><Label htmlFor="name_en">{t('product.nameEn')} <span className="text-red-500">*</span></Label><Input id="name_en" name="name_en" value={product.name_en} onChange={handleProductChange} required /></div>
                            <div><Label htmlFor="name_ar" className="text-right">{t('product.nameAr')} <span className="text-red-500">*</span></Label><Input id="name_ar" name="name_ar" value={product.name_ar} onChange={handleProductChange} dir="rtl" className="text-right" required /></div>
                            <div className="md:col-span-2"><Label htmlFor="description_en">{t('product.descriptionEn')}</Label><Textarea id="description_en" name="description_en" value={product.description_en} onChange={handleProductChange} /></div>
                            <div className="md:col-span-2"><Label htmlFor="description_ar" className="text-right">{t('product.descriptionAr')}</Label><Textarea id="description_ar" name="description_ar" value={product.description_ar} onChange={handleProductChange} dir="rtl" className="text-right"/></div>
                            <div><Label htmlFor="basePrice">{t('product.basePrice')} <span className="text-red-500">*</span></Label><Input id="basePrice" name="basePrice" type="number" step="0.01" value={product.basePrice} onChange={handleProductChange} required /></div>
                            <ImageUploadField preview={mainImage.preview} onImageChange={handleMainImageChange} onRemoveImage={handleRemoveMainImage} labelText={t('product.mainImage')} inputId="main-image-upload" t={t} />
                            <div><Label htmlFor="category">{t('product.category')} <span className="text-red-500">*</span></Label><Select id="category" name="category" value={product.category} onChange={handleProductChange} required><option value="">{t('forms.select')}</option>{categories.map(c => <option key={c._id} value={c._id}>{getDisplayName(c)}</option>)}</Select></div>
                            <div><Label htmlFor="subCategory">{t('product.subCategory')}</Label><Select id="subCategory" name="subCategory" value={product.subCategory} onChange={handleProductChange} disabled={!selectedCategoryData?.subCategories?.length}><option value="">{t('forms.select')}</option>{selectedCategoryData?.subCategories?.map(sc => (<option key={sc._id} value={sc._id}>{getDisplayName(sc)}</option>))}</Select></div>
                        </div>
                    </Fieldset>

                    <Fieldset legend={t('productAdmin.fixedAttributes')}>
                         <div className="space-y-3"> {attributes.map((attr, index) => ( <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center"> <Input placeholder={t('product.attrNameEn')} value={attr.key_en} onChange={e => handleAttributeChange(index, 'key_en', e.target.value)} /> <Input placeholder={t('product.attrNameAr')} value={attr.key_ar} onChange={e => handleAttributeChange(index, 'key_ar', e.target.value)} dir="rtl" /> <Input placeholder={t('product.attrValueEn')} value={attr.value_en} onChange={e => handleAttributeChange(index, 'value_en', e.target.value)} /> <Input placeholder={t('product.attrValueAr')} value={attr.value_ar} onChange={e => handleAttributeChange(index, 'value_ar', e.target.value)} dir="rtl"/> <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 justify-self-end lg:justify-self-center"><Trash2 size={16}/></button> </div> ))} </div> <button type="button" onClick={addAttribute} className="flex items-center gap-2 text-sm text-primary dark:text-primary-light font-semibold mt-4"><Plus size={16}/>{t('productAdmin.addAttribute')}</button>
                    </Fieldset>
                    
                    <Fieldset legend={t('productAdmin.productVariations')}>
                        <div className="space-y-4">{variations.map((v, vIndex) => ( <div key={v._id || vIndex} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-800/50 space-y-4"> <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-zinc-700"> <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('productAdmin.variationGroup')} #{vIndex + 1}</h4> <button type="button" onClick={() => removeVariation(vIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 size={18} /></button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <Input placeholder={t('product.varNameEn')} value={v.name_en} onChange={e => handleVariationNameChange(vIndex, 'en', e.target.value)} /> <Input placeholder={t('product.varNameAr')} value={v.name_ar} onChange={e => handleVariationNameChange(vIndex, 'ar', e.target.value)} dir="rtl"/> </div> <div className="space-y-3 pt-2"> <h5 className="font-medium text-gray-600 dark:text-zinc-400 flex items-center gap-2"><ChevronsRight size={18} className="text-primary-light"/>{t('productAdmin.optionsFor')} "{v.name_en || '...'}"</h5> {v.options.map((opt, oIndex) => ( <div key={opt._id || oIndex} className="p-4 pl-6 border-l-4 border-primary rounded-r-lg bg-white dark:bg-zinc-800 space-y-4 shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow"> <Input placeholder={t('product.optionNameEn')} value={opt.name_en} onChange={e => handleOptionNameChange(vIndex, oIndex, 'en', e.target.value)} /> <Input placeholder={t('product.optionNameAr')} value={opt.name_ar} onChange={e => handleOptionNameChange(vIndex, oIndex, 'ar', e.target.value)} dir="rtl"/> </div> <div className="flex items-center gap-2 flex-shrink-0">
                        {opt.preview && <img src={opt.preview} alt="opt" className="w-10 h-10 object-cover rounded"/>}
                        <input type="file" id={`option-img-${vIndex}-${oIndex}`} onChange={e => handleOptionImageChange(vIndex, oIndex, e.target.files[0])} className="hidden"/> <label htmlFor={`option-img-${vIndex}-${oIndex}`} className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('forms.changeImage')}</label> <button type="button" onClick={() => removeOption(vIndex, oIndex)} className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"><Trash2 size={14}/></button> </div> </div> <div className="pl-4 mt-2 space-y-3"> <h6 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">SKUs for "{opt.name_en || 'this option'}"</h6> {opt.skus.map((sku, sIndex) => ( <div key={sku._id || sIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"> <Input placeholder="SKU Name (EN)" value={sku.name_en} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_en', e.target.value)} /> <Input placeholder="اسم SKU (AR)" value={sku.name_ar} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_ar', e.target.value)} dir="rtl" /> <Input type="number" step="0.01" placeholder="Price" value={sku.price} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'price', e.target.value)} /> <Input type="number" placeholder="Stock" value={sku.stock} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'stock', e.target.value)} /> <div className="flex items-center"> <Input type="text" placeholder="SKU ID" value={sku.sku} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'sku', e.target.value)} /> <button type="button" onClick={() => removeSku(vIndex, oIndex, sIndex)} className="text-red-400 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 ml-2"><Trash2 size={14}/></button> </div> </div> ))} <button type="button" onClick={() => addSkuToOption(vIndex, oIndex)} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold"><Plus size={14}/>Add SKU</button> </div> </div> ))} <button type="button" onClick={() => addOptionToVariation(vIndex)} className="flex items-center gap-2 text-sm text-primary dark:text-primary-light font-semibold hover:text-primary-dark dark:hover:text-primary"><Plus size={16}/>{t('productAdmin.addOption')}</button> </div> </div> ))} </div> <button type="button" onClick={addVariation} className="flex items-center gap-2 text-sm text-primary dark:text-primary-light font-semibold mt-4 hover:text-primary-dark dark:hover:text-primary"><Plus size={18}/>{t('productAdmin.addVariationGroup')}</button>
                    </Fieldset>
                </form>

                <footer className="flex-shrink-0 flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button type="button" onClick={onClose} className="rounded-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-6 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-600">Cancel</button>
                    <button type="submit" form="product-form" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-dark disabled:opacity-60">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ProductForm;