import { BookingStatus } from '@prisma/client';
import * as cron from 'node-cron';
import { formatDate } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { addCheckBookingQueue, getCheckBookingQueueJob, removeJob } from 'src/queues/check-booking-queue';

cron.schedule('* * * * *', async () => {
    const pendingBookings = await PrismaDB.booking.findMany({
        where: {
            status: BookingStatus.PENDING,
        },
    });

    pendingBookings.forEach((booking) => {
        scheduleBookingCheck(booking);
    });
});
function convertMillisecondsToMinutes(milliseconds) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes} phút`;
}

export const scheduleBookingCheck = async (booking) => {
    try {
        const startTime = new Date(booking.start_time);
        const checkTime = new Date(startTime.getTime() + 20 * 60 * 1000); /// 20 phút sau

        const now = new Date();
        const delay = checkTime.getTime() - now.getTime();

        const existsJob = await getCheckBookingQueueJob(booking.id);

        console.log(
            '\n' +
                checkTime.toLocaleString() +
                ' - Auto cancel will start affter: ' +
                convertMillisecondsToMinutes(delay > 0 ? delay : 0),
        );

        if (existsJob === null) {
            console.log(
                '\n' +
                    checkTime.toLocaleString() +
                    ' - Auto cancel will start affter: ' +
                    convertMillisecondsToMinutes(delay > 0 ? delay : 0),
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
                console.log('remove  exists');
                removeJob(booking.id);
            }
        }
    } catch (error) {
        console.log(error);
    }
};
