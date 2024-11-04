import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Module({
    controllers: [ServiceController],
    providers: [ServiceService, PrismaService, UploadService],
})
export class ServiceModule {}
