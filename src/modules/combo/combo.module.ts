import { Module } from '@nestjs/common';
import { ComboService } from './combo.service';
import { ComboController } from './combo.controller';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Module({
    controllers: [ComboController],
    providers: [ComboService, PrismaService, UploadService],
})
export class ComboModule {}
