import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { selectFileds, utcDate } from 'src/common/utils';
import { populateBookingData } from 'src/modules/booking/booking.service';

@Injectable()
export class AnalysisService {
    create(createAnalysisDto: CreateAnalysisDto) {
        return 'This action adds a new analysis';
    }

    async findAll(start_date: string, end_date: string, combo_id: string, service_id: string) {
        const options: any = {};

        if (!start_date || !end_date) {
            throw new Error('Ngày giờ không hợp lệ!');
        } else {
            try {
                utcDate(new Date(start_date));
                utcDate(new Date(end_date));
            } catch (error) {
                throw new Error('Ngày giờ không hợp lệ!');
            }
        }

        if (combo_id) {
            options.combo_id = combo_id;
        }

        if (service_id) {
            options.service_id = service_id;
        }

        const bookings = await PrismaDB.booking.findMany({
            where: {
                start_time: {
                    gte: utcDate(new Date(start_date.replace(' ', '+'))),
                },
                end_time: {
                    lte: utcDate(new Date(end_date.replace(' ', '+'))),
                },

                ...options,
            },
            include: {
                combo: {
                    select: {
                        services: true,
                    },
                },
            },
        });
        return {
            total_price: (await Promise.all(bookings.map(async (item) => await populateBookingData(item)))).reduce(
                (acc, item) => acc + item.total_price,
                0,
            ),
        };
    }

    findOne(id: number) {
        return `This action returns a #${id} analysis`;
    }

    update(id: number, updateAnalysisDto: UpdateAnalysisDto) {
        return `This action updates a #${id} analysis`;
    }

    remove(id: number) {
        return `This action removes a #${id} analysis`;
    }
}
