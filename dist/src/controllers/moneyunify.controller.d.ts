import { Request, Response } from 'express';
import { MoneyUnifyService } from '../services/moneyunify.service';
import { PrismaService } from '../prisma/prisma.service';
interface CreatePaymentDto {
    phone: string;
    amount: number;
    currency: string;
    reference: string;
    description?: string;
    provider: string;
}
interface WebhookDto {
    transactionId: string;
    status: 'successful' | 'failed' | 'pending' | 'cancelled';
    amount: number;
    currency?: string;
    reference?: string;
    phone?: string;
    provider?: string;
    failureReason?: string;
    timestamp?: string;
    signature?: string;
}
export declare class MoneyUnifyController {
    private readonly moneyUnifyService;
    private readonly prisma;
    constructor(moneyUnifyService: MoneyUnifyService, prisma: PrismaService);
    initiatePayment(createPaymentDto: CreatePaymentDto): Promise<{
        success: boolean;
        error: string;
        transactionId?: undefined;
        status?: undefined;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        transactionId: string;
        status: string;
        message: string;
        data: any;
        error?: undefined;
    }>;
    initiatePaymentEncrypted(body: {
        payload: string;
    }): Promise<{
        success: boolean;
        error: string;
        transactionId?: undefined;
        status?: undefined;
        message?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        transactionId: string;
        status: string;
        message: string;
        data: any;
        error?: undefined;
    }>;
    getPaymentStatus(transactionId: string): Promise<{
        success: boolean;
        data: import("../services/moneyunify.service").MoneyUnifyPaymentResponse;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    handleWebhook(webhookDto: WebhookDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePaymentCancellation;
    getProviders(countryCode: string): Promise<{
        success: boolean;
        data: string[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
export {};
