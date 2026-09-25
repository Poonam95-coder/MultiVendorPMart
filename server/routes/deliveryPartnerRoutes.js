const express = require("express");

const router = express.Router();

const c = require("../controllers/deliveryController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Only admin can manage delivery partners
router.get(
    "/",
    protect,
    adminOnly,
    c.getAll
);

router.post(
    "/",
    protect,
    adminOnly,
    c.create
);

router.patch(
    "/:id/toggle",
    protect,
    adminOnly,
    c.toggle
);


module.exports = router;