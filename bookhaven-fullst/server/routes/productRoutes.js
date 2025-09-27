const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload, uploadToCloudinary } = require("../middleware/uploadFile");
const requireAdmin = require('../middleware/authMiddleware');



// =========================
// Product Routes
// =========================

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Tìm kiếm sản phẩm (query ?q=)
router.get('/search', productController.searchProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

// Thêm sản phẩm mới
router.post('/', upload.single("file"), requireAdmin, productController.createProduct);

// Cập nhật sản phẩm
router.put('/:id', upload.single("file"), requireAdmin, productController.updateProduct);

// Xóa sản phẩm
router.delete('/:id', requireAdmin, productController.deleteProduct);

module.exports = router;
