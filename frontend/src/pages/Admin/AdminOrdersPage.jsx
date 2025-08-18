import React from 'react';
import OrderList from '../../components/Admin/OrderPage/OrderList';
import { useLanguage } from "../../context/LanguageContext";
import { ShoppingCart } from 'lucide-react';

const AdminOrdersPage = () => {
    const { t } = useLanguage();
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-zinc-900/50 min-h-screen">
            <header className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-primary-light/10 rounded-lg">
                        <ShoppingCart size={28} className="text-primary-light" />
                    </span>
                    {t('adminOrdersPage.manageOrders')}
                </h1>
            </header>
            <OrderList />
        </div>
    );
};

export default AdminOrdersPage;