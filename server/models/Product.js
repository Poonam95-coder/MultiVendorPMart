const mongoose = require("mongoose");


// Product schema
const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        originalPrice: {
            type: Number,
            default: 0
        },

        image: {
            type: String,
            required: true
        },

        // Used for category based filtering
        category: {
            type: String,
            required: true,
            index: true
        },

        unit: {
            type: String,
            default: "piece"
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        isOrganic: {
            type: Boolean,
            default: false
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        reviewCount: {
            type: Number,
            default: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        // Seller who added this product
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            default: null,
            index: true
        }
    },
    {
        timestamps: true
    }
);


// Text index for product search
schema.index({
    name: "text",
    description: "text"
});


module.exports = mongoose.model(
    "Product",
    schema
);