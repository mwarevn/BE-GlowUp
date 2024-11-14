import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import * as fs from 'fs';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

export const hashPasswd = async (plainTextPassword) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    return hashedPassword;
};

export const selectFileds = {
    id: true,
    gender: true,
    role: true,
    full_name: true,
    phone_number: true,
    avatar: true,
    date_of_birth: true,
    address: true,
    profile: true,
    createdAt: true,
    updatedAt: true,
};

export const uploadSingleImageThirdParty = async (req: Request) => {
    const file = req.file;

    const imgPath: string = file.path;

    const formData = new FormData();
    formData.append('image', fs.createReadStream(imgPath));
    formData.append('type', 'file');

    const formDataLength = await new Promise((resolve, reject) => {
        formData.getLength((err, length) => {
            if (err) {
                reject(err);
            } else {
                resolve(length);
            }
        });
    });

    const uploadImgur = await fetch(process.env.IMGUR_API_URI, {
        method: 'POST',
        headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            ...formData.getHeaders(),
            'Content-Length': formDataLength.toString(),
        },
        body: formData,
    });

    fs.unlinkSync(imgPath);

    const dedata = await uploadImgur.json();

    if (!dedata.success) {
        return null;
    }

    return dedata;
};

export const formatDate = (dateTime: Date) => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
    });
    const parts = formatter.formatToParts(dateTime);
    const dateString = `${parts[4].value}-${parts[2].value}-${parts[0].value}T${parts[6].value}:${parts[8].value}:${parts[10].value}.${String(new Date().getMilliseconds()).padStart(3, '0')}Z`;
    return dateString as unknown as Date;
};

export function isDateInRange(dateString) {
    const date = new Date(dateString);

    // Kiểm tra ngày trong tuần (0: Chủ nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek < 1 || dayOfWeek > 6) {
        return false; // Không phải thứ Hai đến thứ 7
    }

    // Kiểm tra giờ
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const isInTimeRange = (hours > 8 || (hours === 8 && minutes >= 0)) && (hours < 20 || (hours === 20 && minutes <= 30));

    return isInTimeRange;
}
