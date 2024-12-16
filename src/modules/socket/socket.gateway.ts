import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { logger } from 'src/common/utils';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway {
    @WebSocketServer()
    server: Server;

    private users = new Map<string, string>(); // userId -> socketId

    handleConnection(client: Socket) {
        logger.info(`Client connected: ${client.id}`);
        this.broadcastNotification({ type: 'success' });
    }

    handleDisconnect(client: Socket) {
        // remove user from users list on disconnect
        for (const [userId, socketId] of this.users.entries()) {
            if (socketId === client.id) {
                this.users.delete(userId);
                break;
            }
        }
        logger.error(`Client disconnected: ${client.id}`);
    }

    // for client register user id
    @SubscribeMessage('register')
    handleRegister(client: Socket, userId: string) {
        this.users.set(userId, client.id);
        logger.info(`User ${userId} registered with socket ${client.id}`);
    }

    // send notification to user
    sendNotificationToUser(userId: string, notification: any) {
        const socketId = this.users.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
        }
    }

    // send notification to all users
    broadcastNotification(notification: any) {
        this.server.emit('notification', notification);
    }
}
