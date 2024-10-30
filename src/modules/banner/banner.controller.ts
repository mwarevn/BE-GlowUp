import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  UploadedFile,
  Req,
  Res,
  UseInterceptors,
  ServiceUnavailableException,
  UploadedFiles,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Request, Response } from 'express';
import { UploadService } from '../upload/upload.service';
import { multerOptions } from 'src/common/configs/upload';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'banners', maxCount: 10 }], multerOptions),
  )
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body('name') name: string,
    @UploadedFiles() files: { banners?: Express.Multer.File[] },
  ) {
    try {
      if (!files.banners || files.banners.length === 0) {
        throw new HttpException('No banners uploaded', HttpStatus.BAD_REQUEST);
      }

      const banners = files.banners.map(
        (file) => process.env.API_URL + file.path.replace('public/uploads', ''),
      ); // Lưu các đường dẫn ảnh
      const banner = await this.bannerService.create(name, banners); // Gọi service để lưu vào DB

      return res.json({
        message: 'Uploaded successfully',
        success: true,
        banner,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `The banner name must be unique. The value you provided already exists.`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const banner = await this.bannerService.findAll();
      return { success: true, data: banner };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id))
        return `not found user with id ${id}`;
      const banner = await this.bannerService.findOne(id);
      return { success: true, data: banner };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'banners', maxCount: 10 }], multerOptions),
  )
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body('name') name: string,
    @UploadedFiles() files: { banners?: Express.Multer.File[] },
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id))
        return `not found user with id ${id}`;

      if (!files.banners || files.banners.length === 0) {
        throw new HttpException('No banners uploaded', HttpStatus.BAD_REQUEST);
      }

      const banners = files.banners.map(
        (file) => process.env.API_URL + file.path.replace('public/uploads', ''),
      ); // Lưu các đường dẫn ảnh
      const banner = await this.bannerService.update(id, name, banners); // Gọi service để lưu vào DB

      return res.json({
        message: 'Update successfully',
        success: true,
        banner,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `The banner name must be unique. The value you provided already exists.`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user with id ${id}`;
    const banner = await this.bannerService.remove(id);
    return { success: true };
  }
}
