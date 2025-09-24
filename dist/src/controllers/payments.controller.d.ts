import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
interface CreateDepositDto {
    amount: number;
    currency: string;
    customer: {
        phoneNumber: string;
        email?: string;
        name?: string;
    };
    description: string;
    reference: string;
    provider: string;
}
interface WebhookDto {
    id: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
    amount: number;
    currency: string;
    reference: string;
    provider: string;
    failureReason?: string;
    timestamp: string;
    signature: string;
}
export declare class PaymentsController {
    private prisma;
    constructor(prisma: PrismaService);
    createPawaPayDeposit(createDepositDto: CreateDepositDto): Promise<{
        success: boolean;
        paymentId: any;
        status: any;
        message: string;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        paymentId?: undefined;
        status?: undefined;
        message?: undefined;
        data?: undefined;
    }>;
    getPaymentStatus(paymentId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            status: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    handlePawaPayWebhook(webhookDto: WebhookDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePaymentCancellation;
    getProviders(countryCode: string): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
export {};
