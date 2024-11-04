import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { UploadService } from '../upload/upload.service';
import { Prisma } from '@prisma/client';
import { PrismaDB } from '../prisma/prisma.extensions';

@Injectable()
export class BannerService {
    constructor(private uploadService: UploadService) {}

    async create(name: string, banner: string[]) {
        const bannerData = {
            name: name, // Tên banner
            banner: banner, // Mảng đường dẫn ảnh
        };

        return await PrismaDB.banner.create({
            data: bannerData, // Lưu dữ liệu vào bảng banner
        });
    }

    async findAll() {
        return await PrismaDB.banner.findMany();
    }

    async findOne(id: string) {
        try {
            return await PrismaDB.banner.findUnique({
                where: {
                    id,
                },
            });
        } catch (error) {}
    }

    async update(id: string, name: string, banner: string[]) {
        return await PrismaDB.banner.update({
            where: {
                id: id,
            },
            data: {
                name,
                banner,
            },
        });
    }

    async remove(id: string) {
        return await PrismaDB.banner.delete({
            where: {
                id: id,
            },
        });
    }
}
