import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import * as fs from 'fs';
import * as FormData from 'form-data';
import fetch from 'node-fetch';
import * as winston from 'winston';
const format = winston.format;
const { combine, timestamp, label, prettyPrint } = format;

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${localDate(new Date(timestamp as string)).toLocaleString()} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    level: 'silly',
    format: winston.format.combine(winston.format.colorize({ all: true }), winston.format.simple(), timestamp(), customFormat),
    transports: [new winston.transports.Console()],
});

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

export function isDateInRange(dateString) {
    const date = vietNamTime(new Date(dateString));

    const hours = Number(date.split(':')[0]);
    const minutes = Number(date.split(':')[1]);

    // // Kiểm tra ngày trong tuần (0: Chủ nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
    // const dayOfWeek = date.getUTCDay();
    // if (dayOfWeek < 1 || dayOfWeek > 6) {
    //     return false; // Không phải thứ Hai đến thứ 7
    // }

    // const hours = date.getHours();
    // const minutes = date.getMinutes();
    const isInTimeRange = (hours > 8 || (hours === 8 && minutes >= 0)) && (hours < 20 || (hours === 20 && minutes <= 30));

    return isInTimeRange;
}

export const vietNamTime = (date) => {
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false,
    });
};

export const ISOTime = (date) => {
    return date.toISOString();
};

export function localDate(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date input');
    }
    const localHours = date.getUTCHours() + 7;
    if (localHours === date.getHours()) {
        return date;
    }
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

export function utcDate(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date input');
    }

    const utcHours = date.getUTCHours();
    if (utcHours === date.getHours()) {
        return date;
    }

    return new Date(date.getTime() - 7 * 60 * 60 * 1000);
}
