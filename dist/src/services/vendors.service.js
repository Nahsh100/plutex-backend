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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_vendor_dto_1 = require("../dto/create-vendor.dto");
let VendorsService = class VendorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVendorDto) {
        return this.prisma.vendor.create({
            data: createVendorDto,
            include: {
                products: true,
            },
        });
    }
    async findAll() {
        return this.prisma.vendor.findMany({
            include: {
                products: true,
            },
        });
    }
    async findOne(id) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id },
            include: {
                products: true,
            },
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${id} not found`);
        }
        return vendor;
    }
    async update(id, updateVendorDto) {
        return this.prisma.vendor.update({
            where: { id },
            data: updateVendorDto,
            include: {
                products: true,
            },
        });
    }
    async remove(id) {
        await this.prisma.vendor.delete({
            where: { id },
        });
    }
    async getVendorsStats() {
        const [totalVendors, verifiedVendors, activeVendors, pendingVendors] = await Promise.all([
            this.prisma.vendor.count(),
            this.prisma.vendor.count({ where: { isVerified: true } }),
            this.prisma.vendor.count({ where: { status: create_vendor_dto_1.VendorStatus.ACTIVE } }),
            this.prisma.vendor.count({ where: { status: create_vendor_dto_1.VendorStatus.PENDING } }),
        ]);
        return {
            totalVendors,
            verifiedVendors,
            activeVendors,
            pendingVendors,
        };
    }
    async getVendorDashboardStats(vendorId) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
        const [totalProducts, activeProducts, totalOrders, totalRevenue, pendingOrders, shippedOrders, deliveredOrders, totalCustomers] = await Promise.all([
            this.prisma.product.count({ where: { vendorId } }),
            this.prisma.product.count({ where: { vendorId, isActive: true } }),
            this.prisma.vendorOrder.count({ where: { vendorId } }),
            this.prisma.vendorOrder.aggregate({
                where: {
                    vendorId,
                    paymentStatus: 'PAID'
                },
                _sum: { vendorEarnings: true }
            }).then(result => result._sum.vendorEarnings || 0),
            this.prisma.vendorOrder.count({
                where: {
                    vendorId,
                    order: { status: 'PENDING' }
                }
            }),
            this.prisma.vendorOrder.count({
                where: {
                    vendorId,
                    order: { status: 'SHIPPED' }
                }
            }),
            this.prisma.vendorOrder.count({
                where: {
                    vendorId,
                    order: { status: 'DELIVERED' }
                }
            }),
            this.prisma.vendorOrder.findMany({
                where: { vendorId },
                include: { order: { select: { userId: true } } },
                distinct: ['orderId']
            }).then(orders => {
                const uniqueUserIds = new Set(orders.map(vo => vo.order.userId));
                return uniqueUserIds.size;
            })
        ]);
        return {
            totalProducts,
            activeProducts,
            totalOrders,
            totalRevenue,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            totalCustomers
        };
    }
    async getVendorOrders(vendorId) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
        return this.prisma.vendorOrder.findMany({
            where: { vendorId },
            include: {
                order: {
                    include: {
                        user: true,
                        items: {
                            where: { product: { vendorId } },
                            include: { product: true }
                        }
                    }
                },
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getVendorRevenueStats(vendorId) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const revenueData = await this.prisma.vendorOrder.findMany({
            where: {
                vendorId,
                paymentStatus: 'PAID',
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                vendorEarnings: true,
                createdAt: true
            }
        });
        const monthlyRevenue = revenueData.reduce((acc, order) => {
            const month = order.createdAt.toISOString().substring(0, 7);
            acc[month] = (acc[month] || 0) + order.vendorEarnings;
            return acc;
        }, {});
        const chartData = Object.entries(monthlyRevenue)
            .map(([month, revenue]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
            revenue
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        return chartData;
    }
    async getVendorSalesByCategory(vendorId) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
        const salesData = await this.prisma.vendorOrder.findMany({
            where: {
                vendorId,
                paymentStatus: 'PAID'
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
        const categoryTotals = salesData.reduce((acc, vendorOrder) => {
            vendorOrder.items.forEach(item => {
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
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map