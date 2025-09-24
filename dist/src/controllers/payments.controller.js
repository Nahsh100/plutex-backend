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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const pawapay_service_1 = require("../services/pawapay.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsController = class PaymentsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPawaPayDeposit(createDepositDto) {
        try {
            const deposit = await pawapay_service_1.pawaPayService.createDeposit({
                amount: createDepositDto.amount,
                currency: createDepositDto.currency,
                customer: createDepositDto.customer,
                description: createDepositDto.description,
                reference: createDepositDto.reference,
                webhookUrl: `${process.env.BASE_URL}/api/payments/pawapay/webhook`,
            });
            try {
                const order = await this.prisma.order.findFirst({ where: { orderNumber: createDepositDto.reference } });
                await this.prisma.paymentTransaction.create({
                    data: {
                        provider: 'pawaPay',
                        reference: deposit.id,
                        amount: createDepositDto.amount,
                        currency: createDepositDto.currency,
                        status: 'PENDING',
                        raw: deposit,
                        orderId: order?.id,
                    },
                });
            }
            catch (e) {
                console.error('Failed to persist pending transaction:', e);
            }
            return {
                success: true,
                paymentId: deposit.id,
                status: deposit.status,
                message: 'Payment initiated successfully',
                data: deposit,
            };
        }
        catch (error) {
            console.error('PawaPay Deposit Creation Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment initiation failed',
            };
        }
    }
    async getPaymentStatus(paymentId) {
        try {
            const status = await pawapay_service_1.pawaPayService.getDepositStatus(paymentId);
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            console.error('PawaPay Status Check Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get payment status',
            };
        }
    }
    async handlePawaPayWebhook(webhookDto, req, res) {
        try {
            const rawBody = JSON.stringify(webhookDto);
            const result = pawapay_service_1.pawaPayService.processWebhook(webhookDto);
            if (!result.isValid) {
                console.error('Invalid webhook signature:', result.error);
                return res.status(400).json({ error: 'Invalid signature' });
            }
            const { data } = result;
            if (data) {
                switch (data.status) {
                    case 'SUCCESS':
                        await this.handlePaymentSuccess(data);
                        break;
                    case 'FAILED':
                        await this.handlePaymentFailure(data);
                        break;
                    case 'CANCELLED':
                        await this.handlePaymentCancellation(data);
                        break;
                }
            }
            return res.status(200).json({ received: true });
        }
        catch (error) {
            console.error('Webhook Processing Error:', error);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
    async handlePaymentSuccess(paymentData) {
        try {
            console.log('Payment successful:', paymentData);
            await this.prisma.paymentTransaction.upsert({
                where: { reference: paymentData.id },
                update: { status: 'PAID', raw: paymentData },
                create: {
                    provider: 'pawaPay',
                    reference: paymentData.id,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: 'PAID',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
            if (order) {
                await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID' } });
                await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'PAID' } });
                await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
            }
        }
        catch (error) {
            console.error('Error handling payment success:', error);
        }
    }
    async handlePaymentFailure(paymentData) {
        try {
            console.log('Payment failed:', paymentData);
            await this.prisma.paymentTransaction.upsert({
                where: { reference: paymentData.id },
                update: { status: 'FAILED', raw: paymentData },
                create: {
                    provider: 'pawaPay',
                    reference: paymentData.id,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: 'FAILED',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
            if (order) {
                await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
                await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'FAILED' } });
                await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
            }
        }
        catch (error) {
            console.error('Error handling payment failure:', error);
        }
    }
    async handlePaymentCancellation(paymentData) {
        try {
            console.log('Payment cancelled:', paymentData);
            await this.prisma.paymentTransaction.upsert({
                where: { reference: paymentData.id },
                update: { status: 'REFUNDED', raw: paymentData },
                create: {
                    provider: 'pawaPay',
                    reference: paymentData.id,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: 'REFUNDED',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
            if (order) {
                await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'REFUNDED' } });
                await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'REFUNDED' } });
                await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
            }
        }
        catch (error) {
            console.error('Error handling payment cancellation:', error);
        }
    }
    async getProviders(countryCode) {
        try {
            const providers = await pawapay_service_1.pawaPayService.getProviders(countryCode);
            return {
                success: true,
                data: providers,
            };
        }
        catch (error) {
            console.error('Error getting providers:', error);
            return {
                success: false,
                error: 'Failed to get providers',
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('pawapay/create-deposit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPawaPayDeposit", null);
__decorate([
    (0, common_1.Get)('pawapay/status/:paymentId'),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('pawapay/webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePawaPayWebhook", null);
__decorate([
    (0, common_1.Get)('pawapay/providers/:countryCode'),
    __param(0, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getProviders", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map