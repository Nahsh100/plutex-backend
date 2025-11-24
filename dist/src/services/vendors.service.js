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
    async findByEmail(email) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { email },
            include: {
                products: true,
            },
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with email ${email} not found`);
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
        try {
            const allVendorOrders = await this.prisma.vendorOrder.findMany({
                where: { vendorId },
                select: {
                    id: true,
                    paymentStatus: true,
                    vendorEarnings: true,
                    total: true,
                    subtotal: true
                }
            });
            console.log(`Vendor ${vendorId} - All vendor orders:`, allVendorOrders);
            console.log(`Vendor ${vendorId} - PAID orders:`, allVendorOrders.filter(o => o.paymentStatus === 'PAID'));
            const [totalProducts, activeProducts, totalOrders, totalRevenue, vendorOrdersWithStatus, vendorOrdersWithUser] = await Promise.all([
                this.prisma.product.count({ where: { vendorId } }),
                this.prisma.product.count({ where: { vendorId, isActive: true } }),
                this.prisma.vendorOrder.count({ where: { vendorId } }),
                this.prisma.vendorOrder.aggregate({
                    where: {
                        vendorId,
                        paymentStatus: 'PAID',
                        status: 'DELIVERED'
                    },
                    _sum: { vendorEarnings: true }
                }).then(result => {
                    console.log(`Vendor ${vendorId} - Revenue aggregate result (PAID + DELIVERED):`, result);
                    return result._sum.vendorEarnings || 0;
                }),
                this.prisma.vendorOrder.findMany({
                    where: { vendorId },
                    include: { order: { select: { status: true } } }
                }),
                this.prisma.vendorOrder.findMany({
                    where: { vendorId },
                    include: { order: { select: { userId: true } } },
                    distinct: ['orderId']
                })
            ]);
            const pendingOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'PENDING').length;
            const shippedOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'SHIPPED').length;
            const deliveredOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'DELIVERED').length;
            const uniqueUserIds = new Set(vendorOrdersWithUser.map(vo => vo.order.userId));
            const totalCustomers = uniqueUserIds.size;
            let finalRevenue = totalRevenue;
            if (totalRevenue === 0 && totalOrders === 0) {
                console.log(`Vendor ${vendorId} - No vendor orders found, checking regular orders...`);
                const ordersWithVendorProducts = await this.prisma.order.findMany({
                    where: {
                        paymentStatus: 'PAID',
                        items: {
                            some: {
                                product: { vendorId }
                            }
                        }
                    },
                    include: {
                        items: {
                            where: {
                                product: { vendorId }
                            },
                            include: {
                                product: true
                            }
                        }
                    }
                });
                finalRevenue = ordersWithVendorProducts.reduce((total, order) => {
                    const orderTotal = order.items.reduce((sum, item) => {
                        return sum + (item.price * item.quantity);
                    }, 0);
                    return total + orderTotal;
                }, 0);
                console.log(`Vendor ${vendorId} - Calculated revenue from regular orders:`, finalRevenue);
            }
            console.log(`Vendor ${vendorId} - Final stats:`, {
                totalProducts,
                activeProducts,
                totalOrders,
                totalRevenue: finalRevenue,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                totalCustomers
            });
            return {
                totalProducts,
                activeProducts,
                totalOrders,
                totalRevenue: finalRevenue,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                totalCustomers
            };
        }
        catch (error) {
            console.error('Error getting vendor dashboard stats:', error);
            return {
                totalProducts: 0,
                activeProducts: 0,
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0,
                totalCustomers: 0
            };
        }
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
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const revenueData = await this.prisma.vendorOrder.findMany({
                where: {
                    vendorId,
                    paymentStatus: 'PAID',
                    status: 'DELIVERED',
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
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toISOString().substring(0, 7);
                months.push({
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: monthlyRevenue[monthKey] || 0
                });
            }
            return months;
        }
        catch (error) {
            console.error('Error getting vendor revenue stats:', error);
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                months.push({
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: 0
                });
            }
            return months;
        }
    }
    async getVendorSalesByCategory(vendorId) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
        try {
            const salesData = await this.prisma.vendorOrder.findMany({
                where: {
                    vendorId,
                    paymentStatus: 'PAID',
                    status: 'DELIVERED'
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
                    if (item.product && item.product.category) {
                        const categoryName = item.product.category.name || 'Uncategorized';
                        const itemTotal = item.price * item.quantity;
                        acc[categoryName] = (acc[categoryName] || 0) + itemTotal;
                    }
                });
                return acc;
            }, {});
            if (Object.keys(categoryTotals).length === 0) {
                return [];
            }
            const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
            const chartData = Object.entries(categoryTotals)
                .map(([name, value]) => ({
                name,
                value: total > 0 ? Math.round((value / total) * 100) : 0,
                amount: value
            }))
                .sort((a, b) => b.amount - a.amount);
            return chartData;
        }
        catch (error) {
            console.error('Error getting vendor sales by category:', error);
            return [];
        }
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map