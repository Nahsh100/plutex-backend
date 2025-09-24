import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async resolveVendorIdByEmail(email: string): Promise<string | null> {
    try {
      const vendor = await this.prisma.vendor.findUnique({ where: { email } });
      return vendor?.id || null;
    } catch {
      return null;
    }
  }

  async listVendorPayouts(vendorId: string) {
    return this.prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async listAllPayouts(status?: string) {
    return this.prisma.vendorPayout.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { requestedAt: 'desc' },
      include: { vendor: true },
    });
  }

  async requestPayout(vendorId: string, amount: number, currency = 'USD', note?: string) {
    // In a real system we would check vendor available balance here
    return this.prisma.vendorPayout.create({
      data: { vendorId, amount, currency, note },
    });
  }

  async markPayoutPaid(payoutId: string, reference?: string) {
    const payout = await this.prisma.vendorPayout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout not found');

    return this.prisma.vendorPayout.update({
      where: { id: payoutId },
      data: { status: 'PAID', paidAt: new Date(), reference },
    });
  }

  async getVendorEarningsSummary(vendorId: string) {
    const [totalVendorOrders, totalPayouts] = await Promise.all([
      this.prisma.vendorOrder.aggregate({
        where: { vendorId, paymentStatus: 'PAID' },
        _sum: { vendorEarnings: true },
      }),
      this.prisma.vendorPayout.aggregate({
        where: { vendorId, status: { in: ['PAID', 'PENDING'] } },
        _sum: { amount: true },
      }),
    ]);

    const earned = totalVendorOrders._sum.vendorEarnings || 0;
    const paidOrPending = totalPayouts._sum.amount || 0;
    const available = Math.max(earned - paidOrPending, 0);

    return { earned, paidOrPending, available };
  }
}
