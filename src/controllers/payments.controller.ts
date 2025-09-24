import { Controller, Post, Body, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { pawaPayService } from '../services/pawapay.service';
import { PrismaService } from '../prisma/prisma.service';

interface CreateDepositDto {
  amount: number;
  currency: string;
  customer: {
    phoneNumber: string;
    email?: string;
    name?: string;
  };
  description: string;
  reference: string;
  provider: string;
}

interface WebhookDto {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  reference: string;
  provider: string;
  failureReason?: string;
  timestamp: string;
  signature: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private prisma: PrismaService) {}
  
  @Post('pawapay/create-deposit')
  async createPawaPayDeposit(@Body() createDepositDto: CreateDepositDto) {
    try {
      const deposit = await pawaPayService.createDeposit({
        amount: createDepositDto.amount,
        currency: createDepositDto.currency,
        customer: createDepositDto.customer,
        description: createDepositDto.description,
        reference: createDepositDto.reference,
        webhookUrl: `${process.env.BASE_URL}/api/payments/pawapay/webhook`,
      });

      // Persist pending transaction record
      try {
        // Attempt to link transaction to order by orderNumber (stored in reference)
        const order = await this.prisma.order.findFirst({ where: { orderNumber: createDepositDto.reference } });
        await this.prisma.paymentTransaction.create({
          data: {
            provider: 'pawaPay',
            reference: deposit.id, // provider payment id as unique reference
            amount: createDepositDto.amount,
            currency: createDepositDto.currency,
            status: 'PENDING',
            raw: deposit as any,
            orderId: order?.id,
          },
        });
      } catch (e) {
        // Log but do not fail the initiation
        console.error('Failed to persist pending transaction:', e);
      }

      return {
        success: true,
        paymentId: deposit.id,
        status: deposit.status,
        message: 'Payment initiated successfully',
        data: deposit,
      };
    } catch (error) {
      console.error('PawaPay Deposit Creation Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  @Get('pawapay/status/:paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    try {
      const status = await pawaPayService.getDepositStatus(paymentId);
      
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error('PawaPay Status Check Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status',
      };
    }
  }

  @Post('pawapay/webhook')
  async handlePawaPayWebhook(@Body() webhookDto: WebhookDto, @Req() req: Request, @Res() res: Response) {
    try {
      // Get the raw body for signature verification
      const rawBody = JSON.stringify(webhookDto);
      
      // Verify webhook signature
      const result = pawaPayService.processWebhook(webhookDto);
      
      if (!result.isValid) {
        console.error('Invalid webhook signature:', result.error);
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Process the webhook based on status
      const { data } = result;
      
      if (data) {
        switch (data.status) {
          case 'SUCCESS':
            await this.handlePaymentSuccess(data);
            break;
          case 'FAILED':
            await this.handlePaymentFailure(data);
            break;
          case 'CANCELLED':
            await this.handlePaymentCancellation(data);
            break;
        }
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook Processing Error:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async handlePaymentSuccess(paymentData: WebhookDto) {
    try {
      console.log('Payment successful:', paymentData);

      // Update transaction
      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.id },
        update: { status: 'PAID', raw: paymentData as any },
        create: {
          provider: 'pawaPay',
          reference: paymentData.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'PAID',
          raw: paymentData as any,
        },
      });

      // Find order via our original reference (orderNumber)
      const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
      if (order) {
        await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID' } });
        // Mark vendor suborders paid
        await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'PAID' } });
        // Attach transaction to order if not linked
        await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
      }
      
      // TODO: send confirmation, update inventory, trigger fulfillment
      
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  private async handlePaymentFailure(paymentData: WebhookDto) {
    try {
      console.log('Payment failed:', paymentData);

      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.id },
        update: { status: 'FAILED', raw: paymentData as any },
        create: {
          provider: 'pawaPay',
          reference: paymentData.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'FAILED',
          raw: paymentData as any,
        },
      });

      const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
      if (order) {
        await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
        await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'FAILED' } });
        await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
      }
      
      // TODO: notify customer, release inventory
      
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  private async handlePaymentCancellation(paymentData: WebhookDto) {
    try {
      console.log('Payment cancelled:', paymentData);

      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.id },
        update: { status: 'REFUNDED', raw: paymentData as any },
        create: {
          provider: 'pawaPay',
          reference: paymentData.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'REFUNDED',
          raw: paymentData as any,
        },
      });

      const order = await this.prisma.order.findFirst({ where: { orderNumber: paymentData.reference } });
      if (order) {
        await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'REFUNDED' } });
        await this.prisma.vendorOrder.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'REFUNDED' } });
        await this.prisma.paymentTransaction.updateMany({ where: { reference: paymentData.id, orderId: null }, data: { orderId: order.id } });
      }
      
      // TODO: notify customer
      
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
    }
  }

  @Get('pawapay/providers/:countryCode')
  async getProviders(@Param('countryCode') countryCode: string) {
    try {
      const providers = await pawaPayService.getProviders(countryCode);
      
      return {
        success: true,
        data: providers,
      };
    } catch (error) {
      console.error('Error getting providers:', error);
      return {
        success: false,
        error: 'Failed to get providers',
      };
    }
  }
}
