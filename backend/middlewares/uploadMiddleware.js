const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createUploadMiddleware = (subfolder) => {
    const destinationDir = path.join(__dirname, `../uploads/${subfolder}`);
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destinationDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    });

    const upload = multer({ 
        storage: storage,
    });

    return upload;
};

module.exports = createUploadMiddleware;