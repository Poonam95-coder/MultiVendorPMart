const Seller = require('../models/Seller');
const Review = require('../models/Review');
const SellerTrust = require('../models/SellerTrust');

/**
 * Configurable Weights for Seller Trust Score Calculation
 */
const TRUST_WEIGHTS = {
  VERIFICATION: 0.20,
  RATING: 0.30,
  REVIEW_SENTIMENT: 0.30,
  COMPLAINT: 0.20,
};

/**
 * Generate AI Trust Summary based on metrics
 */
function generateTrustSummary({ trustScore, isVerified, avgRating, totalReviews, positiveReviews, negativeReviews, complaintScore }) {
  if (trustScore >= 85) {
    if (totalReviews > 0) {
      return `Highly trusted store with verified credentials, excellent ${avgRating.toFixed(1)}/5 customer rating, and ${Math.round((positiveReviews / totalReviews) * 100)}% positive review sentiment.`;
    }
    return `Highly trusted and verified seller. Ready for shopping with top-tier verification standards.`;
  }

  if (trustScore >= 70) {
    if (totalReviews > 0) {
      return `Trusted seller with solid customer satisfaction, consistent ratings, and verified store profile.`;
    }
    return `Verified seller with good standing. Trust score will grow as customers leave reviews and ratings.`;
  }

  if (trustScore >= 50) {
    if (!isVerified) {
      return `Trust score is moderate. Store is pending admin verification or awaiting customer order reviews.`;
    }
    if (negativeReviews > positiveReviews) {
      return `Trust score is moderate due to mixed customer feedback. Improving product quality and fulfillment will boost score.`;
    }
    return `Developing seller profile with moderate trust rating and active product catalog.`;
  }

  return `Trust score is currently low due to unverified status, low rating averages, or negative customer sentiment.`;
}

/**
 * Recalculates and persists the Trust Score for a specific seller
 * @param {string|ObjectId} sellerId
 * @returns {Promise<Object>} Updated SellerTrust record
 */
async function recalculateSellerTrust(sellerId) {
  try {
    if (!sellerId) return null;

    const seller = await Seller.findById(sellerId);
    if (!seller) return null;

    // 1. Verification Score (0 - 100)
    let verificationScore = 30; // Base score for unverified
    if (seller.isVerified && seller.isActive) {
      verificationScore = 100;
    } else if (seller.isVerified && !seller.isActive) {
      verificationScore = 60;
    } else if (!seller.isVerified && seller.isActive) {
      verificationScore = 40;
    }

    // 2. Fetch all reviews for this seller
    const reviews = await Review.find({ seller: seller._id });
    const totalReviews = reviews.length;

    let positiveReviews = 0;
    let neutralReviews = 0;
    let negativeReviews = 0;
    let totalRatingSum = 0;
    let totalSentimentScoreSum = 0;

    reviews.forEach((r) => {
      totalRatingSum += r.rating;
      totalSentimentScoreSum += (r.sentimentScore !== undefined ? r.sentimentScore : 50);

      if (r.sentiment === 'positive') positiveReviews++;
      else if (r.sentiment === 'negative') negativeReviews++;
      else neutralReviews++;
    });

    // 3. Rating Score (0 - 100)
    let avgRating = totalReviews > 0 ? (totalRatingSum / totalReviews) : (seller.rating || 0);
    let ratingScore = 70; // Baseline if no reviews yet
    if (totalReviews > 0) {
      ratingScore = Math.min(100, Math.max(0, (avgRating / 5) * 100));
    } else if (seller.rating > 0) {
      ratingScore = Math.min(100, Math.max(0, (seller.rating / 5) * 100));
    }

    // 4. Review Sentiment Score (0 - 100)
    let reviewSentimentScore = 70; // Baseline if no reviews yet
    if (totalReviews > 0) {
      reviewSentimentScore = Math.min(100, Math.max(0, totalSentimentScoreSum / totalReviews));
    }

    // 5. Complaint Score (0 - 100)
    // Default to 100 since complaints module is currently clean/unregistered
    const totalComplaints = 0;
    const resolvedComplaints = 0;
    const complaintScore = 100;

    // 6. Weighted Final Trust Score Calculation
    const rawScore =
      (verificationScore * TRUST_WEIGHTS.VERIFICATION) +
      (ratingScore * TRUST_WEIGHTS.RATING) +
      (reviewSentimentScore * TRUST_WEIGHTS.REVIEW_SENTIMENT) +
      (complaintScore * TRUST_WEIGHTS.COMPLAINT);

    const trustScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // 7. Generate Trust Summary
    const trustSummary = generateTrustSummary({
      trustScore,
      isVerified: seller.isVerified,
      avgRating,
      totalReviews,
      positiveReviews,
      negativeReviews,
      complaintScore,
    });

    // 8. Upsert SellerTrust document
    const sellerTrust = await SellerTrust.findOneAndUpdate(
      { seller: seller._id },
      {
        seller: seller._id,
        trustScore,
        verificationScore: Math.round(verificationScore),
        ratingScore: Math.round(ratingScore),
        reviewSentimentScore: Math.round(reviewSentimentScore),
        complaintScore: Math.round(complaintScore),
        trustSummary,
        totalReviews,
        positiveReviews,
        neutralReviews,
        negativeReviews,
        totalComplaints,
        resolvedComplaints,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync updated rating and total reviews back to the Seller model
    if (totalReviews > 0) {
      seller.rating = +(avgRating.toFixed(1));
      await seller.save();
    }

    return sellerTrust;
  } catch (error) {
    console.error('Error recalculating seller trust score:', error);
    return null;
  }
}

/**
 * Get or initialize SellerTrust record
 */
async function getSellerTrust(sellerId) {
  try {
    let trust = await SellerTrust.findOne({ seller: sellerId });
    if (!trust) {
      trust = await recalculateSellerTrust(sellerId);
    }
    return trust;
  } catch (error) {
    console.error('Error fetching seller trust record:', error);
    return null;
  }
}

module.exports = {
  TRUST_WEIGHTS,
  recalculateSellerTrust,
  getSellerTrust,
};
