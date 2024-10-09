import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaDB } from '../prisma/prisma.extensions';

@Injectable()
export class ComboService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createComboDto: CreateComboDto) {
    const { services, ...data } = createComboDto;
    let serviceIds = [];
    let set = new Set();
    serviceIds = services.split(',').filter((id) => id.trim() !== '');
    for (const id of serviceIds) {
      if (!set.has(id)) {
        set.add(id);
      }
    }
    const combo = await this.prismaService.combo.create({
      data: {
        ...data,
        services: Array.from(set) as string[],
      },
    });
    return combo;
  }

  async findAll() {
    const combos = await PrismaDB.combo.findMany();

    const comboWithPrice = [];
    for (const combo of combos) {
      const servicePrices = await PrismaDB.service.findMany();

      const price = servicePrices.reduce(
        (acc, service) => acc + parseFloat(service.price),
        0,
      );

      comboWithPrice.push({
        ...combo,
        price: price + '.000 VND',
      });
    }

    return comboWithPrice;
  }

  async findOne(id: string) {
    return await PrismaDB.combo.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateComboDto: UpdateComboDto) {
    const { services, ...data } = updateComboDto;
    let serviceIds = [];
    let set = new Set();
    serviceIds = services.split(',').filter((id) => id.trim() !== '');
    for (const id of serviceIds) {
      if (!set.has(id)) {
        set.add(id);
      }
    }
    const combo = await this.prismaService.combo.update({
      where: {
        id,
      },
      data: {
        ...data,
        services: Array.from(set) as string[],
      },
    });
    return combo;
  }

  async remove(id: string) {
    return await PrismaDB.combo.delete({
      where: {
        id,
      },
    });
  }
}
