import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('bank-list')
  getBankList() {
    return this.paymentService.getBankList();
  }

  @Get('create-payment')
  async createPayment(@Req() req: Request) {
    const paymentUrl = await this.paymentService.createPaymentUrl(req);
    return { paymentUrl };
  }

  // async createPayment(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   // @Query('amount') amount: number,
  //   // @Query('orderId') orderId: string,
  //   // @Query('bankCode') bankCode: string,
  // ) {
  //   // const order = {
  //   //   amount,
  //   //   orderId,
  //   //   bankCode,
  //   // };
  //   const paymentUrl = await this.paymentService.createPaymentUrl(req, res);
  //   return { paymentUrl };
  // }
}
