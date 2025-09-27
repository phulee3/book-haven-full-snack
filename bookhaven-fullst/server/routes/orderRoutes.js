const express = require('express');
const orderController = require('../controllers/orderController');
const requireAuth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/authMiddleware');
const router = express.Router();

// =========================
// Order Routes
// =========================

// Lấy tất cả đơn hàng (admin only)
router.get('/', requireAdmin, orderController.getAllOrders);

// Lấy đơn hàng của user hiện tại
router.get('/my-orders', requireAuth, orderController.getMyOrders);

// Lấy chi tiết đơn hàng (kèm items)
router.get('/:id', requireAuth, orderController.getOrderById);

// Tạo đơn hàng mới
router.post('/', requireAuth, orderController.createOrder);

// Hủy đơn hàng (chỉ user sở hữu đơn hàng mới được hủy)
router.patch('/:id/cancel', requireAuth, orderController.cancelOrder);

// Cập nhật trạng thái đơn hàng (chỉ admin)
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

// Xóa đơn hàng (chỉ admin)
router.delete('/:id', requireAdmin, orderController.deleteOrder);

module.exports = router;