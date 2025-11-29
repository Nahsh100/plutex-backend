import { PayoutsService } from '../services/payouts.service';
export declare class PayoutsController {
    private payoutsService;
    constructor(payoutsService: PayoutsService);
    myPayouts(req: any): Promise<{
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
    requestPayout(req: any, body: {
        amount: number;
        currency?: string;
        note?: string;
    }): Promise<{
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
    listAll(status?: string): Promise<({
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
            rating: number;
            website: string | null;
            businessType: string | null;
            taxId: string | null;
            idType: string | null;
            idNumber: string | null;
            registrationNumber: string | null;
            documentUrl: string | null;
            internalNotes: string | null;
            isVerified: boolean;
            reviewCount: number;
            logo: string | null;
            location: string | null;
            shippingRate: number | null;
            freeShippingThreshold: number | null;
            shippingNotes: string | null;
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
    markPaid(id: string, body: {
        reference?: string;
    }): Promise<{
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
    mySummary(req: any): Promise<{
        earned: number;
        paidOrPending: number;
        available: number;
    }>;
}
