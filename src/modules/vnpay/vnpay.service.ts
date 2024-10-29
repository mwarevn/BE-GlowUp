import { Injectable } from '@nestjs/common';
import { CreateVnpayDto } from './dto/create-vnpay.dto';
import { UpdateVnpayDto } from './dto/update-vnpay.dto';

@Injectable()
export class VnpayService {
  create(createVnpayDto: CreateVnpayDto) {
    return 'This action adds a new vnpay';
  }

  findAll() {
    return `This action returns all vnpay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vnpay`;
  }

  update(id: number, updateVnpayDto: UpdateVnpayDto) {
    return `This action updates a #${id} vnpay`;
  }

  remove(id: number) {
    return `This action removes a #${id} vnpay`;
  }
}
