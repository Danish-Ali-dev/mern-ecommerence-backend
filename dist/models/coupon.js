import mongoose from "mongoose";
const schema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter the Coupon Code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter Discount Amount"],
    },
});
export const Coupon = mongoose.model("Coupon", schema);
