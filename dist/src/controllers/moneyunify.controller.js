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
exports.MoneyUnifyController = void 0;
const common_1 = require("@nestjs/common");
const moneyunify_service_1 = require("../services/moneyunify.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MoneyUnifyController = class MoneyUnifyController {
    constructor(moneyUnifyService, prisma) {
        this.moneyUnifyService = moneyUnifyService;
        this.prisma = prisma;
    }
    async initiatePayment(createPaymentDto) {
        try {
            const phoneValidation = this.moneyUnifyService.validatePhoneNumber(createPaymentDto.phone, createPaymentDto.provider);
            if (!phoneValidation.valid) {
                return {
                    success: false,
                    error: phoneValidation.error || 'Invalid phone number',
                };
            }
            const paymentResult = await this.moneyUnifyService.initiatePayment({
                phone: phoneValidation.formatted,
                amount: createPaymentDto.amount,
                reference: createPaymentDto.reference,
                description: createPaymentDto.description || `Payment for order ${createPaymentDto.reference}`,
            });
            if (!paymentResult.success) {
                return {
                    success: false,
                    error: paymentResult.error || 'Payment initiation failed',
                };
            }
            try {
                const order = await this.prisma.order.findFirst({
                    where: { orderNumber: createPaymentDto.reference },
                });
                await this.prisma.paymentTransaction.create({
                    data: {
                        provider: 'MoneyUnify',
                        reference: paymentResult.transactionId || `MU-${Date.now()}`,
                        amount: createPaymentDto.amount,
                        currency: createPaymentDto.currency || 'ZMW',
                        status: 'PENDING',
                        raw: paymentResult.data || paymentResult,
                        orderId: order?.id,
                    },
                });
            }
            catch (e) {
                console.error('Failed to persist pending transaction:', e);
            }
            return {
                success: true,
                transactionId: paymentResult.transactionId,
                status: paymentResult.status,
                message: paymentResult.message || 'Payment initiated successfully. Please complete the payment on your phone.',
                data: paymentResult.data,
            };
        }
        catch (error) {
            console.error('Payment initiation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment initiation failed',
            };
        }
    }
    async getPaymentStatus(transactionId) {
        try {
            const status = await this.moneyUnifyService.checkPaymentStatus(transactionId);
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            console.error('Payment status check error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get payment status',
            };
        }
    }
    async handleWebhook(webhookDto, req, res) {
        try {
            console.log('Money Unify webhook received:', webhookDto);
            const result = this.moneyUnifyService.processWebhook(webhookDto);
            if (!result.isValid) {
                console.error('Invalid webhook:', result.error);
                return res.status(400).json({ error: 'Invalid webhook data' });
            }
            const { data } = result;
            if (data) {
                switch (data.status) {
                    case 'successful':
                        await this.handlePaymentSuccess(data);
                        break;
                    case 'failed':
                        await this.handlePaymentFailure(data);
                        break;
                    case 'cancelled':
                        await this.handlePaymentCancellation(data);
                        break;
                    case 'pending':
                        console.log('Payment still pending:', data.transactionId);
                        break;
                }
            }
            return res.status(200).json({ received: true, message: 'Webhook processed successfully' });
        }
        catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
    async handlePaymentSuccess(paymentData) {
        try {
            console.log('Payment successful:', paymentData);
            await this.prisma.paymentTransaction.upsert({
                where: { reference: paymentData.transactionId },
                update: {
                    status: 'PAID',
                    raw: paymentData,
                },
                create: {
                    provider: 'MoneyUnify',
                    reference: paymentData.transactionId,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'ZMW',
                    status: 'PAID',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({
                where: { orderNumber: paymentData.reference },
            });
            if (order) {
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { paymentStatus: 'PAID' },
                });
                await this.prisma.vendorOrder.updateMany({
                    where: { orderId: order.id },
                    data: { paymentStatus: 'PAID' },
                });
                await this.prisma.paymentTransaction.updateMany({
                    where: { reference: paymentData.transactionId, orderId: null },
                    data: { orderId: order.id },
                });
                console.log(`Order ${order.orderNumber} marked as PAID`);
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
                where: { reference: paymentData.transactionId },
                update: {
                    status: 'FAILED',
                    raw: paymentData,
                },
                create: {
                    provider: 'MoneyUnify',
                    reference: paymentData.transactionId,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'ZMW',
                    status: 'FAILED',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({
                where: { orderNumber: paymentData.reference },
            });
            if (order) {
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { paymentStatus: 'FAILED' },
                });
                await this.prisma.vendorOrder.updateMany({
                    where: { orderId: order.id },
                    data: { paymentStatus: 'FAILED' },
                });
                await this.prisma.paymentTransaction.updateMany({
                    where: { reference: paymentData.transactionId, orderId: null },
                    data: { orderId: order.id },
                });
                console.log(`Order ${order.orderNumber} marked as FAILED`);
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
                where: { reference: paymentData.transactionId },
                update: {
                    status: 'REFUNDED',
                    raw: paymentData,
                },
                create: {
                    provider: 'MoneyUnify',
                    reference: paymentData.transactionId,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'ZMW',
                    status: 'REFUNDED',
                    raw: paymentData,
                },
            });
            const order = await this.prisma.order.findFirst({
                where: { orderNumber: paymentData.reference },
            });
            if (order) {
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { paymentStatus: 'REFUNDED' },
                });
                await this.prisma.vendorOrder.updateMany({
                    where: { orderId: order.id },
                    data: { paymentStatus: 'REFUNDED' },
                });
                await this.prisma.paymentTransaction.updateMany({
                    where: { reference: paymentData.transactionId, orderId: null },
                    data: { orderId: order.id },
                });
                console.log(`Order ${order.orderNumber} marked as REFUNDED`);
            }
        }
        catch (error) {
            console.error('Error handling payment cancellation:', error);
        }
    }
    async getProviders(countryCode) {
        try {
            const providers = await this.moneyUnifyService.getProviders(countryCode);
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
exports.MoneyUnifyController = MoneyUnifyController;
__decorate([
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MoneyUnifyController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Get)('status/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoneyUnifyController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MoneyUnifyController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('providers/:countryCode'),
    __param(0, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoneyUnifyController.prototype, "getProviders", null);
exports.MoneyUnifyController = MoneyUnifyController = __decorate([
    (0, common_1.Controller)('payments/moneyunify'),
    __metadata("design:paramtypes", [moneyunify_service_1.MoneyUnifyService,
        prisma_service_1.PrismaService])
], MoneyUnifyController);
//# sourceMappingURL=moneyunify.controller.js.map