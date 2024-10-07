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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
      createServiceDto.picture = imgData.data.link;
      const service = await this.serviceService.create(createServiceDto);
      res.json(service);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `The service name must be unique. The value you provided already exists.`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const imgData = await this.uploadService.uploadSingleImageThirdParty(req);
      updateServiceDto.picture = imgData.data.link;
      const service = await this.serviceService.update(id, updateServiceDto);
      res.json(service);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
