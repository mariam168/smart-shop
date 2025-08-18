const Discount = require('../models/discountModel');
const validateDiscount = async (req, res, next) => {
    const { code, totalAmount } = req.body;
    try {
        const currentDate = new Date();
        const discount = await Discount.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        if (!discount) {
            return res.status(404).json({ message: 'Invalid or expired discount code.' });
        }

        if (totalAmount < discount.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount of ${discount.minOrderAmount} is required.` });
        }

        let discountAmount = 0;
        if (discount.percentage) {
            discountAmount = (totalAmount * discount.percentage) / 100;
            if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
                discountAmount = discount.maxDiscountAmount;
            }
        } else if (discount.fixedAmount) {
            discountAmount = discount.fixedAmount;
        }

        res.json({ message: 'Discount applied!', discountAmount, code: discount.code });
    } catch (error) {
        next(error);
    }
};
const getActiveDiscounts = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const activeDiscounts = await Discount.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ endDate: 1 });
        res.status(200).json(activeDiscounts);
    } catch (error) {
        next(error);
    }
};
const getAllDiscounts = async (req, res, next) => {
    try {
        const discounts = await Discount.find({}).sort({ createdAt: -1 });
        res.status(200).json(discounts);
    } catch (error) {
        next(error);
    }
};

const getDiscountById = async (req, res, next) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) return res.status(404).json({ message: 'Discount not found' });
        res.status(200).json(discount);
    } catch (error) {
        next(error);
    }
};
const createDiscount = async (req, res, next) => {
    try {
        const { code, percentage, fixedAmount, minOrderAmount, maxDiscountAmount, startDate, endDate, isActive } = req.body;
        const newDiscount = new Discount({
            code,
            percentage: (percentage !== undefined && percentage !== '') ? Number(percentage) : undefined,
            fixedAmount: (fixedAmount !== undefined && fixedAmount !== '') ? Number(fixedAmount) : undefined,
            minOrderAmount: (minOrderAmount !== undefined && minOrderAmount !== '') ? Number(minOrderAmount) : 0,
            maxDiscountAmount: (maxDiscountAmount !== undefined && maxDiscountAmount !== '') ? Number(maxDiscountAmount) : undefined,
            startDate, endDate,
            isActive: isActive === 'true' || isActive === true,
        });
        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: `Discount code "${req.body.code}" already exists.` });
        }
        next(error);
    }
};
const updateDiscount = async (req, res, next) => {
    try {
        const updatedDiscount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedDiscount) return res.status(404).json({ message: 'Discount not found' });
        res.status(200).json(updatedDiscount);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: `Discount code "${req.body.code}" already exists.` });
        }
        next(error);
    }
};
const deleteDiscount = async (req, res, next) => {
    try {
        const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
        if (!deletedDiscount) return res.status(404).json({ message: 'Discount not found' });
        res.status(200).json({ message: 'Discount deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateDiscount,
    getActiveDiscounts,
    getAllDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
};