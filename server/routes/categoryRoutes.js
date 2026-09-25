const express = require("express");

const router = express.Router();

const c = require("../controllers/categoryController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Categories can be viewed without login
router.get("/", c.getAll);


// Only admin can manage categories
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

router.delete(
    "/:id",
    protect,
    adminOnly,
    c.remove
);


module.exports = router;