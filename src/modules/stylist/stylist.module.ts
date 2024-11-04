import { Module } from '@nestjs/common';
import { StylistService } from './stylist.service';
import { StylistController } from './stylist.controller';
import { UserService } from 'src/modules/user/user.service';
import { UserModule } from 'src/modules/user/user.module';
import { UploadModule } from 'src/modules/upload/upload.module';

@Module({
    controllers: [StylistController],
    providers: [StylistService],
    imports: [UserModule, UploadModule],
})
export class StylistModule {}
