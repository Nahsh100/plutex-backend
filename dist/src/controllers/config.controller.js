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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../services/config.service");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    async getAppConfig() {
        const config = await this.configService.getAppConfig();
        return {
            commissionRate: config.commissionRate,
            taxRate: config.taxRate,
            updatedAt: config.updatedAt
        };
    }
    async updateAppConfig(body) {
        const saved = await this.configService.updateAppConfig(body);
        return {
            commissionRate: saved.commissionRate,
            taxRate: saved.taxRate,
            updatedAt: saved.updatedAt
        };
    }
    async getGlobalCommission() {
        const rate = await this.configService.getGlobalCommissionRate();
        return { commissionRate: rate };
    }
    async setGlobalCommission(body) {
        const saved = await this.configService.setGlobalCommissionRate(body.commissionRate);
        return { commissionRate: saved.commissionRate };
    }
    async getGlobalTax() {
        const rate = await this.configService.getGlobalTaxRate();
        return { taxRate: rate };
    }
    async setGlobalTax(body) {
        const saved = await this.configService.setGlobalTaxRate(body.taxRate);
        return { taxRate: saved.taxRate };
    }
    async getVendorCommission(vendorId) {
        const rate = await this.configService.getVendorCommissionRate(vendorId);
        return { commissionRate: rate };
    }
    async setVendorCommission(vendorId, body) {
        const res = await this.configService.setVendorCommissionRate(vendorId, body.commissionRate, body.active ?? true);
        return { vendorId: res.vendorId, commissionRate: res.rate, active: res.active };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAppConfig", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateAppConfig", null);
__decorate([
    (0, common_1.Get)('commission'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getGlobalCommission", null);
__decorate([
    (0, common_1.Patch)('commission'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "setGlobalCommission", null);
__decorate([
    (0, common_1.Get)('tax'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getGlobalTax", null);
__decorate([
    (0, common_1.Patch)('tax'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "setGlobalTax", null);
__decorate([
    (0, common_1.Get)('commission/vendor/:vendorId'),
    __param(0, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getVendorCommission", null);
__decorate([
    (0, common_1.Patch)('commission/vendor/:vendorId'),
    __param(0, (0, common_1.Param)('vendorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "setVendorCommission", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map