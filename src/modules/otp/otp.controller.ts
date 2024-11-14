import { Controller, Get, Query } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Get()
    sendOtp(@Query('phone') phone: string) {
        return this.otpService.sendOtp(phone);
    }
}
