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
    ValidateIf,
    registerDecorator,
} from 'class-validator';

export class ChangePasswdDTO {
    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123123' })
    readonly current_password: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123321' })
    readonly new_password: string;

    @IsString()
    @ValidateIf((o) => o.password)
    @IsString()
    @IsEqual('new_password', { message: 'Confirm password must match password' })
    @ApiProperty({ example: '123321' })
    readonly confirm_password: string;
}

function IsEqual(property: string, validationOptions?: any) {
    return function (object: Object, propertyName: string) {
        const validator = {
            validate(value: any, args: any) {
                const relatedValue = (args.object as any)[property];
                return value === relatedValue;
            },
            defaultMessage(args: any) {
                return `${propertyName} must match ${property}`;
            },
        };

        registerDecorator({
            name: 'isEqual',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: validator,
        });
    };
}
