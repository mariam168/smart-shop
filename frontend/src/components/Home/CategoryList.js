import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import DataHandler from '../common/DataHandler';

const CategoryList = () => {
    const { t, language } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${SERVER_URL}/api/categories`, {
                headers: { 'Accept-Language': language }
            });
            const filteredCategories = response.data.filter(cat =>
                cat.imageUrl && cat.name
            );
            setCategories(filteredCategories);
        } catch (err) {
            setError(t('categoryList.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [SERVER_URL, t, language]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark dark:text-white">
                        {t('categoryList.title')}
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        {t('categoryList.subtitle')}
                    </p>
                </div>
                
                <DataHandler
                    loading={loading}
                    error={error}
                    data={categories}
                    onRetry={fetchCategories}
                    emptyMessage={t('categoryList.noCategoriesFound')}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 justify-center">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                to={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="group flex flex-col items-center text-center p-3 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-primary-light/10"
                            >
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden mb-5 bg-gray-200 dark:bg-zinc-800 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-primary-light/20 group-hover:ring-4 group-hover:ring-primary-light/50">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name || t('categoryList.imageAlt')}
                                        className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/300?text=${encodeURIComponent(category.name?.[0] || '?')}`; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-primary-dark dark:text-white transition-colors duration-300 group-hover:text-primary-light">
                                    {category.name || t('categoryList.unnamedCategory')}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </DataHandler>
            </div>
        </section>
    );
};

export default CategoryList;