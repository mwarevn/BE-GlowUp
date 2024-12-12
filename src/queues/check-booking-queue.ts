import { BookingStatus } from '@prisma/client';
import * as Queue from 'bull';
import { ExpoNotiService } from 'src/modules/expo-noti/expo-noti.service';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';

const expoNotiService = new ExpoNotiService();

const checkBookingQueue = new Queue('check-booking-queue', {
    redis: {
        host: process.env.REDIS_HOST,
        // port: 6379,
        port: parseInt(process.env.REDIS_PORT),
    },
});

checkBookingQueue.process(8, async (job: any) => {
    try {
        console.log('Check booking queue: starting job');
        const payload = job.data.data;
        const action = job.data.action;

        const booking = await PrismaDB.booking.findUnique({
            where: {
                id: payload.data.booking.id,
            },
            select: {
                status: true,
                id: true,
            },
        });

        if (booking && booking.status === BookingStatus.PENDING) {
            await PrismaDB.booking.update({
                where: {
                    id: booking.id,
                },
                data: {
                    status: BookingStatus.CANCELED,
                },
            });
        }

        if (payload.data.booking.customer_id) {
            const user = await PrismaDB.user.findUnique({
                where: { id: payload.data.booking.customer_id },
            });

            const token = user?.notify_token;

            if (token) {
                expoNotiService.sendExpoNotify(
                    'Lịch hẹn của bạn đã bị huỷ!',
                    'Rất tiếc lịch hẹn của bạn đã bị huỷ do quá giờ mà bạn chưa tới :(',
                    'error',
                    'high',
                    token,
                    user.id,
                );
            }
        }

        // send notification to user
        // notifyUser(payload.data.booking.customer_id, {
        //     message: 'Booking canceled',
        //     reson: 'Time out!',
        // });
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message };
    }

    checkBookingQueue.removeJobs(job.id);
});

export async function getCheckBookingQueueJob(bookingId: string) {
    const job = await checkBookingQueue.getJob(bookingId);
    return job;
}

export function addCheckBookingQueue(data: any, action: string, delay: any) {
    return checkBookingQueue.add({ data, action }, { delay, jobId: data.data.booking.id });
}

export const removeJob = (id: string) => {
    return checkBookingQueue.removeJobs(id);
};
