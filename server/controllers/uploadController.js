const cloudinary = require('../config/cloudinary');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : '';
    const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : '';

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary credentials are not configured in server/.env',
      });
    }

    // Ensure config is fresh
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'pmart', resource_type: 'auto' },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      stream.end(req.file.buffer);
    });

    res.json({ success: true, url: result.secure_url });
  } catch (e) {
    console.error('Cloudinary upload error:', e.message || e);
    res.status(500).json({
      success: false,
      message: e.message || 'Failed to upload image to Cloudinary',
    });
  }
};

