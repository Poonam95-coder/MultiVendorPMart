const mongoose = require("mongoose");


// Category schema
const categorySchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Category", categorySchema);