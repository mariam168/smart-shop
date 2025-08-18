const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { deleteFile } = require('../utils/fileHandler');
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ 'name.en': 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
};
const createCategory = async (req, res, next) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON } = req.body;
        const subCategoriesData = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        const subCategoryImages = req.files.subCategoryImages || [];
        let imageCounter = 0;

        const subCategories = subCategoriesData.map(sub => {
            if (sub.hasNewImage && subCategoryImages[imageCounter]) {
                sub.imageUrl = `/uploads/categories/${subCategoryImages[imageCounter].filename}`;
                imageCounter++;
            }
            delete sub.hasNewImage;
            return sub;
        });

        const newCategoryData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            subCategories
        };
        if (req.files.mainImage) {
            newCategoryData.imageUrl = `/uploads/categories/${req.files.mainImage[0].filename}`;
        }

        const newCategory = new Category(newCategoryData);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/categories/${req.files.mainImage[0].filename}`);
            if (req.files.subCategoryImages) {
                req.files.subCategoryImages.forEach(f => deleteFile(`/uploads/categories/${f.filename}`));
            }
        }
        next(error);
    }
};
const updateCategory = async (req, res, next) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON, clearMainImage } = req.body;

        const categoryToUpdate = await Category.findById(req.params.id);
        if (!categoryToUpdate) return res.status(404).json({ message: 'Category not found' });

        const incomingSubCategories = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        const newSubCategoryImages = req.files.subCategoryImages || [];
        let imageCounter = 0;

        const finalSubCategories = [];
        const oldSubCategoryImagesToDelete = new Map(categoryToUpdate.subCategories.map(s => [s._id.toString(), s.imageUrl]));

        for (const sub of incomingSubCategories) {
            const existingSub = sub._id ? categoryToUpdate.subCategories.id(sub._id) : null;
            const subData = {
                _id: existingSub ? existingSub._id : undefined,
                name: { en: sub.name.en, ar: sub.name.ar },
                description: { en: sub.description.en || '', ar: sub.description.ar || '' },
                imageUrl: existingSub ? existingSub.imageUrl : undefined
            };

            if (sub.hasNewImage && newSubCategoryImages[imageCounter]) {
                if (existingSub && existingSub.imageUrl) {
                    deleteFile(existingSub.imageUrl);
                }
                subData.imageUrl = `/uploads/categories/${newSubCategoryImages[imageCounter].filename}`;
                imageCounter++;
            }
            
            finalSubCategories.push(subData);
            if(existingSub) oldSubCategoryImagesToDelete.delete(existingSub._id.toString());
        }
        for (const imageUrl of oldSubCategoryImagesToDelete.values()) {
            deleteFile(imageUrl);
        }

        categoryToUpdate.name = { en: name_en, ar: name_ar };
        categoryToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        categoryToUpdate.subCategories = finalSubCategories;

        if (req.files.mainImage) {
            deleteFile(categoryToUpdate.imageUrl);
            categoryToUpdate.imageUrl = `/uploads/categories/${req.files.mainImage[0].filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(categoryToUpdate.imageUrl);
            categoryToUpdate.imageUrl = '';
        }

        const updatedCategory = await categoryToUpdate.save();
        res.json(updatedCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/categories/${req.files.mainImage[0].filename}`);
            if (req.files.subCategoryImages) {
                req.files.subCategoryImages.forEach(f => deleteFile(`/uploads/categories/${f.filename}`));
            }
        }
        next(error);
    }
};
const deleteCategory = async (req, res, next) => {
    try {
        const categoryToDelete = await Category.findById(req.params.id);
        if (!categoryToDelete) return res.status(404).json({ message: 'Category not found' });

        const productCount = await Product.countDocuments({ category: categoryToDelete._id });
        if (productCount > 0) {
            return res.status(400).json({ message: `Cannot delete. Category is used by ${productCount} products.` });
        }

        deleteFile(categoryToDelete.imageUrl);
        categoryToDelete.subCategories.forEach(sub => deleteFile(sub.imageUrl));

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};