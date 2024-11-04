import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { RegisterAccountDTO } from 'src/modules/auth/dto/register-account.dto';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { hashPasswd, selectFileds } from 'src/common/utils';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    // get unique user by codition
    async getUser(where: any) {
        return await this.prisma.user.findFirst({ where });
    }

    // create user with input data
    async createUser(data: any) {
        return await this.prisma.user.create({ data, select: selectFileds });
    }

    // update basic profile
    async updateProfile(where, updateData) {
        return await PrismaDB.user.update({
            where,
            data: updateData,
            select: selectFileds,
        });
    }

    // getAll
    async getAll(where) {
        return PrismaDB.user.findMany({
            where,
            select: selectFileds,
        });
    }

    // update avatar
    async updateAvatar(id: string, avatar: string) {
        return await PrismaDB.user.update({
            where: { id },
            data: {
                avatar,
            },
            select: selectFileds,
        });
    }

    // update phone number
    async updatePhoneNumber(id: string, phone_number: string) {
        return await PrismaDB.user.update({
            where: { id },
            data: {
                phone_number,
            },
        });
    }
}
