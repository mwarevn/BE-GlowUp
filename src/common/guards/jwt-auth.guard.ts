import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const access_token = this.extractAccessTokenFromHeader(request);

        if (!access_token) {
            throw new UnauthorizedException('Access token is missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync(access_token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            const detailsUser = await this.userService.getUser({ id: payload.id });

            if (!detailsUser) {
                throw new UnauthorizedException();
            }

            delete detailsUser.password;

            request['user'] = detailsUser;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid access token!');
        }
    }

    private extractAccessTokenFromHeader(request: Request): string | undefined {
        return request.cookies.access_token || undefined;
    }

    private extractRefreshTokenFromHeader(request: Request): string | undefined {
        return request.cookies.refresh_token || undefined;
    }
}
