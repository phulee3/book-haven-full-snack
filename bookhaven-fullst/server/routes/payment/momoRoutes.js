const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const axios = require('axios');

router.post('/create-qr', async (req, res) => {
    const { orderId, amount, orderInfo } = req.body

    const accessKey = 'F8BBA842ECF85'
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
    const partnerCode = 'MOMO'
    const redirectUrl = 'http://localhost:3000/orders'   // 🔥 redirect về FE orders
    const ipnUrl = 'http://localhost:8081/api/payment/momo/ipn' // callback server
    const requestType = "payWithMethod"
    const momoOrderId = `${orderId}-${Date.now()}`;
    const requestId = momoOrderId
    const extraData = ""
    const autoCapture = true
    const lang = 'vi'

    const rawSignature =
        "accessKey=" + accessKey +
        "&amount=" + amount +
        "&extraData=" + extraData +
        "&ipnUrl=" + ipnUrl +
        "&orderId=" + momoOrderId +
        "&orderInfo=" + orderInfo +
        "&partnerCode=" + partnerCode +
        "&redirectUrl=" + redirectUrl +
        "&requestId=" + requestId +
        "&requestType=" + requestType;

    const crypto = require('crypto')
    const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex')

    const requestBody = {
        partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId: momoOrderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
    }

    try {
        const response = await axios.post(
            "https://test-payment.momo.vn/v2/gateway/api/create",
            requestBody,
            { headers: { 'Content-Type': 'application/json' } }
        )
        console.log("[MOMO][API response]", response.data);
        return res.status(200).json(response.data)
    } catch (error) {
        console.error("MoMo API error:", error.response?.data || error.message);

        return res.status(500).json({
            message: 'Error when calling MoMo API',
            momoError: error.response?.data || null,
            error: error.message,
        });
    }
})


// Nhận callback từ MoMo
router.post('/ipn', async (req, res) => {
    console.log("[MOMO][IPN] Callback data:", req.body)
    const { orderId, resultCode, message } = req.body
    const rawOrderId = orderId.split("-")[0]
    if (resultCode === 0) {
        // Thanh toán thành công
        const success = await Order.findByIdAndUpdate(rawOrderId);
        if (!success) {
            console.warn("Không cập nhật được đơn hàng:", rawOrderId);
        }
        return res.status(200).json({ success: true, message: 'Thanh toán thành công' });
    } else {
        // Thanh toán thất bại hoặc bị hủy
        console.log(`Order ${orderId} thất bại: ${message}`)
    }

    // MoMo yêu cầu trả về 200 + JSON
    res.json({ message: "IPN received" })
})

module.exports = router;