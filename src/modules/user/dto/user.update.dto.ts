import { CustomerProfile, Profile, Rank, Roles, StylistProfile } from '@prisma/client';
import {
    IsString,
    IsEmail,
    MinLength,
    IsOptional,
    IsNotEmpty,
    IsDefined,
    IsNumber,
    IsMobilePhone,
    Length,
} from 'class-validator';
import { CustomerProfileDTO } from 'src/modules/customer/dto/customer.profile.dto';
import { StylistProfileDTO } from 'src/modules/stylist/dto/stylist.profile.dto';

export class UpdateProfileUserDTO {
    @IsOptional()
    gender: Gender;

    @IsOptional()
    full_name: string;

    @IsOptional()
    avatar: string;

    @IsOptional()
    date_of_birth: string;

    @IsOptional()
    address: string;

    @IsOptional()
    profile: CustomerProfileDTO | StylistProfileDTO;
}
