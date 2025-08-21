import React, { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../../../services/productService';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmationModal from '../../common/ConfirmationModal';
import ProductForm from './ProductForm';
import { Loader2, Info, Edit, Trash2, Plus, Copy, CheckCircle, Image as ImageIcon, Search } from 'lucide-react';

const ProductList = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getAdminProductList();
            setProducts(response.data);
        } catch (err) {
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleOpenEditForm = (product) => { setProductToEdit(product); setIsFormOpen(true); };
    const handleOpenAddForm = () => { setProductToEdit(null); setIsFormOpen(true); };
    const handleActionSuccess = () => { setIsFormOpen(false); setProductToEdit(null); fetchProducts(); };
    const handleDeleteClick = (product) => { setProductToDelete(product); setIsModalOpen(true); };
    
    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await productService.deleteProduct(productToDelete._id);
            showToast(t('general.deletedSuccess'), 'success');
            fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.message || t('general.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
            setProductToDelete(null);
        }
    };
    
    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const term = searchTerm.toLowerCase();
        return products.filter(item => 
            item.name?.en?.toLowerCase().includes(term) || 
            item.name?.ar?.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);

    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4"></div>); }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('adminProductsPage.productList')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('adminProductsPage.manageProductsMessage', { count: filteredProducts.length })}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-zinc-500" />
                        <input type="text" placeholder={t('general.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-full border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 py-2 pl-10 pr-4 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition" />
                    </div>
                     <button onClick={handleOpenAddForm} className="flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900">
                        <Plus size={18} />
                        <span>{t('productAdmin.addProductButton')}</span>
                    </button>
                </div>
            </header>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Product</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Category</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider">Base Price</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">Reviews</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {filteredProducts.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4 flex items-center gap-4 min-w-[250px]">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        {product.mainImage ? <img src={product.mainImage} alt={product.name?.[language]} className="h-full w-full object-cover rounded-lg" /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>{product.name?.[language] || product.name?.en}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">ID: ...{product._id.slice(-6)}</span>
                                            <button onClick={() => copyToClipboard(product._id)} className="text-gray-400 hover:text-primary-light">
                                                {copiedId === product._id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-zinc-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>{product.category?.name?.[language] || product.category?.name?.en || 'N/A'}</td>
                                <td className="p-4 font-semibold text-green-600">{product.basePrice?.toFixed(2)} {t('general.currency')}</td>
                                <td className="p-4 text-gray-600 dark:text-zinc-400 text-center">{product.numReviews || 0}</td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs shadow-sm">
                                        <button onClick={() => handleOpenEditForm(product)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light rounded-l-full">
                                            <Edit size={16} />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700"></div>
                                        <button onClick={() => handleDeleteClick(product)} className="p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 rounded-r-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isFormOpen && ( <ProductForm productToEdit={productToEdit} onClose={() => setIsFormOpen(false)} onActionSuccess={handleActionSuccess} /> )}
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} isConfirming={isDeleting} message={t('productAdmin.confirmDelete', { productName: productToDelete?.name?.[language] || 'this product' })}/>
        </div>
    );
};

export default ProductList;