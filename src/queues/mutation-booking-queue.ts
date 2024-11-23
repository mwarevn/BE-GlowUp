import { BookingStatus } from '@prisma/client';
import * as Queue from 'bull';
import { selectFileds } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';

const bookingQueue = new Queue('mutation-booking-queue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
});

bookingQueue.process(1, async (job: any) => {
    const payload = job.data.data;
    const action = job.data.action;

    const newEndTime = new Date(payload.end_time as any);
    const newStartTime = new Date(payload.start_time as any);
    const statusOption = { status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } };
    try {
        const [conflictingStylist, conflictingCustomer] = await Promise.all([
            // Check stylist conflict
            PrismaDB.booking.findMany({
                where: {
                    stylist_id: payload.stylist_id as any,
                    ...(action === 'create' && statusOption),
                    AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
                },
            }),
            // Check customer conflict
            PrismaDB.booking.findMany({
                where: {
                    stylist_id: payload.customer_id as any,
                    ...(action === 'create' && statusOption),
                    AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
                },
            }),
        ]);

        switch (action) {
            case 'create':
                return await handleCreateBooking(payload, conflictingStylist, conflictingCustomer);
            case 'update':
                return await handleUpdateBooking(payload, conflictingStylist, conflictingCustomer);
            default:
                return { success: false, message: 'Invalid action!' };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
});

async function handleUpdateBooking(payload, conflictingStylist, conflictingCustomer) {
    const id = payload.id;
    delete payload.id;
    try {
        if (conflictingStylist.length > 0 && conflictingStylist[0].id !== id) {
            return {
                success: false,
                message: 'Stylist này đã có lịch khác vào thời gian này vui lòng chọn stylist hoặc khung giờ khác!',
            };
        }

        if (conflictingCustomer.length > 0 && conflictingCustomer[0].id !== id) {
            return { success: false, message: 'Bạn không thể đặt lịch trùng nhau!' };
        }

        const newBooking = await PrismaDB.booking.update({
            where: { id },
            data: payload as any,
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

        return { success: true, data: newBooking };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function handleCreateBooking(payload, conflictingStylist, conflictingCustomer) {
    try {
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

        return { success: true, data: newBooking };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export function addBookingQueue(data: any, action: string) {
    return bookingQueue.add({ data, action });
}
