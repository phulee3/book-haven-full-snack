const Review = require('../models/Review');

// Lấy tất cả review của 1 sản phẩm
exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.getByProduct(productId);
        res.json(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách review' });
    }
};


// Tạo đánh giá mới cho sản phẩm
exports.createReview = async (req, res) => {
    try {
        const { product_id, user_id, orderitem_id, rating, comment } = req.body;

        // Kiểm tra xem người dùng đã đánh giá sản phẩm trong đơn hàng này chưa
        const existingReview = await Review.getByOrderItem(orderitem_id);
        if (existingReview && existingReview.user_id === user_id) {
            return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi' });
        }

        // Tiến hành tạo đánh giá mới
        const newReview = await Review.create({ product_id, user_id, orderitem_id, rating, comment });
        console.log(`New review created by user ${user_id} for product ${product_id}`);
        res.status(201).json(newReview);
    } catch (err) {
        console.error('Failed to create review:', err.message);
        res.status(400).json({ error: 'Không thể tạo đánh giá. Vui lòng kiểm tra lại thông tin.' });
    }
};


// Cập nhật review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const updated = await Review.update(id, { rating, comment });

        if (!updated) {
            return res.status(404).json({ error: 'Review không tồn tại' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ error: 'Lỗi khi cập nhật review' });
    }
};

// Xóa review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Review.remove(id);
        if (!success) {
            return res.status(404).json({ error: 'Review không tồn tại' });
        }
        res.json({ message: 'Xóa review thành công' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Lỗi khi xóa review' });
    }
};
