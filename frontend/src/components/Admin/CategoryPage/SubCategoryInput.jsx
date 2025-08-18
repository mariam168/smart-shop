import React from 'react';
import { Trash2, GripVertical, UploadCloud } from 'lucide-react';

const SubCategoryInput = ({ sub, index, onSubCategoryChange, onImageChange, onRemove, t }) => {
    const inputClasses = "w-full rounded-md border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-700 p-2 text-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-transparent transition";
    
    return (
        <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700/50">
            <div className="flex items-center gap-3">
                <div className="text-gray-400 dark:text-zinc-500 cursor-grab self-center">
                    <GripVertical size={20} />
                </div>
                
                <label htmlFor={`sub-img-${sub.tempId}`} className="relative h-16 w-16 flex-shrink-0 cursor-pointer rounded-md border-2 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700/50 flex items-center justify-center text-center hover:border-primary-light transition-colors group">
                    {sub.preview ? 
                        <img src={sub.preview} alt="Sub Preview" className="h-full w-full object-cover rounded-md" />
                        : <UploadCloud size={20} className="text-gray-400 dark:text-zinc-500" />
                    }
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        {t('general.change')}
                    </div>
                    <input type="file" accept="image/*" id={`sub-img-${sub.tempId}`} className="sr-only" onChange={(e) => onImageChange(sub.tempId, e.target.files[0])} />
                </label>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                        type="text" 
                        placeholder={t(`categoryForm.subCategoryNameEnPlaceholder`)}
                        value={sub.name?.en || ''} 
                        onChange={(e) => onSubCategoryChange(sub.tempId, 'name', 'en', e.target.value)} 
                        className={inputClasses} 
                        required 
                    />
                    <input 
                        type="text" 
                        placeholder={t(`categoryForm.subCategoryNameArPlaceholder`)}
                        value={sub.name?.ar || ''} 
                        onChange={(e) => onSubCategoryChange(sub.tempId, 'name', 'ar', e.target.value)} 
                        className={`${inputClasses} text-right`} 
                        dir="rtl"
                        required 
                    />
                </div>

                <button type="button" onClick={() => onRemove(sub.tempId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors self-center">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default SubCategoryInput;