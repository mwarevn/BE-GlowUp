import { OmitType, PartialType } from '@nestjs/swagger';
import { UpdateProfileUserDTO } from 'src/modules/user/dto/user.update.dto';

export class UpdateCustomerDto extends OmitType(UpdateProfileUserDTO, ['profile']) {}
