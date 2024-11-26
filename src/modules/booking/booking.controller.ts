import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpStatus, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQuery } from 'src/modules/booking/constant';
import path from 'path';
import { Response } from 'express';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Get('cancel')
    async cancelBooking(@Query('phone') phone: string, @Query('booking_id') booking_id: string, @Res() res: Response) {
        try {
            const booking = await this.bookingService.cancelBooking(phone, booking_id);
            res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
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
            res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
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
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid query',
                result: null,
                path: '/booking',
            });
        }

        const bookings = await this.bookingService.findAll(searchQuery, query[searchQuery]);

        res.status(200).json({
            success: true,
            result: bookings,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        const booking = await this.bookingService.findOne(id);
        res.status(200).json({
            success: true,
            result: booking,
        });
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Res() res: Response) {
        try {
            const booking = await this.bookingService.update(id, updateBookingDto);
            res.status(200).json({
                success: true,
                result: booking,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
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
            res.status(200).json({ success: deleted.deleted });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            });
        }
    }
}
