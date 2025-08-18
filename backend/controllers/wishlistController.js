const User = require('../models/userModel');
const Product = require('../models/productModel');
const Advertisement = require('../models/advertisementModel');
const populateWishlistItems = async (wishlistIds) => {
    if (!wishlistIds || wishlistIds.length === 0) return [];
    
    const populatedProducts = await Product.find({ '_id': { $in: wishlistIds } })
        .populate('category', 'name').lean();
    
    const productIds = populatedProducts.map(p => p._id);
    const ads = await Advertisement.find({
        productRef: { $in: productIds },
        isActive: true,
        $or: [{ startDate: null }, { startDate: { $lte: new Date() } }],
        $or: [{ endDate: null }, { endDate: { $gte: new Date() } }]
    }).lean();
    
    const adsMap = new Map(ads.map(ad => [ad.productRef.toString(), ad]));
    
    return populatedProducts.map(product => ({
        ...product,
        advertisement: adsMap.get(product._id.toString()) || null
    }));
};

const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('wishlist').lean();
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        const fullyPopulatedWishlist = await populateWishlistItems(user.wishlist);
        res.json(fullyPopulatedWishlist);
    } catch (error) {
        next(error);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const productExists = await Product.findById(productId);
        if (!productExists) return res.status(404).json({ message: 'Product not found.' });

        const user = await User.findByIdAndUpdate(req.user.id, 
            { $addToSet: { wishlist: productId } },
            { new: true, select: 'wishlist' }
        ).lean();

        const fullyPopulatedWishlist = await populateWishlistItems(user.wishlist);
        res.status(200).json({ message: 'Product added to wishlist.', wishlist: fullyPopulatedWishlist });
    } catch (error) {
        next(error);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user = await User.findByIdAndUpdate(req.user.id, 
            { $pull: { wishlist: productId } },
            { new: true, select: 'wishlist' }
        ).lean();

        const fullyPopulatedWishlist = await populateWishlistItems(user.wishlist);
        res.status(200).json({ message: 'Product removed from wishlist.', wishlist: fullyPopulatedWishlist });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};