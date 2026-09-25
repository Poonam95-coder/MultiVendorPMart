const express = require("express");

const router = express.Router();

const c = require("../controllers/userController");
const { protect } = require("../middleware/auth");


// Get all saved addresses
router.get("/", protect, c.addresses);

// Add a new address
router.post("/", protect, c.addAddress);

// Update an address
router.put("/:id", protect, c.updateAddress);

// Delete an address
router.delete("/:id", protect, c.deleteAddress);

// Set an address as default
router.patch(
    "/:id/default",
    protect,
    c.defaultAddress
);


module.exports = router;