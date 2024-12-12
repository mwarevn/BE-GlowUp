import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpStatus, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQuery } from 'src/modules/booking/constant';
import path from 'path';
import { Response } from 'express';
import { isDateInRange } from 'src/common/utils';
import { removeJob } from 'src/queues/check-booking-queue';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}
    //
    @Get('cancel')
    async cancelBooking(@Query('phone') phone: string, @Query('booking_id') booking_id: string, @Res() res: Response) {
        try {
            const booking = await this.bookingService.cancelBooking(phone, booking_id);

            return res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
            });
        }
    }

    @Get('change-booking-status')
    async changeBookingStatus(
        @Query('phone') phone: string,
        @Query('booking_id') booking_id: string,
        @Query('status') status: BookingStatus,
        @Res() res: Response,
    ) {
        try {
            const booking = await this.bookingService.changeBookingStatus(phone, booking_id, status);

            if (booking) {
                removeJob(booking_id);
            }

            return res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
            });
        }
    }

    @Get('change-booking-payment-status')
    async changeBookingPaymentStatus(
        @Query('phone') phone: string,
        @Query('booking_id') booking_id: string,
        @Query('payment_status') payment_status: PaymentStatus,
        @Res() res: Response,
    ) {
        try {
            const booking = await this.bookingService.changeBookingPaymentStatus(phone, booking_id, payment_status);

            if (booking) {
                removeJob(booking_id);
            }

            return res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
            });
        }
    }

    @Post()
    async create(@Body() createBookingDto: CreateBookingDto, @Res() res: Response) {
        try {
            const booking = await this.bookingService.create(createBookingDto);
            return res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            });
        }
    }

    @Get()
    async findAll(@Query() query: any, @Res() res: Response) {
        const searchQuery = Object.keys(query)[0];

        if (!Object.values(BookingQuery).includes(searchQuery as BookingQuery) && Object.keys(query).length > 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid query',
                result: null,
                path: '/booking',
            });
        }

        const bookings = await this.bookingService.findAll(searchQuery, query[searchQuery]);

        return res.status(200).json({
            success: true,
            result: bookings,
        });
    }

    // @Post()
    // async bookingGuests(@Body() createBookingDto: CreateBookingDto, @Res() res: Response) {
    //     const newEndTime = new Date(createBookingDto.end_time as any);
    //     const newStartTime = new Date(createBookingDto.start_time as any);

    //     if (newEndTime <= newStartTime) {
    //         throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu!.');
    //     }

    //     if (newStartTime < new Date()) {
    //         throw new Error('Thời gian bắt đầu không thể nhỏ hơn thời gian hiện tại!.');
    //     }

    //     // if (!isDateInRange(newStartTime)) {
    //     //     throw new Error('Ngày và giờ này tiệm đã đóng cửa!.');
    //     // }
    // }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        const booking = await this.bookingService.findOne(id);
        return res.status(200).json({
            success: true,
            result: booking,
        });
    }
    //
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Res() res: Response) {
        try {
            const booking = await this.bookingService.update(id, updateBookingDto);
            return res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            });
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        try {
            const deleted = await this.bookingService.remove(id);
            return res.status(200).json({ success: deleted.deleted });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            });
        }
    }
}
