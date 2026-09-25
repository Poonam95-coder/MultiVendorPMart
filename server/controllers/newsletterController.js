const Newsletter = require("../models/Newsletter");


// Check email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Subscribe user to newsletter
exports.subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        // Remove extra spaces and convert email to lowercase
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Check if email is already subscribed
        const existing = await Newsletter.findOne({
            email: normalizedEmail
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                alreadySubscribed: true,
                message: "You are already subscribed."
            });
        }

        // Save new subscriber
        await Newsletter.create({
            email: normalizedEmail
        });

        res.status(201).json({
            success: true,
            alreadySubscribed: false,
            message: "You're subscribed to TrustCart updates!"
        });
    } catch (e) {

        // Handle duplicate email from MongoDB
        if (e.code === 11000) {
            return res.status(200).json({
                success: true,
                alreadySubscribed: true,
                message: "You are already subscribed."
            });
        }

        next(e);
    }
};