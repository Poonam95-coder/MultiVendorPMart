const Product = require('../models/Product');
const Seller = require('../models/Seller');
const SellerTrust = require('../models/SellerTrust');
const { getSellerTrust } = require('../services/trustScoreService');

const populateSeller = {
  path: 'seller',
  select: 'storeName storeDescription rating totalOrders isVerified isActive logo address',
};

async function enrichProductsWithTrust(products) {
  if (!products || !products.length) return products;
  const sellerIds = products
    .map((p) => p.seller && (p.seller._id || p.seller))
    .filter(Boolean);

  if (!sellerIds.length) return products;

  const trusts = await SellerTrust.find({ seller: { $in: sellerIds } });
  const trustMap = new Map();
  trusts.forEach((t) => {
    trustMap.set(t.seller.toString(), t);
  });

  return products.map((p) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    if (obj.seller && typeof obj.seller === 'object') {
      const sId = (obj.seller._id || obj.seller).toString();
      const t = trustMap.get(sId);
      obj.seller.trustScore = t?.trustScore ?? (obj.seller.isVerified ? 85 : 50);
      obj.seller.trustSummary = t?.trustSummary || '';
      obj.seller.trust = t || null;
    }
    return obj;
  });
}

async function getActiveSellerFilter() {
  const activeSellers = await Seller.find({ isVerified: true, isActive: true }).select('_id');
  const activeIds = activeSellers.map((s) => s._id);
  return {
    $or: [{ seller: null }, { seller: { $exists: false } }, { seller: { $in: activeIds } }],
  };
}

exports.getProducts = async (req, res, next) => {
  try {
    const { category, organic, sort, minPrice, maxPrice, seller } = req.query;
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(100, Math.max(1, +req.query.limit || 12));
    const sellerFilter = await getActiveSellerFilter();

    const q = {
      $and: [
        sellerFilter,
        ...(category ? [{ category }] : []),
        ...(seller ? [{ seller }] : []),
        ...(organic !== undefined ? [{ isOrganic: organic === 'true' }] : []),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? [
              {
                price: {
                  ...(minPrice !== undefined && { $gte: +minPrice }),
                  ...(maxPrice !== undefined && { $lte: +maxPrice }),
                },
              },
            ]
          : []),
      ],
    };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      name: { name: 1 },
    };

    const total = await Product.countDocuments(q);
    const products = await Product.find(q)
      .populate(populateSeller)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const enriched = await enrichProductsWithTrust(products);

    res.json({
      success: true,
      products: enriched,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (e) {
    next(e);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).populate(populateSeller);
    if (!p) return res.status(404).json({ success: false, message: 'Product not found' });

    // If product belongs to an unverified or inactive seller, don't expose to customer
    if (p.seller && typeof p.seller === 'object') {
      if (!p.seller.isVerified || !p.seller.isActive) {
        return res.status(404).json({ success: false, message: 'Product is currently not available' });
      }
      const trust = await getSellerTrust(p.seller._id);
      const prodObj = p.toObject();
      prodObj.seller.trustScore = trust?.trustScore ?? (p.seller.isVerified ? 85 : 50);
      prodObj.seller.trustSummary = trust?.trustSummary || '';
      prodObj.seller.trust = trust || null;
      return res.json({ success: true, product: prodObj });
    }

    res.json({ success: true, product: p });
  } catch (e) {
    next(e);
  }
};

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, products: [] });

    const sellerFilter = await getActiveSellerFilter();
    const products = await Product.find({
      $and: [{ $text: { $search: q } }, sellerFilter],
    })
      .populate(populateSeller)
      .limit(50);

    const enriched = await enrichProductsWithTrust(products);
    res.json({ success: true, products: enriched });
  } catch (e) {
    next(e);
  }
};

exports.deals = async (req, res, next) => {
  try {
    const sellerFilter = await getActiveSellerFilter();
    const products = await Product.find({
      $and: [{ discount: { $gt: 0 }, stock: { $gt: 0 } }, sellerFilter],
    })
      .populate(populateSeller)
      .sort({ discount: -1 });

    const enriched = await enrichProductsWithTrust(products);
    res.json({ success: true, products: enriched });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, product: await Product.create(req.body) });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(populateSeller);
    if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: p });
  } catch (e) {
    next(e);
  }
};

exports.stock = async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Math.max(0, +req.body.stock || 0) },
      { new: true }
    ).populate(populateSeller);
    res.json({ success: true, product: p });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

