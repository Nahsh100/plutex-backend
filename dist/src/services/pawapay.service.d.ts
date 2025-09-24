export declare const pawaPayService: {
    createDeposit(args: any): Promise<any>;
    getDepositStatus(id: string): Promise<{
        id: string;
        status: string;
    }>;
    processWebhook(dto: any): {
        isValid: boolean;
        data?: any;
        error?: string;
    };
    getProviders(countryCode: string): Promise<any[]>;
};
