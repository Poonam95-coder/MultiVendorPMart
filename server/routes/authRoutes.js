const express = require("express");

const router = express.Router();

const c = require("../controllers/authController");
const { protect } = require("../middleware/auth");


// User authentication
router.post("/register", c.register);
router.post("/login", c.login);


// Seller authentication
router.post(
    "/seller/register",
    c.sellerRegister
);

router.post(
    "/seller/login",
    c.sellerLogin
);


// Delivery partner login
router.post(
    "/delivery/login",
    c.deliveryLogin
);


// Get currently logged-in user
router.get(
    "/me",
    protect,
    c.me
);


// Logout user
router.post("/logout", c.logout);


module.exports = router;