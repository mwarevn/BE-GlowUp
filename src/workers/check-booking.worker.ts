import { BookingStatus } from '@prisma/client';
import * as cron from 'node-cron';
import { localDate, logger, utcDate } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import {
    addCheckBookingQueue,
    addReminderJob,
    getCheckBookingQueueJob,
    getReminderJob,
    removeJob,
    removeReminderJob,
} from 'src/queues/check-booking-queue';

cron.schedule('* * * * *', async () => {
    const pendingBookings = await PrismaDB.booking.findMany({
        where: {
            status: {
                in: [BookingStatus.CONFIRMED, BookingStatus.DELAYING],
            },
        },
    });

    pendingBookings.forEach((booking) => {
        scheduleBookingCheck(booking);
        bookingReminder(booking);
    });
});
function convertMillisecondsToMinutes(milliseconds) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes} phút`;
}

function checkTimeBeforeStart(startTime) {
    const currentTime = new Date();
    const timeDifference = startTime.getTime() - currentTime.getTime();

    const thirtyMinutesInMs = 30 * 60 * 1000;

    return timeDifference <= thirtyMinutesInMs;
}

export const bookingReminder = async (booking) => {
    try {
        const startTime = new Date(booking.start_time);
        const checkTime = new Date(startTime.getTime() - 30 * 60 * 1000); // 30 phút trước khi đến lịch hẹn

        const now = new Date();
        const delay = checkTimeBeforeStart(startTime) ? 0 : checkTime.getTime() - now.getTime();

        // logger.info(
        //     '[' +
        //         localDate(startTime).toLocaleString() +
        //         '] - Nhắc nhở lịch sẽ chạy sau: ' +
        //         convertMillisecondsToMinutes(delay) +
        //         ' nữa.',
        // );
        const existsJob = await getReminderJob(booking.id);

        if (existsJob === null) {
            logger.info(
                '[' +
                    localDate(startTime).toLocaleString() +
                    '] - Nhắc nhở lịch sẽ chạy sau: ' +
                    convertMillisecondsToMinutes(delay) +
                    ' nữa.',
            );
            addReminderJob(
                {
                    data: {
                        booking,
                    },
                },
                'booking-reminder',
                delay > 0 ? delay : 0,
            );
        } else {
            if (existsJob.finishedOn) {
                logger.info('[-] Remove  existing job from queue.');
                removeReminderJob(booking.id);
            }
        }
    } catch (error) {
        logger.debug(error);
    }
};

export const scheduleBookingCheck = async (booking) => {
    try {
        const startTime = new Date(booking.start_time);
        const checkTime = new Date(startTime.getTime() + 20 * 60 * 1000); /// 20 phút sau

        const now = new Date();
        const delay = checkTime.getTime() - now.getTime();

        const existsJob = await getCheckBookingQueueJob(booking.id);

        if (existsJob === null) {
            logger.info(
                '[' +
                    localDate(startTime).toLocaleString() +
                    '] - Tự động hủy lịch sẽ chạy sau: ' +
                    convertMillisecondsToMinutes(delay > 0 ? delay : 0) +
                    ' nữa.',
            );
            addCheckBookingQueue(
                {
                    data: {
                        booking,
                    },
                },
                'check-status',
                delay > 0 ? delay : 0,
            );
        } else {
            if (existsJob.finishedOn) {
                logger.info('[-] Remove  existing job from queue.');
                removeJob(booking.id);
            }
        }
    } catch (error) {
        logger.debug(error);
    }
};
