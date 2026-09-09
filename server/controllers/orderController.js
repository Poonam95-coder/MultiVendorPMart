const Order=require('../models/Order');const Product=require('../models/Product');const DeliveryPartner=require('../models/DeliveryPartner');const generateOTP=require('../utils/generateOTP');
const allowed=['Placed','Confirmed','Assigned','Packed','Out for Delivery','Delivered','Cancelled'];
function addHistory(o,status,note=''){o.status=status;o.statusHistory.push({status,note,timestamp:new Date()});}
exports.place=async(req,res,next)=>{try{const{items,shippingAddress,paymentMethod='cash'}=req.body;if(!Array.isArray(items)||!items.length)return res.status(400).json({success:false,message:'Cart is empty'});const finalItems=[];let subtotal=0;for(const x of items){const p=await Product.findById(x.product||x.productId).populate('seller');if(!p)return res.status(404).json({success:false,message:'Product not found'});if(p.seller&&(!p.seller.isVerified||!p.seller.isActive))return res.status(400).json({success:false,message:`Product "${p.name}" is currently unavailable for purchase.`});if(p.stock<(+x.quantity||0))return res.status(400).json({success:false,message:`Insufficient stock for ${p.name}`});const quantity=+x.quantity;finalItems.push({product:p._id,seller:p.seller?._id||p.seller||null,sellerStatus:'Pending',name:p.name,image:p.image,price:p.price,quantity,unit:p.unit});subtotal+=p.price*quantity;}const deliveryFee=subtotal>20?0:1.99;const tax=+(subtotal*.08).toFixed(2);const total=+(subtotal+deliveryFee+tax).toFixed(2);const o=await Order.create({user:req.user._id,items:finalItems,shippingAddress,paymentMethod,subtotal,deliveryFee,tax,total,status:'Placed',statusHistory:[{status:'Placed',note:'Order placed by customer'}],deliveryOtp:generateOTP(),isPaid:paymentMethod==='cash'?false:false});for(const i of finalItems)await Product.findByIdAndUpdate(i.product,{$inc:{stock:-i.quantity}});res.status(201).json({success:true,order:await o.populate(['deliveryPartner',{path:'items.seller',select:'storeName rating isVerified'}])});}catch(e){next(e)}};
exports.my=async(req,res,next)=>{try{const q={user:req.user._id};if(req.query.status&&req.query.status!=='all')q.status=req.query.status;res.json({success:true,orders:await Order.find(q).populate('deliveryPartner').populate({path:'items.seller',select:'storeName rating isVerified'}).sort({createdAt:-1})})}catch(e){next(e)}};
exports.byId = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id)
      .populate('deliveryPartner')
      .populate('user', 'name email phone')
      .populate({ path: 'items.seller', select: 'storeName rating isVerified' });
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });

    const isCustomer = Boolean(req.user && o.user && (o.user._id ? o.user._id.toString() : o.user.toString()) === req.user._id.toString());
    const isAdmin = Boolean(req.user && req.user.isAdmin);
    const isSeller = Boolean(
      req.seller &&
        o.items.some((i) => {
          const sId = i.seller?._id ? i.seller._id.toString() : (i.seller ? i.seller.toString() : null);
          return sId === req.seller._id.toString();
        })
    );
    const isAssignedDelivery = Boolean(
      req.deliveryPartner &&
        o.deliveryPartner &&
        (o.deliveryPartner._id ? o.deliveryPartner._id.toString() : o.deliveryPartner.toString()) ===
          req.deliveryPartner._id.toString()
    );

    if (!isAdmin && !isCustomer && !isSeller && !isAssignedDelivery) {
      return res.status(403).json({ success: false, message: 'Access denied: not authorized for this order' });
    }
    res.json({ success: true, order: o });
  } catch (e) {
    next(e);
  }
};
exports.all = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('deliveryPartner')
      .populate({ path: 'items.seller', select: 'storeName rating isVerified' })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    next(e);
  }
};

