const express = require("express");

const router = express.Router();

const trustController = require("../controllers/trustScoreController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Anyone can view seller trust score
router.get(
    "/:sellerId",
    trustController.getTrustScore
);


// Only admin can manually recalculate trust score
router.post(
    "/:sellerId/recalculate",
    protect,
    adminOnly,
    trustController.recalculateTrust
);


module.exports = router;