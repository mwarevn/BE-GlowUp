import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateComboDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  price?: string;

  picture?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  services: String;
}
