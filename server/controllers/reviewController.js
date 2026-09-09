const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { analyzeSentiment } = require('../utils/sentimentAnalyzer');
const { recalculateSellerTrust } = require('../services/trustScoreService');

/**
 * POST /api/reviews
 * User submits rating and review for a purchased product in a delivered order
 */
exports.createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Order ID, rating, and review comment are required',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // 1. Verify Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2. Verify Order belongs to user and is Delivered
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Delivered order not found for this account',
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review products from completed, delivered orders',
      });
    }

    // 3. Verify product was in the order
    const orderedItem = order.items.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );
    if (!orderedItem) {
      return res.status(400).json({
        success: false,
        message: 'This product was not part of the specified order',
      });
    }

    // 4. Check for duplicate review
    const existing = await Review.findOne({
      user: userId,
      product: productId,
      order: orderId,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this purchase',
      });
    }

    // 5. Determine Seller
    const rawSeller = product.seller || orderedItem.seller || null;
    const sellerId = rawSeller?._id ? rawSeller._id : rawSeller;
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'This product does not have an associated seller',
      });
    }

    // 6. AI/NLP Sentiment Analysis
    const { sentiment, sentimentScore } = await analyzeSentiment(comment, numRating);

    // 7. Save Review
    const review = await Review.create({
      user: userId,
      product: productId,
      seller: sellerId,
      order: orderId,
      rating: numRating,
      comment: comment.trim(),
      sentiment,
      sentimentScore,
    });

    // 8. Update Product Average Rating and reviewCount
    const allProdReviews = await Review.find({ product: productId });
    const totalProdReviews = allProdReviews.length;
    const avgProdRating =
      allProdReviews.reduce((sum, r) => sum + r.rating, 0) / totalProdReviews;

    product.rating = +(avgProdRating.toFixed(1));
    product.reviewCount = totalProdReviews;
    await product.save();

    // 9. Recalculate AI Seller Trust Score in real time
    const updatedTrust = await recalculateSellerTrust(sellerId);

    // Populate user details for clean frontend response
    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('trust-updated', { sellerId, trust: updatedTrust });
      io.emit('review-created', { review: populatedReview, productId });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted and Trust Score updated successfully!',
      review: populatedReview,
      sellerTrust: updatedTrust,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/reviews/product/:productId
 * Get verified reviews and rating breakdown for a product
 */
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let ratingSum = 0;

    reviews.forEach((r) => {
      ratingSum += r.rating;
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
      if (sentimentCounts[r.sentiment] !== undefined) sentimentCounts[r.sentiment]++;
    });

    const avgRating = total > 0 ? +(ratingSum / total).toFixed(1) : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total,
        avgRating,
        breakdown,
        sentimentCounts,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/reviews/seller/:sellerId
 * Get all reviews for a seller
 */
exports.getSellerReviews = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.find({ seller: sellerId })
      .populate('user', 'name avatar')
      .populate('product', 'name image price')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews, count: reviews.length });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/reviews/my-eligible-orders
 * List delivered order items the user can review
 */
exports.getEligibleToReview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find delivered orders
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'Delivered',
    }).sort({ createdAt: -1 });

    if (!deliveredOrders.length) {
      return res.json({ success: true, eligibleItems: [] });
    }

    // Find already submitted reviews by this user
    const existingReviews = await Review.find({ user: userId });
    const reviewedKeys = new Set(
      existingReviews.map((r) => `${r.order.toString()}_${r.product.toString()}`)
    );

    const eligibleItems = [];
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        if (!item.product) continue;
        const key = `${order._id.toString()}_${item.product.toString()}`;
        if (!reviewedKeys.has(key)) {
          eligibleItems.push({
            orderId: order._id,
            orderDate: order.createdAt,
            productId: item.product,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            seller: item.seller,
          });
        }
      }
    }

    res.json({ success: true, eligibleItems });
  } catch (e) {
    next(e);
  }
};
