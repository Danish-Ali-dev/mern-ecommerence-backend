import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { cacheData, invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utitlity-class.js";
export const myOrders = TryCatch(async (req, res, next) => {
    const user = req.query.user;
    const key = `my-orders-${user}`;
    const orders = await cacheData(key, async () => {
        return await Order.find({ user });
    });
    return res.status(200).json({
        success: true,
        data: orders,
        message: "Orders found successfully",
    });
});
export const allOrders = TryCatch(async (req, res, next) => {
    const key = "all-orders";
    const orders = await cacheData(key, async () => {
        return await Order.find().populate("user", "name");
    });
    return res.status(200).json({
        success: true,
        data: orders,
        message: "Orders found successfully",
    });
});
export const getOrder = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const key = `order-${id}`;
    const order = await cacheData(key, async () => {
        const foundOrder = await Order.findById(id);
        if (!foundOrder) {
            return next(new ErrorHandler("Order Not Found", 400));
        }
        return foundOrder;
    });
    return res.status(200).json({
        success: true,
        data: order,
        message: "Orders found successfully",
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, shippingCharges, tax, discount, total, } = req.body;
    if (!shippingInfo ||
        !Array.isArray(orderItems) ||
        orderItems.length === 0 ||
        !user ||
        !subtotal ||
        !tax ||
        !total) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    const newOrder = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        shippingCharges,
        tax,
        discount,
        total,
    });
    await reduceStock(orderItems);
    invalidateCache({
        product: true,
        order: true,
        admin: true,
        productId: newOrder.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        order: newOrder,
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not found!", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        orderId: String(order._id),
        userId: order.user,
    });
    return res.status(200).json({
        success: true,
        data: order.status,
        message: "Order status updated successfully!",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not found!", 404));
    await order.deleteOne();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        orderId: String(order._id),
        userId: order.user,
    });
    return res.status(200).json({
        success: true,
        message: "Order deleted successfully!",
    });
});
