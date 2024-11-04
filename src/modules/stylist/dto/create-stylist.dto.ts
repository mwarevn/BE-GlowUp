import { Gender, Roles } from '@prisma/client';
import { IsMobilePhone, IsOptional, IsString } from 'class-validator';
import { StylistProfileDTO } from 'src/modules/stylist/dto/stylist.profile.dto';
import { CreateUserDTO } from 'src/modules/user/dto/user.creaete.dto';

export class CreateStylistDto extends CreateUserDTO {
    @IsOptional()
    profile: StylistProfileDTO;
}
