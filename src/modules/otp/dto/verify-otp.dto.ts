import { IsMobilePhone, IsString } from 'class-validator';
import { GetOTP_Dto } from 'src/modules/otp/dto/get-otp.dto';

export class VerifyOTP_Dto extends GetOTP_Dto {
    @IsString()
    readonly otp_code: string;
}
