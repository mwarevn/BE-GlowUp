import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { Roles } from '@prisma/client';
import { selectFileds } from 'src/common/utils';

@Injectable()
export class CustomerService {
    async create(createCustomerDto: CreateCustomerDto) {
        const exitsCustomer = await PrismaDB.user.findFirst({
            where: {
                phone_number: createCustomerDto.phone_number,
                role: Roles.CUSTOMER,
            },
        });

        if (exitsCustomer) {
            throw new Error('Số điện thoại này đã được sử dụng!');
        }
        return PrismaDB.user.create({
            data: {
                ...createCustomerDto,
                role: Roles.CUSTOMER,
            },
            select: selectFileds,
        });
    }

    async findAll() {
        return await PrismaDB.user.findMany({
            where: {
                role: Roles.CUSTOMER,
            },
            select: selectFileds,
        });
    }

    async findOne(id: string) {
        return await PrismaDB.user.findFirst({
            where: {
                id,
                role: Roles.CUSTOMER,
            },
            select: selectFileds,
        });
    }

    async remove(id: string) {
        return await PrismaDB.user.delete({
            where: { id },
        });
    }
}
