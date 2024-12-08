import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ExpoNotiModule } from 'src/modules/expo-noti/expo-noti.module';

@Module({
    controllers: [BookingController],
    providers: [BookingService],
    imports: [ExpoNotiModule],
})
export class BookingModule {}
