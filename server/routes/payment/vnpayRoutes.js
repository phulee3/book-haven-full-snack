const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');


router.post('/create-qr', async (req, res) => {
    const { orderId, amount, orderInfor } = req.body;

    const vnpay = new VNPay({
        tmnCode: 'Z75SEZIL',
        secureSecret: 'NN6RSGNM0UYMAE770BBE8SEA814GRUSZ',
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true, // tùy chọn
        hashAlgorithm: 'SHA512', // tùy chọn
        loggerFn: ignoreLogger, // tùy chọn
    })
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: amount, //
        vnp_IpAddr: '127.0.0.1', //
        vnp_TxnRef: String(orderId),
        vnp_OrderInfo: orderInfor,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: 'http://localhost:5173/orders', //
        vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
        vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
        vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
    });

    return res.status(200).json({ payUrl: vnpayResponse })
});

router.get('/check-payment-vnpay', async (req, res) => {
    try {
        const vnpay = new VNPay({
            tmnCode: 'Z75SEZIL',
            secureSecret: 'NN6RSGNM0UYMAE770BBE8SEA814GRUSZ',
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: 'SHA512',
            loggerFn: ignoreLogger,
        });

        // Xác minh callback từ VNPAY
        const verify = vnpay.verifyReturnUrl(req.query);
        if (!verify.isVerified) {
            return res.status(400).json({ success: false, message: 'Sai chữ ký VNPAY' });
        }

        const orderId = req.query.vnp_TxnRef;
        console.log("VNPAY Order ID:", orderId);
        const responseCode = req.query.vnp_ResponseCode;
        console.log("VNPAY Response Code:", responseCode);

        if (responseCode === '00') {
            // Thanh toán thành công → update order
            const success = await Order.findByIdAndUpdate(orderId);
            if (!success) {
                console.warn("Không cập nhật được đơn hàng:", orderId);
            }
            return res.status(200).json({ success: true, message: 'Thanh toán thành công' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Lỗi xử lý callback' });
    }
});


module.exports = router;