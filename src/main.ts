import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose', 'fatal'],
  });
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // app protections
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

  await app.listen(PORT).then(() => {
    console.clear();
    console.log('──────────────────────────────────────────────────────');
    console.log('\n');
    console.log(' > Application running on PORT: ' + PORT);
    console.log(
      ' > Swagger running on: http://localhost:' + PORT + '/api-docs',
    );
    console.log('\n\n');
  });
}

bootstrap();
