import { Module } from '@nestjs/common';
import { ExpoNotiService } from './expo-noti.service';
import { ExpoNotiController } from './expo-noti.controller';

@Module({
  controllers: [ExpoNotiController],
  providers: [ExpoNotiService],
})
export class ExpoNotiModule {}
