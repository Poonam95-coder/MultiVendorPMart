const Category = require("../models/Category");


// Get all categories
exports.getAll = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            categories
        });
    } catch (e) {
        next(e);
    }
};


// Create a new category
exports.create = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            category
        });
    } catch (e) {
        next(e);
    }
};


// Update category details
exports.update = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            category
        });
    } catch (e) {
        next(e);
    }
};


// Delete a category
exports.remove = async (req, res, next) => {
    try {
        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });
    } catch (e) {
        next(e);
    }
};