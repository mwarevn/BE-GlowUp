import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import { Roles } from '@prisma/client';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { hashPasswd, selectFileds } from 'src/common/utils';

@Injectable()
export class StylistService {
    constructor() {}

    async create(createStylistDto: CreateStylistDto) {
        const existsStylist = await PrismaDB.user.findFirst({
            where: {
                phone_number: createStylistDto.phone_number,
                role: Roles.STYLIST,
            },
        });

        if (existsStylist) {
            throw new Error('Số điện thoại này đã được sử dụng!');
        }
        return PrismaDB.user.create({
            data: {
                ...createStylistDto,
                role: Roles.STYLIST,
            },
            select: selectFileds,
        });
    }

    async findAll() {
        const stylists = await PrismaDB.user.findMany({
            where: { role: Roles.STYLIST },
            select: selectFileds,
        });

        return stylists;
    }

    async findOne(id: string) {
        const existsStylist = await PrismaDB.user.findUnique({
            where: { id },
            select: selectFileds,
        });
        return existsStylist;
    }

    async update(id: string, updateStylistDto: UpdateStylistDto) {
        return await PrismaDB.user.update({
            where: { id },
            data: updateStylistDto,
            select: selectFileds,
        });
    }

    async remove(id: string) {
        return PrismaDB.user.delete({
            where: { id, role: Roles.STYLIST },
        });
    }
}
