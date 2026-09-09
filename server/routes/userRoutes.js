const r = require('express').Router();
const c = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

r.get('/', protect, adminOnly, c.getUsers);
r.get('/profile', protect, c.profile);
r.put('/profile', protect, c.update);

module.exports = r;

