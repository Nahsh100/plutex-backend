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
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string | null;
            zipCode: string | null;
            country: string;
            status: import(".prisma/client").$Enums.VendorStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            website: string | null;
            businessType: string | null;
            taxId: string | null;
            idType: string | null;
            idNumber: string | null;
            registrationNumber: string | null;
            documentUrl: string | null;
            internalNotes: string | null;
            isVerified: boolean;
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
