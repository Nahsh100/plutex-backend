import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface MoneyUnifyPaymentRequest {
  phone: string;
  amount: number;
  reference?: string;
  description?: string;
}

export interface MoneyUnifyPaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
  error?: string;
  data?: any;
}

@Injectable()
export class MoneyUnifyService {
  private readonly apiUrl = process.env.MONEYUNIFY_API_URL || 'https://plutex-pay-production.up.railway.app/api/v1/moneyunify';
  private readonly initiateTimeoutMs = Number(process.env.MONEYUNIFY_INITIATE_TIMEOUT_MS || 120000); // 2 minutes by default
  private readonly testAmount = process.env.MONEYUNIFY_TEST_AMOUNT
    ? Number(process.env.MONEYUNIFY_TEST_AMOUNT)
    : 1;

  /**
   * Initiate a payment via Money Unify
   */
  async initiatePayment(request: MoneyUnifyPaymentRequest): Promise<MoneyUnifyPaymentResponse> {
    try {
      // Use test amount for the external MoneyUnify call while keeping the real
      // amount in our own order records (request.amount is passed through elsewhere).
      const amountToCharge = this.testAmount ?? request.amount;

      const response = await axios.post(`${this.apiUrl}/pay`, {
        phone: request.phone,
        amount: amountToCharge,
        reference: request.reference,
        description: request.description,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.initiateTimeoutMs,
      });

      return response.data;
    } catch (error) {
      console.error('Money Unify payment initiation error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: 'Payment request timed out while waiting for MoneyUnify. Please check your phone for any pending prompts and try again if necessary.',
          };
        }

        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Payment initiation failed',
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred during payment initiation',
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<MoneyUnifyPaymentResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/status/${transactionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Money Unify status check error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Status check failed',
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred during status check',
      };
    }
  }

  /**
   * Process webhook callback from Money Unify
   */
  processWebhook(webhookData: any): { isValid: boolean; data?: any; error?: string } {
    try {
      // Validate webhook data structure
      if (!webhookData || typeof webhookData !== 'object') {
        return {
          isValid: false,
          error: 'Invalid webhook data structure',
        };
      }

      // Basic validation - adjust based on actual Money Unify webhook format
      const requiredFields = ['transactionId', 'status', 'amount'];
      const missingFields = requiredFields.filter(field => !(field in webhookData));

      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        };
      }

      // TODO: Add signature verification if Money Unify provides webhook signatures
      // const isSignatureValid = this.verifyWebhookSignature(webhookData);
      // if (!isSignatureValid) {
      //   return { isValid: false, error: 'Invalid webhook signature' };
      // }

      return {
        isValid: true,
        data: webhookData,
      };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        isValid: false,
        error: 'Webhook processing failed',
      };
    }
  }

  /**
   * Get available payment providers for a country
   */
  async getProviders(countryCode: string = 'ZM'): Promise<string[]> {
    // For Zambia, return the three requested providers
    if (countryCode === 'ZM' || countryCode === 'Zambia') {
      return ['Airtel Money', 'MTN Mobile Money', 'Zamtel Kwacha'];
    }

    // Default providers
    return ['Airtel Money', 'MTN Mobile Money', 'Zamtel Kwacha'];
  }

  /**
   * Validate phone number format for Zambian mobile money
   */
  validatePhoneNumber(phone: string, provider?: string): { valid: boolean; formatted?: string; error?: string } {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Zambian phone numbers are typically 10 digits starting with 09 or 12 digits starting with 260
    if (cleaned.length === 10 && cleaned.startsWith('09')) {
      return {
        valid: true,
        formatted: cleaned,
      };
    }

    if (cleaned.length === 12 && cleaned.startsWith('260')) {
      return {
        valid: true,
        formatted: cleaned,
      };
    }

    // Try to format if it's 9 digits (missing leading 0)
    if (cleaned.length === 9) {
      return {
        valid: true,
        formatted: '0' + cleaned,
      };
    }

    return {
      valid: false,
      error: 'Invalid phone number format. Expected format: 0971234567 or 260971234567',
    };
  }
}
