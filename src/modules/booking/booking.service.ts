import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { formatDate, selectFileds } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  /**
   * Coditions:
   * - Phải login (customer, stylist)
   * - Phải nằm trong giờ làm việc - T2 > T6. ca sáng 8h - 11h30 ca chiều 13h - 16h50
   * - Stylist phải working
   * - Phải nằm trong thời gian stylist rảnh và thời gian stylist rảnh phải đủ để làm combo
   * - Customer không thể order 2 lần trong cùng 1 khoảng thời gian.
   */
  async create(createBookingDto: CreateBookingDto) {
    const newEndTime = new Date(
      createBookingDto.end_time as string,
    ) as unknown as string;
    const newStartTime = new Date(
      createBookingDto.start_time as string,
    ) as unknown as string;

    const conflictingBookings = await PrismaDB.booking.findMany({
      where: {
        stylist_id: createBookingDto.stylist_id as any,
        status: BookingStatus.PENDING || BookingStatus.CONFIRMED,
        AND: [
          { start_time: { lt: newEndTime } },
          { end_time: { gt: newStartTime } },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      throw new Error(
        'Khung giờ này đã có booking khác, vui lòng chọn thời gian khác.',
      );
    }

    // const payload = {
    //   start_time: '16:00 - 26/10/2024',
    //   end_time: '17:00 - 26/10/2024',
    //   combo_id: '671c91cf1fd1b4e152adfdde',
    //   customer_id: '671c6145dbb73ad05c0c2953',
    //   stylist_id: '671c9139086e066034740ce5',
    // };

    // try {
    //   const newBooking = await PrismaDB.booking.create({
    //     data: payload,
    //   });

    //   return newBooking;
    // } catch (error) {
    //   console.log(error);
    //   return null;
    // }
  }

  findAll() {
    return `This action returns all booking`;
  }

  async findOne(id: string) {
    const validBooking = await PrismaDB.booking.findUnique({
      where: {
        id,
      },
      include: {
        combo: {
          select: {
            services: true,
          },
        },
        customer: {
          select: selectFileds,
        },
        stylist: {
          select: selectFileds,
        },
      },
    });
    return validBooking;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
