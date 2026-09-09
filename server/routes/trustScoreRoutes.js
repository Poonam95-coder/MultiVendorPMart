const express = require('express');
const router = express.Router();
const trustController = require('../controllers/trustScoreController');
const { protect, adminOnly } = require('../middleware/auth');

// Public / Authenticated read endpoint
router.get('/:sellerId', trustController.getTrustScore);

// Protected manual recalculation endpoint
router.post('/:sellerId/recalculate', protect, adminOnly, trustController.recalculateTrust);

module.exports = router;
