import { PartialType } from '@nestjs/swagger';
import { CreateExpoNotiDto } from './create-expo-noti.dto';

export class UpdateExpoNotiDto extends PartialType(CreateExpoNotiDto) {}
