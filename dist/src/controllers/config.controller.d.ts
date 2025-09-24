import { ConfigService } from '../services/config.service';
export declare class ConfigController {
    private configService;
    constructor(configService: ConfigService);
    getAppConfig(): Promise<{
        commissionRate: number;
        taxRate: number;
        updatedAt: Date;
    }>;
    updateAppConfig(body: {
        commissionRate?: number;
        taxRate?: number;
    }): Promise<{
        commissionRate: number;
        taxRate: number;
        updatedAt: Date;
    }>;
    getGlobalCommission(): Promise<{
        commissionRate: number;
    }>;
    setGlobalCommission(body: {
        commissionRate: number;
    }): Promise<{
        commissionRate: number;
    }>;
    getGlobalTax(): Promise<{
        taxRate: number;
    }>;
    setGlobalTax(body: {
        taxRate: number;
    }): Promise<{
        taxRate: number;
    }>;
    getVendorCommission(vendorId: string): Promise<{
        commissionRate: number;
    }>;
    setVendorCommission(vendorId: string, body: {
        commissionRate: number;
        active?: boolean;
    }): Promise<{
        vendorId: string;
        commissionRate: number;
        active: boolean;
    }>;
}
