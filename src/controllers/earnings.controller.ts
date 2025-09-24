import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('earnings')
export class EarningsController {
  constructor(private prisma: PrismaService) {}

  @Get('vendors')
  async listVendorEarnings(@Query('limit') limitStr?: string) {
    const vendors = await this.prisma.vendor.findMany({ select: { id: true, name: true } });

    const summaries = await Promise.all(vendors.map(async (v) => {
      const earnedAgg = await this.prisma.vendorOrder.aggregate({
        where: { vendorId: v.id, paymentStatus: 'PAID' },
        _sum: { vendorEarnings: true },
      });
      const payoutAgg = await this.prisma.vendorPayout.aggregate({
        where: { vendorId: v.id, status: { in: ['PAID', 'PENDING'] } },
        _sum: { amount: true },
      });
      const earned = earnedAgg._sum.vendorEarnings || 0;
      const paidOrPending = payoutAgg._sum.amount || 0;
      const available = Math.max(earned - paidOrPending, 0);
      return { vendorId: v.id, vendorName: v.name, earned, paidOrPending, available };
    }));

    return summaries
      .sort((a, b) => b.available - a.available)
      .slice(0, limitStr ? parseInt(limitStr, 10) : summaries.length);
  }
}

