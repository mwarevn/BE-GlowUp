import { PrismaDB } from 'src/modules/prisma/prisma.extensions';

export class ExpoNotiService {
    async sendExpoNotify(
        title: string,
        message: string,
        priority: 'hight' | 'medium' | 'low',
        token: string | string[],
        user_id?: string | string[],
    ) {
        const options = {
            method: 'POST',
            url: 'https://exp.host/--/api/v2/push/send',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: token,
                sound: 'default',
                title,
                priority,
                body: message,
            }),
        };
        if (typeof token === 'string') {
            await PrismaDB.notifyHistory.create({
                data: {
                    title,
                    body: {
                        message,
                        priority,
                    },
                    user_id: typeof user_id === 'string' ? user_id : user_id[0],
                },
            });
        } else {
            await Promise.all(
                token.map(async (item, index) => {
                    await PrismaDB.notifyHistory.create({
                        data: {
                            title,
                            body: {
                                message,
                                priority,
                            },
                            user_id: user_id[index],
                        },
                    });
                }),
            );
        }
        return await fetch(options.url, options);
    }

    async findAllNotifyHistory(user_id: string) {
        return await PrismaDB.notifyHistory.findMany({
            where: {
                user_id,
            },
        });
    }

    async markRead(id: string) {
        return await PrismaDB.notifyHistory.update({
            where: {
                id,
            },
            data: {
                readed: true,
            },
        });
    }
}
