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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_order_dto_1 = require("../dto/create-order.dto");
const websocket_service_1 = require("./websocket.service");
const config_service_1 = require("./config.service");
const email_service_1 = require("./email.service");
const ORDER_NOTIFICATION_INCLUDE = {
    user: true,
    items: {
        include: {
            product: {
                include: {
                    vendor: true,
                },
            },
        },
    },
    vendorOrders: {
        include: {
            vendor: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    },
};
let OrdersService = class OrdersService {
    constructor(prisma, webSocketService, configService, emailService) {
        this.prisma = prisma;
        this.webSocketService = webSocketService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async create(createOrderDto) {
        const { items, paymentProvider, paymentReference, paymentCurrency, paymentRawData, ...orderData } = createOrderDto;
        const order = await this.prisma.order.create({
            data: {
                ...orderData,
                items: {
                    create: items,
                },
            },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (paymentProvider && paymentReference && paymentCurrency) {
            await this.prisma.paymentTransaction.create({
                data: {
                    provider: paymentProvider,
                    reference: paymentReference,
                    amount: order.total,
                    currency: paymentCurrency,
                    status: order.paymentStatus,
                    raw: paymentRawData || {},
                    orderId: order.id,
                },
            });
        }
        await this.createVendorOrdersForOrder(order.id);
        const orderWithRelations = await this.prisma.order.findUnique({
            where: { id: order.id },
            include: ORDER_NOTIFICATION_INCLUDE,
        });
        if (orderWithRelations) {
            this.sendOrderNotifications(orderWithRelations).catch((error) => {
                console.error(`Failed to send order notification emails for order ${order.id}:`, error);
            });
        }
        return orderWithRelations;
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async findUserOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const { items, ...orderData } = updateOrderDto;
        const currentOrder = await this.prisma.order.findUnique({
            where: { id },
            select: { status: true, userId: true },
        });
        if (!currentOrder) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                ...orderData,
                ...(items && {
                    items: {
                        deleteMany: {},
                        create: items,
                    },
                }),
            },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (items && items.length > 0) {
            await this.rebuildVendorOrders(id);
        }
        const vendorOrderUpdate = {};
        if (updateOrderDto.paymentStatus) {
            vendorOrderUpdate.paymentStatus = updateOrderDto.paymentStatus;
        }
        if (updateOrderDto.status) {
            vendorOrderUpdate.status = updateOrderDto.status;
        }
        if (Object.keys(vendorOrderUpdate).length > 0) {
            await this.prisma.vendorOrder.updateMany({
                where: { orderId: id },
                data: vendorOrderUpdate,
            });
            console.log(`Synced vendor orders for order ${id}:`, vendorOrderUpdate);
        }
        if (updateOrderDto.status && updateOrderDto.status !== currentOrder.status) {
            try {
                await this.webSocketService.sendOrderStatusUpdate(currentOrder.userId, id, updateOrderDto.status, {
                    orderNumber: updatedOrder.orderNumber,
                    total: updatedOrder.total,
                    items: updatedOrder.items,
                });
            }
            catch (error) {
                console.error('Failed to send WebSocket update:', error);
            }
        }
        return updatedOrder;
    }
    async remove(id) {
        await this.prisma.order.delete({
            where: { id },
        });
    }
    async getOrdersStats() {
        const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: create_order_dto_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: create_order_dto_1.OrderStatus.SHIPPED } }),
            this.prisma.order.count({ where: { status: create_order_dto_1.OrderStatus.DELIVERED } }),
            this.prisma.order.count({ where: { status: create_order_dto_1.OrderStatus.CANCELLED } }),
        ]);
        return {
            totalOrders,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
        };
    }
    async getRevenueTrends() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const revenueData = await this.prisma.order.findMany({
            where: {
                paymentStatus: create_order_dto_1.PaymentStatus.PAID,
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                total: true,
                createdAt: true
            }
        });
        const monthlyRevenue = revenueData.reduce((acc, order) => {
            const month = order.createdAt.toISOString().substring(0, 7);
            acc[month] = (acc[month] || 0) + order.total;
            return acc;
        }, {});
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push({
                month: monthName,
                revenue: monthlyRevenue[monthKey] || 0
            });
        }
        return months;
    }
    async getSalesByCategory() {
        const salesData = await this.prisma.order.findMany({
            where: {
                paymentStatus: create_order_dto_1.PaymentStatus.PAID
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });
        const categoryTotals = salesData.reduce((acc, order) => {
            order.items.forEach(item => {
                const categoryName = item.product.category?.name || 'Uncategorized';
                const itemTotal = item.price * item.quantity;
                acc[categoryName] = (acc[categoryName] || 0) + itemTotal;
            });
            return acc;
        }, {});
        const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const chartData = Object.entries(categoryTotals)
            .map(([name, value]) => ({
            name,
            value: total > 0 ? Math.round((value / total) * 100) : 0,
            amount: value
        }))
            .sort((a, b) => b.value - a.value);
        return chartData;
    }
    async createVendorOrdersForOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: { select: { vendorId: true, price: true } } } },
            },
        });
        if (!order)
            return;
        const vendorIdToItems = {};
        for (const item of order.items) {
            const vendorId = item.product.vendorId;
            if (!vendorIdToItems[vendorId])
                vendorIdToItems[vendorId] = [];
            vendorIdToItems[vendorId].push(item);
        }
        for (const [vendorId, vendorItems] of Object.entries(vendorIdToItems)) {
            const subtotal = vendorItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
            const orderSubtotal = Math.max(order.subtotal || 0, 0.00001);
            const share = subtotal / orderSubtotal;
            const tax = (order.tax || 0) * share;
            const shipping = (order.shippingCost || 0) * share;
            const total = subtotal + tax + shipping;
            const vendorOverride = await this.prisma.vendorCommission.findUnique({ where: { vendorId } });
            const globalRate = await this.configService.getGlobalCommissionRate();
            const commissionRate = vendorOverride?.active ? vendorOverride.rate : globalRate;
            const commissionAmount = total * commissionRate;
            const vendorEarnings = total - commissionAmount;
            const vendorOrder = await this.prisma.vendorOrder.create({
                data: {
                    orderId,
                    vendorId,
                    subtotal,
                    tax,
                    shippingCost: shipping,
                    total,
                    commissionRate,
                    commissionAmount,
                    vendorEarnings,
                },
            });
            await this.prisma.orderItem.updateMany({
                where: { id: { in: vendorItems.map((vi) => vi.id) } },
                data: { vendorOrderId: vendorOrder.id },
            });
        }
    }
    async rebuildVendorOrders(orderId) {
        await this.prisma.orderItem.updateMany({ where: { orderId }, data: { vendorOrderId: null } });
        await this.prisma.vendorOrder.deleteMany({ where: { orderId } });
        await this.createVendorOrdersForOrder(orderId);
    }
    async syncAllVendorOrders() {
        console.log('Starting sync of all vendor orders with parent orders...');
        const orders = await this.prisma.order.findMany({
            select: {
                id: true,
                status: true,
                paymentStatus: true,
            },
        });
        let syncedCount = 0;
        for (const order of orders) {
            const result = await this.prisma.vendorOrder.updateMany({
                where: { orderId: order.id },
                data: {
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                },
            });
            if (result.count > 0) {
                syncedCount += result.count;
                console.log(`Synced ${result.count} vendor orders for order ${order.id}`);
            }
        }
        console.log(`Sync complete! Updated ${syncedCount} vendor orders across ${orders.length} orders.`);
        return { syncedOrders: orders.length, syncedVendorOrders: syncedCount };
    }
    async sendOrderNotifications(order) {
        if (!order)
            return;
        if (order.user?.email) {
            try {
                await this.emailService.sendCustomerOrderConfirmation(order, order.user.email);
            }
            catch (error) {
                console.error(`Failed to send customer confirmation for order ${order.id}:`, error);
            }
        }
        if (!order.vendorOrders?.length)
            return;
        for (const vendorOrder of order.vendorOrders) {
            const vendorEmail = vendorOrder.vendor?.email;
            if (!vendorEmail || !vendorOrder.items?.length)
                continue;
            try {
                await this.emailService.sendVendorOrderNotification(order, vendorEmail, vendorOrder.items);
            }
            catch (error) {
                console.error(`Failed to send vendor notification for order ${order.id} to vendor ${vendorOrder.vendorId}:`, error);
            }
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => websocket_service_1.WebSocketService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        websocket_service_1.WebSocketService,
        config_service_1.ConfigService,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map