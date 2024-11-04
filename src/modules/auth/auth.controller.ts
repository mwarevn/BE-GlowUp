import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    ServiceUnavailableException,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChangePasswdDTO } from 'src/modules/auth/dto/change-password.dto';
import { RegisterAccountDTO } from 'src/modules/auth/dto/register-account.dto';
import { LoginDTO } from 'src/modules/auth/dto/login.dto';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { ForgotPasswdDTO } from 'src/modules/auth/dto/forgot-password.dto';
import { RefreshTokenDTO } from 'src/modules/auth/dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private jwtService: JwtService,
    ) {}

    @Post('register')
    async registerAccount(@Req() req: Request, @Res() res: Response, @Body() registerAccountDTO: RegisterAccountDTO) {
        try {
            const createdAccount = await this.authService.registerAccount(registerAccountDTO);

            res.json({ success: true, data: createdAccount });
        } catch (error) {
            throw new ServiceUnavailableException(error.message);
        }
    }

    @Post('login')
    @UseInterceptors(ClassSerializerInterceptor)
    async loginSystem(@Body() loginDto: LoginDTO, @Res() res: Response) {
        try {
            const validUser = await this.authService.loginSystem(loginDto, res);
            if (!validUser || !validUser.password) {
                throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không chính xác!');
            }

            // remove protected fields
            delete validUser.password;
            delete validUser.deleted;
            delete validUser.access_token;
            delete validUser.refresh_token;

            const options = { httpOnly: true, secure: false };
            const payload = { id: validUser.id };
            const access_token = await this.authService.generateAccessToken(payload);
            const refresh_token = await this.authService.generateRefreshToken(payload);

            res.cookie('access_token', access_token, options);
            res.cookie('refresh_token', refresh_token, options);

            res.json({
                refresh_token,
                access_token,
                data: validUser,
            });
        } catch (error) {
            // console.log(error);
            throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không chính xác!');
        }
    }

    @Get('logout')
    async logout(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
        // const result = await this.authService.logout(id);

        // if (!result) {
        //   throw new BadRequestException('Can not logout now !');
        // }

        res.json({ success: true });
    }

    // TODO: handle change number phone

    @Post('change-password/:id')
    @UseGuards(AuthGuard)
    async changePasswd(
        @Body() changePasswdDTO: ChangePasswdDTO,
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') id: string,
    ) {
        const user = req['user'];

        // only self can change the passwd
        if (user['id'] !== id) {
            throw new ForbiddenException('Không có quyền thay đổi mật khẩu của người khác !');
        }

        // check valid user in database
        const exitstsUser = await this.userService.getUser({
            id,
        });

        if (!exitstsUser) {
            throw new BadRequestException('yêu cầu lỗi, tài khoản này không tồn tại hoặc đã bị xoá!');
        }

        // compare current payload password vs database password
        const isValidPasswd = await this.authService.verifyPassword(changePasswdDTO.current_password, exitstsUser.password);

        if (!isValidPasswd) {
            throw new BadRequestException('Mật khẩu không chính xác!');
        }

        // ignore same passwd
        if (changePasswdDTO.current_password === changePasswdDTO.new_password) {
            throw new BadRequestException('Mật khẩu này đang được sử dụng!');
        }

        // hash passwd
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(changePasswdDTO.new_password, salt);

        // update profile
        const updatedUser = await this.userService.updateProfile(
            {
                id,
            },
            {
                password: hashedPassword,
            },
        );

        if (!updatedUser) {
            throw new ServiceUnavailableException();
        }

        res.json({ success: true });
    }

    @Post('forgot-password')
    async forgotPasswd(@Body() forgotPasswdDTO: ForgotPasswdDTO, @Req() req: Request, @Res() res: Response) {
        const exitstsUser = await this.userService.getUser({
            phone_number: forgotPasswdDTO.phone_number,
        });

        if (!exitstsUser) {
            throw new NotFoundException('Tài khoản không tồn tại!');
        }

        // hash passwd
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(forgotPasswdDTO.new_password, salt);

        const updateUser = await this.userService.updateProfile(
            { phone_number: forgotPasswdDTO.phone_number },
            {
                password: hashedPassword,
            },
        );

        if (!updateUser) {
            throw new ServiceUnavailableException();
        }

        res.json({ success: true });
    }

    @Post('refresh-token')
    async getAccessTokenFromRefreshToken(@Body() refreshTokenDTO: RefreshTokenDTO, @Res() res: Response) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshTokenDTO.refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const access_token = await this.authService.generateAccessToken({
                id: payload.id,
            });

            const options = { httpOnly: true, secure: false };
            res.cookie('access_token', access_token, options);

            res.json({ success: true, access_token });
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token!');
        }
    }

    // @Get('google')
    // @UseGuards(AuthGuard('google'))
    // async googleAuth() {}

    // @Get('google/callback')
    // @UseGuards(AuthGuard('google'))
    // googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    //   return this.authService.loginGoogle(req, res);
    // }
}
