import { BookingStatus } from '@prisma/client';
import * as Queue from 'bull';
import { CreateBookingDto } from 'src/modules/booking/dto/create-booking.dto';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';

export const bookingQueue = new Queue('booking-queue', {
    redis: {
        host: 'localhost',
        port: 6379,
    },
});

bookingQueue.process(3, async (job: any) => {
    const payload: CreateBookingDto = job.data;

    const newEndTime = new Date(payload.end_time as any);
    const newStartTime = new Date(payload.start_time as any);

    try {
        const [conflictingStylist, conflictingCustomer] = await Promise.all([
            // Check stylist conflict
            PrismaDB.booking.findMany({
                where: {
                    stylist_id: payload.stylist_id as any,
                    status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
                    AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
                },
            }),
            // Check customer conflict
            PrismaDB.booking.findMany({
                where: {
                    stylist_id: payload.customer_id as any,
                    status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
                    AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
                },
            }),
        ]);

        if (conflictingStylist.length > 0) {
            return {
                success: false,
                message: 'Stylist này đã có lịch khác vào thời gian này vui lòng chọn stylist hoặc khung giờ khác!',
            };
        }

        if (conflictingCustomer.length > 0) {
            return { success: false, message: 'Bạn không thể đặt lịch trùng nhau!' };
        }

        const newBooking = await PrismaDB.booking.create({
            data: payload as any,
        });

        return { success: true, data: newBooking };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

export function addBookingQueue(data: any) {
    return bookingQueue.add(data);
}
