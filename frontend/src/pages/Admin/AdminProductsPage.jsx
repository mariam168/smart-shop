import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../context/LanguageContext";
import { Package } from 'lucide-react';

const AdminProductsPage = () => {
    const { t } = useLanguage();
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-zinc-900/50 min-h-screen">
            <header className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-primary-light/10 rounded-lg">
                        <Package size={28} className="text-primary-light" />
                    </span>
                    {t('adminProductsPage.title')}
                </h1>
            </header>
            <ProductList />
        </div>
    );
};

export default AdminProductsPage;