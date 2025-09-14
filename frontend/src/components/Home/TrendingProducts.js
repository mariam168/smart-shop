import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "../ProductCard";
import { useLanguage } from "../../context/LanguageContext";
import { TrendingUp } from "lucide-react";
import axios from 'axios';
import DataHandler from '../common/DataHandler';

const TrendingProducts = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchTrendingData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const productsPromise = axios.get(`${API_BASE_URL}/api/products`, {
                headers: { 'Accept-Language': language }
            });
            const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`, {
                headers: { 'Accept-Language': language }
            });

            const [productsRes, advertisementsRes] = await Promise.all([
                productsPromise,
                advertisementsPromise
            ]);

            const allProducts = productsRes.data;
            const allAdvertisements = advertisementsRes.data;

            let enrichedProducts = allProducts.map(product => {
                const associatedAd = allAdvertisements.find(ad => (ad.productRef?._id || ad.productRef) === product._id);
                return { ...product, advertisement: associatedAd || null };
            });

            enrichedProducts.sort((a, b) => {
                const isAAdvertised = !!a.advertisement;
                const isBAdvertised = !!b.advertisement;
                if (isAAdvertised && !isBAdvertised) return -1;
                if (!isAAdvertised && isBAdvertised) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setProducts(enrichedProducts.slice(0, 8));
        } catch (err) {
            setError(t('trendingProducts.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [t, API_BASE_URL, language]);

    useEffect(() => {
        fetchTrendingData();
    }, [fetchTrendingData]); 

    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-3 mb-2">
                         <TrendingUp className="text-primary-light" size={32} />
                         <h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark dark:text-white">
                            {t('trendingProducts.title')}
                        </h2>
                    </div>
                    <p className="mt-3 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        {t('trendingProducts.subtitle')}
                    </p>
                </div>
                
                <DataHandler
                    loading={loading}
                    error={error}
                    data={products}
                    onRetry={fetchTrendingData}
                    emptyMessage={t('trendingProducts.noProductsFound')}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product) => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                advertisement={product.advertisement}
                            />
                        ))}
                    </div>
                </DataHandler>
            </div>
        </section>
    );
};

export default TrendingProducts;