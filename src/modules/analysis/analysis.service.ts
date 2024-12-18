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
                payment_status: PaymentStatus.PAID,
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
        // Lấy múi giờ hiện tại
        let localTimezoneOffset = new Date().getTimezoneOffset() * 60000; // tính bằng mili giây

        // Tạo startOfMonth và endOfMonth
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // 00h 00m ngày đầu tháng
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0); // 23h 59m 59s ngày cuối tháng

        // Điều chỉnh cho múi giờ
        startOfMonth.setTime(startOfMonth.getTime() - localTimezoneOffset);
        endOfMonth.setHours(23, 59, 59, 999); // Đảm bảo endOfMonth là 23h 59m 59s

        // console.log({ startOfMonth, endOfMonth });

        const completedBookingsThisMonth = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
                payment_status: PaymentStatus.PAID,
                start_time: {
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

        localTimezoneOffset = new Date().getTimezoneOffset() * 60000;
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0) - localTimezoneOffset); // 00h 00m của hôm nay
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999) - localTimezoneOffset); // 23h 59m 59s

        const completedBookingsToday = await PrismaDB.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
                payment_status: PaymentStatus.PAID,
                start_time: {
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
                start_time: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
            orderBy: {
                start_time: 'desc',
            },
            // take: 20,
            include: {
                combo: true,
                customer: true,
                stylist: true,
            },
        });

        // monthly revenue
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);

        const bookings = await PrismaDB.booking.findMany({
            where: {
                start_time: {
                    gte: startOfYear,
                    lt: endOfYear,
                },
                payment_status: PaymentStatus.PAID,
            },
            include: {
                combo: true,
                customer: true,
                stylist: true,
            },
        });

        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            total: 0,
        }));

        const transformedBookings = await Promise.all(bookings.map(async (item) => await populateBookingData(item)));

        transformedBookings.forEach((booking) => {
            const month = new Date(booking.start_time).getUTCMonth();
            monthlyRevenue[month].total += booking?.total_price || 0;
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
