const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAdmin = require('../middleware/authMiddleware');
// =========================
// User Routes
// =========================

// Lấy tất cả user
router.get('/', requireAdmin, userController.getAllUsers);

// Lấy user theo ID
router.get('/:id', requireAdmin, userController.getUserById);

// Đăng ký user mới
router.post('/register', userController.registerUser);

// Cập nhật user
router.put('/:id', requireAdmin, userController.updateUser);

// Xóa user
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;
