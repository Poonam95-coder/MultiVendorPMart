const Product = require('../models/Product');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const User = require('../models/User');
const { getSellerTrust } = require('../services/trustScoreService');

// GET /api/seller/profile
exports.getProfile = async (req, res, next) => {
  try {
    const [seller, trust] = await Promise.all([
      Seller.findById(req.seller._id).populate('user', 'name email phone avatar'),
      getSellerTrust(req.seller._id),
    ]);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }
    res.json({ success: true, seller, trust });
  } catch (e) {
    next(e);
  }
};

// PUT /api/seller/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { storeName, storeDescription, email, phone, logo, address } = req.body;
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    if (storeName) seller.storeName = storeName.trim();
    if (storeDescription !== undefined) seller.storeDescription = storeDescription.trim();
    if (email) seller.email = email.trim().toLowerCase();
    if (phone !== undefined) seller.phone = phone.trim();
    if (logo !== undefined) seller.logo = logo;
    if (address !== undefined) seller.address = address;

    await seller.save();
    res.json({ success: true, seller });
  } catch (e) {
    next(e);
  }
};

// GET /api/seller/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;

    const [totalProducts, activeProducts, lowStock, outOfStock, sellerProducts, trust] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, stock: { $gt: 0 } }),
      Product.countDocuments({ seller: sellerId, stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ seller: sellerId, stock: 0 }),
      Product.find({ seller: sellerId }).sort({ rating: -1, reviewCount: -1 }).limit(5),
      getSellerTrust(sellerId),
    ]);

    // Orders containing at least one item from this seller
    const allSellerOrders = await Order.find({ 'items.seller': sellerId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const totalOrders = allSellerOrders.length;
    const completedOrders = allSellerOrders.filter((o) => o.status === 'Delivered').length;
    const pendingOrders = allSellerOrders.filter(
      (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
    ).length;

    const matchSellerItem = (item) => {
      if (!item || !item.seller) return false;
      const sId = item.seller._id ? item.seller._id.toString() : item.seller.toString();
      return sId === sellerId.toString();
    };

    // Calculate revenue from Delivered orders for this seller's items only
    let revenue = 0;
    allSellerOrders.forEach((o) => {
      if (o.status === 'Delivered') {
        o.items.forEach((item) => {
          if (matchSellerItem(item)) {
            revenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });

    const recentOrders = allSellerOrders.slice(0, 10).map((o) => {
      const sellerItems = o.items.filter(matchSellerItem);
      const sellerSubtotal = sellerItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
        0
      );
      return {
        _id: o._id,
        createdAt: o.createdAt,
        user: o.user,
        status: o.status,
        sellerItems,
        sellerSubtotal,
        total: o.total,
      };
    });

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStock,
        outOfStock,
        totalOrders,
        pendingOrders,
        completedOrders,
        revenue: +revenue.toFixed(2),
        topProducts: sellerProducts,
        recentOrders,
        trust,
      },
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/seller/products
exports.getProducts = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { category, sort, search } = req.query;
    const q = { seller: sellerId };

    if (category) q.category = category;
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      stock_asc: { stock: 1 },
      stock_desc: { stock: -1 },
      name: { name: 1 },
    };

    const products = await Product.find(q).sort(sortMap[sort] || { createdAt: -1 });
    res.json({ success: true, products, totalProducts: products.length });
  } catch (e) {
    next(e);
  }
};

// POST /api/seller/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      unit,
      stock,
      isOrganic,
      discount,
    } = req.body;

    if (!name || price === undefined || !image || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, image and category are required',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: +price,
      originalPrice: originalPrice ? +originalPrice : +price,
      image,
      category,
      unit: unit || 'piece',
      stock: stock !== undefined ? Math.max(0, +stock) : 0,
      isOrganic: Boolean(isOrganic),
      discount: discount !== undefined ? Math.max(0, Math.min(100, +discount)) : 0,
      seller: req.seller._id,
    });

    res.status(201).json({ success: true, product });
  } catch (e) {
    next(e);
  }
};

