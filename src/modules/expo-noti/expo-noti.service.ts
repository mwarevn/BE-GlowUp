export class ExpoNotiService {
    async sendExpoNotify(title: string, message: string, priority: 'hight' | 'medium' | 'low', token: string | string[]) {
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
        return await fetch(options.url, options);
    }
}
