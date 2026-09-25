const express = require("express");

const router = express.Router();

const c = require("../controllers/orderController");
const {
    protect,
    deliveryOnly
} = require("../middleware/auth");


// Delivery partner order routes
router.get(
    "/orders",
    protect,
    deliveryOnly,
    c.deliveryOrders
);

router.patch(
    "/orders/:id/status",
    protect,
    deliveryOnly,
    c.deliveryStatus
);

router.post(
    "/orders/:id/complete",
    protect,
    deliveryOnly,
    c.complete
);

router.post(
    "/orders/:id/cancel",
    protect,
    deliveryOnly,
    c.deliveryCancel
);


module.exports = router;