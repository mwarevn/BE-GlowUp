import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaDB } from '../prisma/prisma.extensions';

@Injectable()
export class ComboService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createComboDto: CreateComboDto) {
        const { services, ...data } = createComboDto;
        let serviceIds = [];
        let set = new Set();
        serviceIds = services.split(',').filter((id) => id.trim() !== '');
        for (const id of serviceIds) {
            if (!set.has(id)) {
                set.add(id);
            }
        }

        const combo = await this.prismaService.combo.create({
            data: {
                ...data,
                total_time: parseInt(createComboDto.total_time) || 0,
                point: parseInt(createComboDto.point),
                services: Array.from(set) as string[],
            },
        });

        return combo;
    }

    async findAll() {
        const combos = await PrismaDB.combo.findMany();

        // Lấy tất cả các ID của service hiện có trong database
        const existingServiceIds = new Set(
            (await PrismaDB.service.findMany({ select: { id: true } })).map((service) => service.id),
        );

        for (const combo of combos) {
            // Lọc ra những service id tồn tại
            const validServiceIds = combo.services.filter((serviceId) => existingServiceIds.has(serviceId));

            // Nếu array services thay đổi, cập nhật lại combo
            if (validServiceIds.length !== combo.services.length) {
                await PrismaDB.combo.update({
                    where: { id: combo.id },
                    data: { services: validServiceIds },
                });
            }

            // Tính lại giá dựa trên các service còn tồn tại
            const servicePrices = await PrismaDB.service.findMany({
                where: {
                    id: {
                        in: validServiceIds,
                    },
                },
                select: {
                    id: true,
                    price: true,
                    time: true,
                },
            });
            const time = servicePrices.reduce((acc, service) => acc + service.time, 0);
            const price = servicePrices.reduce((acc, service) => acc + parseFloat(service.price), 0);

            // Cập nhật giá combo
            await PrismaDB.combo.update({
                where: { id: combo.id },
                data: { price: price + '', total_time: time },
            });
        }

        return await PrismaDB.combo.findMany();
    }

    async findFilter(id: string) {
        // Tìm tất cả các combo có chứa serviceId trong mảng services
        const combos = await PrismaDB.combo.findMany({
            where: {
                services: {
                    has: id, // Lọc ra combo có chứa serviceId trong mảng services
                },
            },
        });

        return combos;
    }

    async search(query: string) {
        return PrismaDB.combo.findMany({
            where: {
                OR: [{ name: { contains: query, mode: 'insensitive' } }],
            },
        });
    }

    async findOne(id: string) {
        return await PrismaDB.combo.findUnique({
            where: {
                id,
            },
        });
    }

    async update(id: string, updateComboDto: UpdateComboDto) {
        const { services, ...data } = updateComboDto;
        let serviceIds = [];
        let set = new Set();
        serviceIds = services.split(',').filter((id) => id.trim() !== '');
        for (const id of serviceIds) {
            if (!set.has(id)) {
                set.add(id);
            }
        }
        const combo = await this.prismaService.combo.update({
            where: {
                id,
            },
            data: {
                ...data,
                total_time: parseInt(updateComboDto.total_time) || 0,
                point: parseInt(updateComboDto.point),
                services: Array.from(set) as string[],
            },
        });
        return combo;
    }

    async remove(id: string) {
        return await PrismaDB.combo.delete({
            where: {
                id,
            },
        });
    }
}
