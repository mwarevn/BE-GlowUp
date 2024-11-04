import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return '<a style="padding: 10px; display: block; text-decoration: none; color: white; font-weight: bold; background: #24f5; border-radius: 10px; position: absolute; top: 50%; left: 50%" href="/auth/google">Login</a>';
    }
}
