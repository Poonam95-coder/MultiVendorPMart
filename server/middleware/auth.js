const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryPartner = require('../models/DeliveryPartner');
const Seller = require('../models/Seller');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const extracted = authHeader.slice(7).trim();
      if (extracted && extracted !== 'null' && extracted !== 'undefined') {
        token = extracted;
      }
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'delivery') {
      req.deliveryPartner = await DeliveryPartner.findById(decoded.id);
      if (!req.deliveryPartner) {
        return res.status(401).json({ success: false, message: 'Delivery account not found' });
      }
    } else {
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      const seller = await Seller.findOne({
        $or: [{ user: req.user._id }, { email: req.user.email }],
      });
      if (seller) {
        req.seller = seller;
      }
    }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

function deliveryOnly(req, res, next) {
  if (!req.deliveryPartner) {
    return res.status(401).json({ success: false, message: 'Delivery partner access required' });
  }
  next();
}

function sellerOnly(req, res, next) {
  if (!req.user || !req.seller) {
    return res.status(403).json({ success: false, message: 'Seller access required' });
  }
  next();
}

function sellerActiveAndVerified(req, res, next) {
  if (!req.user || !req.seller) {
    return res.status(403).json({ success: false, message: 'Seller access required' });
  }
  if (!req.seller.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Seller account is pending Admin verification.',
    });
  }
  if (!req.seller.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Seller account is currently inactive.',
    });
  }
  next();
}

module.exports = { protect, adminOnly, deliveryOnly, sellerOnly, sellerActiveAndVerified };
