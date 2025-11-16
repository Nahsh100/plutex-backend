import { PrismaService } from '../prisma/prisma.service';
export declare class PayoutsService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveVendorIdByEmail(email: string): Promise<string | null>;
    listVendorPayouts(vendorId: string): Promise<{
        status: import(".prisma/client").$Enums.PayoutStatus;
        id: string;
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
            name: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            status: import(".prisma/client").$Enums.VendorStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            website: string | null;
            businessType: string | null;
            taxId: string | null;
            isVerified: boolean;
            rating: number;
            reviewCount: number;
            logo: string | null;
            location: string | null;
        };
    } & {
        status: import(".prisma/client").$Enums.PayoutStatus;
        id: string;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    })[]>;
    requestPayout(vendorId: string, amount: number, currency?: string, note?: string): Promise<{
        status: import(".prisma/client").$Enums.PayoutStatus;
        id: string;
        vendorId: string;
        amount: number;
        reference: string | null;
        currency: string;
        requestedAt: Date;
        paidAt: Date | null;
        note: string | null;
    }>;
    markPayoutPaid(payoutId: string, reference?: string): Promise<{
        status: import(".prisma/client").$Enums.PayoutStatus;
        id: string;
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
