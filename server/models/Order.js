const mongoose = require('mongoose');

const Item = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
    sellerStatus: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Preparing', 'Packed'],
      default: 'Pending',
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const Address = new mongoose.Schema(
  {
    label: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [Item], required: true },
    shippingAddress: Address,
    paymentMethod: { type: String, default: 'cash' },
    subtotal: Number,
    deliveryFee: Number,
    tax: Number,
    total: Number,
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Assigned', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
    deliveryOtp: { type: String, default: '' },
    liveLocation: { lat: Number, lng: Number, updatedAt: Date },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', schema);

