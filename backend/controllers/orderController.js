const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, discount } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }
        
        const itemsPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalPrice = itemsPrice - (discount?.amount || 0);
        
        const order = new Order({
            user: req.user.id,
            orderItems: cart.items, 
            shippingAddress,
            paymentMethod,
            itemsPrice,
            totalPrice: totalPrice > 0 ? totalPrice : 0, 
            discount: discount ? { code: discount.code, amount: discount.amount } : undefined,
        });

        const createdOrder = await order.save();
        for (const item of createdOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            if (item.selectedVariantId) { 
                const sku = product.variations
                    .flatMap(v => v.options.flatMap(o => o.skus))
                    .find(s => s._id.equals(item.selectedVariantId));
                if (sku && typeof sku.stock === 'number') {
                    sku.stock -= item.quantity;
                }
            } else if (typeof product.stock === 'number') {
                product.stock -= item.quantity;
            }
            await product.save();
        }
        
        await Cart.deleteOne({ user: req.user.id });
        
        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    }
};
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email').lean();

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }
        
        res.json(order);
    } catch (error) {
        next(error);
    }
};
const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id || `ADMIN_PAID_${Date.now()}`,
                status: req.body.status || 'COMPLETED',
                update_time: req.body.update_time || new Date().toISOString(),
                email_address: req.body.email_address,
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};
const updateOrderToDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered
};