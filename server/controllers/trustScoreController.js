const Seller = require('../models/Seller');
const { recalculateSellerTrust, getSellerTrust, TRUST_WEIGHTS } = require('../services/trustScoreService');

/**
 * GET /api/trust/:sellerId or /api/sellers/:sellerId/trust-score
 */
exports.getTrustScore = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const trustData = await getSellerTrust(sellerId);
    if (!trustData) {
      return res.status(500).json({ success: false, message: 'Failed to compute trust score' });
    }

    // Determine trust level badge
    let trustLevel = 'Developing';
    let trustBadgeColor = 'amber';
    if (trustData.trustScore >= 85) {
      trustLevel = 'Highly Trusted';
      trustBadgeColor = 'emerald';
    } else if (trustData.trustScore >= 70) {
      trustLevel = 'Trusted';
      trustBadgeColor = 'blue';
    } else if (trustData.trustScore < 50) {
      trustLevel = 'Needs Improvement';
      trustBadgeColor = 'rose';
    }

    res.json({
      success: true,
      seller: {
        _id: seller._id,
        storeName: seller.storeName,
        isVerified: seller.isVerified,
        isActive: seller.isActive,
        rating: seller.rating,
        logo: seller.logo,
      },
      trust: {
        ...trustData.toObject(),
        trustLevel,
        trustBadgeColor,
        weights: TRUST_WEIGHTS,
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/trust/:sellerId/recalculate
 * Internal recalculation endpoint protected for Admin or Seller
 */
exports.recalculateTrust = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const trust = await recalculateSellerTrust(sellerId);
    if (!trust) {
      return res.status(404).json({ success: false, message: 'Seller not found or error calculating score' });
    }
    res.json({ success: true, message: 'Trust score recalculated successfully', trust });
  } catch (e) {
    next(e);
  }
};
