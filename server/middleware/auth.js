const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DeliveryPartner = require("../models/DeliveryPartner");
const Seller = require("../models/Seller");


// Check login token and identify the user role
async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        // Check token from Authorization header
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const extracted = authHeader.slice(7).trim();

            if (
                extracted &&
                extracted !== "null" &&
                extracted !== "undefined"
            ) {
                token = extracted;
            }
        }

        // If no header token, check cookie
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Delivery partner has a separate account model
        if (decoded.role === "delivery") {
            req.deliveryPartner =
                await DeliveryPartner.findById(decoded.id);

            if (!req.deliveryPartner) {
                return res.status(401).json({
                    success: false,
                    message: "Delivery account not found"
                });
            }
        } else {
            // Get normal user account
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }


            // Check whether this user also has a seller profile
            const seller = await Seller.findOne({
                $or: [
                    { user: req.user._id },
                    { email: req.user.email }
                ]
            });

            if (seller) {
                req.seller = seller;
            }
        }

        next();
    } catch (e) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}


// Allow only admin users
function adminOnly(req, res, next) {
    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
}


// Allow only delivery partners
function deliveryOnly(req, res, next) {
    if (!req.deliveryPartner) {
        return res.status(401).json({
            success: false,
            message: "Delivery partner access required"
        });
    }

    next();
}


// Allow only users having a seller profile
function sellerOnly(req, res, next) {
    if (!req.user || !req.seller) {
        return res.status(403).json({
            success: false,
            message: "Seller access required"
        });
    }

    next();
}


// Allow only verified and active sellers
function sellerActiveAndVerified(req, res, next) {
    if (!req.user || !req.seller) {
        return res.status(403).json({
            success: false,
            message: "Seller access required"
        });
    }

    // Seller must be verified by admin
    if (!req.seller.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Seller account is pending Admin verification."
        });
    }

    // Seller account must also be active
    if (!req.seller.isActive) {
        return res.status(403).json({
            success: false,
            message: "Seller account is currently inactive."
        });
    }

    next();
}


module.exports = {
    protect,
    adminOnly,
    deliveryOnly,
    sellerOnly,
    sellerActiveAndVerified
};