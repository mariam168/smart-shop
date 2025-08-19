const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createUploadMiddleware = (subfolder) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `smart_shop/${subfolder}`,
            allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
            transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
        },
    });

    return multer({ storage: storage });
};

module.exports = createUploadMiddleware;