exports.status = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    const s = req.body.status;
    if (!allowed.includes(s)) return res.status(400).json({ success: false, message: 'Invalid status' });
    addHistory(o, s, req.body.note || `Status changed to ${s}`);
    if (s === 'Out for Delivery' && !o.deliveryOtp) o.deliveryOtp = generateOTP();
    if (s === 'Delivered') o.deliveryOtp = '';
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: s,
        statusHistory: populated.statusHistory,
      });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

exports.assign = async (req, res, next) => {
  try {
    const p = await DeliveryPartner.findById(req.body.deliveryPartnerId);
    if (!p || !p.isActive) return res.status(400).json({ success: false, message: 'Active delivery partner required' });
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    o.deliveryPartner = p._id;
    addHistory(o, 'Assigned', `Assigned to ${p.name}`);
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: 'Assigned',
        deliveryPartner: populated.deliveryPartner,
        statusHistory: populated.statusHistory,
      });
      io.to(`delivery:${p._id}`).emit('order-assigned', { order: populated });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    if (['Delivered', 'Cancelled'].includes(o.status)) return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    for (const i of o.items) await Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } });
    addHistory(o, 'Cancelled', req.body.reason || 'Order cancelled');
    o.deliveryOtp = '';
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: 'Cancelled',
        statusHistory: populated.statusHistory,
      });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

exports.deliveryOrders = async (req, res, next) => {
  try {
    const q = { deliveryPartner: req.deliveryPartner._id };
    if (req.query.tab === 'completed') q.status = { $in: ['Delivered', 'Cancelled'] };
    else q.status = { $nin: ['Delivered', 'Cancelled'] };
    const orders = await Order.find(q)
      .populate('user', 'name email phone')
      .populate('deliveryPartner')
      .populate({ path: 'items.seller', select: 'storeName rating isVerified' })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    next(e);
  }
};

exports.deliveryStatus = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!o.deliveryPartner || o.deliveryPartner.toString() !== req.deliveryPartner._id.toString())
      return res.status(403).json({ success: false, message: 'Order is not assigned to this delivery partner' });
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    addHistory(o, req.body.status, req.body.note || 'Delivery status updated');
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: req.body.status,
        statusHistory: populated.statusHistory,
      });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!o.deliveryPartner || o.deliveryPartner.toString() !== req.deliveryPartner._id.toString())
      return res.status(403).json({ success: false, message: 'Order is not assigned to this delivery partner' });
    const otp = req.body.otp !== undefined ? String(req.body.otp).trim() : '';
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits' });
    if (otp !== String(o.deliveryOtp).trim()) return res.status(400).json({ success: false, message: 'Invalid delivery OTP' });
    addHistory(o, 'Delivered', 'Delivery completed with OTP');
    o.deliveryOtp = '';
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: 'Delivered',
        statusHistory: populated.statusHistory,
      });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

exports.deliveryCancel = async (req, res, next) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!o.deliveryPartner || o.deliveryPartner.toString() !== req.deliveryPartner._id.toString())
      return res.status(403).json({ success: false, message: 'Order is not assigned to this delivery partner' });
    if (['Delivered', 'Cancelled'].includes(o.status)) return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    for (const i of o.items) await Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } });
    addHistory(o, 'Cancelled', req.body.reason || 'Delivery cancelled');
    o.deliveryOtp = '';
    await o.save();
    const populated = await o.populate([
      'deliveryPartner',
      'user',
      { path: 'items.seller', select: 'storeName rating isVerified' },
    ]);

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order:${o._id}`).emit('status-update', {
        orderId: o._id.toString(),
        status: 'Cancelled',
        statusHistory: populated.statusHistory,
      });
      io.emit('order-updated', { order: populated });
    }

    res.json({ success: true, order: populated });
  } catch (e) {
    next(e);
  }
};

