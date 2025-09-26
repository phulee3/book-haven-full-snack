const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const requireAuth = require('../middleware/authMiddleware');
// =========================
// Cart Routes
// =========================

// Lấy giỏ hàng theo user
router.get('/:userId', requireAuth, cartController.getCartByUser);

// Thêm sản phẩm vào giỏ
router.post('/', requireAuth, cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
router.put('/:id', requireAuth, cartController.updateCartItem);

// Xóa 1 sản phẩm trong giỏ
router.delete('/:id', requireAuth, cartController.removeCartItem);

// Xóa toàn bộ giỏ hàng của 1 user
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
