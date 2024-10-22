import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UploadModule } from 'src/modules/upload/upload.module';
import { UserModule } from 'src/modules/user/user.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ComboModule } from './modules/combo/combo.module';
import { ServiceModule } from './modules/service/service.module';
import { StylistModule } from './modules/stylist/stylist.module';
import { CustomerModule } from './modules/customer/customer.module';
import { BannerModule } from './modules/banner/banner.module';
import { BookingModule } from './modules/booking/booking.module';
import { VnpayModule } from './modules/vnpay/vnpay.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    UploadModule,
    PrismaModule,
    ComboModule,
    ServiceModule,
    StylistModule,
    CustomerModule,
    BannerModule,
    BookingModule,
    VnpayModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
