import { PrismaService } from '../prisma/prisma.service';
export declare class ConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalCommissionRate(): Promise<number>;
    getGlobalTaxRate(): Promise<number>;
    setGlobalCommissionRate(rate: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        commissionRate: number;
        taxRate: number;
    }>;
    setGlobalTaxRate(rate: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        commissionRate: number;
        taxRate: number;
    }>;
    getAppConfig(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        commissionRate: number;
        taxRate: number;
    }>;
    updateAppConfig(data: {
        commissionRate?: number;
        taxRate?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        commissionRate: number;
        taxRate: number;
    }>;
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
