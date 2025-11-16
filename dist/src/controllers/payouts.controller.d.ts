import { PayoutsService } from '../services/payouts.service';
export declare class PayoutsController {
    private payoutsService;
    constructor(payoutsService: PayoutsService);
    myPayouts(req: any): Promise<{
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
    requestPayout(req: any, body: {
        amount: number;
        currency?: string;
        note?: string;
    }): Promise<{
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
    listAll(status?: string): Promise<({
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
    markPaid(id: string, body: {
        reference?: string;
    }): Promise<{
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
    mySummary(req: any): Promise<{
        earned: number;
        paidOrPending: number;
        available: number;
    }>;
}
