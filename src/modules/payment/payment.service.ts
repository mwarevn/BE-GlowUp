import { Injectable, Req, Res } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';
import { Request, Response } from 'express';

@Injectable()
export class PaymentService {
  constructor(private readonly vnpayService: VnpayService) {}

  async getBankList() {
    return this.vnpayService.getBankList();
  }

  async createPaymentUrl(@Req() req: Request): Promise<string> {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress;

    const tmnCode = 'REVSPUGM';
    const secretKey = 'vZVDTGN3T8S2KBDUT7OGQCVAYLIDNL34Q';
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = 'http://localhost:3000/payment/vnpay-return';

    const moment = require('moment');
    var createDate = moment().format('YYYYMMDDHHmmss');
    var orderId = moment().format('HHmmss');

    const amount = req.body.amount;
    const bankCode = req.body.bankCode;
    const orderInfo = req.body.orderDescription;
    const orderType = req.body.orderType;
    const locale = req.body.language || 'vn';
    const currCode = 'VND';

    let vnp_Params: { [key: string]: any } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '192.168.77.115',
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const crypto = require('crypto');
    const hmac = crypto.createHmac('SHA256', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    return `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;
  }
}
function sortObject(vnp_Params: { [key: string]: any }): {
  [key: string]: any;
} {
  const sortedParams: { [key: string]: any } = {};

  // Lấy danh sách các key, sắp xếp theo thứ tự bảng chữ cái
  const sortedKeys = Object.keys(vnp_Params).sort((a, b) => a.localeCompare(b));

  // Thêm từng key-value vào đối tượng mới đã sắp xếp
  sortedKeys.forEach((key) => {
    sortedParams[key] = vnp_Params[key];
  });

  return sortedParams;
}
