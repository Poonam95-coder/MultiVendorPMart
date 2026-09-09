const r = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

r.post('/register', c.register);
r.post('/login', c.login);
r.post('/seller/register', c.sellerRegister);
r.post('/seller/login', c.sellerLogin);
r.post('/delivery/login', c.deliveryLogin);
r.get('/me', protect, c.me);
r.post('/logout', c.logout);

module.exports = r;

