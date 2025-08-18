import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import advertisementService from '../../services/advertisementService';

export const useAdvertisementForm = (advertisementToEdit) => {
    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const [advertisement, setAdvertisement] = useState({
        title_en: "", title_ar: "", description_en: "", description_ar: "",
        link: "", type: "slide", isActive: true, order: 0,
        startDate: "", endDate: "", discountPercentage: "", productRef: "",
    });
    const [image, setImage] = useState({ file: null, preview: '', clear: false });
    const [products, setProducts] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/products/admin-list`, {
                headers: { 'x-admin-request': 'true' }
            });
            setProducts(res.data);
        } catch (err) {
            setError('Failed to fetch products.');
        }
    }, [serverUrl]);

    useEffect(() => {
        fetchProducts();
        if (advertisementToEdit) {
            setIsLoading(true);
            advertisementService.getAdvertisementRaw(advertisementToEdit._id)
                .then(res => {
                    const rawAd = res.data;
                    setAdvertisement({
                        title_en: rawAd.title?.en || '', title_ar: rawAd.title?.ar || '',
                        description_en: rawAd.description?.en || '', description_ar: rawAd.description?.ar || '',
                        link: rawAd.link || '', type: rawAd.type || 'slide', isActive: rawAd.isActive,
                        order: rawAd.order || 0,
                        startDate: rawAd.startDate ? new Date(rawAd.startDate).toISOString().slice(0, 10) : '',
                        endDate: rawAd.endDate ? new Date(rawAd.endDate).toISOString().slice(0, 10) : '',
                        discountPercentage: rawAd.discountPercentage ?? '',
                        productRef: rawAd.productRef?._id || '',
                    });
                    if (rawAd.image) {
                        setImage({ file: null, preview: `${serverUrl}${rawAd.image}`, clear: false });
                    }
                    if (rawAd.productRef) {
                        setProductSearchTerm(rawAd.productRef.name?.en || rawAd.productRef.name || '');
                    }
                })
                .catch(() => setError('Failed to load advertisement data.'))
                .finally(() => setIsLoading(false));
        } else {
            setAdvertisement({
                title_en: "", title_ar: "", description_en: "", description_ar: "",
                link: "", type: "slide", isActive: true, order: 0,
                startDate: "", endDate: "", discountPercentage: "", productRef: "",
            });
            setImage({ file: null, preview: '', clear: false });
            setProductSearchTerm("");
        }
    }, [advertisementToEdit, serverUrl, fetchProducts]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdvertisement(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleImageChange = (file) => {
        if (file) setImage({ file, preview: URL.createObjectURL(file), clear: false });
    };

    const handleRemoveImage = () => {
        setImage({ file: null, preview: '', clear: true });
    };

    const handleProductSelect = (product) => {
        if (product) {
            setAdvertisement(prev => ({ ...prev, productRef: product._id }));
            setProductSearchTerm(product.name?.en || product.name || "");
        } else {
            setAdvertisement(prev => ({ ...prev, productRef: "" }));
            setProductSearchTerm("");
        }
    };
    
    const prepareFormData = () => {
        const formData = new FormData();
        Object.entries(advertisement).forEach(([key, value]) => {
            if (value !== null) { 
                formData.append(key, value);
            }
        });

        if (image.file) {
            formData.append('image', image.file);
        }
        if (advertisementToEdit) {
            formData.append('clearImage', image.clear);
        }
        return formData;
    };

    return {
        advertisement, handleChange,
        image, handleImageChange, handleRemoveImage,
        products, productSearchTerm, setProductSearchTerm, handleProductSelect,
        isLoading, error,
        prepareFormData
    };
};