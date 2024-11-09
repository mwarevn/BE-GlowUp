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
                services: Array.from(set) as string[],
            },
        });

        return combo;
    }

    async findAll() {
        // Lấy tất cả các combo từ database
        const combos = await PrismaDB.combo.findMany();

        for (const combo of combos) {
            // Lấy danh sách các dịch vụ có trong combo dựa trên `combo.services`
            const servicePrices = await PrismaDB.service.findMany({
                where: {
                    id: {
                        in: combo.services,
                    },
                },
            });

            // Tính tổng giá các dịch vụ trong combo
            const price = servicePrices.reduce((acc, service) => acc + parseFloat(service.price), 0);

            // Cập nhật giá combo vào cơ sở dữ liệu
            await PrismaDB.combo.update({
                where: { id: combo.id },
                data: { price: price + '' }, // Gán giá trị của price một cách rõ ràng
            });
        }

        return await PrismaDB.combo.findMany(); // Trả về danh sách combo đã được cập nhật giá
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
