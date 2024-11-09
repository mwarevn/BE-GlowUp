import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @IsOptional()
    status: BookingStatus;
}
