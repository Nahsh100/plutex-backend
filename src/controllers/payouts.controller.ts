import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { PayoutsService } from '../services/payouts.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  // Vendor: list my payouts
  @Get('me')
  async myPayouts(@Request() req) {
    return this.payoutsService.listVendorPayouts(req.user.vendorId || req.user.id);
  }

  // Vendor: request payout
  @Post('request')
  async requestPayout(@Request() req, @Body() body: { amount: number; currency?: string; note?: string }) {
    return this.payoutsService.requestPayout(req.user.vendorId || req.user.id, body.amount, body.currency, body.note);
  }

  // Admin: list all payouts
  @Get()
  async listAll(@Query('status') status?: string) {
    return this.payoutsService.listAllPayouts(status);
  }

  // Admin: mark payout paid
  @Patch(':id/mark-paid')
  async markPaid(@Param('id') id: string, @Body() body: { reference?: string }) {
    return this.payoutsService.markPayoutPaid(id, body.reference);
  }

  // Vendor: earnings summary
  @Get('me/summary')
  async mySummary(@Request() req) {
    // Fallback for existing tokens without vendorId: try resolve via email
    const vendorId = req.user.vendorId || (await this.payoutsService.resolveVendorIdByEmail(req.user.email));
    return this.payoutsService.getVendorEarningsSummary(vendorId || req.user.id);
  }
}
