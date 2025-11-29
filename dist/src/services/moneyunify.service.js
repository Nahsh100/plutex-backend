"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyUnifyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let MoneyUnifyService = class MoneyUnifyService {
    constructor() {
        this.apiUrl = process.env.MONEYUNIFY_API_URL || 'https://plutex-pay-production.up.railway.app/api/v1/moneyunify';
        this.initiateTimeoutMs = Number(process.env.MONEYUNIFY_INITIATE_TIMEOUT_MS || 120000);
        this.testAmount = process.env.MONEYUNIFY_TEST_AMOUNT
            ? Number(process.env.MONEYUNIFY_TEST_AMOUNT)
            : 1;
    }
    async initiatePayment(request) {
        try {
            const amountToCharge = this.testAmount ?? request.amount;
            const response = await axios_1.default.post(`${this.apiUrl}/pay`, {
                phone: request.phone,
                amount: amountToCharge,
                reference: request.reference,
                description: request.description,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: this.initiateTimeoutMs,
            });
            return response.data;
        }
        catch (error) {
            console.error('Money Unify payment initiation error:', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    return {
                        success: false,
                        error: 'Payment request timed out while waiting for MoneyUnify. Please check your phone for any pending prompts and try again if necessary.',
                    };
                }
                return {
                    success: false,
                    error: error.response?.data?.message || error.message || 'Payment initiation failed',
                };
            }
            return {
                success: false,
                error: 'An unexpected error occurred during payment initiation',
            };
        }
    }
    async checkPaymentStatus(transactionId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/status/${transactionId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            console.error('Money Unify status check error:', error);
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    error: error.response?.data?.message || error.message || 'Status check failed',
                };
            }
            return {
                success: false,
                error: 'An unexpected error occurred during status check',
            };
        }
    }
    processWebhook(webhookData) {
        try {
            if (!webhookData || typeof webhookData !== 'object') {
                return {
                    isValid: false,
                    error: 'Invalid webhook data structure',
                };
            }
            const requiredFields = ['transactionId', 'status', 'amount'];
            const missingFields = requiredFields.filter(field => !(field in webhookData));
            if (missingFields.length > 0) {
                return {
                    isValid: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`,
                };
            }
            return {
                isValid: true,
                data: webhookData,
            };
        }
        catch (error) {
            console.error('Webhook processing error:', error);
            return {
                isValid: false,
                error: 'Webhook processing failed',
            };
        }
    }
    async getProviders(countryCode = 'ZM') {
        if (countryCode === 'ZM' || countryCode === 'Zambia') {
            return ['Airtel Money', 'MTN Mobile Money', 'Zamtel Kwacha'];
        }
        return ['Airtel Money', 'MTN Mobile Money', 'Zamtel Kwacha'];
    }
    validatePhoneNumber(phone, provider) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10 && cleaned.startsWith('09')) {
            return {
                valid: true,
                formatted: cleaned,
            };
        }
        if (cleaned.length === 12 && cleaned.startsWith('260')) {
            return {
                valid: true,
                formatted: cleaned,
            };
        }
        if (cleaned.length === 9) {
            return {
                valid: true,
                formatted: '0' + cleaned,
            };
        }
        return {
            valid: false,
            error: 'Invalid phone number format. Expected format: 0971234567 or 260971234567',
        };
    }
};
exports.MoneyUnifyService = MoneyUnifyService;
exports.MoneyUnifyService = MoneyUnifyService = __decorate([
    (0, common_1.Injectable)()
], MoneyUnifyService);
//# sourceMappingURL=moneyunify.service.js.map