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
exports.EarningsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EarningsController = class EarningsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listVendorEarnings(limitStr) {
        const vendors = await this.prisma.vendor.findMany({ select: { id: true, name: true } });
        const summaries = await Promise.all(vendors.map(async (v) => {
            const earnedAgg = await this.prisma.vendorOrder.aggregate({
                where: { vendorId: v.id, paymentStatus: 'PAID' },
                _sum: { vendorEarnings: true },
            });
            const payoutAgg = await this.prisma.vendorPayout.aggregate({
                where: { vendorId: v.id, status: { in: ['PAID', 'PENDING'] } },
                _sum: { amount: true },
            });
            const earned = earnedAgg._sum.vendorEarnings || 0;
            const paidOrPending = payoutAgg._sum.amount || 0;
            const available = Math.max(earned - paidOrPending, 0);
            return { vendorId: v.id, vendorName: v.name, earned, paidOrPending, available };
        }));
        return summaries
            .sort((a, b) => b.available - a.available)
            .slice(0, limitStr ? parseInt(limitStr, 10) : summaries.length);
    }
};
exports.EarningsController = EarningsController;
__decorate([
    (0, common_1.Get)('vendors'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EarningsController.prototype, "listVendorEarnings", null);
exports.EarningsController = EarningsController = __decorate([
    (0, common_1.Controller)('earnings'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EarningsController);
//# sourceMappingURL=earnings.controller.js.map