const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, sellerOnly, sellerActiveAndVerified } = require('../middleware/auth');

// All seller routes require authentication and seller profile
router.use(protect, sellerOnly);

// Profile (Allowed for unverified/inactive sellers to view/update profile info)
router.get('/profile', sellerController.getProfile);
router.put('/profile', sellerController.updateProfile);

// Dashboard (Requires active and verified seller)
router.get('/dashboard', sellerActiveAndVerified, sellerController.getDashboard);

// Products (Requires active and verified seller)
router.get('/products', sellerActiveAndVerified, sellerController.getProducts);
router.post('/products', sellerActiveAndVerified, sellerController.createProduct);
router.put('/products/:id', sellerActiveAndVerified, sellerController.updateProduct);
router.delete('/products/:id', sellerActiveAndVerified, sellerController.deleteProduct);
router.patch('/products/:id/stock', sellerActiveAndVerified, sellerController.updateStock);

// Inventory (Requires active and verified seller)
router.get('/inventory', sellerActiveAndVerified, sellerController.getInventory);

// Orders (Requires active and verified seller)
router.get('/orders', sellerActiveAndVerified, sellerController.getOrders);
router.get('/orders/:id', sellerActiveAndVerified, sellerController.getOrderById);
router.patch('/orders/:id/status', sellerActiveAndVerified, sellerController.updateOrderStatus);

module.exports = router;

