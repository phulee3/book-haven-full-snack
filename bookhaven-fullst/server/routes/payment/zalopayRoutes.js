const express = require("express")
const crypto = require("crypto")
const axios = require("axios")
const dayjs = require("dayjs")

const router = express.Router()

const request = require('request'); // nhớ cài nếu chưa: npm install request

router.post("/create-qr", async (req, res) => {
    try {
        const { items, description, amount } = req.body;

        const app_id = 2554;
        const key1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";

        const currentDate = dayjs();
        const app_time = currentDate.valueOf();
        const tranId = currentDate.format("YYMMDD");
        const app_trans_id = `${tranId}_${app_time}`;

        const embed_data = JSON.stringify({});
        const item = JSON.stringify(items || []);



        const app_user = "demo"; // khai báo trước
        const hmac_input = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${item}`;
        const mac = crypto.createHmac('sha256', key1).update(hmac_input).digest('hex');


        const data = {
            app_id,
            app_trans_id,
            app_time,
            app_user: "demo",
            amount,
            description,
            bank_code: "zalopayqr",
            embed_data,
            item,
            mac
        };

        console.log("Request data:", data);

        // Dùng request thay cho axios
        request({
            url: 'https://sb-openapi.zalopay.vn/v2/create',
            method: 'POST',
            json: true,
            body: data
        }, function (error, response, body) {
            if (body.return_code === 1) {
                console.log('Body:', body);
                res.status(200).json({
                    return_code: body.return_code,
                    return_message: body.return_message,
                    order_url: body.order_url,
                    order_token: body.order_token,
                    zp_trans_token: body.zp_trans_token
                })
            } else {
                console.log('Error:', body);
                res.status(500).send(body);
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating order" });
    }
});



router.post("/callback", (req, res) => {
    console.log("ZaloPay callback:", req.body)

    // TODO: verify MAC từ ZaloPay
    // update DB (cập nhật đơn hàng đã thanh toán thành công)

    res.json({ return_code: 1, return_message: "success" })
})


module.exports = router;
