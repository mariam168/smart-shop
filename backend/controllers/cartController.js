const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Advertisement = require('../models/advertisementModel');
const getCart = async (req, res, next) => {
    try {
        let userCart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name mainImage variations stock'
            });

        if (!userCart) {
            return res.status(200).json({ cart: [] });
        }
        const validItems = userCart.items.filter(item => item.product);
        if (validItems.length < userCart.items.length) {
            userCart.items = validItems;
            await userCart.save();
        }

        res.status(200).json({ cart: validItems });
    } catch (error) {
        next(error);
    }
};
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1, selectedVariantId = null } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        let userCart = await Cart.findOne({ user: req.user.id });
        if (!userCart) userCart = new Cart({ user: req.user.id, items: [] });
        
        const existingItemIndex = userCart.items.findIndex(item => 
            item.product.toString() === productId && 
            String(item.selectedVariant || null) === String(selectedVariantId || null)
        );

        let priceForCalculation = product.basePrice;
        let finalImage = product.mainImage;
        let finalStock; 
        let variantDetailsText = '';

        if (selectedVariantId) {
            const sku = product.variations
                .flatMap(v => v.options.flatMap(o => o.skus))
                .find(s => s._id.equals(selectedVariantId));
            if (!sku) return res.status(400).json({ message: 'Variant not found' });
            priceForCalculation = sku.price; 
            finalStock = sku.stock;
            const optionParent = product.variations.flatMap(v => v.options).find(o => o.skus.some(s => s._id.equals(selectedVariantId)));
            if (optionParent?.image) finalImage = optionParent.image;
            variantDetailsText = [optionParent?.name_en, sku.name_en].filter(Boolean).join(' / ');
        } else {
            finalStock = product.stock;
        }

        const activeAd = await Advertisement.findOne({
            productRef: productId, isActive: true,
            $or: [{ startDate: null }, { startDate: { $lte: new Date() } }],
            $or: [{ endDate: null }, { endDate: { $gte: new Date() } }]
        });
        
        let finalPrice = priceForCalculation;
        if (activeAd && activeAd.discountPercentage > 0) {
            finalPrice = priceForCalculation * (1 - (activeAd.discountPercentage / 100));
        }
        finalPrice = Math.round(finalPrice * 100) / 100;

        if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += quantity;
            userCart.items[existingItemIndex].price = finalPrice; 
            userCart.items[existingItemIndex].stock = finalStock;
        } else {
            userCart.items.push({ 
                product: productId, name: product.name, image: finalImage,
                price: finalPrice, quantity, selectedVariant: selectedVariantId,
                variantDetailsText: variantDetailsText, stock: finalStock
            });
        }

        await userCart.save();
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name');
        res.status(201).json({ cart: populatedCart.items });
    } catch (error) {
        next(error);
    }
};
const updateCartItem = async (req, res, next) => {
    try {
        const { productId, quantity, selectedVariantId = null } = req.body;
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity < 0) return res.status(400).json({ message: 'Invalid quantity' });

        const userCart = await Cart.findOne({ user: req.user.id });
        if (!userCart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = userCart.items.findIndex(item => 
            item.product.toString() === productId && 
            String(item.selectedVariant || null) === String(selectedVariantId || null)
        );

        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

        if (numQuantity === 0) {
            userCart.items.splice(itemIndex, 1);
        } else {
            userCart.items[itemIndex].quantity = numQuantity;
        }

        await userCart.save();
        const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name');
        res.status(200).json({ cart: populatedCart.items });
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

module.exports = { getCart, addToCart, updateCartItem, clearCart };