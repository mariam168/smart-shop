import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white dark:bg-black p-4 text-center">
            <div className="w-full max-w-md">
                <AlertTriangle className="mx-auto h-16 w-16 text-primary" />
                <h1 className="mt-6 text-5xl font-extrabold text-zinc-900 dark:text-white">404</h1>
                <p className="mt-2 text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                    {t('general.pageNotFound', 'Page Not Found')}
                </p>
                <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
                    {t('general.pageNotFoundDesc', "Sorry, we couldn't find the page you're looking for.")}
                </p>
                <Link
                    to="/"
                    className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                    {t('general.backToHome', 'Go Back Home')}
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;