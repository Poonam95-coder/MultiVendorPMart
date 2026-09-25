const mongoose = require("mongoose");


// Seller schema
const schema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true
        },

        storeDescription: {
            type: String,
            default: "",
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        logo: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        // Seller needs admin verification before selling
        isVerified: {
            type: Boolean,
            default: false
        },

        // Controls whether seller is currently active
        isActive: {
            type: Boolean,
            default: false
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        totalOrders: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Seller", schema);