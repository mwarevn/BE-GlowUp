import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';
import { PrismaService } from 'src/modules/prisma/prisma.service';

const prisma = new PrismaService();

export const PrismaDB = prisma.$extends(
    createSoftDeleteExtension({
        models: {
            User: true,
            Service: true,
            Combo: true,
            Banner: true,
            Booking: true,
        },
    }),
);
