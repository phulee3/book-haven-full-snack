const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // Không cần .js nếu dùng CommonJS
const { v4: uuidv4 } = require("uuid");

// 1. Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 2. Hàm upload
const uploadToCloudinary = async (file, folder = "uploads") => {
    if (!file) return null;

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, public_id: uuidv4() },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(file.buffer);
    });
};

// 3. Export các hàm
module.exports = {
    upload,
    uploadToCloudinary,
};
