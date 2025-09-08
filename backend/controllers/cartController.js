const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Advertisement = require('../models/advertisementModel');
const mongoose = require('mongoose');

const getCart = async (req, res, next) => {
    try {
        let userCart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name mainImage variations category',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

        if (!userCart || !userCart.items) {
            return res.status(200).json({ items: [] });
        }

        const validItems = userCart.items.filter(item => item.product);
        if (validItems.length < userCart.items.length) {
            userCart.items = validItems;
            await userCart.save();
        }

        res.status(200).json(userCart);
    } catch (error) {
        next(error);
    }
};

const syncCart = async (req, res, next) => {
    try {
        const { items } = req.body;
        const user = req.user.id;

        const productIds = items.map(item => new mongoose.Types.ObjectId(item.product));
        const products = await Product.find({ '_id': { $in: productIds } });
        const productsMap = new Map(products.map(p => [p._id.toString(), p]));

        const activeAds = await Advertisement.find({
            productRef: { $in: productIds },
            isActive: true,
            $and: [
                { $or: [{ startDate: null }, { startDate: { $lte: new Date() } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] }
            ]
        });
        const adsMap = new Map(activeAds.map(ad => [ad.productRef.toString(), ad]));

        const finalCartItems = items.map(item => {
            const product = productsMap.get(item.product.toString());
            if (!product) return null;

            let priceForCalculation = item.price;
            let finalStock = item.stock;

            const activeAd = adsMap.get(item.product.toString());
            let finalPrice = priceForCalculation;
            if (activeAd && activeAd.discountPercentage > 0) {
                finalPrice = priceForCalculation * (1 - (activeAd.discountPercentage / 100));
            }
            finalPrice = Math.round(finalPrice * 100) / 100;

            return {
                ...item,
                name: product.name,
                originalPrice: priceForCalculation,
                finalPrice: finalPrice,
                stock: finalStock,
            };
        }).filter(Boolean);

        const cart = await Cart.findOneAndUpdate(
            { user },
            { items: finalCartItems },
            { new: true, upsert: true }
        );
        
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });
        res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, syncCart, clearCart };