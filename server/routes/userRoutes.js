const express = require("express");

const router = express.Router();

const c = require("../controllers/userController");
const {
    protect,
    adminOnly
} = require("../middleware/auth");


// Admin can view all users
router.get(
    "/",
    protect,
    adminOnly,
    c.getUsers
);


// Logged-in user profile
router.get(
    "/profile",
    protect,
    c.profile
);

router.put(
    "/profile",
    protect,
    c.update
);


module.exports = router;