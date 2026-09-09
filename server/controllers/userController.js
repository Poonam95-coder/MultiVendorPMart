const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (e) {
    next(e);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id);
    res.json({ success: true, user: u });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: req.body.name, phone: req.body.phone, avatar: req.body.avatar } },
      { new: true }
    );
    res.json({ success: true, user: u });
  } catch (e) {
    next(e);
  }
};

exports.addresses=async(req,res,next)=>{try{res.json({success:true,addresses:req.user.addresses})}catch(e){next(e)}};

exports.addAddress=async(req,res,next)=>{try{const u=await User.findById(req.user._id);if(req.body.isDefault)u.addresses.forEach(a=>a.isDefault=false);u.addresses.push(req.body);
  await u.save();res.status(201).json({success:true,address:u.addresses.at(-1),addresses:u.addresses})}catch(e){next(e)}};exports.updateAddress=async(req,res,next)=>{try{const u=await User.findById(req.user._id);const a=u.addresses.id(req.params.id);if(!a)return res.status(404).json({success:false,message:'Address not found'});if(req.body.isDefault)u.addresses.forEach(x=>x.isDefault=false);Object.assign(a,req.body);

  await u.save();res.json({success:true,address:a,addresses:u.addresses})}catch(e){next(e)}};exports.deleteAddress=async(req,res,next)=>
  {try{const u=await User.findById(req.user._id);u.addresses.pull(req.params.id);await u.save();res.json({success:true,addresses:u.addresses})}catch(e){next(e)}};
  
exports.defaultAddress=async(req,res,next)=>{try{const u=await User.findById(req.user._id);u.addresses.forEach(a=>a.isDefault=a._id.toString()===req.params.id);await u.save();res.json({success:true,addresses:u.addresses})}catch(e){next(e)}};
