import { Injectable } from '@nestjs/common';
import * as https from 'https';

const apiKeySid = process.env.STRINGEE_KEY_SID;
const apiKeySecret = process.env.STRINGEE_KEY_SECRET;

@Injectable()
export class OtpService {
    sendOtp(phone: string) {
        const sms = [
            {
                from: 'YOUR_BRANDNAME',
                to: '84968902516',
                text: 'hello anh minh dep zai',
            },
        ];

        return this.sendSMS(sms);
    }

    sendSMS(sms: any) {
        const options = {
            hostname: 'api.stringee.com',
            port: 443,
            path: '/v1/sms',
            method: 'POST',
            headers: {
                'X-STRINGEE-AUTH': this.getAccessToken(apiKeySid, apiKeySecret),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        };

        const postData = JSON.stringify({
            sms: sms,
        });

        const req = https.request(options, function (res) {
            console.log('STATUS:', res.statusCode);
            console.log('HEADERS:', JSON.stringify(res.headers));
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                console.log('BODY:', chunk);
            });

            res.on('end', function () {
                console.log('No more data in response.');
            });
        });

        req.on('error', function (e) {
            console.log('Problem with request:', e.message);
        });

        req.write(postData);
        req.end();
    }

    getAccessToken(apiKeySid: string, apiKeySecret: string) {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 3600;

        const header = { cty: 'stringee-api;v=1' };
        const payload = {
            jti: apiKeySid + '-' + now,
            iss: apiKeySid,
            exp,
            rest_api: 1,
        };

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(payload, apiKeySecret, { algorithm: 'HS256', header });
        return token;
    }
}
