import React from 'react';
import AdvertisementList from '../../components/Admin/AdvertisementPage/AdvertisementList';
import { useLanguage } from "../../context/LanguageContext";
import { Megaphone } from 'lucide-react';

const AdminAdvertisementsPage = () => {
    const { t } = useLanguage();
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-zinc-900/50 min-h-screen">
            <header className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-primary-light/10 rounded-lg">
                        <Megaphone size={28} className="text-primary-light" />
                    </span>
                    {t('advertisementAdmin.manageAdvertisementsTitle')}
                </h1>
            </header>
            <AdvertisementList />
        </div>
    );
};

export default AdminAdvertisementsPage;