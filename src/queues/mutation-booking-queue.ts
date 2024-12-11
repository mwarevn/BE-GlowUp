import { BookingStatus } from '@prisma/client';
import * as Queue from 'bull';
import { selectFileds, utcDate } from 'src/common/utils';
import { broadcastNotification } from 'src/main';
import { ExpoNotiService } from 'src/modules/expo-noti/expo-noti.service';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';

const bookingQueue = new Queue('mutation-booking-queue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        // port: 6379,
    },
});

bookingQueue.process(1, async (job: any) => {
    const payload = job.data.data;
    const action = job.data.action;

    const newEndTime = utcDate(new Date(payload.end_time as any));
    const newStartTime = utcDate(new Date(payload.start_time as any));
    const statusOption = { status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } };

    try {
        const conflictingStylist = await PrismaDB.booking.findMany({
            where: {
                stylist_id: payload.stylist_id as any,
                ...(action === 'create' && statusOption),
                AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
            },
        });
        let conflictingCustomer;
        if (payload.customer_id) {
            conflictingCustomer = await PrismaDB.booking.findMany({
                where: {
                    stylist_id: payload.customer_id as any,
                    ...(action === 'create' && statusOption),
                    AND: [{ start_time: { lt: newEndTime } }, { end_time: { gt: newStartTime } }],
                },
            });
        }

        switch (action) {
            case 'create':
                return await handleCreateBooking(payload, conflictingStylist, conflictingCustomer);
            case 'update':
                console.log('Update booking');
                return await handleUpdateBooking(payload, conflictingStylist, conflictingCustomer);
            default:
                return { success: false, message: 'Invalid action!' };
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message };
    }
});

const notifyExpoService = new ExpoNotiService();

async function handleUpdateBooking(payload, conflictingStylist, conflictingCustomer) {
    const id = payload.id;
    delete payload.id;
    console.log(payload);
    try {
        if (conflictingStylist.length > 0 && conflictingStylist[0].id !== payload.stylist_id) {
            return {
                success: false,
                message: 'Stylist này đã có lịch khác vào thời gian này vui lòng chọn stylist hoặc khung giờ khác!',
            };
        }

        if (conflictingCustomer && conflictingCustomer.length > 0 && conflictingCustomer[0].id !== id) {
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
                    select: { ...selectFileds, notify_token: true },
                },
                stylist: {
                    select: selectFileds,
                },
            },
        });

        if (newBooking && newBooking.customer) {
            if (payload.status === BookingStatus.CONFIRMED && newBooking.customer?.notify_token) {
                notifyExpoService.sendExpoNotify(
                    'Lịch hẹn đã được xác nhận!',
                    'Lịch hẹn đã được xác nhận!',
                    'success',
                    'high',
                    newBooking.customer.notify_token,
                    newBooking.customer_id,
                );
            }

            return { success: true, data: newBooking };
        } else {
            return { success: false, message: 'Không tìm thấy booking này!' };
        }
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

        if (conflictingCustomer && conflictingCustomer.length > 0) {
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

        broadcastNotification({
            type: 'default',
            msg: 'Khách hàng đã đặt lịch hẹn mới!',
        });

        return { success: true, data: newBooking };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export function addBookingQueue(data: any, action: string) {
    console.log('[+] Added Booking Queue...');
    return bookingQueue.add({ data, action });
}
