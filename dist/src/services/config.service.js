"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConfigService = class ConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalCommissionRate() {
        const cfg = await this.prisma.appConfig.findFirst();
        if (!cfg) {
            const created = await this.prisma.appConfig.create({ data: {} });
            return created.commissionRate;
        }
        return cfg.commissionRate;
    }
    async getGlobalTaxRate() {
        const cfg = await this.prisma.appConfig.findFirst();
        if (!cfg) {
            const created = await this.prisma.appConfig.create({ data: {} });
            return created.taxRate;
        }
        return cfg.taxRate;
    }
    async setGlobalCommissionRate(rate) {
        const existing = await this.prisma.appConfig.findFirst();
        if (existing) {
            return this.prisma.appConfig.update({ where: { id: existing.id }, data: { commissionRate: rate } });
        }
        return this.prisma.appConfig.create({ data: { commissionRate: rate } });
    }
    async setGlobalTaxRate(rate) {
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
    async updateAppConfig(data) {
        const existing = await this.prisma.appConfig.findFirst();
        if (existing) {
            return this.prisma.appConfig.update({ where: { id: existing.id }, data });
        }
        return this.prisma.appConfig.create({ data: data });
    }
    async getVendorCommissionRate(vendorId) {
        const override = await this.prisma.vendorCommission.findUnique({ where: { vendorId } });
        return override?.active ? override.rate : null;
    }
    async setVendorCommissionRate(vendorId, rate, active = true) {
        const existing = await this.prisma.vendorCommission.findUnique({ where: { vendorId } });
        if (existing) {
            return this.prisma.vendorCommission.update({ where: { vendorId }, data: { rate, active } });
        }
        return this.prisma.vendorCommission.create({ data: { vendorId, rate, active } });
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map