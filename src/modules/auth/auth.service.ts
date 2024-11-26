import { Injectable } from '@nestjs/common';
import { LoginDTO } from 'src/modules/auth/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { RegisterAccountDTO } from 'src/modules/auth/dto/register-account.dto';
import { hashPasswd } from 'src/common/utils';

export interface JWTPayload {
    id: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    async loginSystem(loginDto: LoginDTO, res: Response) {
        const matchedUser = await this.userService.getUser({
            phone_number: loginDto.phone_number,
        });

        // if phone number not found
        if (!matchedUser) {
            return null;
        }

        const isMatch = await this.verifyPassword(loginDto.password, matchedUser.password);

        // if password does not match
        if (!isMatch) {
            return null;
        }

        if (loginDto.notify_token) {
            await this.userService.updateProfile({ id: matchedUser.id }, { notify_token: loginDto.notify_token });
        }

        return matchedUser;
    }

    // register new account
    async registerAccount(registerAccountDTO: RegisterAccountDTO) {
        const existsUser = await this.userService.getUser({
            phone_number: registerAccountDTO.phone_number,
        });

        const hashedPassword = await hashPasswd(registerAccountDTO.password);

        if (existsUser && !existsUser.password) {
            return await this.userService.updateProfile(
                { id: existsUser.id },
                {
                    ...registerAccountDTO,
                    password: hashedPassword,
                },
            );
        }

        if (existsUser) {
            throw new Error('Số điện thoại này đã được sử dụng!');
        }

        return await this.userService.createUser({
            ...registerAccountDTO,
            password: hashedPassword,
        });
    }

    // async logout(id: string) {
    //   return await PrismaDB.user.update({
    //     where: { id },
    //     data: {
    //       access_token: null,
    //       refresh_token: null,
    //     },
    //   });
    // }

    // async storeToken(where: any, access_token: string, refresh_token: string) {
    //   return await PrismaDB.user.update({
    //     where,
    //     data: {
    //       access_token,
    //       refresh_token,
    //     },
    //   });
    // }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    async generateAccessToken(payload: any) {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '8m',
        });
    }

    async generateRefreshToken(payload: any) {
        return await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '8d',
        });
    }
}
