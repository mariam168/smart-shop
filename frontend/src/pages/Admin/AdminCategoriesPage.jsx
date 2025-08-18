import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import categoryService from '../../services/categoryService';
import { useLanguage } from '../../context/LanguageContext';
import CategoryForm from '../../components/Admin/CategoryPage/CategoryForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Plus, Edit, Trash2, Loader2, Info, ChevronDown, ChevronRight, ListTree, Search, XCircle, Image as ImageIcon } from 'lucide-react';

const AdminCategoriesPage = () => {
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
    const filteredCategories = categories.filter(category => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            category.name?.en?.toLowerCase().includes(term) ||
            category.name?.ar?.toLowerCase().includes(term) ||
            category.subCategories?.some(sub => 
                sub.name?.en?.toLowerCase().includes(term) || sub.name?.ar?.toLowerCase().includes(term)
            )
        );
    });
    if (loading) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-red-300 dark:border-red-700">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.error')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchCategories} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-zinc-900 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {t('adminCategoryPage.manageCategories')}
                </h1>
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

            <div className="space-y-3">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => (
                        <div key={cat._id} className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary-light/30">
                            <div className="flex items-center p-3 sm:p-4">
                                <button onClick={() => toggleExpand(cat._id)} className={`p-2 rounded-full transition-colors ${cat.subCategories?.length > 0 ? 'hover:bg-gray-100 dark:hover:bg-zinc-700' : 'opacity-0 cursor-default'}`} disabled={!cat.subCategories?.length}>
                                    <ChevronRight size={20} className={`transition-transform duration-300 text-gray-400 dark:text-zinc-500 ${expandedCategories[cat._id] ? 'rotate-90' : 'rotate-0'}`} />
                                </button>
                                <img src={cat.imageUrl ? `${serverUrl}${cat.imageUrl}` : 'https://via.placeholder.com/150'} alt={cat.name?.[language] || 'Category'} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover mx-3" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-base text-gray-800 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>{cat.name?.[language] || cat.name?.en}</p>
                                    <p className="text-xs text-gray-400 dark:text-zinc-400">{t('categoryList.subcategories')}: {cat.subCategories?.length || 0}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenEditForm(cat)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(cat)} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {expandedCategories[cat._id] && cat.subCategories?.length > 0 && (
                                <div className="pl-10 pr-4 pb-4 sm:pl-16">
                                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                                        <ul className="space-y-3">
                                            {cat.subCategories.map(sub => (
                                                <li key={sub._id} className="flex items-center gap-3">
                                                    {sub.imageUrl ? 
                                                        <img src={`${serverUrl}${sub.imageUrl}`} alt={sub.name?.[language]} className="h-8 w-8 rounded-md object-cover"/>
                                                        : <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 dark:bg-zinc-700"><ImageIcon size={16} className="text-gray-400 dark:text-zinc-500"/></span>
                                                    }
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>{sub.name?.[language] || sub.name?.en}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <Info size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{searchTerm ? t('categoryList.noSearchResults') : t('adminCategoryPage.noCategoriesYet')}</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{searchTerm ? t('categoryList.tryDifferentSearch') : t('adminCategoryPage.addFirstCategory')}</p>
                    </div>
                )}
            </div>

            {isFormOpen && ( <CategoryForm categoryToEdit={categoryToEdit} onFormSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} /> )}
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} title={t('adminCategoryPage.confirmDeleteTitle')} message={t('adminCategoryPage.confirmDeleteMessage', { categoryName: categoryToDelete?.name?.en || 'this item' })} confirmText={t('general.yesDelete')} icon={Trash2} isConfirming={isDeleting} />
        </div>
    );
};

export default AdminCategoriesPage;