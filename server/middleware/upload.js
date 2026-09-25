const multer = require("multer");


// Store uploaded file temporarily in memory
const upload = multer({
    storage: multer.memoryStorage(),

    // Maximum file size is 5 MB
    limits: {
        fileSize: 5 * 1024 * 1024
    },

    // Allow only selected image formats
    fileFilter: (req, file, cb) => {
        const allowedTypes =
            /^image\/(jpeg|png|webp)$/;

        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only jpeg, png and webp images are allowed"
                )
            );
        }
    }
});

module.exports = upload;