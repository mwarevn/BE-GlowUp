import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    IsPhoneNumber,
    IsOptional,
    Length,
    IsDate,
    IsMobilePhone,
} from 'class-validator';

export class RegisterAccountDTO {
    @IsString()
    @MaxLength(100)
    @ApiProperty({ example: 'Anh minh tit đẹp trai nhất nhóm' })
    readonly full_name: string;

    @IsMobilePhone('vi-VN', null)
    @IsOptional()
    @Length(10)
    @ApiProperty({ example: '0988885993' })
    readonly phone_number: number;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123123' })
    readonly password: string;
}
