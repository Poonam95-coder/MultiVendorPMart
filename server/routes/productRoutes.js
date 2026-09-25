const express = require("express");

const router = express.Router();

const c = require("../controllers/productController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Public product routes
router.get("/search", c.search);
router.get("/deals", c.deals);
router.get("/", c.getProducts);
router.get("/:id", c.getProduct);


// Admin can manage products
router.post(
    "/",
    protect,
    adminOnly,
    c.create
);

router.put(
    "/:id",
    protect,
    adminOnly,
    c.update
);

router.patch(
    "/:id/stock",
    protect,
    adminOnly,
    c.stock
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    c.remove
);


module.exports = router;