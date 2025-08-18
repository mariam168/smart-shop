const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Advertisement = require('../models/advertisementModel');
const { deleteFile } = require('../utils/fileHandler');
const { translateDoc } = require('../utils/translator');
const getAdminProductList = async (req, res, next) => {
    try {
        const products = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();
        res.json(products);
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const lang = req.language || 'en';
        const now = new Date();
        const allProducts = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();
        const validAds = await Advertisement.find({
            isActive: true, productRef: { $ne: null },
            $and: [{ $or: [{ startDate: null }, { startDate: { $lte: now } }] }, { $or: [{ endDate: null }, { endDate: { $gte: now } }] }]
        }).lean();
        
        const adsMap = new Map(validAds.map(ad => [ad.productRef.toString(), ad]));

        const finalProducts = allProducts.map(product => {
            let productWithAd = { ...product };
            if (adsMap.has(product._id.toString())) {
                productWithAd.advertisement = adsMap.get(product._id.toString());
            }
           return translateDoc(productWithAd, lang, ['name', 'description', 'category.name', 'advertisement.title', 'advertisement.description']);
        });
        res.json(finalProducts);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const lang = req.language || 'en';
        const isAdminRequest = req.headers['x-admin-request'] === 'true';
        const now = new Date();

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found (Invalid ID).' });
        }

        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('reviews.user', 'name')
            .lean();
        
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        if (isAdminRequest) {
            return res.json(product); 
        }

        const activeAd = await Advertisement.findOne({
            isActive: true, productRef: product._id,
            $and: [{ $or: [{ startDate: null }, { startDate: { $lte: now } }] }, { $or: [{ endDate: null }, { endDate: { $gte: now } }] }]
        }).lean();

        let finalProduct = { ...product };
        if (activeAd) { finalProduct.advertisement = activeAd; }

        const translatedProduct = translateDoc(finalProduct, lang, ['name', 'description', 'category.name', 'advertisement.title', 'advertisement.description']);
        res.json(translatedProduct);
    } catch (error) {
        next(error);
    }
};
const createProduct = async (req, res, next) => {
    try {
        const { name_en, name_ar, description_en, description_ar, basePrice, category, subCategory, attributes, variations } = req.body;
        const newProductData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            basePrice, category, subCategory: subCategory || null,
            attributes: attributes ? JSON.parse(attributes) : [],
            variations: variations ? JSON.parse(variations) : [],
        };
        const mainImage = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImage) newProductData.mainImage = `/uploads/products/${mainImage.filename}`;

        if (newProductData.variations) {
            newProductData.variations.forEach((v, vIndex) => {
                if (v.options) v.options.forEach((o, oIndex) => {
                    const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                    if (imageFile) o.image = `/uploads/products/${imageFile.filename}`;
                });
            });
        }
        const product = new Product(newProductData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        next(error);
    }
};
const updateProduct = async (req, res, next) => {
    try {
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) return res.status(404).json({ message: 'Product not found.' });

        const { name_en, name_ar, description_en, description_ar, basePrice, category, subCategory, attributes, variations, clearMainImage } = req.body;
        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        productToUpdate.basePrice = basePrice;
        productToUpdate.category = category;
        productToUpdate.subCategory = subCategory || null;
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = `/uploads/products/${mainImageFile.filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = null;
        }
        
        const incomingVariations = variations ? JSON.parse(variations) : [];
        const oldVariationOptionsImages = new Map();
        productToUpdate.variations.forEach(v => v.options.forEach(o => { if (o._id && o.image) oldVariationOptionsImages.set(o._id.toString(), o.image); }));

        const updatedVariations = incomingVariations.map((iVar, vIndex) => {
            const options = iVar.options.map((iOpt, oIndex) => {
                const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                let imagePath = iOpt.image;
                if (imageFile) {
                    if (iOpt._id && oldVariationOptionsImages.has(iOpt._id.toString())) {
                        deleteFile(oldVariationOptionsImages.get(iOpt._id.toString()));
                    }
                    imagePath = `/uploads/products/${imageFile.filename}`;
                }
                return { ...iOpt, _id: iOpt._id || new mongoose.Types.ObjectId(), image: imagePath, skus: iOpt.skus.map(s => ({...s, _id: s._id || new mongoose.Types.ObjectId()})) };
            });
            return { ...iVar, _id: iVar._id || new mongoose.Types.ObjectId(), options: options };
        });
        
        const newOptionIds = new Set(updatedVariations.flatMap(v => v.options.map(o => o._id.toString())));
        for (const [optionId, imagePath] of oldVariationOptionsImages.entries()) {
            if (!newOptionIds.has(optionId)) deleteFile(imagePath);
        }

        productToUpdate.variations = updatedVariations;
        productToUpdate.markModified('variations');

        const updatedProduct = await productToUpdate.save();
        res.json(updatedProduct);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        next(error);
    }
};
const deleteProduct = async (req, res, next) => {
    try {
        const productToDelete = await Product.findByIdAndDelete(req.params.id);
        if (!productToDelete) return res.status(404).json({ message: 'Product not found.' });

        deleteFile(productToDelete.mainImage);
        productToDelete.variations.forEach(v => v.options.forEach(o => { if (o.image) deleteFile(o.image); }));

        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
const createProductReview = async (req, res, next) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

        const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        
        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminProductList,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
};