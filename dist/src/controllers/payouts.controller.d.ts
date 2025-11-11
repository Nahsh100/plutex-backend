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
