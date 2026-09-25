const mongoose = require("mongoose");


// Newsletter subscriber schema
const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Newsletter",
    newsletterSchema
);