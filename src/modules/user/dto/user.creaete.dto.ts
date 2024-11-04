import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsOptional } from 'class-validator';

export class CreateUserDTO {
    @IsOptional()
    @ApiProperty({
        example: 'MALE',
        description: 'Optional',
    })
    gender: Gender;

    @IsOptional()
    @ApiProperty({
        example: 'anh thiện scam',
        description: 'Optional',
    })
    full_name: string;

    @IsMobilePhone('vi-VN')
    @ApiProperty({
        example: '0984845622',
    })
    phone_number: string;

    @IsOptional()
    @ApiProperty({
        description: 'Optional',
    })
    avatar: string;

    @IsOptional()
    @ApiProperty({
        example: '15/11/2003',
    })
    date_of_birth: string;

    @IsOptional()
    @ApiProperty({
        example: 'hà nội',
        description: 'Optional',
    })
    address: string;
}
