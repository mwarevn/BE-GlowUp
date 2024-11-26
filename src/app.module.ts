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
import { PaymentModule } from './modules/payment/payment.module';
import { VnpayModule } from 'nestjs-vnpay';
import { SocketModule } from './modules/socket/socket.module';
import { OtpModule } from './modules/otp/otp.module';
import { ExpoNotiModule } from './modules/expo-noti/expo-noti.module';

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
        PaymentModule,
        SocketModule,
        OtpModule,
        ExpoNotiModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
