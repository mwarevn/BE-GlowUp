import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService],
    imports: [],
})
export class UserModule {}
