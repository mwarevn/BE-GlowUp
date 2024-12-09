import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(@Res() res: Response, @Req() req: Request) {
        // return res.render('index');
        // return res.redirect('');
    }
}
