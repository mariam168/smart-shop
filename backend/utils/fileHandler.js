const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFile = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) {
        return;
    }

    try {
        const urlSegments = imageUrl.split('/');
        const folderIndex = urlSegments.indexOf('smart_shop');
        if (folderIndex === -1) {
            console.warn(`Could not determine public_id from URL: ${imageUrl}`);
            return;
        }
        
        const publicIdWithExtension = urlSegments.slice(folderIndex).join('/');
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(`Failed to delete file from Cloudinary: ${imageUrl}`, error);
    }
};

module.exports = { deleteFile };