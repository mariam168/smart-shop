const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

module.exports = { deleteFile };