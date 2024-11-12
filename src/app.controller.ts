import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(@Query('msg') msg: string): string {
        return this.appService.getHello(msg);
    }
}
