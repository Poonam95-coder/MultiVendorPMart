const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const Seller = require('../models/Seller');
const { recalculateSellerTrust, getSellerTrust } = require('../services/trustScoreService');

exports.dashboard = async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      outOfStock,
      totalPartners,
      totalSellers,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      DeliveryPartner.countDocuments(),
      Seller.countDocuments(),
      Order.find()
        .populate('user', 'name email')
        .populate('deliveryPartner', 'name phone')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        outOfStock,
        totalPartners,
        totalSellers,
        recentOrders,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.getSellers = async (req, res, next) => {
  try {
    const { tab } = req.query;
    const query = {};

    if (tab === 'pending') {
      query.isVerified = false;
    } else if (tab === 'verified') {
      query.isVerified = true;
      query.isActive = true;
    } else if (tab === 'suspended') {
      query.isVerified = true;
      query.isActive = false;
    }

    const sellers = await Seller.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      sellers.map(async (s) => {
        const [productCount, orderCount, trust] = await Promise.all([
          Product.countDocuments({ seller: s._id }),
          Order.countDocuments({ 'items.seller': s._id }),
          getSellerTrust(s._id),
        ]);
        return {
          ...s.toObject(),
          productCount,
          orderCount,
          trustScore: trust?.trustScore || 50,
          trustSummary: trust?.trustSummary || '',
          trust,
        };
      })
    );

    res.json({ success: true, sellers: enriched });
  } catch (e) {
    next(e);
  }
};

exports.getSellerById = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    const [products, orders, trust] = await Promise.all([
      Product.find({ seller: seller._id }).sort({ createdAt: -1 }),
      Order.find({ 'items.seller': seller._id }).populate('user', 'name email').sort({ createdAt: -1 }),
      getSellerTrust(seller._id),
    ]);

    res.json({ success: true, seller, products, orders, trust });
  } catch (e) {
    next(e);
  }
};

exports.approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isVerified = true;
    seller.isActive = true;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller "${seller.storeName}" has been approved and activated.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.rejectSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isVerified = false;
    seller.isActive = false;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller "${seller.storeName}" verification was rejected.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.suspendSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isActive = false;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller "${seller.storeName}" has been suspended.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.activateSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isActive = true;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller "${seller.storeName}" has been activated.`,
    });
  } catch (e) {
    next(e);
  }
};

exports.verifySeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isVerified = req.body.isVerified !== undefined ? Boolean(req.body.isVerified) : !seller.isVerified;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller verification updated to ${seller.isVerified}`,
    });
  } catch (e) {
    next(e);
  }
};

exports.toggleSellerStatus = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !seller.isActive;
    await seller.save();

    // Recalculate AI Trust Score automatically
    const trust = await recalculateSellerTrust(seller._id);

    res.json({
      success: true,
      seller,
      trust,
      message: `Seller status updated to ${seller.isActive ? 'Active' : 'Suspended'}`,
    });
  } catch (e) {
    next(e);
  }
};
