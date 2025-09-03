import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

const OrderList = () => {
    const { t } = useLanguage();
    const { token, loadingAuth } = useAuth();

    useEffect(() => {
        console.log("--- OrderList Component ---");
        console.log("Auth Loading Status:", loadingAuth);
        console.log("Token Value:", token);
    }, [token, loadingAuth]);

    if (loadingAuth) {
        return (
            <div className="text-center p-10">
                <p>Auth is loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Order List Test Page
            </h2>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                <p className="font-mono text-sm">
                    <strong>Current Token: </strong> 
                    {token ? `Token exists (length: ${token.length})` : 'No Token Found'}
                </p>
                <p className="mt-2 text-xs">
                    Please check the browser's developer console (F12) for more details.
                </p>
            </div>
        </div>
    );
};

export default OrderList;