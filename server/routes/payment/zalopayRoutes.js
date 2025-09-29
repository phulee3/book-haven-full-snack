const express = require("express")
const crypto = require("crypto")
const axios = require("axios")
const moment = require("moment")
const qs = require("qs")
const Order = require("../../models/Order")

const router = express.Router()

// ================== CẤU HÌNH ZALOPAY ==================
const zaloPayConfig = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create'
};

// API để tạo đơn hàng ZaloPay
router.post("/create-qr", async (req, res) => {
    try {
        const { amount, orderInfo, orderId } = req.body;
        const callback_url = `${process.env.BASE_URL || 'http://localhost:8081'}/api/payment/zalopay/callback`;
        const redirect_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?app_trans_id=${moment().format('YYMMDD')}_${orderId}&status=1`;
        const embed_data = { redirecturl: redirect_url };
        const items = [];

        const order = {
            app_id: zaloPayConfig.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${orderId}`, // Sử dụng orderId thực tế
            app_user: 'user123',
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: orderInfo || `BookHaven - Payment for order #${orderId}`,
            bank_code: '',
            callback_url: callback_url,
        };

        const data = `${zaloPayConfig.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = crypto.createHmac('sha256', zaloPayConfig.key1).update(data).digest('hex');

        console.log("ZaloPay Request data:", order);
        console.log("ZaloPay Callback URL:", callback_url);

        const result = await axios.post(zaloPayConfig.endpoint, null, { params: order });

        if (result.data.return_code === 1) {
            res.status(200).json({
                return_code: result.data.return_code,
                return_message: result.data.return_message,
                order_url: result.data.order_url,
                order_token: result.data.order_token,
                zp_trans_token: result.data.zp_trans_token
            });
        } else {
            console.log('ZaloPay Error:', result.data);
            res.status(500).json(result.data);
        }
    } catch (error) {
        console.log('ZaloPay Create Order Error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo yêu cầu ZaloPay' });
    }
});



// API để ZaloPay server gọi lại (callback/IPN)
router.post("/callback", async (req, res) => {
    console.log("ZaloPay Callback received:", req.body);
    let result = {};
    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;
        let mac = crypto.createHmac('sha256', zaloPayConfig.key2).update(dataStr).digest('hex');

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = 'mac not equal';
        } else {
            let dataJson = JSON.parse(dataStr);
            console.log("ZaloPay Callback: update order's status = success where app_trans_id =", dataJson['app_trans_id']);

            // Cập nhật trạng thái đơn hàng trong database
            const appTransId = dataJson['app_trans_id'];
            // Extract order ID from app_trans_id (format: YYMMDD_orderId)
            const orderId = appTransId.split('_')[1]; // Lấy phần orderId

            console.log("ZaloPay: Extracted orderId from app_trans_id:", orderId);

            const success = await Order.findByIdAndUpdate(orderId);
            if (success) {
                console.log("ZaloPay: Đã cập nhật trạng thái đơn hàng thành công:", orderId);
            } else {
                console.warn("ZaloPay: Không cập nhật được đơn hàng:", orderId);
            }

            result.return_code = 1;
            result.return_message = 'success';
        }
    } catch (ex) {
        console.log('ZaloPay Callback Error:', ex.message);
        result.return_code = 0;
        result.return_message = ex.message;
    }
    res.json(result);
});

// API để xác minh kết quả thanh toán ZaloPay (tương tự VNPay)
router.get('/check-payment-zalopay', async (req, res) => {
    try {
        const { app_trans_id, status } = req.query;

        console.log("ZaloPay Check Payment - app_trans_id:", app_trans_id, "status:", status);

        if (!app_trans_id) {
            return res.status(400).json({ success: false, message: 'Thiếu app_trans_id' });
        }

        // Extract order ID from app_trans_id (format: YYMMDD_orderId)
        const orderId = app_trans_id.split('_')[1];
        console.log("ZaloPay Check Payment - extracted orderId:", orderId);

        // Xử lý status có thể là array hoặc string
        const statusValue = Array.isArray(status) ? status[0] : status;
        console.log("ZaloPay Check Payment - statusValue:", statusValue);

        if (statusValue === '1' || statusValue === 1) {
            // Thanh toán thành công → update order
            const success = await Order.findByIdAndUpdate(orderId);
            if (success) {
                console.log("ZaloPay Check Payment: Đã cập nhật trạng thái đơn hàng thành công:", orderId);
                return res.status(200).json({ success: true, message: 'Thanh toán thành công' });
            } else {
                console.warn("ZaloPay Check Payment: Không cập nhật được đơn hàng:", orderId);
                return res.status(400).json({ success: false, message: 'Không cập nhật được đơn hàng' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Thanh toán không thành công' });
        }
    } catch (err) {
        console.error("ZaloPay Check Payment Error:", err);
        return res.status(500).json({ success: false, message: 'Lỗi xử lý xác minh thanh toán' });
    }
});

module.exports = router;
