const express = require("express");

const router = express.Router();

const c = require("../controllers/adminController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// All admin routes require login and admin access
router.use(protect, adminOnly);


// Admin dashboard
router.get("/dashboard", c.dashboard);

// Seller management
router.get("/sellers", c.getSellers);
router.get("/sellers/:id", c.getSellerById);

router.patch(
    "/sellers/:id/approve",
    c.approveSeller
);

router.patch(
    "/sellers/:id/reject",
    c.rejectSeller
);

router.patch(
    "/sellers/:id/suspend",
    c.suspendSeller
);

router.patch(
    "/sellers/:id/activate",
    c.activateSeller
);

router.patch(
    "/sellers/:id/verify",
    c.verifySeller
);

router.patch(
    "/sellers/:id/status",
    c.toggleSellerStatus
);


module.exports = router;