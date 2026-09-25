const User = require("../models/User");


// Get all normal users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({
            isAdmin: false
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (e) {
        next(e);
    }
};


// Get logged-in user's profile
exports.profile = async (req, res, next) => {
    try {
        const u = await User.findById(req.user._id);

        res.json({
            success: true,
            user: u
        });
    } catch (e) {
        next(e);
    }
};


// Update user profile
exports.update = async (req, res, next) => {
    try {
        const u = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: req.body.name,
                    phone: req.body.phone,
                    avatar: req.body.avatar
                }
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            user: u
        });
    } catch (e) {
        next(e);
    }
};


// Get saved addresses
exports.addresses = async (req, res, next) => {
    try {
        res.json({
            success: true,
            addresses: req.user.addresses
        });
    } catch (e) {
        next(e);
    }
};


// Add a new address
exports.addAddress = async (req, res, next) => {
    try {
        const u = await User.findById(req.user._id);

        // If new address is default, remove default from others
        if (req.body.isDefault) {
            u.addresses.forEach((a) => {
                a.isDefault = false;
            });
        }

        u.addresses.push(req.body);

        await u.save();

        res.status(201).json({
            success: true,
            address: u.addresses.at(-1),
            addresses: u.addresses
        });
    } catch (e) {
        next(e);
    }
};


// Update an existing address
exports.updateAddress = async (req, res, next) => {
    try {
        const u = await User.findById(req.user._id);

        const a = u.addresses.id(req.params.id);

        if (!a) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Make this address default if requested
        if (req.body.isDefault) {
            u.addresses.forEach((x) => {
                x.isDefault = false;
            });
        }

        Object.assign(a, req.body);

        await u.save();

        res.json({
            success: true,
            address: a,
            addresses: u.addresses
        });
    } catch (e) {
        next(e);
    }
};


// Delete an address
exports.deleteAddress = async (req, res, next) => {
    try {
        const u = await User.findById(req.user._id);

        u.addresses.pull(req.params.id);

        await u.save();

        res.json({
            success: true,
            addresses: u.addresses
        });
    } catch (e) {
        next(e);
    }
};


// Set an address as default
exports.defaultAddress = async (req, res, next) => {
    try {
        const u = await User.findById(req.user._id);

        u.addresses.forEach((a) => {
            a.isDefault =
                a._id.toString() === req.params.id;
        });

        await u.save();

        res.json({
            success: true,
            addresses: u.addresses
        });
    } catch (e) {
        next(e);
    }
};