import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { selectFileds } from 'src/common/utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // register new account
  async registerAccount(createUserDto: CreateUserDto) {
    const existsUser = await this.getUser({
      phone_number: createUserDto.phone_number,
    });

    if (existsUser) {
      throw new Error('Số điện thoại này đã được sử dụng!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const createdUser = await this.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser;
  }

  // get unique user by codition
  async getUser(where: any) {
    return await this.prisma.user.findFirst({ where });
  }

  // create user with input data
  async createUser(data: any) {
    return await this.prisma.user.create({ data });
  }

  // update basic profile
  async updateProfile(where, updateData) {
    return await this.prisma.user.update({
      where,
      data: updateData,
      select: selectFileds,
    });
  }

  // getAll
  async getAll(where) {
    return PrismaDB.user.findMany({
      where,
      select: {
        id: true,
        gender: true,
        role: true,
        full_name: true,
        phone_number: true,
        avatar: true,
        date_of_birth: true,
        address: true,
        profile: true,
      },
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
}
