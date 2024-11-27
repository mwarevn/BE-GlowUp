import { IsMobilePhone } from 'class-validator';

export class GetOTP_Dto {
    @IsMobilePhone('vi-VN', {}, { message: 'Phone number is not valid' })
    readonly phone_number: string;
}
