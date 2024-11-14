import { Injectable, Query } from '@nestjs/common';
import { SocketGateway } from 'src/modules/socket/socket.gateway';

@Injectable()
export class AppService {
    constructor(private socket: SocketGateway) {}
    getHello(msg: string): string {
        this.socket.sendNotificationToUser('123', msg);
        // return '<a style="padding: 10px; display: block; text-decoration: none; color: white; font-weight: bold; background: #24f5; border-radius: 10px; position: absolute; top: 50%; left: 50%" href="/auth/google">Login</a>';
        return `
        <form method="get">
            <input type="text" name="msg" placeholder="Enter message">
            <button type="submit">Send</button>
        </form>
        `;
    }
}
