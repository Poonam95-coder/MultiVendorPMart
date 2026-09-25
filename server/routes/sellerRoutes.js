const express = require("express");

const router = express.Router();

const sellerController = require("../controllers/sellerController");
const {
    protect,
    sellerOnly,
    sellerActiveAndVerified
} = require("../middleware/auth");


// All seller routes require login and seller profile
router.use(
    protect,
    sellerOnly
);


// Seller profile
// Unverified/inactive sellers can still view and update their profile
router.get(
    "/profile",
    sellerController.getProfile
);

router.put(
    "/profile",
    sellerController.updateProfile
);


// Seller dashboard
// Only active and verified sellers can access
router.get(
    "/dashboard",
    sellerActiveAndVerified,
    sellerController.getDashboard
);


// Product management
router.get(
    "/products",
    sellerActiveAndVerified,
    sellerController.getProducts
);

router.post(
    "/products",
    sellerActiveAndVerified,
    sellerController.createProduct
);

router.put(
    "/products/:id",
    sellerActiveAndVerified,
    sellerController.updateProduct
);

router.delete(
    "/products/:id",
    sellerActiveAndVerified,
    sellerController.deleteProduct
);

router.patch(
    "/products/:id/stock",
    sellerActiveAndVerified,
    sellerController.updateStock
);


// Inventory
router.get(
    "/inventory",
    sellerActiveAndVerified,
    sellerController.getInventory
);


// Order management
router.get(
    "/orders",
    sellerActiveAndVerified,
    sellerController.getOrders
);

router.get(
    "/orders/:id",
    sellerActiveAndVerified,
    sellerController.getOrderById
);

router.patch(
    "/orders/:id/status",
    sellerActiveAndVerified,
    sellerController.updateOrderStatus
);


module.exports = router;