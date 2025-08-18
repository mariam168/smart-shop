import React, { useState, useEffect, useCallback, useMemo } from 'react';
import advertisementService from '../../../services/advertisementService';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmationModal from '../../common/ConfirmationModal';
import AdvertisementForm from './AdvertisementForm';
import { Loader2, Info, Edit, Trash2, Plus, Search, Image as ImageIcon, ExternalLink, Percent, Calendar } from 'lucide-react';

const AdvertisementList = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [advertisementToEdit, setAdvertisementToEdit] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB').format(new Date(dateString));
    };

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const res = await advertisementService.getAllAdvertisements();
            setAdvertisements(res.data);
        } catch (err) { setError(t('general.errorFetchingData')); } 
        finally { setLoading(false); }
    }, [t]);

    useEffect(() => { fetchAds(); }, [fetchAds]);

    const handleOpenEditForm = (ad) => { setAdvertisementToEdit(ad); setIsFormOpen(true); };
    const handleOpenAddForm = () => { setAdvertisementToEdit(null); setIsFormOpen(true); };
    const handleActionSuccess = () => { setIsFormOpen(false); setAdvertisementToEdit(null); fetchAds(); };
    const handleDeleteClick = (ad) => { setAdToDelete(ad); setIsModalOpen(true); };

    const handleConfirmDelete = async () => {
        if (!adToDelete) return;
        setIsDeleting(true);
        try {
            await advertisementService.deleteAdvertisement(adToDelete._id);
            showToast(t('general.deletedSuccess'), 'success');
            fetchAds();
        } catch (err) {
            showToast(err.response?.data?.message || t('general.deleteError'), 'error');
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
            setAdToDelete(null);
        }
    };
    
    const filteredAdvertisements = useMemo(() => {
        if (!searchTerm) return advertisements;
        const term = searchTerm.toLowerCase();
        return advertisements.filter(ad => 
            ad.title?.en?.toLowerCase().includes(term) || 
            ad.title?.ar?.toLowerCase().includes(term) ||
            ad.productRef?.name?.en?.toLowerCase().includes(term) ||
            ad.productRef?.name?.ar?.toLowerCase().includes(term)
        );
    }, [advertisements, searchTerm]);
    const getTranslatedText = (item, field) => {
        if (!item || !item[field]) return '';
        if (typeof item[field] === 'object') {
            return item[field][language] || item[field].en || '';
        }
        return item[field];
    };


    if (loading) { return (<div className="flex min-h-[60vh] w-full items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>); }
    if (error) { return (<div className="flex min-h-[60vh] w-full items-center justify-center p-4">{/*...Error JSX...*/}</div>); }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                 <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('advertisementAdmin.advertisementListTitle')}</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('general.manageItemsMessage', { count: filteredAdvertisements.length, itemName: t('general.advertisements') })}</p>
                </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        <input type="text" placeholder={t('general.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 pl-9 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <button onClick={handleOpenAddForm} className="flex-shrink-0 flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark shadow-sm">
                        <Plus size={16} />
                        <span className="hidden sm:inline">{t('advertisementAdmin.addAdvertisementButton')}</span>
                    </button>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Advertisement</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Linked Product</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Details</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Status</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {filteredAdvertisements.map(ad => (
                            <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <td className="p-4 flex items-center gap-4 min-w-[300px]">
                                    {ad.image ? 
                                      <img src={`${SERVER_URL}${ad.image}`} alt={getTranslatedText(ad, 'title')} className="h-12 w-16 rounded-md object-cover flex-shrink-0" /> :
                                      <div className="h-12 w-16 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0"><ImageIcon className="h-6 w-6 text-gray-400"/></div>
                                    }
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800 dark:text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>{getTranslatedText(ad, 'title')}</span>
                                        <span className="text-xs text-gray-400 dark:text-zinc-500 capitalize">{ad.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 min-w-[200px]">
                                    {ad.productRef ? (
                                        <div className="flex items-center gap-2">
                                            {ad.productRef.mainImage && <img src={`${SERVER_URL}${ad.productRef.mainImage}`} alt={getTranslatedText(ad.productRef, 'name')} className="h-9 w-9 rounded-md object-cover flex-shrink-0" />}
                                            <span className="text-gray-600 dark:text-zinc-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>{getTranslatedText(ad.productRef, 'name')}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-zinc-500 italic">No Linked Product</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 min-w-[250px]">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                                            <Percent size={14} className="text-green-500 flex-shrink-0"/>
                                            <span>{ad.discountPercentage > 0 ? `${ad.discountPercentage}% Discount` : 'No Discount'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                                            <Calendar size={14} className="text-blue-500 flex-shrink-0"/>
                                            <span className="text-xs">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</span>
                                        </div>
                                        {ad.link && ad.link !== '#' && (
                                            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1.5">
                                                <ExternalLink size={14} className="flex-shrink-0"/>
                                                <span className="truncate">{ad.link}</span>
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${ad.isActive ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                                        {ad.isActive ? t('general.active') : t('general.inactive')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="inline-flex items-center rounded-md -space-x-px text-xs">
                                        <button onClick={() => handleOpenEditForm(ad)} className="rounded-l-md p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-primary dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-primary-light">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(ad)} className="rounded-r-md p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isFormOpen && ( <AdvertisementForm advertisementToEdit={advertisementToEdit} onClose={() => setIsFormOpen(false)} onActionSuccess={handleActionSuccess} /> )}
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} isConfirming={isDeleting} message={t('advertisementAdmin.confirmDelete', { advertisementTitle: getTranslatedText(adToDelete, 'title') })}/>
        </div>
    );
};

export default AdvertisementList;