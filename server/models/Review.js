const mongoose = require("mongoose");


// Review schema
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true,
            index: true
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        // Sentiment detected from the review comment
        sentiment: {
            type: String,
            enum: [
                "positive",
                "neutral",
                "negative"
            ],
            default: "neutral"
        },

        sentimentScore: {
            type: Number,
            default: 50,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);


// Prevent duplicate reviews for the same product and order
reviewSchema.index(
    {
        user: 1,
        product: 1,
        order: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model(
    "Review",
    reviewSchema
);