import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import './workers/check-booking.worker';
import { SocketGateway } from 'src/modules/socket/socket.gateway';
import { applyGuard } from 'src/common/guards/nest.guard';

let socketGateway: SocketGateway;
import * as mongoose from 'mongoose';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'debug', 'verbose', 'fatal'],
    });

    const PORT = process.env.PORT || 3000;

    socketGateway = app.get(SocketGateway);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.useStaticAssets(join(__dirname, '..', 'public'));
    // app protections
    app.enableCors();
    // app.use(csurf()); //
    // app.use(helmet());

    // validation data
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    app.useStaticAssets(join(__dirname, '..', 'public/uploads'));

    // swagger
    const config = new DocumentBuilder()
        .setTitle('API docs - DATN')
        .setDescription('The document of API for DATN')
        .setVersion('1.0')
        .addTag('api')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    // end
    //

    await app
        .listen(PORT, () => {
            applyGuard();
            mongoose
                .connect(process.env.MONGODB_CONECTION_STRING)
                .then(() => {
                    console.log('Connected to MongoDB');
                })
                .catch(console.error);
        })
        .then(() => {
            // console.clear();
            console.log('────────────────────────────────────────────────────────────────────────────────');
            console.log('\n');
            console.log(`[!] Make sure you have started the redis server (localhost and port: ${process.env.REDIS_PORT})!`);
            console.log('\n');
            console.log(' > Application running on PORT: ' + PORT);
            console.log(' > Swagger running on: http://localhost:' + PORT + '/api-docs');
            console.log('\n\n');
            console.log(new Date());
            console.log('\n\n');
        });
}

bootstrap();

// notification
export function notifyUser(userId: string, notification: any) {
    if (socketGateway) {
        socketGateway.sendNotificationToUser(userId, notification);
    } else {
        console.error('SocketGateway is not initialized.');
    }
}

export function broadcastNotification(notification: any) {
    if (socketGateway) {
        socketGateway.broadcastNotification(notification);
    } else {
        console.error('SocketGateway is not initialized.');
    }
}
