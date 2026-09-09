const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public read endpoints
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Protected customer endpoints
router.post('/', protect, reviewController.createReview);
router.get('/my-eligible-orders', protect, reviewController.getEligibleToReview);

module.exports = router;
