import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    @ApiProperty({
        example: 'mát xa LÀNH MẠNH',
    })
    name: string;

    @IsString()
    @ApiProperty({
        example: 'LÀNH MẠNH CỰC KỲ',
    })
    description: string;

    @IsString()
    @ApiProperty({
        example: '1000',
    })
    price: string;

    @IsOptional()
    picture?: string;

    @IsString()
    time: string;
}
