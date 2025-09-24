import { PrismaService } from '../prisma/prisma.service';
export declare class EarningsController {
    private prisma;
    constructor(prisma: PrismaService);
    listVendorEarnings(limitStr?: string): Promise<{
        vendorId: string;
        vendorName: string;
        earned: number;
        paidOrPending: number;
        available: number;
    }[]>;
}
