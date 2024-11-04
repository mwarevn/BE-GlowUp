import * as multer from 'multer';
import { createHash } from 'crypto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

const storageOptions = multer.diskStorage({
    filename: (req, file, cb) => {
        const hash = createHash('sha256')
            .update(file.originalname + Date.now().toString())
            .digest('hex')
            .slice(0, 10);
        cb(null, `${hash}_${file.originalname}`);
    },
    destination: `${__dirname.split('modules')[0]}public/img`,
});

const fileFilter = (req, file, callback) => {
    const isMatch = file.originalname.match(/\.(jpg|jpeg|png)$/);

    if (!isMatch) {
        return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
    }
    callback(null, true);
};

export const uploadSingleImageInterceptor = () =>
    FileInterceptor('picture', {
        storage: storageOptions,
        fileFilter,
        limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
    });

export const multerOptions = {
    storage: multer.diskStorage({
        destination: 'public/uploads/banners',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now();
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
    },
};
