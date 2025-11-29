interface MoneyUnifyPaymentRequest {
    phone: string;
    amount: number;
    reference?: string;
    description?: string;
}
export interface MoneyUnifyPaymentResponse {
    success: boolean;
    transactionId?: string;
    status?: string;
    message?: string;
    error?: string;
    data?: any;
}
export declare class MoneyUnifyService {
    private readonly apiUrl;
    private readonly initiateTimeoutMs;
    private readonly testAmount;
    initiatePayment(request: MoneyUnifyPaymentRequest): Promise<MoneyUnifyPaymentResponse>;
    checkPaymentStatus(transactionId: string): Promise<MoneyUnifyPaymentResponse>;
    processWebhook(webhookData: any): {
        isValid: boolean;
        data?: any;
        error?: string;
    };
    getProviders(countryCode?: string): Promise<string[]>;
    validatePhoneNumber(phone: string, provider?: string): {
        valid: boolean;
        formatted?: string;
        error?: string;
    };
}
export {};
