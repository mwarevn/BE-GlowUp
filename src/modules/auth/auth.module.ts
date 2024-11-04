import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, PrismaService],
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
        }),
        PassportModule,
    ],
    exports: [AuthService],
})
export class AuthModule {}
