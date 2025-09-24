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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("../services/cart.service");
const add_to_cart_dto_1 = require("../dto/add-to-cart.dto");
const update_cart_item_dto_1 = require("../dto/update-cart-item.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    getCart(req) {
        const userId = req.user?.id;
        return this.cartService.getCart(userId);
    }
    getCartSummary(req) {
        const userId = req.user?.id;
        return this.cartService.getCartSummary(userId);
    }
    addToCart(req, addToCartDto) {
        const userId = req.user?.id;
        return this.cartService.addToCart(userId, addToCartDto);
    }
    updateCartItem(req, itemId, updateCartItemDto) {
        const userId = req.user?.id;
        return this.cartService.updateCartItem(userId, itemId, updateCartItemDto);
    }
    removeFromCart(req, itemId) {
        const userId = req.user?.id;
        return this.cartService.removeFromCart(userId, itemId);
    }
    moveToSaved(req, itemId) {
        const userId = req.user?.id;
        return this.cartService.moveToSaved(userId, itemId);
    }
    moveToCart(req, productId) {
        const userId = req.user?.id;
        return this.cartService.moveToCart(userId, productId);
    }
    removeSaved(req, productId) {
        const userId = req.user?.id;
        return this.cartService.removeSaved(userId, productId);
    }
    clearCart(req) {
        const userId = req.user?.id;
        return this.cartService.clearCart(userId);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCartSummary", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_to_cart_dto_1.AddToCartDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Patch)('items/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeFromCart", null);
__decorate([
    (0, common_1.Post)('items/:itemId/save'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "moveToSaved", null);
__decorate([
    (0, common_1.Post)('saved/:productId/move-to-cart'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "moveToCart", null);
__decorate([
    (0, common_1.Delete)('saved/:productId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeSaved", null);
__decorate([
    (0, common_1.Delete)('clear'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "clearCart", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('cart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map