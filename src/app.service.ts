import { Injectable } from '@nestjs/common';
import { SocketGateway } from 'src/modules/socket/socket.gateway';

@Injectable()
export class AppService {
    constructor(private socket: SocketGateway) {}
    getHello(): string {
        console.log('oke');
        this.socket.sendNotificationToUser('user123', 'bờ roát cặc notifi....');
        return '<a style="padding: 10px; display: block; text-decoration: none; color: white; font-weight: bold; background: #24f5; border-radius: 10px; position: absolute; top: 50%; left: 50%" href="/auth/google">Login</a>';
    }
}
