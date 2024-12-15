import { BookingStatus } from '@prisma/client';
import * as Queue from 'bull';
import { logger } from 'src/common/utils';
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
    if (job.id.split(':')[0] === 'queue-reminder') {
        return handleReminder(job);
    }
    try {
        logger.info('Check booking queue: starting job');
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

        if (booking && booking.status === BookingStatus.CONFIRMED) {
            await PrismaDB.booking.update({
                where: {
                    id: booking.id,
                },
                data: {
                    status: BookingStatus.CANCELED,
                },
            });
        }

        if (payload.data.booking?.customer_id) {
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
    } catch (error) {
        logger.debug(error);
        return { success: false, message: error.message };
    }

    checkBookingQueue.removeJobs(job.id);
});

export async function getCheckBookingQueueJob(bookingId: string) {
    const job = await checkBookingQueue.getJob(`queue-cancel:${bookingId}`);
    return job;
}

export function addCheckBookingQueue(data: any, action: string, delay: any) {
    return checkBookingQueue.add({ data, action }, { delay, jobId: `queue-cancel:${data.data.booking.id}` });
}

export const removeJob = (id: string) => {
    return checkBookingQueue.removeJobs(`queue-cancel:${id}`);
};

// reminder handler
export async function getReminderJob(bookingId: string) {
    const job = await checkBookingQueue.getJob(`queue-reminder:${bookingId}`);
    return job;
}

export function addReminderJob(data: any, action: string, delay: any) {
    return checkBookingQueue.add({ data, action }, { delay, jobId: `queue-reminder:${data.data.booking.id}` });
}

export const removeReminderJob = (id: string) => {
    return checkBookingQueue.removeJobs(`queue-reminder:${id}`);
};

const handleReminder = async (job: any) => {
    try {
        logger.info('Reminder booking queue: starting job');
        const payload = job.data.data;
        const action = job.data.action;

        const booking = await PrismaDB.booking.findUnique({
            where: {
                id: payload.data.booking.id,
            },
            select: {
                status: true,
                id: true,
                isReminded: true,
            },
        });

        if (booking && !booking.isReminded && booking.status != BookingStatus.CANCELED) {
            await PrismaDB.booking.update({
                where: {
                    id: booking.id,
                },
                data: {
                    isReminded: !booking.isReminded, // true
                },
            });
        }

        if (payload.data.booking?.customer_id) {
            const user = await PrismaDB.user.findUnique({
                where: { id: payload.data.booking.customer_id },
            });

            const token = user?.notify_token;

            if (token) {
                expoNotiService.sendExpoNotify(
                    '30 phút nữa sẽ tới giờ hẹn!',
                    'Sắp tới giờ cắt tóc của bạn, hãy sẵn sàng nhé! Nếu tới muộn quá 20 phút lịch hẹn sẽ tự động huỷ đó nha!',
                    'error',
                    'high',
                    token,
                    user.id,
                );
            }
        }
    } catch (error) {
        logger.debug(error);
        return { success: false, message: error.message };
    }

    checkBookingQueue.removeJobs(job.id);
};
