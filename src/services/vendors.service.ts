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

  async findByEmail(email: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { email },
      include: {
        products: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with email ${email} not found`);
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

    try {
      // First, let's check what vendor orders exist
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

      const [
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        vendorOrdersWithStatus,
        vendorOrdersWithUser
      ] = await Promise.all([
        // Product stats
        this.prisma.product.count({ where: { vendorId } }),
        this.prisma.product.count({ where: { vendorId, isActive: true } }),

        // Order stats - using vendorOrders table for vendor-specific orders
        this.prisma.vendorOrder.count({ where: { vendorId } }),

        // Revenue - sum of vendorEarnings from vendorOrders with PAID payment and DELIVERED status
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

        // Get vendor orders with order status for counting
        this.prisma.vendorOrder.findMany({
          where: { vendorId },
          include: { order: { select: { status: true } } }
        }),

        // Get vendor orders with user info for unique customer count
        this.prisma.vendorOrder.findMany({
          where: { vendorId },
          include: { order: { select: { userId: true } } },
          distinct: ['orderId']
        })
      ]);

      // Count orders by status
      const pendingOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'PENDING').length;
      const shippedOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'SHIPPED').length;
      const deliveredOrders = vendorOrdersWithStatus.filter(vo => vo.order.status === 'DELIVERED').length;

      // Count unique customers
      const uniqueUserIds = new Set(vendorOrdersWithUser.map(vo => vo.order.userId));
      const totalCustomers = uniqueUserIds.size;

      // If no vendorOrders exist, try to calculate from regular orders with vendor's products
      let finalRevenue = totalRevenue;
      if (totalRevenue === 0 && totalOrders === 0) {
        console.log(`Vendor ${vendorId} - No vendor orders found, checking regular orders...`);
        
        // Get orders that contain this vendor's products
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

        // Calculate revenue from these orders (price * quantity for vendor's items)
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
    } catch (error) {
      console.error('Error getting vendor dashboard stats:', error);
      // Return default stats if there's an error
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

    try {
      // Get revenue data for the last 6 months
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

      // Group by month
      const monthlyRevenue = revenueData.reduce((acc, order) => {
        const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + order.vendorEarnings;
        return acc;
      }, {} as Record<string, number>);

      // Generate last 6 months even if no data
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
    } catch (error) {
      console.error('Error getting vendor revenue stats:', error);
      // Return empty data for last 6 months
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

  async getVendorSalesByCategory(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    try {
      // Get sales data grouped by category (only paid and delivered orders)
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

      // Group sales by category
      const categoryTotals = salesData.reduce((acc, vendorOrder) => {
        vendorOrder.items.forEach(item => {
          if (item.product && item.product.category) {
            const categoryName = item.product.category.name || 'Uncategorized';
            const itemTotal = item.price * item.quantity;
            acc[categoryName] = (acc[categoryName] || 0) + itemTotal;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      // If no data, return empty array
      if (Object.keys(categoryTotals).length === 0) {
        return [];
      }

      // Calculate total for percentages
      const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

      // Convert to chart format with percentages
      const chartData = Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value: total > 0 ? Math.round((value / total) * 100) : 0,
          amount: value
        }))
        .sort((a, b) => b.amount - a.amount);

      return chartData;
    } catch (error) {
      console.error('Error getting vendor sales by category:', error);
      return [];
    }
  }
}
