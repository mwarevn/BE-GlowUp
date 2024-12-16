import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { selectFileds, utcDate } from 'src/common/utils';
import { populateBookingData } from 'src/modules/booking/booking.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalysisService {
    create(createAnalysisDto: CreateAnalysisDto) {
        return 'This action adds a new analysis';
    }

    async overView() {
        /**
         * This function will return the total revenue of the system from booking table, total revenue by this month, total revenue by today, total PENDING booking now
         *
         */

        const pendingBookings = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.PENDING,
            },
            include: {
                combo: {
                    select: {
                        services: true,
                    },
                },
            },
        });

        const completedBookings = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
            },
            include: {
                combo: {
                    select: {
                        services: true,
                    },
                },
            },
        });

        const total_revenue = (
            await Promise.all(completedBookings.map(async (item) => await populateBookingData(item)))
        ).reduce((acc, item) => acc + item.total_price, 0);

        // const this_month_revenue

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const completedBookingsThisMonth = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            include: {
                combo: {
                    select: {
                        services: true,
                    },
                },
            },
        });

        const this_month_revenue = (
            await Promise.all(completedBookingsThisMonth.map(async (item) => await populateBookingData(item)))
        ).reduce((acc, item) => acc + item.total_price, 0);

        // today
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

        const completedBookingsToday = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
            include: {
                combo: true,
            },
        });

        const today_evenue = (
            await Promise.all(completedBookingsToday.map(async (item) => await populateBookingData(item)))
        ).reduce((acc, item) => acc + item.total_price, 0);

        // recent booking - 20
        const recent_bookings = await PrismaDB.booking.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            // take: 20,
            include: {
                combo: true,
                customer: true,
                stylist: true,
            },
        });

        // monthly revenue
        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // Bắt đầu năm
        const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1); // Bắt đầu năm sau

        const bookings = await PrismaDB.booking.findMany({
            where: {
                createdAt: {
                    gte: startOfYear,
                    lt: endOfYear,
                },
                payment_status: PaymentStatus.PAID, // Chỉ lấy các booking đã thanh toán
            },
            include: {
                combo: true,
                customer: true,
                stylist: true,
            },
        });

        // Khởi tạo mảng doanh thu hàng tháng
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            total: 0,
        }));

        // Chuyển đổi booking dữ liệu
        const transformedBookings = await Promise.all(bookings.map(async (item) => await populateBookingData(item)));

        // Tính toán doanh thu theo tháng
        transformedBookings.forEach((booking) => {
            const month = booking.createdAt.getMonth(); // Lấy tháng (0-11)
            monthlyRevenue[month].total += booking?.total_price || 0; // Cộng doanh thu vào tháng tương ứng
        });

        return {
            total_revenue,
            this_month_revenue,
            today_evenue,
            total_pending_booking: pendingBookings.length,
            recent_bookings: await Promise.all(recent_bookings.map(async (item) => await populateBookingData(item))),
            chart: monthlyRevenue,
        };
    }

    async findAll(start_date: string, end_date: string, combo_id: string, service_id: string) {
        const options: any = {};

        if (!start_date || !end_date) {
            throw new Error('Ngày giờ không hợp lệ!');
        } else {
            try {
                new Date(start_date);
                new Date(end_date);
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
                    gte: new Date(start_date.replace(' ', '+')),
                },
                end_time: {
                    lte: new Date(end_date.replace(' ', '+')),
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
