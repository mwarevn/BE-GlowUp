import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
// import * as bodyParsers from 'body-parser/common';
import './workers/check-booking.worker';
import { SocketGateway } from 'src/modules/socket/socket.gateway';
let socketGateway: SocketGateway;
import * as mongoose from 'mongoose';
import * as partials from 'express-partials';
import { localDate, logger, utcDate } from 'src/common/utils';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        // logger: ['error', 'warn', 'debug', 'verbose', 'fatal'],
    });

    const PORT = process.env.PORT || 3000;

    socketGateway = app.get(SocketGateway);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
    app.setViewEngine('ejs');
    app.use(partials());
    //
    app.useStaticAssets(join(__dirname, '..', 'public'));
    // app protections
    app.enableCors({
        origin: ['http://localhost:3001', 'https://fastsave.live', 'https://minhcuder.xyz', 'https://minhcuder.com'],
        credentials: true,
    });
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

    await app
        .listen(PORT, () => {
            mongoose
                .connect(process.env.MONGODB_CONECTION_STRING)
                .then(() => {
                    logger.info('MongoDB connected\n\n');
                })
                .catch(logger.error);
        })
        .then(() => {
            logger.warn(`Make sure you have started the redis server (localhost and port: ${process.env.REDIS_PORT})!`);
            logger.info('Application running on PORT: ' + PORT);
            logger.info('Swagger running on: http://localhost:' + PORT + '/api-docs');
            logger.info('Giờ hiện tại: ' + localDate(new Date()).toLocaleString());
            logger.info('Giờ quốc tế: ' + utcDate(new Date()).toUTCString());
        });
}

bootstrap();

// notify
export function notifyUser(userId: string, notification: any) {
    if (socketGateway) {
        socketGateway.sendNotificationToUser(userId, notification);
    } else {
        logger.error('SocketGateway is not initialized.');
    }
}

export function broadcastNotification(notification: any) {
    if (socketGateway) {
        socketGateway.broadcastNotification(notification);
    } else {
        logger.error('SocketGateway is not initialized.');
    }
}
