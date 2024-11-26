import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpoNotiService } from './expo-noti.service';
import { CreateExpoNotiDto } from './dto/create-expo-noti.dto';
import { UpdateExpoNotiDto } from './dto/update-expo-noti.dto';

@Controller('expo-noti')
export class ExpoNotiController {
    constructor(private readonly expoNotiService: ExpoNotiService) {}
}
