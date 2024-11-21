import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Request, Response } from 'express';
import * as followRedirects from 'follow-redirects';
import { OtpModel } from 'src/modules/otp/otp.schema';
const https = followRedirects.https;

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Get()
    async getOTP(@Query('number_phone') number_phone: string, @Req() req: Request, @Res() res: Response) {
        const phone = this.formatPhoneNumber(number_phone);

        if (!phone) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        const existsOTP = await OtpModel.findOne({ number_phone: phone });

        if (existsOTP) {
            return res.status(400).json({
                message:
                    "The code has been sent to your SMS inbox. Please check your messages. If you still don't see the code, you can request the OTP again after a few minutes.",
            });
        }

        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
        const createdOTP = await OtpModel.create({ otp: otp_code, number_phone: phone });

        return this.sendOTP(phone, otp_code, res);

        // return res.json({});
    }

    @Get('verify')
    async verifyOTP(@Query('number_phone') number_phone: string, @Query('otp_code') otp_code: string, @Res() res: Response) {
        const phone = this.formatPhoneNumber(number_phone);

        if (!phone) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        const existsOTP = await OtpModel.findOne({ number_phone: phone });

        if (!existsOTP) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        if (existsOTP.otp !== otp_code) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        await OtpModel.deleteOne({ number_phone: phone });

        return res.json({ message: 'OTP code is correct' });
    }

    sendOTP(number_phone: string, otp_code: string, res: Response) {
        const options = {
            method: 'POST',
            hostname: '8krlqe.api.infobip.com',
            path: '/sms/2/text/advanced',
            headers: {
                Authorization: 'App fb2ee62659675984bdce24cfef4bb89a-68e86590-1328-48a1-9cec-230d043dbc53',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            maxRedirects: 20,
        };
        const postData = JSON.stringify({
            messages: [
                {
                    destinations: [{ to: number_phone }],
                    from: '447491163443',
                    text:
                        '[MWAREVN]\nYour OTP code is ' +
                        otp_code +
                        ' this code will expire in about 1 minute. Please do not share this code with anyone else.',
                },
            ],
        });
        const request = https.request(options, (response) => {
            let chunks: Buffer[] = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                // const body = Buffer.concat(chunks);
                res.status(200).json({
                    message: 'OTP sent successfully',
                    link: `https://minhcuder.com/otp/verify?number_phone=${number_phone}&otp_code=${otp_code}`,
                });
            });
            response.on('error', (error) => {
                res.status(500).json({ message: 'Error sending OTP', error: error.message });
            });
        });
        request.on('error', (error) => {
            console.error(error);
            res.status(500).json({ message: 'Request error', error: error.message });
        });
        request.write(postData);
        request.end();
    }

    formatPhoneNumber(phone) {
        const phoneMap = {
            '090': '84',
            '091': '84',
            '092': '84',
            '093': '84',
            '094': '84',
            '095': '84',
            '096': '84',
            '097': '84',
            '098': '84',
            '099': '84',
            '032': '84',
            '033': '84',
            '034': '84',
            '035': '84',
            '036': '84',
            '037': '84',
            '038': '84',
            '039': '84',
            '070': '84',
            '077': '84',
            '078': '84',
            '079': '84',
            '080': '84',
            '081': '84',
            '082': '84',
            '083': '84',
            '084': '84',
            '085': '84',
            '086': '84',
            '087': '84',
            '088': '84',
            '089': '84',
        };

        if (phone.length === 9) {
            return '84' + phone;
        }

        if (!/^\d{10}$/.test(phone)) {
            return null;
        }

        const prefix = phone.slice(0, 3);
        const countryCode = phoneMap[prefix];

        if (countryCode) {
            return `${countryCode}${phone.slice(1)}`;
        } else {
            return null;
        }
    }
}
