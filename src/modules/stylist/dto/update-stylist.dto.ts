import { OmitType } from '@nestjs/swagger';
import { UpdateProfileUserDTO } from 'src/modules/user/dto/user.update.dto';

export class UpdateStylistDto extends OmitType(UpdateProfileUserDTO, ['profile']) {}
