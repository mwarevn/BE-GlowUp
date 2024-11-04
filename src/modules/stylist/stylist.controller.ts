import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    Res,
    UseInterceptors,
    UploadedFile,
    Req,
    BadRequestException,
    ForbiddenException,
    UseGuards,
} from '@nestjs/common';
import { StylistService } from './stylist.service';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import { Request, response, Response } from 'express';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';
import { UploadService } from 'src/modules/upload/upload.service';
import { Roles } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import mongoose from 'mongoose';

@Controller('stylist')
export class StylistController {
    constructor(
        private readonly stylistService: StylistService,
        private uploadService: UploadService,
    ) {}

    @Post()
    @UseInterceptors(uploadSingleImageInterceptor())
    async create(
        @Body() createStylistDto: CreateStylistDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        let avatar = 'https://minhdevs.github.io/introduce/dev.png';
        await this.uploadService
            .uploadSingleImageThirdParty(req)
            .then((resonse) => {
                if (resonse.success) {
                    avatar = resonse.data.link;
                }
            })
            .catch((err) => {});

        try {
            createStylistDto.avatar = avatar;
            const creadtedStylist = await this.stylistService.create(createStylistDto);

            if (!creadtedStylist) {
                throw new BadRequestException();
            }

            return res.json({ success: true, data: creadtedStylist });
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    async findAll(@Res() res: Response) {
        const stylists = await this.stylistService.findAll();
        if (!stylists) {
            throw new NotFoundException();
        }
        return res.json({ success: true, data: stylists });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;
        const existsStylist = await this.stylistService.findOne(id);

        if (!existsStylist) {
            throw new NotFoundException();
        }

        return { success: true, data: existsStylist };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;
            await this.stylistService.remove(id);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
}
