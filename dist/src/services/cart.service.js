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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        vendor: true,
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const savedItems = await this.prisma.savedItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        vendor: true,
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            items: cartItems,
            savedItems,
        };
    }
    async addToCart(userId, addToCartDto) {
        const { productId, quantity = 1 } = addToCartDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.isActive || product.availability === 'OUT_OF_STOCK' || product.availability === 'DISCONTINUED') {
            throw new common_1.BadRequestException('Product is not available');
        }
        if (quantity > product.stockQuantity) {
            throw new common_1.BadRequestException(`Only ${product.stockQuantity} items available in stock`);
        }
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                throw new common_1.BadRequestException(`Cannot add ${quantity} more items. Maximum available: ${product.stockQuantity - existingItem.quantity}`);
            }
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: {
                    product: {
                        include: {
                            vendor: true,
                            category: true,
                        },
                    },
                },
            });
        }
        await this.prisma.savedItem.deleteMany({
            where: {
                userId,
                productId,
            },
        });
        return this.prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity,
            },
            include: {
                product: {
                    include: {
                        vendor: true,
                        category: true,
                    },
                },
            },
        });
    }
    async updateCartItem(userId, itemId, updateCartItemDto) {
        const { quantity } = updateCartItemDto;
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { product: true },
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (quantity > cartItem.product.stockQuantity) {
            throw new common_1.BadRequestException(`Only ${cartItem.product.stockQuantity} items available in stock`);
        }
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: {
                    include: {
                        vendor: true,
                        category: true,
                    },
                },
            },
        });
    }
    async removeFromCart(userId, itemId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.delete({
            where: { id: itemId },
        });
        return { message: 'Item removed from cart' };
    }
    async moveToSaved(userId, itemId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { product: true },
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        const existingSavedItem = await this.prisma.savedItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: cartItem.productId,
                },
            },
        });
        if (!existingSavedItem) {
            await this.prisma.savedItem.create({
                data: {
                    userId,
                    productId: cartItem.productId,
                },
            });
        }
        await this.prisma.cartItem.delete({
            where: { id: itemId },
        });
        return { message: 'Item moved to saved items' };
    }
    async moveToCart(userId, productId) {
        const savedItem = await this.prisma.savedItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (!savedItem) {
            throw new common_1.NotFoundException('Saved item not found');
        }
        const cartItem = await this.addToCart(userId, { productId, quantity: 1 });
        await this.prisma.savedItem.delete({
            where: { id: savedItem.id },
        });
        return cartItem;
    }
    async removeSaved(userId, productId) {
        const savedItem = await this.prisma.savedItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (!savedItem) {
            throw new common_1.NotFoundException('Saved item not found');
        }
        await this.prisma.savedItem.delete({
            where: { id: savedItem.id },
        });
        return { message: 'Item removed from saved items' };
    }
    async clearCart(userId) {
        await this.prisma.cartItem.deleteMany({
            where: { userId },
        });
        return { message: 'Cart cleared' };
    }
    async getCartSummary(userId) {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
        const subtotal = cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
        const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        return {
            itemCount,
            subtotal,
            items: cartItems.length,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map