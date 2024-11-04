import { OmitType, PartialType } from '@nestjs/swagger';
import { Rank } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { profile } from 'console';
import { CustomerProfileDTO } from 'src/modules/customer/dto/customer.profile.dto';
import { CreateStylistDto } from 'src/modules/stylist/dto/create-stylist.dto';
import { CreateUserDTO } from 'src/modules/user/dto/user.creaete.dto';

export class CreateCustomerDto extends CreateUserDTO {
    @IsOptional()
    profile: CustomerProfileDTO;
}
