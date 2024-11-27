import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Request, Response } from 'express';
import { get } from 'http';
import * as moment from 'moment';
import qs from 'qs';
import * as crypto from 'crypto';
import { PrismaDB } from '../prisma/prisma.extensions';
import mongoose from 'mongoose';
import path from 'path';
let querystring = require('qs');

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Get('bank-list')
    getBankList() {
        return this.paymentService.getBankList();
    }

    sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }
        return sorted;
    }

    @Post('/create_payment_url')
    async createPaymentUrl(@Body() body: any, @Req() req: Request, @Res() res: Response) {
        try {
            process.env.TZ = 'Asia/Ho_Chi_Minh';
            const date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');
            let ipAddr =
                req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.remoteAddress;
            let tmnCode = process.env.VNP_TMN_CODE;
            let secretKey = process.env.VNP_HASH_SECRET;
            let vnpUrl = process.env.VNP_URL;
            let returnUrl = process.env.VNP_RETURN_URL;
            const bookingId = body.bookingId;
            const booking = await PrismaDB.booking.findUnique({
                where: {
                    id: bookingId,
                },
                select: {
                    combo: {
                        select: {
                            price: true,
                        },
                    },
                },
            });

            let bookingPrice = booking.combo?.price;
            // bookingPrice = '8000000';
            if (!booking) {
                throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
            }

            const orderId = moment(date).format('DDHHmmss');
            const amount = parseFloat(bookingPrice) * 100;
            console.log(amount);
            const bankCode = body.bankCode;
            let vnp_Params: any = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Locale: body.language || 'vn',
                vnp_CurrCode: 'VND',
                vnp_TxnRef: orderId,
                vnp_OrderInfo: 'Thanh toan cho ma GD:' + orderId,
                vnp_OrderType: bookingId,
                vnp_Amount: amount,
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
            };
            if (bankCode) {
                vnp_Params['vnp_BankCode'] = bankCode;
            }
            vnp_Params = this.sortObject(vnp_Params);
            let signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            vnp_Params['vnp_SecureHash'] = signed;
            const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
            res.status(200).json({ paymentUrl });
        } catch (error) {
            res.status(500).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/payment/create_payment_url',
            });
        }
    }

    @Get('/vnpay_return')
    vnpayReturn(@Req() req: Request, @Res() res: Response) {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = this.sortObject(vnp_Params);

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            // xử lý kết quả giao dịch ở đây
            res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
        } else {
            res.render('success', { code: '97' });
        }
    }
}
