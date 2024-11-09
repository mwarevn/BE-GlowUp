import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { formatDate, isDateInRange, selectFileds } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { BookingStatus, Roles } from '@prisma/client';
import { addBookingQueue } from 'src/queues/booking-queue';

@Injectable()
export class BookingService {
    /**
     * Coditions:
     * - Phải login (customer, stylist)
     * - Phải nằm trong giờ làm việc - T2 > T7. sáng bắt đầu từ 8h , chiều tan làm lúc 20h30
     * - Stylist phải working
     * - Phải nằm trong thời gian stylist rảnh và thời gian stylist rảnh phải đủ để làm combo
     * - Customer không thể order 2 lần trong cùng 1 khoảng thời gian.
     */
    async create(createBookingDto: CreateBookingDto) {
        const newEndTime = new Date(createBookingDto.end_time as any);
        const newStartTime = new Date(createBookingDto.start_time as any);

        if (newEndTime <= newStartTime) {
            throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu!.');
        }

        if (!isDateInRange(newStartTime)) {
            throw new Error('Ngày và giờ này tiệm đã đóng cửa!.');
        }

        const stylist = await PrismaDB.user.findUnique({
            where: {
                id: createBookingDto.stylist_id as any,
                role: Roles.STYLIST,
            },
            select: { profile: true },
        });
        console.log(stylist);
        if (!stylist && !stylist?.profile.stylist.isWorking) {
            throw new Error('Stylist này không còn làm việc!.');
        }

        const job = await addBookingQueue(createBookingDto);
        const result = await job.finished();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result;
    }

    findAll() {
        return `This action returns all booking`;
    }

    async findOne(id: string) {
        const validBooking = await PrismaDB.booking.findUnique({
            where: {
                id,
            },
            include: {
                combo: {
                    select: {
                        services: true,
                        id: true,
                        name: true,
                        description: true,
                        picture: true,
                    },
                },
                customer: {
                    select: selectFileds,
                },
                stylist: {
                    select: selectFileds,
                },
            },
        });

        const services = [];
        if (validBooking && validBooking.combo.services && validBooking.combo.services.length > 0) {
            services.push(
                ...(await PrismaDB.service.findMany({
                    where: {
                        id: {
                            in: validBooking.combo.services,
                        },
                    },
                })),
            );
        }

        delete validBooking.customer_id;
        delete validBooking.stylist_id;
        delete validBooking.combo_id;

        return {
            ...validBooking,
            combo: {
                ...validBooking.combo,
                services,
            },
            total_time: services.reduce((sum, service) => sum + parseFloat(service.total_time) || 0, 0),
            total_price: services.reduce((sum, service) => sum + parseFloat(service.price) || 0, 0),
        };
    }

    update(id: number, updateBookingDto: UpdateBookingDto) {
        return `This action updates a #${id} booking`;
    }

    remove(id: number) {
        return `This action removes a #${id} booking`;
    }
}
