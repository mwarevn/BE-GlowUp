import { HttpException, HttpStatus, Injectable, UploadedFile } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaDB } from '../prisma/prisma.extensions';

@Injectable()
export class ServiceService {
    constructor(private prisma: PrismaService) {}

    async create(createServiceDto: CreateServiceDto) {
        const service = await PrismaDB.service.create({
            data: {
                ...createServiceDto,
                time: parseInt(createServiceDto.time),
            },
        });
        return service;
    }

    async findAll() {
        const services = await PrismaDB.service.findMany();
        return services;
    }

    findOne(id: string) {
        const service = PrismaDB.service.findUnique({
            where: { id },
        });
        return service;
    }

    update(id: string, updateServiceDto: UpdateServiceDto) {
        const service = PrismaDB.service.update({
            where: { id },
            data: {
                ...updateServiceDto,
                time: parseInt(updateServiceDto.time),
            },
        });
        return service;
    }

    remove(id: string) {
        return PrismaDB.service.delete({
            where: { id },
        });
    }
}
