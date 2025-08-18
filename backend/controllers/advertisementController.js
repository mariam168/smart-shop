const Advertisement = require('../models/advertisementModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { deleteFile } = require('../utils/fileHandler');

const getAdvertisements = async (req, res, next) => {
    try {
        const { type, isActive } = req.query;
        let queryFilter = {};
        if (type) queryFilter.type = type;
        if (isActive !== undefined) queryFilter.isActive = isActive === 'true';

        const advertisements = await Advertisement.find(queryFilter)
            .sort({ order: 1, createdAt: -1 })
            .populate({ path: 'productRef', select: 'name mainImage' })
            .lean();
        
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
    // --- التعديل هنا: العودة لاستخدام req.file ---
    const imagePath = req.file ? `/uploads/advertisements/${req.file.filename}` : null;

    if (!title_en?.trim() || !title_ar?.trim()) {
        if (req.file) deleteFile(imagePath);
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
                if (req.file) deleteFile(imagePath);
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
        if (req.file) deleteFile(imagePath);
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
            if (req.file) deleteFile(`/uploads/advertisements/${req.file.filename}`);
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
                    return res.status(400).json({ message: 'Invalid productRef: Product not found.' });
                }
                updateData.productRef = productRef;
            } else {
                updateData.productRef = null;
            }
        }

        // --- التعديل هنا: العودة لاستخدام req.file ---
        if (req.file) {
            deleteFile(advertisement.image);
            updateData.image = `/uploads/advertisements/${req.file.filename}`;
        } else if (clearImage === 'true') {
            deleteFile(advertisement.image);
            updateData.image = '';
        }

        const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedAdvertisement);

    } catch (err) {
        if (req.file) deleteFile(`/uploads/advertisements/${req.file.filename}`);
        next(err);
    }
};

const deleteAdvertisement = async (req, res, next) => {
    try {
        const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
        if (!advertisement) return res.status(404).json({ message: 'Advertisement not found' });
        deleteFile(advertisement.image);
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