import { IsMobilePhone, IsString } from 'class-validator';

export class UpdateNumberphoneDTO {
    @IsMobilePhone('vi-VN')
    phone_number: string;
}
