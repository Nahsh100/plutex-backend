import { PrismaService } from '../prisma/prisma.service';
export declare class PayoutsService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveVendorIdByEmail(email: string): Promise<string | null>;
    listVendorPayouts(vendorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    }[]>;
    listAllPayouts(status?: string): Promise<({
        vendor: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string;
            website: string | null;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            businessType: string | null;
            taxId: string | null;
            isVerified: boolean;
            status: import(".prisma/client").$Enums.VendorStatus;
            rating: number;
            reviewCount: number;
            logo: string | null;
            location: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    })[]>;
    requestPayout(vendorId: string, amount: number, currency?: string, note?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    }>;
    markPayoutPaid(payoutId: string, reference?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    }>;
    getVendorEarningsSummary(vendorId: string): Promise<{
        earned: number;
        paidOrPending: number;
        available: number;
    }>;
}
