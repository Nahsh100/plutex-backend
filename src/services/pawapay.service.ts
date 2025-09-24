export const pawaPayService = {
  async createDeposit(args: any) {
    return { id: `pp_${Date.now()}`, status: 'PENDING', ...args };
  },
  async getDepositStatus(id: string) {
    return { id, status: 'SUCCESS' };
  },
  processWebhook(dto: any) {
    return { isValid: true, data: dto } as { isValid: boolean; data?: any; error?: string };
  },
  async getProviders(countryCode: string) {
    return [] as any[];
  },
};

