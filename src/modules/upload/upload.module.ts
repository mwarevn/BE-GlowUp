import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [UploadController],
    providers: [UploadService],
    imports: [UserModule, AuthModule],
    exports: [UploadService],
})
export class UploadModule {}
