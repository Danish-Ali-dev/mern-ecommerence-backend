import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = (mongoURI) => {
    mongoose.connect(mongoURI, {
        dbName: "ecommerence",
    })
        .then(() => console.log("DB connected successfully")) // Log success
        .catch((error) => console.log(`DB connection error: ${error.message}`)); // Log error
};
export const cacheData = async (cacheKey, fetchFunction) => {
    if (myCache.has(cacheKey)) {
        return JSON.parse(myCache.get(cacheKey));
    }
    else {
        const data = await fetchFunction();
        myCache.set(cacheKey, JSON.stringify(data));
        return data;
    }
};
export const invalidateCache = async ({ product, order, admin }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "admin-products",
            "categories",
        ];
        let products = await Product.find({}).select("_id");
        products.forEach((i) => {
            productKeys.push(`product-${i._id}`);
        });
        myCache.del(productKeys);
    }
    if (order) {
    }
    if (admin) {
    }
};
export const reduceStock = async (orderItems) => {
    // console.log("Order Items:", JSON.stringify(orderItems, null, 2)); 
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product not found");
        product.stock -= order.quantity;
        await product.save();
    }
};
/*
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
sudo service mongod restart
*/
