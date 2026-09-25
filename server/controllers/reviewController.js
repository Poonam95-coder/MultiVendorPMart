const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { analyzeSentiment } = require("../utils/sentimentAnalyzer");
const { recalculateSellerTrust } = require("../services/trustScoreService");


// Create a new review for a delivered product
exports.createReview = async (req, res, next) => {
    try {
        const { productId, orderId, rating, comment } = req.body;
        const userId = req.user._id;

        // Check required fields
        if (!productId || !orderId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Product ID, Order ID, rating, and review comment are required"
            });
        }

        const numRating = Number(rating);

        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a number between 1 and 5"
            });
        }

        // Check whether product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check order belongs to the logged-in user
        const order = await Order.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Delivered order not found for this account"
            });
        }

        // Only delivered orders can be reviewed
        if (order.status !== "Delivered") {
            return res.status(400).json({
                success: false,
                message: "You can only review products from completed, delivered orders"
            });
        }

        // Check product was actually included in this order
        const orderedItem = order.items.find(
            (item) =>
                item.product &&
                item.product.toString() === productId.toString()
        );

        if (!orderedItem) {
            return res.status(400).json({
                success: false,
                message: "This product was not part of the specified order"
            });
        }

        // Prevent duplicate reviews for the same purchase
        const existing = await Review.findOne({
            user: userId,
            product: productId,
            order: orderId
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a review for this purchase"
            });
        }

        // Get seller connected with the product
        const rawSeller = product.seller || orderedItem.seller || null;
        const sellerId = rawSeller?._id ? rawSeller._id : rawSeller;

        if (!sellerId) {
            return res.status(400).json({
                success: false,
                message: "This product does not have an associated seller"
            });
        }

        // Analyze review sentiment
        const {
            sentiment,
            sentimentScore
        } = await analyzeSentiment(comment, numRating);

        // Save review with sentiment details
        const review = await Review.create({
            user: userId,
            product: productId,
            seller: sellerId,
            order: orderId,
            rating: numRating,
            comment: comment.trim(),
            sentiment,
            sentimentScore
        });

        // Update product rating and review count
        const allProdReviews = await Review.find({
            product: productId
        });

        const totalProdReviews = allProdReviews.length;

        const avgProdRating =
            allProdReviews.reduce((sum, r) => sum + r.rating, 0) /
            totalProdReviews;

        product.rating = +(avgProdRating.toFixed(1));
        product.reviewCount = totalProdReviews;

        await product.save();

        // Recalculate seller trust score after new review
        const updatedTrust = await recalculateSellerTrust(sellerId);

        // Get user details for frontend
        const populatedReview = await Review.findById(review._id)
            .populate("user", "name avatar");

        // Send real-time updates if Socket.io is available
        if (req.app.get("io")) {
            const io = req.app.get("io");

            io.emit("trust-updated", {
                sellerId,
                trust: updatedTrust
            });

            io.emit("review-created", {
                review: populatedReview,
                productId
            });
        }

        res.status(201).json({
            success: true,
            message: "Review submitted and Trust Score updated successfully!",
            review: populatedReview,
            sellerTrust: updatedTrust
        });
    } catch (e) {
        next(e);
    }
};


// Get all reviews and rating details for a product
exports.getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({
            product: productId
        })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        const total = reviews.length;

        const breakdown = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        const sentimentCounts = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        let ratingSum = 0;

        // Calculate rating and sentiment statistics
        reviews.forEach((r) => {
            ratingSum += r.rating;

            if (breakdown[r.rating] !== undefined) {
                breakdown[r.rating]++;
            }

            if (sentimentCounts[r.sentiment] !== undefined) {
                sentimentCounts[r.sentiment]++;
            }
        });

        const avgRating =
            total > 0
                ? +(ratingSum / total).toFixed(1)
                : 0;

        res.json({
            success: true,
            reviews,
            stats: {
                total,
                avgRating,
                breakdown,
                sentimentCounts
            }
        });
    } catch (e) {
        next(e);
    }
};


// Get all reviews of a seller
exports.getSellerReviews = async (req, res, next) => {
    try {
        const { sellerId } = req.params;

        const reviews = await Review.find({
            seller: sellerId
        })
            .populate("user", "name avatar")
            .populate("product", "name image price")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews,
            count: reviews.length
        });
    } catch (e) {
        next(e);
    }
};


// Get delivered products that the user has not reviewed yet
exports.getEligibleToReview = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Find all delivered orders of the user
        const deliveredOrders = await Order.find({
            user: userId,
            status: "Delivered"
        }).sort({ createdAt: -1 });

        if (!deliveredOrders.length) {
            return res.json({
                success: true,
                eligibleItems: []
            });
        }

        // Get reviews already submitted by the user
        const existingReviews = await Review.find({
            user: userId
        });

        const reviewedKeys = new Set(
            existingReviews.map(
                (r) => `${r.order.toString()}_${r.product.toString()}`
            )
        );

        const eligibleItems = [];

        // Check every product from delivered orders
        for (const order of deliveredOrders) {
            for (const item of order.items) {
                if (!item.product) {
                    continue;
                }

                const key =
                    `${order._id.toString()}_${item.product.toString()}`;

                // Add only products that have not been reviewed
                if (!reviewedKeys.has(key)) {
                    eligibleItems.push({
                        orderId: order._id,
                        orderDate: order.createdAt,
                        productId: item.product,
                        productName: item.name,
                        productImage: item.image,
                        price: item.price,
                        seller: item.seller
                    });
                }
            }
        }

        res.json({
            success: true,
            eligibleItems
        });
    } catch (e) {
        next(e);
    }
};