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
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayoutsService = class PayoutsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveVendorIdByEmail(email) {
        try {
            const vendor = await this.prisma.vendor.findUnique({ where: { email } });
            return vendor?.id || null;
        }
        catch {
            return null;
        }
    }
    async listVendorPayouts(vendorId) {
        return this.prisma.vendorPayout.findMany({
            where: { vendorId },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async listAllPayouts(status) {
        return this.prisma.vendorPayout.findMany({
            where: status ? { status: status } : undefined,
            orderBy: { requestedAt: 'desc' },
            include: { vendor: true },
        });
    }
    async requestPayout(vendorId, amount, currency = 'USD', note) {
        return this.prisma.vendorPayout.create({
            data: { vendorId, amount, currency, note },
        });
    }
    async markPayoutPaid(payoutId, reference) {
        const payout = await this.prisma.vendorPayout.findUnique({ where: { id: payoutId } });
        if (!payout)
            throw new common_1.NotFoundException('Payout not found');
        return this.prisma.vendorPayout.update({
            where: { id: payoutId },
            data: { status: 'PAID', paidAt: new Date(), reference },
        });
    }
    async getVendorEarningsSummary(vendorId) {
        const [totalVendorOrders, totalPayouts] = await Promise.all([
            this.prisma.vendorOrder.aggregate({
                where: { vendorId, paymentStatus: 'PAID' },
                _sum: { vendorEarnings: true },
            }),
            this.prisma.vendorPayout.aggregate({
                where: { vendorId, status: { in: ['PAID', 'PENDING'] } },
                _sum: { amount: true },
            }),
        ]);
        const earned = totalVendorOrders._sum.vendorEarnings || 0;
        const paidOrPending = totalPayouts._sum.amount || 0;
        const available = Math.max(earned - paidOrPending, 0);
        return { earned, paidOrPending, available };
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map