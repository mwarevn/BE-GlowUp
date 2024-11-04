import { Controller, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { UploadService } from 'src/modules/upload/upload.service';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';

@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) {}

    @Post('third-party/picture')
    @UseInterceptors(uploadSingleImageInterceptor())
    async uploadThirdPartyPicture(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
        return res.json(await this.uploadService.uploadSingleImageThirdParty(req));
    }
}
