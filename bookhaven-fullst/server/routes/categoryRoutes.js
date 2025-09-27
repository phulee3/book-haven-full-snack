const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const requireAdmin = require('../middleware/authMiddleware');
// =========================
// Category Routes
// =========================

// Lấy tất cả category
router.get('/', categoryController.getAllCategories);

// Lấy category theo id
router.get('/:id', categoryController.getCategoryById);

// Tạo category mới
router.post('/', requireAdmin, categoryController.createCategory);

// Cập nhật category
router.put('/:id', requireAdmin, categoryController.updateCategory);

// Xóa category
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
