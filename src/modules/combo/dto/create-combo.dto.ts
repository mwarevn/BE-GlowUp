import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

export class CreateComboDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'gói tráng ấp pha trè cực thích' })
    name: string;

    @IsOptional()
    @IsString()
    @IsOptional()
    @ApiProperty({ example: '100', description: 'Optional' })
    price?: string;

    picture?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'bao gồm rửa ấm trén ăn mì chính đc em tiếp viên minh nguyễn tắm cho',
    })
    description: string;

    @IsString()
    @ApiProperty({
        example: ['67065e467578879a37b0280e'],
    })
    services: String;
}
