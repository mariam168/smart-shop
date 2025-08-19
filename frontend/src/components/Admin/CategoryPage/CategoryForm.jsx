import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCategoryForm } from '../../../hooks/useCategoryForm';
import categoryService from '../../../services/categoryService'; 
import SubCategoryInput from './SubCategoryInput';
import { Plus, X, Loader2, CheckCircle, List, UploadCloud } from 'lucide-react';

const ImageUploadField = ({ preview, onImageChange, onRemoveImage, labelText, inputId, t }) => (
    <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-2">{labelText}</label>
        <div className="flex items-center gap-5">
            {preview && (
                <div className="relative h-28 w-28 rounded-xl shadow-md">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                    <button type="button" onClick={onRemoveImage} className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <X size={16} />
                    </button>
                </div>
            )}
            <label htmlFor={inputId} className="relative flex-1 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6 text-center hover:border-primary-light dark:hover:border-primary transition-colors">
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-zinc-400">
                    <UploadCloud size={32} />
                    <span className="font-semibold">{preview ? t('general.changeImage') : t('general.uploadImage')}</span>
                    <span className="text-xs">PNG, JPG, WEBP</span>
                </div>
                <input id={inputId} type="file" onChange={(e) => onImageChange(e.target.files[0])} className="sr-only" accept="image/png, image/jpeg, image/webp" />
            </label>
        </div>
    </div>
);

const CategoryForm = ({ categoryToEdit, onFormSubmit, onCancel }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        category, subCategories, mainImage,
        handleMainFieldChange, handleMainImageChange, handleRemoveMainImage,
        handleAddSubCategory, handleSubCategoryChange, handleSubCategoryImageChange, handleRemoveSubCategory,
        prepareFormData
    } = useCategoryForm(categoryToEdit);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!category.name.en.trim() || !category.name.ar.trim()) {
            showToast(t('categoryForm.validationCategoryNameRequired'), 'error');
            setIsSubmitting(false);
            return;
        }
        const formData = prepareFormData();
        try {
            if (categoryToEdit) {
                await categoryService.updateCategory(categoryToEdit._id, formData);
            } else {
                await categoryService.createCategory(formData);
            }
            showToast(t('general.savedSuccess'), 'success');
            setTimeout(() => onFormSubmit(), 1000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('categoryForm.errorMessage');
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full rounded-lg border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-3 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition";
    const labelClasses = "block text-sm font-semibold text-gray-600 dark:text-zinc-300 mb-1.5";
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 md:pt-16">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {categoryToEdit ? t('categoryForm.editCategoryTitle') : t('categoryForm.addCategoryTitle')}
                    </h3>
                    <button onClick={onCancel} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors">
                        <X size={24} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <fieldset className="p-5 border border-gray-200 dark:border-zinc-700/50 rounded-xl">
                        <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-white">{t('categoryForm.mainCategoryDetails')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4">
                            <div>
                                <label htmlFor="name_en" className={labelClasses}>{t('categoryForm.categoryNameEnLabel')} <span className="text-red-500">*</span></label>
                                <input type="text" id="name_en" name="name_en" value={category.name.en} onChange={handleMainFieldChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="name_ar" className={`${labelClasses} text-right`}>{t('categoryForm.categoryNameArLabel')} <span className="text-red-500">*</span></label>
                                <input type="text" id="name_ar" name="name_ar" value={category.name.ar} onChange={handleMainFieldChange} className={`${inputClasses} text-right`} required dir="rtl" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description_en" className={labelClasses}>{t('categoryForm.descriptionEnLabel')}</label>
                                <textarea id="description_en" name="description_en" value={category.description.en} onChange={handleMainFieldChange} rows="3" className={inputClasses}></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description_ar" className={`${labelClasses} text-right`}>{t('categoryForm.descriptionArLabel')}</label>
                                <textarea id="description_ar" name="description_ar" value={category.description.ar} onChange={handleMainFieldChange} rows="3" className={`${inputClasses} text-right`} dir="rtl"></textarea>
                            </div>
                            <ImageUploadField 
                                preview={mainImage.preview}
                                onImageChange={handleMainImageChange}
                                onRemoveImage={handleRemoveMainImage}
                                labelText={t('categoryForm.categoryImageLabel')}
                                inputId="main-image-input"
                                t={t}
                            />
                        </div>
                    </fieldset>
                    
                    <fieldset className="p-5 border border-gray-200 dark:border-zinc-700/50 rounded-xl">
                        <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                           <List size={20} className="text-primary-light" /> {t('categoryForm.subCategoriesTitle')}
                        </legend>
                        <div className="flex justify-end -mt-8 mb-4">
                            <button type="button" onClick={handleAddSubCategory} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-primary-dark">
                                <Plus size={16} /> {t('categoryForm.addSubCategoryButton')}
                            </button>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto p-2 -mr-2 pr-4">
                            {subCategories.length === 0 && <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-8">{t('categoryForm.noSubcategoriesMessage')}</p>}
                            {subCategories.map((sub, index) => (
                                <SubCategoryInput key={sub.tempId} sub={sub} index={index} onSubCategoryChange={handleSubCategoryChange} onImageChange={handleSubCategoryImageChange} onRemove={handleRemoveSubCategory} t={t} />
                            ))}
                        </div>
                    </fieldset>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
                        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-6 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50 transition-colors">
                            {t('general.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 shadow-lg hover:shadow-primary-dark/30 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            <span>{isSubmitting ? t('general.saving') : (categoryToEdit ? t('general.saveChanges') : t('general.addCategory'))}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;