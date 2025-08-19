import { useState, useEffect } from 'react';

export const useCategoryForm = (categoryToEdit) => {
    const [category, setCategory] = useState({ name: { en: '', ar: '' }, description: { en: '', ar: '' } });
    const [subCategories, setSubCategories] = useState([]);
    const [mainImage, setMainImage] = useState({ file: null, preview: '', clear: false });
    const [subCategoryFiles, setSubCategoryFiles] = useState({});

    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                name: categoryToEdit.name || { en: '', ar: '' },
                description: categoryToEdit.description || { en: '', ar: '' },
            });
            setSubCategories((categoryToEdit.subCategories || []).map(sub => ({
                ...sub,
                tempId: sub._id || `temp_${Date.now() + Math.random()}`,
                preview: sub.imageUrl || '',
            })));
            setMainImage({ file: null, preview: categoryToEdit.imageUrl || '', clear: false });
            setSubCategoryFiles({});
        } else {
            setCategory({ name: { en: '', ar: '' }, description: { en: '', ar: '' } });
            setSubCategories([]);
            setMainImage({ file: null, preview: '', clear: false });
            setSubCategoryFiles({});
        }
    }, [categoryToEdit]);

    const handleMainFieldChange = (e) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('_');
        setCategory(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };

    const handleMainImageChange = (file) => {
        if (file) setMainImage({ file, preview: URL.createObjectURL(file), clear: false });
    };

    const handleRemoveMainImage = () => {
        setMainImage({ file: null, preview: '', clear: true });
    };

    const handleAddSubCategory = () => {
        const newSub = {
            tempId: `temp_${Date.now() + Math.random()}`,
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            imageUrl: '', preview: '', hasNewImage: false,
        };
        setSubCategories(prev => [...prev, newSub]);
    };

    const handleSubCategoryChange = (tempId, field, lang, value) => {
        setSubCategories(prev => prev.map(sub => 
            sub.tempId === tempId ? { ...sub, [field]: { ...sub[field], [lang]: value } } : sub
        ));
    };

    const handleSubCategoryImageChange = (tempId, file) => {
        if (file) {
            setSubCategoryFiles(prev => ({ ...prev, [tempId]: file }));
            setSubCategories(prev => prev.map(sub => 
                sub.tempId === tempId ? { ...sub, preview: URL.createObjectURL(file), hasNewImage: true } : sub
            ));
        }
    };

    const handleRemoveSubCategory = (tempId) => {
        setSubCategories(prev => prev.filter(sub => sub.tempId !== tempId));
        setSubCategoryFiles(prev => {
            const { [tempId]: _, ...rest } = prev;
            return rest;
        });
    };

    const prepareFormData = () => {
        const formData = new FormData();
        formData.append('name_en', category.name.en);
        formData.append('name_ar', category.name.ar);
        formData.append('description_en', category.description.en);
        formData.append('description_ar', category.description.ar);

        if (categoryToEdit) formData.append('clearMainImage', mainImage.clear);
        if (mainImage.file) formData.append('mainImage', mainImage.file);

        const subCategoryPayload = subCategories.map(sub => ({
            _id: String(sub._id).startsWith('temp_') ? undefined : sub._id,
            name: sub.name,
            description: sub.description,
            imageUrl: sub.imageUrl,
            hasNewImage: !!subCategoryFiles[sub.tempId]
        }));
        formData.append('subCategories', JSON.stringify(subCategoryPayload));
        
        Object.values(subCategoryFiles).forEach(file => {
            formData.append('subCategoryImages', file);
        });
        
        return formData;
    };

    return {
        category, subCategories, mainImage,
        handleMainFieldChange, handleMainImageChange, handleRemoveMainImage,
        handleAddSubCategory, handleSubCategoryChange, handleSubCategoryImageChange, handleRemoveSubCategory,
        prepareFormData
    };
};