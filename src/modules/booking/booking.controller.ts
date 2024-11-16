import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQuery } from 'src/modules/booking/constant';
import path from 'path';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    async create(@Body() createBookingDto: CreateBookingDto) {
        try {
            const booking = await this.bookingService.create(createBookingDto);
            return {
                success: true,
                result: booking,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            };
        }
    }

    @Get()
    async findAll(@Query() query: any) {
        const searchQuery = Object.keys(query)[0];

        if (!Object.values(BookingQuery).includes(searchQuery as BookingQuery) && Object.keys(query).length > 0) {
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid query',
                result: null,
                path: '/booking',
            };
        }

        const bookings = await this.bookingService.findAll(searchQuery, query[searchQuery]);

        return {
            success: true,
            result: bookings,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const booking = await this.bookingService.findOne(id);
        return {
            success: true,
            result: booking,
        };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        try {
            const booking = await this.bookingService.update(id, updateBookingDto);
            return {
                success: true,
                result: booking,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            };
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            const deleted = await this.bookingService.remove(id);
            return { success: deleted.deleted };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/booking',
            };
        }
    }
}
