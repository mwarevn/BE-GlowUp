import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Req,
    Res,
    ServiceUnavailableException,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Roles } from '@prisma/client';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/roles.guard';
import { uploadSingleImageThirdParty } from 'src/common/utils';
import { PrismaDB } from 'src/modules/prisma/prisma.extensions';
import { UpdateNumberphoneDTO } from 'src/modules/user/dto/user.update-number_phone.dto';
import { UpdateProfileUserDTO } from 'src/modules/user/dto/user.update.dto';
import { UserService } from 'src/modules/user/user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Delete(':id')
    @UseGuards(AuthGuard, AdminGuard)
    async deleteUser(@Res() res: Response) {
        console.log(
            await PrismaDB.user.delete({
                where: { id: '66eff159557a6976231f5151' },
            }),
        );

        res.json({ success: true });
    }

    @Patch('update-phone-number')
    @UseGuards(AuthGuard)
    async updateNumberPhone(
        // @Body() updateNumberphoneDto: UpdateNumberphoneDTO,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        console.log(123);
        // const current_user = req['user'];

        // if (current_user['phone_number'] === updateNumberphoneDto.phone_number) {
        //   return res.json({ success: true });
        // }

        // try {
        //   const exitsUser = await this.userService.getUser({
        //     number_phone: updateNumberphoneDto.phone_number,
        //   });

        //   if (exitsUser) {
        //     throw new BadRequestException(
        //       'This number phone is already exist on system!',
        //     );
        //   }

        //   const updatedUser = await this.userService.updatePhoneNumber(
        //     current_user['id'],
        //     updateNumberphoneDto.phone_number,
        //   );

        //   if (!updatedUser) {
        //     throw new ServiceUnavailableException();
        //   }
        // } catch (error) {
        //   throw new ServiceUnavailableException(error.message);
        // }
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    async update(
        @Body() updateProfileDTO: UpdateProfileUserDTO,
        @Req() req: Request,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        console.log(updateProfileDTO);
        if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;

        const user = req['user'];
        // TODO: thêm phần quyền cập nhật - user chỉnh profile - stylist chỉnh profile và profile users
        const accepted = user['id'] === id || user['role'] === Roles.ADMIN;

        if (!accepted) {
            throw new ForbiddenException();
        }

        if (updateProfileDTO.profile) {
            if (user['role'] != Roles.ADMIN) {
                throw new ForbiddenException();
            }
        }

        try {
            const updatedUser = await this.userService.updateProfile({ id }, updateProfileDTO);

            res.json({ success: true, data: updatedUser });
        } catch (error) {
            console.log(error.message);
            throw new BadRequestException('Kiểm tra lại định dạng dữ liệu!');
        }
    }

    @Patch('update-avatar/:id')
    @UseGuards(AuthGuard)
    @UseInterceptors(uploadSingleImageInterceptor())
    async updateAvatar(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        if (!mongoose.Types.ObjectId.isValid(id)) return `not found mongoose Types ObjectId ${id}`;

        const user = req['user'];

        if (user['id'] !== id) {
            throw new ForbiddenException();
        }

        try {
            const imgData = await uploadSingleImageThirdParty(req);

            if (!imgData.success) {
                throw new ServiceUnavailableException();
            }

            const avatar = imgData.data.link;

            const updatedUser = await this.userService.updateAvatar(id, avatar);

            if (!updatedUser) {
                throw new BadRequestException();
            }

            res.json({ success: true, data: updatedUser });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    // TODO: update phone number - update-phone-number
}
