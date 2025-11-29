import { AppConfig } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type AppConfigWithShipping = AppConfig & {
    defaultShippingRate: number | null;
    freeShippingThreshold: number | null;
};
export declare class ConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalCommissionRate(): Promise<number>;
    getGlobalTaxRate(): Promise<number>;
    setGlobalCommissionRate(rate: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        freeShippingThreshold: number;
        commissionRate: number;
        taxRate: number;
        defaultShippingRate: number;
    }>;
    setGlobalTaxRate(rate: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        freeShippingThreshold: number;
        commissionRate: number;
        taxRate: number;
        defaultShippingRate: number;
    }>;
    getAppConfig(): Promise<AppConfigWithShipping>;
    updateAppConfig(data: {
        commissionRate?: number;
        taxRate?: number;
        defaultShippingRate?: number;
        freeShippingThreshold?: number;
    }): Promise<AppConfigWithShipping>;
    getShippingDefaults(): Promise<{
        defaultShippingRate: number;
        freeShippingThreshold: number;
    }>;
    setShippingDefaults(defaultShippingRate: number, freeShippingThreshold: number): Promise<AppConfigWithShipping>;
    getVendorCommissionRate(vendorId: string): Promise<number | null>;
    setVendorCommissionRate(vendorId: string, rate: number, active?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        rate: number;
        active: boolean;
    }>;
}
export {};
