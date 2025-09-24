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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const payouts_service_1 = require("../services/payouts.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let PayoutsController = class PayoutsController {
    constructor(payoutsService) {
        this.payoutsService = payoutsService;
    }
    async myPayouts(req) {
        return this.payoutsService.listVendorPayouts(req.user.vendorId || req.user.id);
    }
    async requestPayout(req, body) {
        return this.payoutsService.requestPayout(req.user.vendorId || req.user.id, body.amount, body.currency, body.note);
    }
    async listAll(status) {
        return this.payoutsService.listAllPayouts(status);
    }
    async markPaid(id, body) {
        return this.payoutsService.markPayoutPaid(id, body.reference);
    }
    async mySummary(req) {
        const vendorId = req.user.vendorId || (await this.payoutsService.resolveVendorIdByEmail(req.user.email));
        return this.payoutsService.getVendorEarningsSummary(vendorId || req.user.id);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "myPayouts", null);
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "listAll", null);
__decorate([
    (0, common_1.Patch)(':id/mark-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Get)('me/summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "mySummary", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map