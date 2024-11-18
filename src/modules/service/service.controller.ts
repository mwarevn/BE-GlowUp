import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Req,
    Res,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';
import { UploadService } from '../upload/upload.service';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
@UseInterceptors(uploadSingleImageInterceptor())
@Controller('service')
export class ServiceController {
    constructor(
        private readonly serviceService: ServiceService,
        private uploadService: UploadService,
    ) {}

    @Post()
    async create(
        @Body() createServiceDto: CreateServiceDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            if (file) {
                const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
                createServiceDto.picture = imgData.data.link;
            } else {
                createServiceDto.picture = 'https://placehold.co/600x400';
            }
            const service = await this.serviceService.create(createServiceDto);
            res.status(200).json({ success: true, result: service });
        } catch (error) {
            if (error.code === 'P2002') {
                res.status(HttpStatus.CONFLICT).json({
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `The service name must be unique. The value you provided already exists.`,
                    result: null,
                    path: '/service',
                });
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/service',
            });
        }
    }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const service = await this.serviceService.findAll();
            res.status(200).json({ success: true, result: service });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        if (!mongoose.Types.ObjectId.isValid(id))
            res.status(400).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid service id',
                result: null,
                path: '/service',
            });
        const service = await this.serviceService.findOne(id);
        res.status(200).json({ success: true, result: service });
    }
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateServiceDto: UpdateServiceDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        console.log(updateServiceDto.picture);
        try {
            if (!mongoose.Types.ObjectId.isValid(id))
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid service id',
                    result: null,
                    path: '/service',
                });

            if (file) {
                const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
                updateServiceDto.picture = imgData.data.link;
            }
            const service = await this.serviceService.update(id, updateServiceDto);
            res.json({ success: true, result: service });
        } catch (error) {
            res.json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/service',
            });
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        if (!mongoose.Types.ObjectId.isValid(id))
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid service id',
                result: null,
                path: '/service',
            });
        const service = await this.serviceService.remove(id);
        res.status(200).json({ success: true });
    }
}
