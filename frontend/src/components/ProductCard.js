import React from "react";
import { Heart, Award, Star, ArrowRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < Math.round(rating) ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}
                fill="currentColor"
            />
        ))}
    </div>
);

const ProductCard = ({ product }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuth();

    if (!product || !product.name) {
        return null;
    }

    const getLocalizedText = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[language] || field.en;
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            showToast(t('wishlist.loginRequired'), 'info');
            navigate('/login');
            return;
        }
        if (product?._id) {
            toggleFavorite(product);
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };

    const formatPrice = (price) => {
        if (price == null) return t('general.notApplicable');
        const currencyCode = 'EGP';
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(price));
        } catch (error) {
            return `${price} ${currencyCode}`;
        }
    };

    const adData = product.advertisement;
    const isAdvertised = !!adData && adData.discountPercentage > 0;
    const discountPercentage = isAdvertised ? adData.discountPercentage : 0;
    
    let originalPrice = null;
    let finalPrice = null;

    let startingPrice = product.basePrice;
    if (product.variations && product.variations.length > 0 && product.variations[0].options && product.variations[0].options.length > 0) {
        startingPrice = product.variations[0].options[0].price;
    }

    if (isAdvertised) {
        originalPrice = startingPrice;
        finalPrice = startingPrice * (1 - (discountPercentage / 100));
    } else {
        finalPrice = startingPrice;
    }

    const productName = getLocalizedText(product.name);
    const productCategoryName = getLocalizedText(product.category?.name);
    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const imageUrl = product.mainImage || 'https://via.placeholder.com/400?text=No+Image';

    return (
        <div
            onClick={handleCardClick}
            className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 
            ${isAdvertised
                ? 'border-primary/50'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="relative overflow-hidden">
                <div className="bg-zinc-100 dark:bg-zinc-800 aspect-square flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt={productName}
                        className="h-full w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                        loading="lazy"
                    />
                </div>
                {isAdvertised && (
                    <div className={`absolute top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md ${language === 'ar' ? 'right-3' : 'left-3'}`}>
                        <Award size={14} />
                        <span>{Math.round(discountPercentage)}% {t('general.off')}</span>
                    </div>
                )}

                <button
                    aria-label={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    className={`action-button absolute top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-zinc-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-zinc-900/60 dark:text-white dark:hover:bg-zinc-800 ${language === 'ar' ? 'left-3' : 'right-3'}`}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-300'}/>
                </button>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary dark:text-primary-light">
                        {productCategoryName}
                    </p>

                    <h3
                        className="mb-3 text-lg font-bold text-zinc-900 line-clamp-2 leading-tight dark:text-white"
                        title={productName}
                    >
                        {productName}
                    </h3>

                    {product.numReviews > 0 && (
                        <div className="flex items-center gap-1.5">
                            <StarRating rating={product.averageRating} />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">({product.numReviews})</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            {originalPrice && originalPrice > finalPrice && (
                                <p className="text-sm font-medium text-zinc-400 line-through dark:text-zinc-500">
                                    {formatPrice(originalPrice)}
                                </p>
                            )}
                            <p className={`text-2xl font-extrabold ${isAdvertised ? 'text-red-600 dark:text-red-400' : 'text-primary-dark dark:text-primary-light'}`}>
                                {formatPrice(finalPrice)}
                            </p>
                        </div>
                        <div className="relative">
                             <button
                                className="action-button group/button flex h-11 items-center justify-center rounded-full bg-primary px-3 text-white transition-all duration-300 ease-in-out hover:w-32 dark:bg-primary-light dark:text-primary-dark"
                                onClick={handleViewDetails}
                                aria-label={t('productCard.viewDetails')}
                            >
                                <ShoppingCart size={18} />
                                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-in-out group-hover/button:ml-2 group-hover/button:max-w-xs">
                                    {t('productCard.viewDetails')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;