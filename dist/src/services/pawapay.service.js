"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pawaPayService = void 0;
exports.pawaPayService = {
    async createDeposit(args) {
        return { id: `pp_${Date.now()}`, status: 'PENDING', ...args };
    },
    async getDepositStatus(id) {
        return { id, status: 'SUCCESS' };
    },
    processWebhook(dto) {
        return { isValid: true, data: dto };
    },
    async getProviders(countryCode) {
        return [];
    },
};
//# sourceMappingURL=pawapay.service.js.map