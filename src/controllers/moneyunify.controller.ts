import { Controller, Post, Body, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MoneyUnifyService } from '../services/moneyunify.service';
import { PrismaService } from '../prisma/prisma.service';

interface CreatePaymentDto {
  phone: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  provider: string;
}

interface WebhookDto {
  transactionId: string;
  status: 'successful' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency?: string;
  reference?: string;
  phone?: string;
  provider?: string;
  failureReason?: string;
  timestamp?: string;
  signature?: string;
}

@Controller('payments/moneyunify')
export class MoneyUnifyController {
  constructor(
    private readonly moneyUnifyService: MoneyUnifyService,
    private readonly prisma: PrismaService
  ) {}

  @Post('initiate')
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      // Validate phone number
      const phoneValidation = this.moneyUnifyService.validatePhoneNumber(
        createPaymentDto.phone,
        createPaymentDto.provider
      );

      if (!phoneValidation.valid) {
        return {
          success: false,
          error: phoneValidation.error || 'Invalid phone number',
        };
      }

      // Initiate payment via Money Unify
      const paymentResult = await this.moneyUnifyService.initiatePayment({
        phone: phoneValidation.formatted!,
        amount: createPaymentDto.amount,
        reference: createPaymentDto.reference,
        description: createPaymentDto.description || `Payment for order ${createPaymentDto.reference}`,
      });

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Payment initiation failed',
        };
      }

      // Create pending payment transaction record
      try {
        const order = await this.prisma.order.findFirst({
          where: { orderNumber: createPaymentDto.reference },
        });

        await this.prisma.paymentTransaction.create({
          data: {
            provider: 'MoneyUnify',
            reference: paymentResult.transactionId || `MU-${Date.now()}`,
            amount: createPaymentDto.amount,
            currency: createPaymentDto.currency || 'ZMW',
            status: 'PENDING',
            raw: paymentResult.data || paymentResult,
            orderId: order?.id,
          },
        });
      } catch (e) {
        console.error('Failed to persist pending transaction:', e);
        // Don't fail the payment initiation if DB write fails
      }

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        status: paymentResult.status,
        message: paymentResult.message || 'Payment initiated successfully. Please complete the payment on your phone.',
        data: paymentResult.data,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  @Get('status/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    try {
      const status = await this.moneyUnifyService.checkPaymentStatus(transactionId);

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status',
      };
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookDto: WebhookDto, @Req() req: Request, @Res() res: Response) {
    try {
      console.log('Money Unify webhook received:', webhookDto);

      // Verify webhook
      const result = this.moneyUnifyService.processWebhook(webhookDto);

      if (!result.isValid) {
        console.error('Invalid webhook:', result.error);
        return res.status(400).json({ error: 'Invalid webhook data' });
      }

      // Process the webhook based on status
      const { data } = result;

      if (data) {
        switch (data.status) {
          case 'successful':
            await this.handlePaymentSuccess(data);
            break;
          case 'failed':
            await this.handlePaymentFailure(data);
            break;
          case 'cancelled':
            await this.handlePaymentCancellation(data);
            break;
          case 'pending':
            // Just log, don't update status
            console.log('Payment still pending:', data.transactionId);
            break;
        }
      }

      return res.status(200).json({ received: true, message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async handlePaymentSuccess(paymentData: WebhookDto) {
    try {
      console.log('Payment successful:', paymentData);

      // Update or create transaction
      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.transactionId },
        update: {
          status: 'PAID',
          raw: paymentData as any,
        },
        create: {
          provider: 'MoneyUnify',
          reference: paymentData.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ZMW',
          status: 'PAID',
          raw: paymentData as any,
        },
      });

      // Find and update order
      const order = await this.prisma.order.findFirst({
        where: { orderNumber: paymentData.reference },
      });

      if (order) {
        // Update order payment status
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID' },
        });

        // Update vendor sub-orders
        await this.prisma.vendorOrder.updateMany({
          where: { orderId: order.id },
          data: { paymentStatus: 'PAID' },
        });

        // Link transaction to order if not already linked
        await this.prisma.paymentTransaction.updateMany({
          where: { reference: paymentData.transactionId, orderId: null },
          data: { orderId: order.id },
        });

        console.log(`Order ${order.orderNumber} marked as PAID`);
      }

      // TODO: Send confirmation email, update inventory, trigger fulfillment
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  private async handlePaymentFailure(paymentData: WebhookDto) {
    try {
      console.log('Payment failed:', paymentData);

      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.transactionId },
        update: {
          status: 'FAILED',
          raw: paymentData as any,
        },
        create: {
          provider: 'MoneyUnify',
          reference: paymentData.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ZMW',
          status: 'FAILED',
          raw: paymentData as any,
        },
      });

      const order = await this.prisma.order.findFirst({
        where: { orderNumber: paymentData.reference },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        });

        await this.prisma.vendorOrder.updateMany({
          where: { orderId: order.id },
          data: { paymentStatus: 'FAILED' },
        });

        await this.prisma.paymentTransaction.updateMany({
          where: { reference: paymentData.transactionId, orderId: null },
          data: { orderId: order.id },
        });

        console.log(`Order ${order.orderNumber} marked as FAILED`);
      }

      // TODO: Notify customer, release inventory
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  private async handlePaymentCancellation(paymentData: WebhookDto) {
    try {
      console.log('Payment cancelled:', paymentData);

      await this.prisma.paymentTransaction.upsert({
        where: { reference: paymentData.transactionId },
        update: {
          status: 'REFUNDED',
          raw: paymentData as any,
        },
        create: {
          provider: 'MoneyUnify',
          reference: paymentData.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ZMW',
          status: 'REFUNDED',
          raw: paymentData as any,
        },
      });

      const order = await this.prisma.order.findFirst({
        where: { orderNumber: paymentData.reference },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'REFUNDED' },
        });

        await this.prisma.vendorOrder.updateMany({
          where: { orderId: order.id },
          data: { paymentStatus: 'REFUNDED' },
        });

        await this.prisma.paymentTransaction.updateMany({
          where: { reference: paymentData.transactionId, orderId: null },
          data: { orderId: order.id },
        });

        console.log(`Order ${order.orderNumber} marked as REFUNDED`);
      }

      // TODO: Notify customer
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
    }
  }

  @Get('providers/:countryCode')
  async getProviders(@Param('countryCode') countryCode: string) {
    try {
      const providers = await this.moneyUnifyService.getProviders(countryCode);

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
