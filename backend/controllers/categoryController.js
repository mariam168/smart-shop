const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

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
        
        const mainImageFile = req.files['mainImage'] ? req.files['mainImage'][0] : null;
        const subCategoryImages = req.files['subCategoryImages'] || [];
        
        const subCategoriesData = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        let imageCounter = 0;

        const subCategories = subCategoriesData.map(sub => {
            const newSub = {
                name: sub.name,
                description: sub.description,
            };
            if (sub.hasNewImage && subCategoryImages[imageCounter]) {
                newSub.imageUrl = subCategoryImages[imageCounter].path; 
                imageCounter++;
            }
            return newSub;
        });

        const newCategoryData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            subCategories
        };
        
        if (mainImageFile) {
            newCategoryData.imageUrl = mainImageFile.path; 
        }

        const newCategory = new Category(newCategoryData);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON, clearMainImage } = req.body;

        const categoryToUpdate = await Category.findById(req.params.id);
        if (!categoryToUpdate) return res.status(404).json({ message: 'Category not found' });

        const mainImageFile = req.files['mainImage'] ? req.files['mainImage'][0] : null;
        const newSubCategoryImages = req.files['subCategoryImages'] || [];

        const incomingSubCategories = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        let imageCounter = 0;

        const finalSubCategories = incomingSubCategories.map(sub => {
            const existingSub = sub._id ? categoryToUpdate.subCategories.id(sub._id) : null;
            
            const subData = {
                _id: existingSub ? existingSub._id : new mongoose.Types.ObjectId(),
                name: sub.name,
                description: sub.description,
                imageUrl: existingSub ? existingSub.imageUrl : undefined
            };

            if (sub.hasNewImage && newSubCategoryImages[imageCounter]) {
                subData.imageUrl = newSubCategoryImages[imageCounter].path; 
                imageCounter++;
            }
            return subData;
        });

        categoryToUpdate.name = { en: name_en, ar: name_ar };
        categoryToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        categoryToUpdate.subCategories = finalSubCategories;

        if (mainImageFile) {
            categoryToUpdate.imageUrl = mainImageFile.path; 
        } else if (clearMainImage === 'true') {
            categoryToUpdate.imageUrl = '';
        }

        const updatedCategory = await categoryToUpdate.save();
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const categoryToDelete = await Category.findByIdAndDelete(req.params.id);
        if (!categoryToDelete) return res.status(404).json({ message: 'Category not found' });

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