const User = require('../models/User');
const DeliveryPartner = require('../models/DeliveryPartner');
const Seller = require('../models/Seller');
const generateToken = require('../utils/generateToken');
const { recalculateSellerTrust } = require('../services/trustScoreService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const safe = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatar: u.avatar,
  addresses: u.addresses,
  isAdmin: u.isAdmin,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

function setCookie(res, t) {
  res.cookie('token', t, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
      });
    }

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const u = await User.create({ name: String(name).trim(), email: normalizedEmail, password });
    const token = generateToken({ id: u._id.toString(), role: 'user' });
    setCookie(res, token);
    res.status(201).json({ success: true, token, user: safe(u) });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const u = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!u || !(await u.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let role = u.isAdmin ? 'admin' : 'user';
    const seller = await Seller.findOne({ user: u._id });
    if (seller && !u.isAdmin) {
      role = 'seller';
    }

    const token = generateToken({ id: u._id.toString(), role });
    setCookie(res, token);
    res.json({ success: true, token, user: safe(u), seller: seller || null });
  } catch (e) {
    next(e);
  }
};

exports.sellerRegister = async (req, res, next) => {
  try {
    const { name, email, password, storeName, storeDescription, phone, address } = req.body;
    if (!name || !email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and Store Name are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid business email address' });
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
      });
    }

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const u = await User.create({ name: String(name).trim(), email: normalizedEmail, password, phone: phone ? String(phone).trim() : '' });
    const seller = await Seller.create({
      user: u._id,
      storeName: String(storeName).trim(),
      storeDescription: storeDescription ? String(storeDescription).trim() : '',
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      address: address ? String(address).trim() : '',
      isVerified: false,
      isActive: false,
    });

    // Initialize SellerTrust record
    await recalculateSellerTrust(seller._id);

    const token = generateToken({ id: u._id.toString(), role: 'seller' });
    setCookie(res, token);
    res.status(201).json({ success: true, token, user: safe(u), seller });
  } catch (e) {
    next(e);
  }
};

exports.sellerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const u = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!u || !(await u.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const seller = await Seller.findOne({ user: u._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found for this account' });
    }

    const token = generateToken({ id: u._id.toString(), role: 'seller' });
    setCookie(res, token);
    res.json({ success: true, token, user: safe(u), seller });
  } catch (e) {
    next(e);
  }
};

exports.deliveryLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const p = await DeliveryPartner.findOne({ email: normalizedEmail }).select('+password');
    if (!p || !(await p.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!p.isActive) {
      return res.status(403).json({ success: false, message: 'Delivery account is currently inactive' });
    }

    const token = generateToken({ id: p._id.toString(), role: 'delivery' });
    setCookie(res, token);
    res.json({
      success: true,
      token,
      partner: {
        _id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        avatar: p.avatar,
        vehicleType: p.vehicleType,
        isActive: p.isActive,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res) =>
  res.json({
    success: true,
    user: req.user || null,
    partner: req.deliveryPartner || null,
    seller: req.seller || null,
  });

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

