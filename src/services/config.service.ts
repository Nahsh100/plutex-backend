import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  async getGlobalCommissionRate(): Promise<number> {
    const cfg = await this.prisma.appConfig.findFirst();
    if (!cfg) {
      const created = await this.prisma.appConfig.create({ data: {} });
      return created.commissionRate;
    }
    return cfg.commissionRate;
  }

  async getGlobalTaxRate(): Promise<number> {
    const cfg = await this.prisma.appConfig.findFirst();
    if (!cfg) {
      const created = await this.prisma.appConfig.create({ data: {} });
      return created.taxRate;
    }
    return cfg.taxRate;
  }

  async setGlobalCommissionRate(rate: number) {
    const existing = await this.prisma.appConfig.findFirst();
    if (existing) {
      return this.prisma.appConfig.update({ where: { id: existing.id }, data: { commissionRate: rate } });
    }
    return this.prisma.appConfig.create({ data: { commissionRate: rate } });
  }

  async setGlobalTaxRate(rate: number) {
    const existing = await this.prisma.appConfig.findFirst();
    if (existing) {
      return this.prisma.appConfig.update({ where: { id: existing.id }, data: { taxRate: rate } });
    }
    return this.prisma.appConfig.create({ data: { taxRate: rate } });
  }

  async getAppConfig() {
    const cfg = await this.prisma.appConfig.findFirst();
    if (!cfg) {
      return await this.prisma.appConfig.create({ data: {} });
    }
    return cfg;
  }

  async updateAppConfig(data: { commissionRate?: number; taxRate?: number }) {
    const existing = await this.prisma.appConfig.findFirst();
    if (existing) {
      return this.prisma.appConfig.update({ where: { id: existing.id }, data });
    }
    return this.prisma.appConfig.create({ data: data as any });
  }

  async getVendorCommissionRate(vendorId: string): Promise<number | null> {
    const override = await this.prisma.vendorCommission.findUnique({ where: { vendorId } });
    return override?.active ? override.rate : null;
  }

  async setVendorCommissionRate(vendorId: string, rate: number, active: boolean = true) {
    const existing = await this.prisma.vendorCommission.findUnique({ where: { vendorId } });
    if (existing) {
      return this.prisma.vendorCommission.update({ where: { vendorId }, data: { rate, active } });
    }
    return this.prisma.vendorCommission.create({ data: { vendorId, rate, active } });
  }
}

