import React, { useState, useEffect, useCallback, useMemo } from 'react';
import categoryService from '../../../services/categoryService';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmationModal from '../../common/ConfirmationModal';
import CategoryForm from './CategoryForm';
import { Loader2, Info, Edit, Trash2, Plus, Search, ChevronRight, Image as ImageIcon } from 'lucide-react';

const CategoryList = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch (err) {
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingCategories'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenAddForm = () => {
        setCategoryToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (category) => {
        setCategoryToEdit(category);
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setCategoryToEdit(null);
        fetchCategories();
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);

        try {
            await categoryService.deleteCategory(categoryToDelete._id);
            showToast(t('general.deletedSuccess'), 'success');
            fetchCategories();
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('general.deleteError');
            showToast(errorMessage, 'error');
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        const term = searchTerm.toLowerCase();
        return categories.filter(category => 
            category.name?.en?.toLowerCase().includes(term) ||
            category.name?.ar?.toLowerCase().includes(term) ||
            category.subCategories?.some(sub => 
                sub.name?.en?.toLowerCase().includes(term) || sub.name?.ar?.toLowerCase().includes(term)
            )
        );
    }, [categories, searchTerm]);


    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4"><div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-red-200 dark:border-red-800"><Info size={40} className="mx-auto mb-4 text-red-500" /><h3 className="text-xl font-bold mb-2">Error</h3><p className="text-red-600">{error}</p><button onClick={fetchCategories} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Try Again</button></div></div>); }
    
    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('adminCategoryPage.categoryListTitle')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('general.manageItemsMessage', { count: filteredCategories.length, itemName: t('general.categories') })}</p>
                </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            placeholder={t('categoryList.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 py-2 pl-10 pr-4 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition"
                        />
                    </div>
                    <button
                        onClick={handleOpenAddForm}
                        className="flex-shrink-0 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">{t('adminCategoryPage.addCategoryButton')}</span>
                    </button>
                </div>
            </header>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-12"></th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Sub-categories</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Products</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {filteredCategories.map(cat => (
                            <React.Fragment key={cat._id}>
                                <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4 text-center">
                                        {cat.subCategories?.length > 0 && (
                                            <button onClick={() => toggleExpand(cat._id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                                                <ChevronRight size={16} className={`transition-transform duration-300 text-gray-500 ${expandedCategories[cat._id] ? 'rotate-90' : ''}`} />
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center gap-4 min-w-[250px]">
                                        {cat.imageUrl ? 
                                          <img src={`${serverUrl}${cat.imageUrl}`} alt={cat.name?.[language]} className="h-12 w-12 rounded-lg object-cover flex-shrink-0 shadow-md ring-1 ring-gray-200 dark:ring-zinc-700" /> :
                                          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0"><ImageIcon className="h-6 w-6 text-gray-400"/></div>
                                        }
                                        <span className="font-semibold text-gray-800 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>{cat.name?.[language] || cat.name?.en}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{cat.subCategories?.length || 0}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-400 text-center">0</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs shadow-sm">
                                            <button onClick={() => handleOpenEditForm(cat)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light rounded-l-full">
                                                <Edit size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700"></div>
                                            <button onClick={() => handleDeleteClick(cat)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 rounded-r-full">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedCategories[cat._id] && (
                                    <tr className="bg-gray-50/50 dark:bg-zinc-800/30">
                                        <td colSpan="5" className="p-0">
                                            <div className="p-4 pl-16">
                                                <ul className="space-y-2">
                                                    {cat.subCategories.map(sub => (
                                                        <li key={sub._id} className="flex items-center gap-3 text-sm">
                                                             {sub.imageUrl ? 
                                                                <img src={`${serverUrl}${sub.imageUrl}`} alt={sub.name?.[language]} className="h-6 w-6 rounded-md object-cover"/>
                                                                : <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 dark:bg-zinc-700"><ImageIcon size={12} className="text-gray-400 dark:text-zinc-500"/></span>
                                                            }
                                                            <span className="text-gray-700 dark:text-gray-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>{sub.name?.[language] || sub.name?.en}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isFormOpen && ( <CategoryForm categoryToEdit={categoryToEdit} onFormSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} /> )}
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} isConfirming={isDeleting} message={t('adminCategoryPage.confirmDeleteMessage', { categoryName: categoryToDelete?.name?.[language] || '' })}/>
        </div>
    );
};

export default CategoryList;