const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + "-" + file.originalname
        );
    }

});

// Allow only image files
const fileFilter = (req, file, cb) => {

    const allowedTypes = /jpg|jpeg|png|gif|webp/;

    const isValid =
        allowedTypes.test(file.mimetype) &&
        allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );

    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }

};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;