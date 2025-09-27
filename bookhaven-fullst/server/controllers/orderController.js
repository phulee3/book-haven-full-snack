const Order = require('../models/Order.js');
const OrderItem = require('../models/OrderItem.js');
const Cart = require('../models/Cart.js');
const crypto = require('crypto');
const querystring = require('querystring');

// VNPay helper function (added)
function buildVnpayPayUrl({ amount, orderId, ipAddr, orderInfo, returnUrl, tmnCode, hashSecret }) {
    if (!tmnCode || !hashSecret || !returnUrl) {
        throw new Error('Missing VNPay configuration (VNPAY_TMN_CODE / VNPAY_HASH_SECRET / VNPAY_RETURN_URL)');
    }
    const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const date = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const createDate = date.getFullYear().toString()
        + pad(date.getMonth() + 1)
        + pad(date.getDate())
        + pad(date.getHours())
        + pad(date.getMinutes())
        + pad(date.getSeconds());

    let vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: Math.round(Number(amount) || 0) * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    // Sort params
    const sortedKeys = Object.keys(vnpParams).sort();
    const sortedParams = {};
    sortedKeys.forEach(k => { sortedParams[k] = vnpParams[k]; });

    const signData = sortedKeys.map(k => `${k}=${encodeURIComponent(sortedParams[k])}`).join('&');
    const hmac = crypto.createHmac('sha512', hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const query = signData + '&vnp_SecureHash=' + secureHash;
    return { payUrl: `${vnpUrl}?${query}` };
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: 'Server error while fetching orders' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ JWT token
        const orders = await Order.getByUserId(userId);
        res.json(orders);
    } catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ error: 'Server error while fetching your orders' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Lấy từ JWT token

        const order = await Order.getById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Kiểm tra quyền truy cập (user chỉ xem được đơn hàng của mình, admin xem được tất cả)
        if (req.user.role !== 'admin' && order.user_id !== userId) {
            return res.status(403).json({ error: 'You can only view your own orders' });
        }

        const items = await OrderItem.getByOrderId(id);
        res.json({ ...order, items });
    } catch (err) {
        console.error("Error fetching order by ID:", err);
        res.status(500).json({ error: 'Server error while fetching order' });
    }
};

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id; // lấy từ JWT token
        const { total_amount, payment_method, shipping_address, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item" });
        }

        // Mặc định đơn hàng chưa thanh toán
        const order = await Order.create({
            user_id: userId,
            total_amount,
            status: "pending",
            payment_method,
            shipping_address,
            payment_status: "unpaid"
        });

        // thêm items
        for (let item of items) {
            await OrderItem.create({ order_id: order.id, ...item });
        }

        // xóa giỏ hàng
        await Cart.removeItemsByOrder(order.id, userId);

        if (payment_method === "vnpay") {
            // Nếu là VNPay thì tạo URL thanh toán
            const { payUrl } = buildVnpayPayUrl({
                amount: total_amount,
                orderId: order.id,
                ipAddr:
                    req.headers["x-forwarded-for"] ||
                    req.connection.remoteAddress ||
                    req.socket?.remoteAddress ||
                    "127.0.0.1",
                orderInfo: `Thanh toán đơn hàng #${order.id}`,
                returnUrl: process.env.VNPAY_RETURN_URL,
                tmnCode: process.env.VNPAY_TMN_CODE,
                hashSecret: process.env.VNPAY_HASH_SECRET,
            });

            return res.status(201).json({
                message: "Order created, redirect to VNPay",
                order_id: order.id,
                payUrl
            });
        }

        // Nếu là COD thì trả về luôn
        res.status(201).json({
            message: "Order created successfully",
            order_id: order.id
        });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: "Server error while creating order" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Lấy từ JWT token

        // Kiểm tra đơn hàng có tồn tại không
        const order = await Order.getById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Kiểm tra đơn hàng có thuộc về user này không
        if (order.user_id !== userId) {
            return res.status(403).json({ error: 'You can only cancel your own orders' });
        }

        // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc confirmed
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({
                error: `Cannot cancel order with status: ${order.status}. Only pending or confirmed orders can be cancelled.`
            });
        }

        // Cập nhật trạng thái thành 'cancelled'
        const updated = await Order.updateStatus(id, 'cancelled');
        if (!updated) {
            return res.status(500).json({ error: 'Failed to cancel order' });
        }

        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json({ error: 'Server error while cancelling order' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validation status'status', 'enum(\'pending\',\'processing\',\'shipped\',\'completed\',\'cancelled\')'

        const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
            });
        }

        const updated = await Order.updateStatus(id, status);
        if (!updated) return res.status(404).json({ error: 'Order not found to update' });

        res.json({ message: 'Order status updated successfully', status });
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).json({ error: 'Server error while updating order' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Order.remove(id);
        if (!success) return res.status(404).json({ error: 'Order not found to delete' });

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).json({ error: 'Server error while deleting order' });
    }
};

module.exports = {
    getAllOrders,
    getMyOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    updateOrderStatus,
    deleteOrder
};