import { IsString } from 'class-validator';

export class RefreshTokenDTO {
    @IsString()
    readonly refresh_token: string;
}
