const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Lấy tất cả review của 1 sản phẩm
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Thêm review mới
router.post('/', reviewController.createReview);

// Cập nhật review
router.put('/:id', reviewController.updateReview);

// Xóa review theo id
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
