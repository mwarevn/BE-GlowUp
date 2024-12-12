import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { formatDate, isDateInRange, logger, selectFileds, utcDate } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { BookingStatus, Roles } from '@prisma/client';
import { addBookingQueue } from 'src/queues/mutation-booking-queue';
import { BookingQuery } from 'src/modules/booking/constant';
import { removeJob } from 'src/queues/check-booking-queue';
import { ExpoNotiService } from 'src/modules/expo-noti/expo-noti.service';

export const populateBookingData = async (validBooking) => {
    const services = [];
    if (validBooking && validBooking.combo?.services && validBooking.combo?.services.length > 0) {
        services.push(
            ...(await PrismaDB.service.findMany({
                where: {
                    id: {
                        in: validBooking.combo?.services,
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
        total_time: services.reduce((sum, service) => sum + parseFloat(service.time) || 0, 0),
        total_price: services.reduce((sum, service) => sum + parseFloat(service.price) || 0, 0),
    };
};

@Injectable()
export class BookingService {
    constructor(private expoNotiService: ExpoNotiService) {}

    async cancelBooking(phone: string, booking_id: string) {
        const booking = await PrismaDB.booking.findUnique({
            where: {
                id: booking_id,
            },
            include: {
                customer: {
                    select: {
                        notify_token: true,
                        ...selectFileds,
                    },
                },
            },
        });

        if (!booking) {
            throw new Error('Không tìm thấy booking!.');
        }

        if (booking.status === BookingStatus.CANCELED) {
            throw new Error('Booking này đã bị hủy!.');
        }

        removeJob(booking_id);

        const notify_token = booking.customer?.notify_token;

        if (notify_token) {
            this.expoNotiService.sendExpoNotify(
                'Booking đã bị hủy',
                'Đã hủy booking của bạn',
                'success',
                'high',
                booking.customer.notify_token,
                booking.customer_id,
            );
        }

        return await PrismaDB.booking.update({
            where: {
                id: booking_id,
            },
            data: {
                status: BookingStatus.CANCELED,
            },
        });
    }

    async changeBookingStatus(phone: string, booking_id: string, status: BookingStatus) {
        const booking = await PrismaDB.booking.findUnique({
            where: {
                id: booking_id,
            },
            include: {
                customer: {
                    select: {
                        notify_token: true,
                        ...selectFileds,
                    },
                },
            },
        });

        if (!booking) {
            throw new Error('Không tìm thấy booking!.');
        }

        const notify_token = booking.customer?.notify_token;

        if (notify_token) {
            this.expoNotiService
                .sendExpoNotify(
                    'Booking đã bị hủy',
                    'Đã hủy booking của bạn',
                    'success',
                    'high',
                    booking.customer.notify_token,
                    booking.customer_id,
                )
                .then((res) => res.json())
                .then((res) => {})
                .catch(logger.debug);
        }

        return await PrismaDB.booking.update({
            where: {
                id: booking_id,
            },
            data: {
                status,
            },
        });
    }

    /**
     * Coditions:
     * - Phải login (customer, stylist)
     * - Phải nằm trong giờ làm việc - T2 > T7. sáng bắt đầu từ 8h , chiều tan làm lúc 20h30
     * - Stylist phải working
     * - Phải nằm trong thời gian stylist rảnh và thời gian stylist rảnh phải đủ để làm combo
     * - Customer không thể order 2 lần trong cùng 1 khoảng thời gian.
     */
    async create(createBookingDto: CreateBookingDto) {
        const newEndTime = utcDate(new Date(createBookingDto.end_time as any));
        const newStartTime = utcDate(new Date(createBookingDto.start_time as any));

        if (newEndTime <= newStartTime) {
            throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu!.');
        }

        if (newStartTime < utcDate(new Date())) {
            throw new Error('Thời gian bắt đầu không thể nhỏ hơn thời gian hiện tại!.');
        }

        if (!isDateInRange(newStartTime)) {
            throw new Error('Ngày và giờ này tiệm đã đóng cửa!.');
        } // 8h - 20h30
        const stylist = await PrismaDB.user.findUnique({
            where: {
                id: createBookingDto.stylist_id as string,
                role: Roles.STYLIST,
            },
            select: { profile: true },
        });

        const combo = await PrismaDB.combo.findUnique({
            where: {
                id: createBookingDto.combo_id as string,
            },
        });

        if (createBookingDto.customer_id) {
            const customer = await PrismaDB.user.findUnique({
                where: {
                    id: createBookingDto.customer_id as string,
                },
            });

            if (!customer) {
                throw new Error('Không tìm thấy khách hàng này!');
            }
        }

        if (!combo) {
            throw new Error('Combo không tồn tại!.');
        }

        if (!combo?.services || combo.services.length === 0) {
            throw new Error('Combo này không có dịch vụ!.');
        }

        if (!stylist || !stylist.profile || stylist.profile.stylist.isWorking === false) {
            throw new Error('Stylist này không còn làm việc!.');
        }

        const job = await addBookingQueue(createBookingDto, 'create');
        const result = await job.finished();

        if (!result.success) {
            throw new Error(result.message);
        }

        return await populateBookingData(result.data);
    }

    async findAll(key, value) {
        const coditions = [];

        switch (key) {
            case BookingQuery.phone_number:
                coditions.push({
                    customer: {
                        phone_number: value,
                    },
                });
                break;
            case BookingQuery.user_id:
                coditions.push({
                    customer: {
                        id: value,
                    },
                });
                break;
            case BookingQuery.stylist_id:
                coditions.push({
                    stylist: {
                        id: value,
                    },
                });
                break;
            case BookingQuery.status:
                coditions.push({
                    status: value,
                });
                break;
            case BookingQuery.combo_id:
                coditions.push({
                    combo_id: value,
                });

                break;
            case BookingQuery.combo_name:
                coditions.push({
                    combo: {
                        name: value,
                    },
                });
                break;
            case BookingQuery.combo_name:
                coditions.push({
                    combo: {
                        name: value,
                    },
                });
                break;
            case BookingQuery.service_id:
                coditions.push({
                    combo: {
                        services: {
                            has: value,
                        },
                    },
                });

                break;
            case BookingQuery.service_name:
                coditions.push({
                    combo: {
                        services: {
                            has: value,
                        },
                    },
                });
                break;
            default:
                break;
        }

        const booking = await PrismaDB.booking.findMany({
            where: {
                AND: coditions,
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

        return await Promise.all(booking.map(async (item) => await populateBookingData(item)));
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

        // const services = [];
        // if (validBooking && validBooking.combo.services && validBooking.combo.services.length > 0) {
        //     services.push(
        //         ...(await PrismaDB.service.findMany({
        //             where: {
        //                 id: {
        //                     in: validBooking.combo.services,
        //                 },
        //             },
        //         })),
        //     );
        // }

        // delete validBooking.customer_id;
        // delete validBooking.stylist_id;
        // delete validBooking.combo_id;

        // return {
        //     ...validBooking,
        //     combo: {
        //         ...validBooking.combo,
        //         services,
        //     },
        //     total_time: services.reduce((sum, service) => sum + parseFloat(service.total_time) || 0, 0),
        //     total_price: services.reduce((sum, service) => sum + parseFloat(service.price) || 0, 0),
        // };

        return await populateBookingData(validBooking);
    }

    async update(id: string, updateBookingDto: UpdateBookingDto) {
        const newEndTime = utcDate(new Date(updateBookingDto.end_time as any));
        const newStartTime = utcDate(new Date(updateBookingDto.start_time as any));

        const currentBooking = await PrismaDB.booking.findUnique({
            where: { id },
        });

        if (!currentBooking) {
            throw new Error('Booking không hợp lệ!.');
        }

        if (currentBooking.start_time !== newStartTime && currentBooking.end_time !== newEndTime) {
            if (newEndTime <= newStartTime) {
                throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu!.');
            }

            if (newStartTime < utcDate(new Date())) {
                throw new Error('Thời gian bắt đầu không thể nhỏ hơn thời gian hiện tại!.');
            }
        }

        // if (newEndTime <= newStartTime) {
        //     throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu!.');
        // }

        // if (!isDateInRange(newStartTime)) {
        //     throw new Error('Ngày và giờ này tiệm đã đóng cửa!.');
        // }

        if (updateBookingDto.stylist_id && updateBookingDto.stylist_id !== currentBooking.stylist_id) {
            const stylist = await PrismaDB.user.findUnique({
                where: {
                    id: updateBookingDto.stylist_id as any,
                    role: Roles.STYLIST,
                },
                select: { profile: true },
            });

            if (stylist == null || !stylist.profile || stylist.profile.stylist.isWorking === false) {
                throw new Error('Stylist này không còn làm việc!.');
            }
        }

        const job = await addBookingQueue({ ...updateBookingDto, id }, 'update');
        const result = await job.finished();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result;
    }

    async remove(id: string) {
        return await PrismaDB.booking.delete({
            where: {
                id,
            },
        });
    }
}
