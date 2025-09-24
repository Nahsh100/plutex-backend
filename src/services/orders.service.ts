import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, OrderStatus, PaymentStatus } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { WebSocketService } from './websocket.service';
import { ConfigService } from './config.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WebSocketService))
    private webSocketService: WebSocketService,
    private configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;
    
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

    // Create per-vendor sub-orders and compute commissions
    await this.createVendorOrdersForOrder(order.id);

    // Return order with vendorOrders attached
    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: true,
        items: { include: { product: true } },
        vendorOrders: {
          include: { vendor: true, items: true },
        },
      },
    });
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

  async findUserOrders(userId: string) {
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

  async findOne(id: string) {
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { items, ...orderData } = updateOrderDto;
    
    // Get the current order to check for status changes
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true, userId: true },
    });

    if (!currentOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
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

    // Rebuild vendor orders if items changed
    if (items && items.length > 0) {
      await this.rebuildVendorOrders(id);
    }

    // If payment status changed, propagate to vendor sub-orders
    if (updateOrderDto.paymentStatus) {
      await this.prisma.vendorOrder.updateMany({
        where: { orderId: id },
        data: { paymentStatus: updateOrderDto.paymentStatus as PaymentStatus },
      });
    }

    // Send real-time update if status changed
    if (updateOrderDto.status && updateOrderDto.status !== currentOrder.status) {
      try {
        await this.webSocketService.sendOrderStatusUpdate(
          currentOrder.userId,
          id,
          updateOrderDto.status,
          {
            orderNumber: updatedOrder.orderNumber,
            total: updatedOrder.total,
            items: updatedOrder.items,
          }
        );
      } catch (error) {
        console.error('Failed to send WebSocket update:', error);
        // Don't throw error - order update should still succeed
      }
    }

    return updatedOrder;
  }

  async remove(id: string) {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async getOrdersStats() {
    const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
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
    // Get revenue data for the last 6 months from all paid orders
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueData = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    // Group by month
    const monthlyRevenue = revenueData.reduce((acc, order) => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format for charts and ensure we have data for all 6 months
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
    // Get sales data grouped by category from all paid orders
    const salesData = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID
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
    const categoryTotals = salesData.reduce((acc, order) => {
      order.items.forEach(item => {
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

  private async createVendorOrdersForOrder(orderId: string) {
    // Load order with items and product vendor
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { vendorId: true, price: true } } } },
      },
    });
    if (!order) return;

    // Group items by vendor
    const vendorIdToItems: Record<string, typeof order.items> = {} as any;
    for (const item of order.items) {
      const vendorId = item.product.vendorId;
      if (!vendorIdToItems[vendorId]) vendorIdToItems[vendorId] = [] as any;
      (vendorIdToItems[vendorId] as any).push(item);
    }

    // For each vendor, compute totals and commission, then create VendorOrder and link items
    for (const [vendorId, vendorItems] of Object.entries(vendorIdToItems)) {
      const subtotal = vendorItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
      // Simple proportional tax/shipping split by subtotal share (fallback if zero)
      const orderSubtotal = Math.max(order.subtotal || 0, 0.00001);
      const share = subtotal / orderSubtotal;
      const tax = (order.tax || 0) * share;
      const shipping = (order.shippingCost || 0) * share;
      const total = subtotal + tax + shipping;

      // Determine commission rate: vendor override or global
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

      // Link items to vendor order
      await this.prisma.orderItem.updateMany({
        where: { id: { in: vendorItems.map((vi) => vi.id) } },
        data: { vendorOrderId: vendorOrder.id },
      });
    }
  }

  private async rebuildVendorOrders(orderId: string) {
    // Clear existing vendor orders links and records
    await this.prisma.orderItem.updateMany({ where: { orderId }, data: { vendorOrderId: null } });
    await this.prisma.vendorOrder.deleteMany({ where: { orderId } });
    await this.createVendorOrdersForOrder(orderId);
  }
}
