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
            res.json({ success: true, data: service });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new HttpException(
                    `The service name must be unique. The value you provided already exists.`,
                    HttpStatus.CONFLICT,
                );
            }
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        try {
            const service = await this.serviceService.findAll();
            return { success: true, data: service };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;
        const service = await this.serviceService.findOne(id);
        return { success: true, data: service };
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
            if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;

            if (file) {
                const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
                updateServiceDto.picture = imgData.data.link;
            }
            const service = await this.serviceService.update(id, updateServiceDto);
            res.json({ success: true, data: service });
        } catch (error) {
            console.log(error);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;
        const service = await this.serviceService.remove(id);
        return { success: true };
    }
}
