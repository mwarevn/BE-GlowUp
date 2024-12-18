import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    Req,
    Res,
    HttpException,
    HttpStatus,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { ComboService } from './combo.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { UploadService } from '../upload/upload.service';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaDB } from '../prisma/prisma.extensions';
import mongoose from 'mongoose';
import { STATUS_CODES } from 'http';
import path from 'path';

@UseInterceptors(uploadSingleImageInterceptor())
@Controller('combo')
export class ComboController {
    constructor(
        private readonly comboService: ComboService,
        private uploadService: UploadService,
    ) {}

    @Post()
    async create(
        @Body() createComboDto: CreateComboDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            if (file) {
                const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
                createComboDto.picture = imgData.data.link;
            } else {
                createComboDto.picture = 'https://placehold.co/600x400';
            }
            const services = createComboDto.services.split(',').filter((id) => id.trim() !== '');
            for (const service of services) {
                const serviceId = await PrismaDB.service.findUnique({
                    where: {
                        id: service,
                    },
                    select: {
                        id: true,
                    },
                });
                if (!serviceId) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        success: false,
                        statusCode: HttpStatus.NOT_FOUND,
                        message: `Id dịch vụ ${service} không tồn tại`,
                        result: null,
                        path: '/combo',
                    });
                }
            }

            const combo = await this.comboService.create(createComboDto);

            return res.json({ success: true, result: combo });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(HttpStatus.CONFLICT).json({
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `Tên combo phải là duy nhất. Giá trị bạn cung cấp đã tồn tại.`,
                    result: null,
                    path: '/combo',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/combo',
            });
        }
    }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const combo = await this.comboService.findAll();
            return res.status(200).json({ success: true, result: combo });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/combo',
            });
        }
    }
    @Get('filter/:id')
    async findFilter(@Param('id') id: string, @Res() res: Response) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(400).json({
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `not found mongoose Types ObjectId ${id}`,
                    result: null,
                });
            const combo = await this.comboService.findFilter(id);
            return res.status(200).json({ success: true, result: combo });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/combo',
            });
        }
    }

    @Get('search')
    async search(@Query('search') query: string) {
        return this.comboService.search(query);
    }
    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        try {
            const combo = await this.comboService.findOne(id);
            return res.status(200).json({ success: true, result: combo });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/combo',
            });
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateComboDto: UpdateComboDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: `not found mongoose Types ObjectId ${id}`,
                    result: null,
                    path: '/combo',
                });
            if (file) {
                const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
                updateComboDto.picture = imgData.data.link;
            }
            const services = updateComboDto.services.split(',').filter((id) => id.trim() !== '');
            for (const service of services) {
                const serviceId = await PrismaDB.service.findUnique({
                    where: {
                        id: service,
                    },
                    select: {
                        id: true,
                    },
                });
                if (!serviceId) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        success: false,
                        statusCode: HttpStatus.NOT_FOUND,
                        message: `Service id ${service} not found`,
                        result: null,
                        path: '/combo',
                    });
                }
            }
            const combo = await this.comboService.update(id, updateComboDto);
            return res.json({ success: true, result: combo });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.json({
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `Tên combo phải là duy nhất. Giá trị bạn cung cấp đã tồn tại.`,
                    result: null,
                    path: '/combo',
                });
                // res.json({
                //     success: false,
                //     statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                //     message: error.message,
                //     result: null,
                //     path: '/combo',
                // });
            }
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json(`not found mongoose Types ObjectId ${id}`);
            const booking = await PrismaDB.booking.findMany({
                where: {
                    combo_id: id,
                },
            });

            if (booking.length > 0) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Combo đã tồn tại trong booking',
                    result: null,
                });
            }

            const combo = await this.comboService.remove(id);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                result: null,
                path: '/combo',
            });
        }
    }
}
