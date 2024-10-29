import { PartialType } from '@nestjs/swagger';
import { CreateVnpayDto } from './create-vnpay.dto';

export class UpdateVnpayDto extends PartialType(CreateVnpayDto) {}
