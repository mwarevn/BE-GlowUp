import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    Query,
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

            res.json({ success: true, result: createdAccount });
        } catch (error) {
            res.json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                result: null,
                path: '/auth/register',
            });
        }
    }

    @Post('login')
    @UseInterceptors(ClassSerializerInterceptor)
    async loginSystem(@Body() loginDto: LoginDTO, @Res() res: Response) {
        try {
            const validUser = await this.authService.loginSystem(loginDto, res);
            if (!validUser || !validUser.password) {
                res.json({
                    success: false,
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'Số điện thoại hoặc mật khẩu không chính xác!',
                    result: null,
                    path: '/auth/login',
                });
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
                result: validUser,
            });
        } catch (error) {
            // console.log(error);
            res.json({
                success: false,
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Số điện thoại hoặc mật khẩu không chính xác!',
                result: null,
                path: '/auth/login',
            });
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
            return res.json({
                success: false,
                statusCode: HttpStatus.FORBIDDEN,
                message: 'Không có quyền thay đổi mật khẩu của người khác !',
                result: null,
                path: '/auth/change-password',
            });
        }

        // check valid user in database
        const exitstsUser = await this.userService.getUser({
            id,
        });

        if (!exitstsUser) {
            res.json({
                success: false,
                statusCode: HttpStatus.NOT_FOUND,
                message: 'yêu cầu lỗi, tài khoản này không tồn tại hoặc đã bị xoá!',
                result: null,
                path: '/auth/change-password',
            });
        }

        // compare current payload password vs database password
        const isValidPasswd = await this.authService.verifyPassword(changePasswdDTO.current_password, exitstsUser.password);

        if (!isValidPasswd) {
            res.json({
                success: false,
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Mật khẩu hiện tại không chính xác!',
                result: null,
                path: '/auth/change-password',
            });
        }

        // ignore same passwd
        if (changePasswdDTO.current_password === changePasswdDTO.new_password) {
            res.json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Mật khẩu này đang được sử dụng',
                result: null,
                path: '/auth/change-password',
            });
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
            res.json({
                success: false,
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Tài khoản không tồn tại!',
                result: null,
                path: '/auth/forgot-password',
            });
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

    @Get('generate-access-token')
    async generateAccessToken(@Query() refresh_token: string, @Res() res: Response) {
        try {
            const valid_refresh_token = await this.jwtService.verifyAsync(refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            if (valid_refresh_token) {
                const access_token = await this.authService.generateAccessToken({
                    id: valid_refresh_token.id,
                });

                res.json({ success: true, access_token });
            } else {
                throw new UnauthorizedException();
            }
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException();
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
