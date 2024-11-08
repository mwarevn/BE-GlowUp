import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

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
    findAll() {
        return this.bookingService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.bookingService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return this.bookingService.update(+id, updateBookingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bookingService.remove(+id);
    }
}
