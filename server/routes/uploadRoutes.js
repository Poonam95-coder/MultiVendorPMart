const r = require('express').Router();
const c = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

r.post(
  '/',
  protect,
  (req, res, next) => {
    if (req.user?.isAdmin || req.seller) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Admin or Seller access required' });
  },
  upload.single('image'),
  c.upload
);

module.exports = r;

