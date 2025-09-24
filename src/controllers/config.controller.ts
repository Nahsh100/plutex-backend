import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ConfigService } from '../services/config.service';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  // Get all app configuration
  @Get()
  async getAppConfig() {
    const config = await this.configService.getAppConfig();
    return {
      commissionRate: config.commissionRate,
      taxRate: config.taxRate,
      updatedAt: config.updatedAt
    };
  }

  // Update app configuration
  @Patch()
  async updateAppConfig(@Body() body: { commissionRate?: number; taxRate?: number }) {
    const saved = await this.configService.updateAppConfig(body);
    return {
      commissionRate: saved.commissionRate,
      taxRate: saved.taxRate,
      updatedAt: saved.updatedAt
    };
  }

  @Get('commission')
  async getGlobalCommission() {
    const rate = await this.configService.getGlobalCommissionRate();
    return { commissionRate: rate };
  }

  @Patch('commission')
  async setGlobalCommission(@Body() body: { commissionRate: number }) {
    const saved = await this.configService.setGlobalCommissionRate(body.commissionRate);
    return { commissionRate: saved.commissionRate };
  }

  @Get('tax')
  async getGlobalTax() {
    const rate = await this.configService.getGlobalTaxRate();
    return { taxRate: rate };
  }

  @Patch('tax')
  async setGlobalTax(@Body() body: { taxRate: number }) {
    const saved = await this.configService.setGlobalTaxRate(body.taxRate);
    return { taxRate: saved.taxRate };
  }

  @Get('commission/vendor/:vendorId')
  async getVendorCommission(@Param('vendorId') vendorId: string) {
    const rate = await this.configService.getVendorCommissionRate(vendorId);
    return { commissionRate: rate };
  }

  @Patch('commission/vendor/:vendorId')
  async setVendorCommission(
    @Param('vendorId') vendorId: string,
    @Body() body: { commissionRate: number; active?: boolean },
  ) {
    const res = await this.configService.setVendorCommissionRate(
      vendorId,
      body.commissionRate,
      body.active ?? true,
    );
    return { vendorId: res.vendorId, commissionRate: res.rate, active: res.active };
  }
}

