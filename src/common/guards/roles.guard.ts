import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { Request } from 'express';

const compareRole = (req: Request, role: Roles): boolean => {
    return req['user']['role'] === role;
};

@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        return compareRole(request, Roles.ADMIN);
    }
}

@Injectable()
export class CustomerGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        return compareRole(request, Roles.CUSTOMER);
    }
}

@Injectable()
export class StylistGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        return compareRole(request, Roles.STYLIST);
    }
}
