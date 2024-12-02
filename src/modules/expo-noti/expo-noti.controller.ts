import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ExpoNotiService } from './expo-noti.service';
import { CreateExpoNotiDto } from './dto/create-expo-noti.dto';
import { UpdateExpoNotiDto } from './dto/update-expo-noti.dto';

@Controller('expo-noti')
export class ExpoNotiController {
    constructor(private readonly expoNotiService: ExpoNotiService) {}

    @Get('history')
    async findAllNotifyHistory(@Param('user_id') user_id: string) {
        return await this.expoNotiService.findAllNotifyHistory(user_id);
    }

    @Patch('history/mark-read/:id')
    async markRead(@Param('id') id: string) {
        if (!id) {
            throw new Error('Invalid id'); //
        }

        try {
            return await this.expoNotiService.markRead(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Patch('history/mark-all-read/:id')
    async markAllRead(@Param('id') id: string) {
        if (!id) {
            throw new Error('Invalid id'); //
        }

        try {
            return await this.expoNotiService.markAllRead(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
