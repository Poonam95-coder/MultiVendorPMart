const mongoose = require('mongoose');

const sellerTrustSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      unique: true,
      index: true,
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    verificationScore: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    ratingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    reviewSentimentScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    complaintScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    trustSummary: {
      type: String,
      default: 'New seller profile created. Trust score will update as store activity, reviews, and ratings are received.',
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    positiveReviews: {
      type: Number,
      default: 0,
    },
    neutralReviews: {
      type: Number,
      default: 0,
    },
    negativeReviews: {
      type: Number,
      default: 0,
    },
    totalComplaints: {
      type: Number,
      default: 0,
    },
    resolvedComplaints: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerTrust', sellerTrustSchema);
