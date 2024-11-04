import { IsOptional } from 'class-validator';

export class StylistProfileDTO {
    @IsOptional()
    stylist: {
        reviews?: number;
        experience?: string;
        isWorking?: boolean;
    };
}
