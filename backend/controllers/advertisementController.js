const Advertisement = require('../models/advertisementModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { deleteFile } = require('../utils/fileHandler');
const { translateDoc } = require('../utils/translator');

const getAdvertisements = async (req, res, next) => {
    try {
        const { type, isActive, productRef } = req.query;
        const isAdminRequest = req.headers['x-admin-request'] === 'true';
        const lang = req.language || 'en';

        let queryFilter = {};
        if (type) queryFilter.type = type;
        if (isActive !== undefined) queryFilter.isActive = isActive === 'true';
        if (productRef && mongoose.Types.ObjectId.isValid(productRef)) {
            queryFilter.productRef = productRef;
        }

        let advertisements = await Advertisement.find(queryFilter)
            .sort({ order: 1, createdAt: -1 })
            .populate({ 
                path: 'productRef',
                populate: { path: 'category', select: 'name' } 
            })
            .lean();
        
        if (!isAdminRequest) {
            advertisements = advertisements.map(ad => {
                let translatedAd = { ...ad };
                if (ad.productRef) {
                    translatedAd.productRef = translateDoc(ad.productRef, lang, ['name', 'description', 'category.name']);
                }
                return translateDoc(translatedAd, lang, ['title', 'description']);
            });
        }
        
        res.json(advertisements);
    } catch (err) {
        next(err);
    }
};

const getAdvertisementRaw = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Advertisement not found (Invalid ID).' });
        }
        const advertisement = await Advertisement.findById(req.params.id).populate('productRef', 'name');
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }
        res.json(advertisement);
    } catch (err) {
        next(err);
    }
};

const createAdvertisement = async (req, res, next) => {
    const { title_en, title_ar, description_en, description_ar, link, type, isActive, order, startDate, endDate, discountPercentage, productRef } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!title_en?.trim() || !title_ar?.trim()) {
        if (req.file) await deleteFile(imagePath);
        return res.status(400).json({ message: 'Title (English & Arabic) are required.' });
    }

    try {
        const newAdData = {
            title: { en: title_en.trim(), ar: title_ar.trim() },
            description: { en: description_en?.trim() || '', ar: description_ar?.trim() || '' },
            image: imagePath,
            link: link?.trim() || '#',
            type: type || 'slide',
            isActive: isActive === 'true' || isActive === true,
            order: parseInt(order) || 0,
            startDate: startDate || null,
            endDate: endDate || null,
            discountPercentage: (discountPercentage !== '' && discountPercentage != null) ? parseFloat(discountPercentage) : 0,
        };

        if (productRef && mongoose.Types.ObjectId.isValid(productRef)) {
            const productExists = await Product.findById(productRef);
            if (!productExists) {
                if (req.file) await deleteFile(imagePath);
                return res.status(400).json({ message: 'Invalid productRef: Product not found.' });
            }
            newAdData.productRef = productRef;
        } else {
            newAdData.productRef = null;
        }
        
        const advertisement = new Advertisement(newAdData);
        await advertisement.save();
        res.status(201).json(advertisement);
    } catch (err) {
        if (req.file) await deleteFile(imagePath);
        next(err);
    }
};

const updateAdvertisement = async (req, res, next) => {
    const { id } = req.params;
    const { 
        title_en, title_ar, description_en, description_ar, 
        link, type, isActive, order, startDate, endDate, 
        discountPercentage, productRef, clearImage 
    } = req.body;

    try {
        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            if (req.file) await deleteFile(req.file.path);
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        const updateData = {};

        if (title_en) updateData['title.en'] = title_en.trim();
        if (title_ar) updateData['title.ar'] = title_ar.trim();
        if (description_en !== undefined) updateData['description.en'] = description_en.trim();
        if (description_ar !== undefined) updateData['description.ar'] = description_ar.trim();
        if (link !== undefined) updateData.link = link.trim();
        if (type) updateData.type = type;
        if (isActive !== undefined) updateData.isActive = (isActive === 'true' || isActive === true);
        if (order !== undefined) updateData.order = parseInt(order);
        if (startDate !== undefined) updateData.startDate = startDate || null;
        if (endDate !== undefined) updateData.endDate = endDate || null;
        if (discountPercentage !== undefined) {
            updateData.discountPercentage = (discountPercentage !== '' && discountPercentage != null) ? parseFloat(discountPercentage) : 0;
        }

        if (productRef !== undefined) {
            if (productRef && mongoose.Types.ObjectId.isValid(productRef)) {
                const productExists = await Product.findById(productRef);
                if (!productExists) {
                    if (req.file) await deleteFile(req.file.path);
                    return res.status(400).json({ message: 'Invalid productRef: Product not found.' });
                }
                updateData.productRef = productRef;
            } else {
                updateData.productRef = null;
            }
        }

        if (req.file) {
            if (advertisement.image) {
                await deleteFile(advertisement.image);
            }
            updateData.image = req.file.path;
        } else if (clearImage === 'true') {
            if (advertisement.image) {
                await deleteFile(advertisement.image);
            }
            updateData.image = '';
        }

        const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedAdvertisement);

    } catch (err) {
        if (req.file) await deleteFile(req.file.path);
        next(err);
    }
};

const deleteAdvertisement = async (req, res, next) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
        
        if (advertisement.image) {
            await deleteFile(advertisement.image);
        }
        
        await Advertisement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Advertisement deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAdvertisements,
    getAdvertisementRaw,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
};