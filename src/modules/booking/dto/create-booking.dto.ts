import { IsDate, IsString } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    start_time: String;

    @IsString()
    end_time: String;

    @IsString()
    combo_id: String;

    @IsString()
    customer_id: String;

    @IsString()
    stylist_id: String;
}
