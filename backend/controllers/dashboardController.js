const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const getSummaryStats = async (req, res, next) => {
    try {
        const totalSalesResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
        ]);

        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        const summaryStats = {
            totalRevenue: totalSalesResult[0]?.totalRevenue || 0,
            totalOrders: totalSalesResult[0]?.totalOrders || 0,
            totalProducts,
            totalUsers,
            averageOrderValue: (totalSalesResult[0]?.totalOrders > 0) ? totalSalesResult[0].totalRevenue / totalSalesResult[0].totalOrders : 0
        };

        res.status(200).json(summaryStats);
    } catch (error) {
        next(error);
    }
};

const getSalesOverTime = async (req, res, next) => {
    try {
        const salesData = await Order.aggregate([
            { $match: { isPaid: true, createdAt: { $ne: null } } }, // Ensure createdAt exists
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    totalRevenue: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: "$totalRevenue",
                    orders: "$orderCount"
                }
            }
        ]);
        res.status(200).json(salesData);
    } catch (error) {
        next(error);
    }
};

const getTopSellingProducts = async (req, res, next) => {
    try {
        const productSalesData = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalQuantitySold: { $sum: "$orderItems.quantity" }
                }
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 0,
                    name: "$productDetails.name",
                    quantitySold: "$totalQuantitySold"
                }
            }
        ]);
        res.status(200).json(productSalesData);
    } catch (error) {
        next(error);
    }
};

const getRecentOrders = async (req, res, next) => {
    try {
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');
        res.status(200).json(recentOrders);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummaryStats,
    getSalesOverTime,
    getTopSellingProducts,
    getRecentOrders
};