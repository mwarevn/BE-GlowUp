import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @IsOptional()
    status: BookingStatus;
    @IsOptional()
    status_payment: PaymentStatus;
}
