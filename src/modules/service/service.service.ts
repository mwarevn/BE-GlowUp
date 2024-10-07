import {
  HttpException,
  HttpStatus,
  Injectable,
  UploadedFile,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaDB } from '../prisma/prisma.extensions';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: createServiceDto,
    });
    return service;
  }

  findAll() {
    const services = this.prisma.service.findMany();
    return services;
  }

  findOne(id: string) {
    const service = this.prisma.service.findUnique({
      where: { id },
    });
    return service;
  }

  update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
    return service;
  }

  remove(id: string) {
    return PrismaDB.service.delete({
      where: { id },
    });
  }
}
