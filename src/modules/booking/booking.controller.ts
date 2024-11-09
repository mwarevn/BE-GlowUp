import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQuery } from 'src/modules/booking/constant';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    async create(@Body() createBookingDto: CreateBookingDto) {
        try {
            return await this.bookingService.create(createBookingDto);
        } catch (error) {
            return { error: error.message };
        }
    }

    @Get()
    async findAll(@Query() query: any) {
        const searchQuery = Object.keys(query)[0];

        if (!Object.values(BookingQuery).includes(searchQuery as BookingQuery) && Object.keys(query).length > 0) {
            throw new BadRequestException('Invalid query');
        }

        const bookings = await this.bookingService.findAll(searchQuery, query[searchQuery]);

        return bookings || [];
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.bookingService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        try {
            return await this.bookingService.update(id, updateBookingDto);
        } catch (error) {
            return { error: error.message };
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            const deleted = await this.bookingService.remove(id);
            return { success: deleted.deleted };
        } catch (error) {
            return { error: error.message };
        }
    }
}
