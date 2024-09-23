import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as protectAPI from 'protect-api';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // app protection
  app.enableCors();
  // app.use(csurf());
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

  // swagger
  const config = new DocumentBuilder()
    .setTitle('API docs - minhcuder')
    .setDescription('The document of API for DATN')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // end

  await app.listen(PORT, protectAPI()).then(() => {
    console.log('Application running on PORT: ' + PORT);
  });
}

bootstrap();
