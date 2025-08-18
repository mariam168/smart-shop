import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import productService from '../../services/productService';

export const useProductForm = (productToEdit) => {
    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    
    const [product, setProduct] = useState({ name_en: '', name_ar: '', description_en: '', description_ar: '', basePrice: '', category: '', subCategory: '' });
    const [attributes, setAttributes] = useState([]);
    const [variations, setVariations] = useState([]);
    const [mainImage, setMainImage] = useState({ file: null, preview: '', clear: false });
    const [optionImageFiles, setOptionImageFiles] = useState({});
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/categories`, { headers: { 'x-admin-request': 'true' } });
            setCategories(res.data);
        } catch (err) { setError('Failed to fetch categories.'); }
    }, [serverUrl]);

    useEffect(() => {
        fetchCategories();
        if (productToEdit) {
            setIsLoading(true);
            productService.getProductByIdAdmin(productToEdit._id)
                .then(res => {
                    const fullProduct = res.data;
                    setProduct({
                        name_en: fullProduct.name?.en || '', name_ar: fullProduct.name?.ar || '',
                        description_en: fullProduct.description?.en || '', description_ar: fullProduct.description?.ar || '',
                        basePrice: fullProduct.basePrice || '',
                        category: fullProduct.category?._id || fullProduct.category || '',
                        subCategory: fullProduct.subCategory?._id || fullProduct.subCategory || '',
                    });
                    setAttributes(fullProduct.attributes || []);
                    setVariations((fullProduct.variations || []).map(v => {
                        const newOptions = (v.options || []).map(o => ({
                            ...o,
                            preview: o.image ? `${serverUrl}${o.image}` : null
                        }));
                        return {...v, options: newOptions};
                    }));
                    if (fullProduct.mainImage) {
                        setMainImage({ file: null, preview: `${serverUrl}${fullProduct.mainImage}`, clear: false });
                    }
                })
                .catch(() => setError('Failed to load product data.'))
                .finally(() => setIsLoading(false));
        }
    }, [productToEdit, serverUrl, fetchCategories]);

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setProduct(prev => ({ ...prev, category: value, subCategory: '' }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleMainImageChange = (file) => { if (file) { setMainImage({ file, preview: URL.createObjectURL(file), clear: false }); } };
    const handleRemoveMainImage = () => { setMainImage({ file: null, preview: '', clear: true }); };

    const addAttribute = () => setAttributes(prev => [...prev, { key_en: '', key_ar: '', value_en: '', value_ar: '' }]);
    const removeAttribute = (index) => setAttributes(prev => prev.filter((_, i) => i !== index));
    const handleAttributeChange = (index, field, value) => setAttributes(prev => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));

    const addVariation = () => setVariations(prev => [...prev, { _id: `temp_${Date.now()}`, name_en: '', name_ar: '', options: [] }]);
    const removeVariation = (vIndex) => setVariations(prev => prev.filter((_, i) => i !== vIndex));
    const handleVariationNameChange = (vIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, [`name_${lang}`]: value } : v)));

    const addOptionToVariation = (vIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: [...v.options, { _id: `temp_${Date.now()}`, name_en: '', name_ar: '', image: null, preview: null, skus: [] }] } : v)));
    const removeOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.filter((_, j) => j !== oIndex) } : v)));
    const handleOptionNameChange = (vIndex, oIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, [`name_${lang}`]: value } : o)) } : v)));
    const handleOptionImageChange = (vIndex, oIndex, file) => {
        if (file) {
            const key = `variationImage_${vIndex}_${oIndex}`;
            setOptionImageFiles(prev => ({ ...prev, [key]: file }));
            setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, preview: URL.createObjectURL(file) } : o)) } : v)));
        }
    };
    
    const addSkuToOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: [...o.skus, { _id: `temp_${Date.now()}`, name_en: '', name_ar: '', price: product.basePrice, stock: 0, sku: '' }] } : o)) } : v)));
    const removeSku = (vIndex, oIndex, sIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.filter((_, k) => k !== sIndex) } : o)) } : v)));
    const handleSkuChange = (vIndex, oIndex, sIndex, field, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.map((s, k) => (k === sIndex ? { ...s, [field]: value } : s)) } : v)) } : v)));

    const prepareFormData = () => {
        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => formData.append(key, value));
        
        formData.append('attributes', JSON.stringify(attributes));
        
        const finalVariations = variations.map(v => {
            const options = v.options.map(o => {
                const skus = o.skus.map(s => {
                    const newSku = {...s};
                    if (String(s._id).startsWith('temp_')) delete newSku._id;
                    return newSku;
                });
                const newOption = {...o, skus};
                if (String(o._id).startsWith('temp_')) delete newOption._id;
                return newOption;
            });
            const newVariation = {...v, options};
            if (String(v._id).startsWith('temp_')) delete newVariation._id;
            return newVariation;
        });
        formData.append('variations', JSON.stringify(finalVariations));
        
        if (mainImage.file) formData.append('mainImage', mainImage.file);
        if (productToEdit) formData.append('clearMainImage', String(mainImage.clear));
        
        Object.entries(optionImageFiles).forEach(([key, file]) => {
            formData.append(key, file);
        });

        return formData;
    };

    return {
        product, handleProductChange,
        attributes, addAttribute, removeAttribute, handleAttributeChange,
        variations, addVariation, removeVariation, handleVariationNameChange,
        addOptionToVariation, removeOption, handleOptionNameChange, handleOptionImageChange,
        addSkuToOption, removeSku, handleSkuChange,
        mainImage, handleMainImageChange, handleRemoveMainImage,
        categories, isLoading, error,
        prepareFormData
    };
};