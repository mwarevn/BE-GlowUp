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

export class ForgotPasswdDTO {
    @IsMobilePhone('vi-VN', null)
    @Length(10)
    @ApiProperty({ example: '0972945022' })
    readonly phone_number: number;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: '123321' })
    readonly new_password: string;

    @IsString()
    @ValidateIf((o) => o.password)
    @IsString()
    @IsEqual('new_password', { message: 'Mật khẩu không trùng khớp!' })
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
                return `${propertyName} không khớp với ${property}`;
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
