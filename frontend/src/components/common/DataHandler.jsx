import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Info, RefreshCcw, AlertCircle, Loader2 } from 'lucide-react';

const PageLoader = () => (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
    </div>
);

const ErrorMessage = ({ message, onRetry }) => {
    const { t } = useLanguage();
    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
            <div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4">
                <AlertCircle size={40} />
                <p className="font-semibold text-xl">{t('general.error')}</p>
                <p className="text-base">{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700">
                        <RefreshCcw size={16} />
                        <span>{t('general.retry')}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const DataHandler = ({ loading, error, data, onRetry, emptyMessage, emptyIcon: EmptyIcon = Info, children }) => {
    const { t } = useLanguage();
    
    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={onRetry} />;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                <EmptyIcon size={48} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
                <p className="font-semibold text-xl text-zinc-800 dark:text-white">
                    {emptyMessage || t('general.noDataFound')}
                </p>
            </div>
        );
    }

    return children;
};

export default DataHandler;