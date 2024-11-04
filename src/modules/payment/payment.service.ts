import { Injectable, Req, Res } from '@nestjs/common';
import * as moment from 'moment';
import { VnpayService } from 'nestjs-vnpay';
import { Request, Response } from 'express';

@Injectable()
export class PaymentService {
    constructor(private readonly vnpayService: VnpayService) {}

    async getBankList() {
        return this.vnpayService.getBankList();
    }

    //   async createPaymentUrl(@Req() req: Request, @Res() res: Response) {
    //     process.env.TZ = 'Asia/Ho_Chi_Minh';

    //     let date = new Date();
    //     let createDate = moment(date).format('YYYYMMDDHHmmss');

    //     let ipAddr =
    //       req.headers['x-forwarded-for'] ||
    //       req.connection.remoteAddress ||
    //       req.socket.remoteAddress ||
    //       req.connection.remoteAddress;

    //     let tmnCode = 'L7ODOMNQ';
    //     let secretKey = 'U9FPOHV7YZEF78V43PH8ZBCE8GEWO6D0';
    //     let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    //     let returnUrl = 'http://localhost:3000/payment/vnpay_return';
    //     let orderId = moment(date).format('DDHHmmss');
    //     let amount = req.body.amount;
    //     let bankCode = req.body.bankCode;

    //     let locale = req.body.language;
    //     if (locale === null || locale === '') {
    //       locale = 'vn';
    //     }
    //     let currCode = 'VND';
    //     let vnp_Params = {};
    //     vnp_Params['vnp_Version'] = '2.1.0';
    //     vnp_Params['vnp_Command'] = 'pay';
    //     vnp_Params['vnp_TmnCode'] = tmnCode;
    //     vnp_Params['vnp_Locale'] = locale;
    //     vnp_Params['vnp_CurrCode'] = currCode;
    //     vnp_Params['vnp_TxnRef'] = orderId;
    //     vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    //     vnp_Params['vnp_OrderType'] = 'other';
    //     vnp_Params['vnp_Amount'] = amount * 100;
    //     vnp_Params['vnp_ReturnUrl'] = returnUrl;
    //     vnp_Params['vnp_IpAddr'] = ipAddr;
    //     vnp_Params['vnp_CreateDate'] = createDate;
    //     if (bankCode !== null && bankCode !== '') {
    //       vnp_Params['vnp_BankCode'] = bankCode;
    //     }

    //     vnp_Params = sortObject(vnp_Params);

    //     let querystring = require('qs');
    //     let signData = querystring.stringify(vnp_Params, { encode: false });
    //     let crypto = require('crypto');
    //     let hmac = crypto.createHmac('sha512', secretKey);
    //     let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    //     vnp_Params['vnp_SecureHash'] = signed;
    //     vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    //     res.json(vnpUrl);
    //   }

    //   async vnpayReturn(@Req() req: Request, @Res() res: Response) {
    //     let vnp_Params = req.query;

    //     let secureHash = vnp_Params['vnp_SecureHash'];

    //     delete vnp_Params['vnp_SecureHash'];
    //     delete vnp_Params['vnp_SecureHashType'];

    //     vnp_Params = sortObject(vnp_Params);

    //     let tmnCode = 'L7ODOMNQ';
    //     let secretKey = 'U9FPOHV7YZEF78V43PH8ZBCE8GEWO6D0';
    //     let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    //     let returnUrl = 'http://localhost:3000/payment/vnpay_return';

    //     let querystring = require('qs');
    //     let signData = querystring.stringify(vnp_Params, { encode: false });
    //     let crypto = require('crypto');
    //     let hmac = crypto.createHmac('sha512', secretKey);
    //     let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    //     if (secureHash === signed) {
    //       //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    //       res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
    //     } else {
    //       res.render('success', { code: '97' });
    //     }
    //   }
    // }

    // function sortObject(obj) {
    //   let sorted = {};
    //   let str = [];
    //   let key;
    //   for (key in obj) {
    //     if (obj.hasOwnProperty(key)) {
    //       str.push(encodeURIComponent(key));
    //     }
    //   }
    //   str.sort();
    //   for (key = 0; key < str.length; key++) {
    //     sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    //   }
    //   return sorted;
}
