const DeliveryPartner = require("../models/DeliveryPartner");


// Get all delivery partners
exports.getAll = async (req, res, next) => {
    try {
        const partners = await DeliveryPartner.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            partners
        });
    } catch (e) {
        next(e);
    }
};


// Create a delivery partner
exports.create = async (req, res, next) => {
    try {
        const p = await DeliveryPartner.create(req.body);

        // Do not send password in response
        const partner = await DeliveryPartner.findById(p._id)
            .select("-password");

        res.status(201).json({
            success: true,
            partner
        });
    } catch (e) {
        next(e);
    }
};


// Activate or deactivate a delivery partner
exports.toggle = async (req, res, next) => {
    try {
        const p = await DeliveryPartner.findById(req.params.id);

        // Change current active status
        p.isActive = !p.isActive;
        await p.save();

        const partner = await DeliveryPartner.findById(p._id)
            .select("-password");

        res.json({
            success: true,
            partner
        });
    } catch (e) {
        next(e);
    }
};