// PUT /api/seller/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check
    if (!product.seller || product.seller.toString() !== req.seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      unit,
      stock,
      isOrganic,
      discount,
    } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = +price;
    if (originalPrice !== undefined) product.originalPrice = +originalPrice;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (unit !== undefined) product.unit = unit;
    if (stock !== undefined) product.stock = Math.max(0, +stock);
    if (isOrganic !== undefined) product.isOrganic = Boolean(isOrganic);
    if (discount !== undefined) product.discount = Math.max(0, Math.min(100, +discount));

    await product.save();
    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/seller/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check
    if (!product.seller || product.seller.toString() !== req.seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/seller/products/:id/stock
exports.updateStock = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check
    if (!product.seller || product.seller.toString() !== req.seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify stock for this product',
      });
    }

    const newStock = Math.max(0, +req.body.stock || 0);
    product.stock = newStock;
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
};

// GET /api/seller/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const products = await Product.find({ seller: sellerId }).sort({ stock: 1, name: 1 });

    const inventory = products.map((p) => {
      let status = 'In Stock';
      if (p.stock === 0) status = 'Out of Stock';
      else if (p.stock <= 10) status = 'Low Stock';

      return {
        _id: p._id,
        name: p.name,
        image: p.image,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        status,
      };
    });

    res.json({ success: true, inventory, total: inventory.length });
  } catch (e) {
    next(e);
  }
};

// GET /api/seller/orders
exports.getOrders = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { status, sellerStatus } = req.query;

    const query = { 'items.seller': sellerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const matchSellerItem = (item) => {
      if (!item || !item.seller) return false;
      const sId = item.seller._id ? item.seller._id.toString() : item.seller.toString();
      return sId === sellerId.toString();
    };

    // Filter and format items per order for this seller
    const formattedOrders = orders
      .map((order) => {
        let sellerItems = order.items.filter(matchSellerItem);

        if (sellerStatus && sellerStatus !== 'all') {
          sellerItems = sellerItems.filter((item) => item.sellerStatus === sellerStatus);
        }

        if (sellerItems.length === 0) return null;

        const sellerTotal = sellerItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );

        return {
          _id: order._id,
          createdAt: order.createdAt,
          status: order.status,
          user: order.user,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          items: sellerItems,
          sellerTotal,
        };
      })
      .filter(Boolean);

    res.json({ success: true, orders: formattedOrders, count: formattedOrders.length });
  } catch (e) {
    next(e);
  }
};

// GET /api/seller/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const matchSellerItem = (item) => {
      if (!item || !item.seller) return false;
      const sId = item.seller._id ? item.seller._id.toString() : item.seller.toString();
      return sId === sellerId.toString();
    };

    const sellerItems = order.items.filter(matchSellerItem);

    if (sellerItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No items in this order belong to your store',
      });
    }

    const sellerTotal = sellerItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    res.json({
      success: true,
      order: {
        _id: order._id,
        createdAt: order.createdAt,
        status: order.status,
        statusHistory: order.statusHistory,
        user: order.user,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        items: sellerItems,
        sellerTotal,
      },
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/seller/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { status, itemId } = req.body;
    const allowedSellerStatuses = ['Pending', 'Accepted', 'Rejected', 'Preparing', 'Packed'];

    if (!allowedSellerStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedSellerStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const matchSellerItem = (item) => {
      if (!item || !item.seller) return false;
      const sId = item.seller._id ? item.seller._id.toString() : item.seller.toString();
      return sId === sellerId.toString();
    };

    const matchItemProduct = (item) => {
      if (!itemId) return true;
      if (!item || !item.product) return false;
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      return pId === itemId.toString();
    };

    let itemModified = false;
    order.items.forEach((item) => {
      if (matchSellerItem(item)) {
        if (matchItemProduct(item)) {
          item.sellerStatus = status;
          itemModified = true;
        }
      }
    });

    if (!itemModified) {
      return res.status(403).json({
        success: false,
        message: 'No matching items belong to your store in this order',
      });
    }

    order.statusHistory.push({
      status: `Seller (${req.seller.storeName}): ${status}`,
      timestamp: new Date(),
      note: req.body.note || `Seller updated item fulfillment status to ${status}`,
    });

    // If all seller items in the entire order are Packed, and order is Placed/Confirmed/Assigned, we can sync order state
    const allItemsPacked = order.items.every(
      (item) => item.sellerStatus === 'Packed' || !item.seller
    );
    if (allItemsPacked && ['Placed', 'Confirmed', 'Assigned'].includes(order.status)) {
      order.status = 'Packed';
      order.statusHistory.push({
        status: 'Packed',
        timestamp: new Date(),
        note: 'All seller items are packed and ready for delivery pickup',
      });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
};
