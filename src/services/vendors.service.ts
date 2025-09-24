import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, VendorStatus } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
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

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
      include: {
        products: true,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.vendor.delete({
      where: { id },
    });
  }

  async getVendorsStats() {
    const [totalVendors, verifiedVendors, activeVendors, pendingVendors] = await Promise.all([
      this.prisma.vendor.count(),
      this.prisma.vendor.count({ where: { isVerified: true } }),
      this.prisma.vendor.count({ where: { status: VendorStatus.ACTIVE } }),
      this.prisma.vendor.count({ where: { status: VendorStatus.PENDING } }),
    ]);

    return {
      totalVendors,
      verifiedVendors,
      activeVendors,
      pendingVendors,
    };
  }

  async getVendorDashboardStats(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalCustomers
    ] = await Promise.all([
      // Product stats
      this.prisma.product.count({ where: { vendorId } }),
      this.prisma.product.count({ where: { vendorId, isActive: true } }),

      // Order stats - using vendorOrders table for vendor-specific orders
      this.prisma.vendorOrder.count({ where: { vendorId } }),

      // Revenue - sum of vendorEarnings from vendorOrders with PAID status only
      this.prisma.vendorOrder.aggregate({
        where: {
          vendorId,
          paymentStatus: 'PAID'
        },
        _sum: { vendorEarnings: true }
      }).then(result => result._sum.vendorEarnings || 0),

      // Order status counts
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

      // Unique customers who have ordered from this vendor
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

  async getVendorOrders(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
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

  async getVendorRevenueStats(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get revenue data for the last 6 months
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

    // Group by month
    const monthlyRevenue = revenueData.reduce((acc, order) => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + order.vendorEarnings;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format for charts
    const chartData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return chartData;
  }

  async getVendorSalesByCategory(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Get sales data grouped by category (only paid orders)
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

    // Group sales by category
    const categoryTotals = salesData.reduce((acc, vendorOrder) => {
      vendorOrder.items.forEach(item => {
        const categoryName = item.product.category?.name || 'Uncategorized';
        const itemTotal = item.price * item.quantity;
        acc[categoryName] = (acc[categoryName] || 0) + itemTotal;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate total for percentages
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    // Convert to chart format with percentages
    const chartData = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        amount: value
      }))
      .sort((a, b) => b.value - a.value);

    return chartData;
  }
}
