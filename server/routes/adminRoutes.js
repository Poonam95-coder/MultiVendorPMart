const r = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

r.use(protect, adminOnly);

r.get('/dashboard', c.dashboard);
r.get('/sellers', c.getSellers);
r.get('/sellers/:id', c.getSellerById);
r.patch('/sellers/:id/approve', c.approveSeller);
r.patch('/sellers/:id/reject', c.rejectSeller);
r.patch('/sellers/:id/suspend', c.suspendSeller);
r.patch('/sellers/:id/activate', c.activateSeller);
r.patch('/sellers/:id/verify', c.verifySeller);
r.patch('/sellers/:id/status', c.toggleSellerStatus);

module.exports = r;


