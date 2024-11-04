import { Rank } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { CreateCustomerDto } from 'src/modules/customer/dto/create-customer.dto';

export class CustomerProfileDTO {
    @IsOptional()
    customer?: {
        rank?: Rank;
        rewards?: number;
    };
}
