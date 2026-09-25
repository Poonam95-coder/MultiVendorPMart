const express = require("express");

const router = express.Router();

const c = require("../controllers/orderController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Customer order routes
router.post(
    "/",
    protect,
    c.place
);

router.get(
    "/my",
    protect,
    c.my
);


// Admin can view and manage all orders
router.get(
    "/",
    protect,
    adminOnly,
    c.all
);

router.get(
    "/:id",
    protect,
    c.byId
);

router.patch(
    "/:id/status",
    protect,
    adminOnly,
    c.status
);

router.patch(
    "/:id/assign",
    protect,
    adminOnly,
    c.assign
);


// Customer can cancel their order
router.patch(
    "/:id/cancel",
    protect,
    c.cancel
);


module.exports = router;