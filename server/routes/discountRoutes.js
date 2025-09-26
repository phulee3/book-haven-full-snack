const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// =========================
// Discount Routes
// =========================

// Lấy tất cả discount
router.get('/', discountController.getAllDiscounts);

// Lấy discount theo id
router.get('/:id', discountController.getDiscountById);

// Tạo discount mới
router.post('/', discountController.createDiscount);

// Cập nhật discount
router.put('/:id', discountController.updateDiscount);

// Xóa discount
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
