import { IsDate, IsMobilePhone, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    start_time: String;

    @IsString()
    end_time: String;

    @IsString()
    combo_id: String;

    @IsString()
    @IsOptional()
    customer_id: String;

    @IsString()
    stylist_id: String;

    @IsString()
    @IsOptional()
    full_name: String;

    @IsMobilePhone('vi-VN')
    @IsOptional()
    phone_number: String;
}
