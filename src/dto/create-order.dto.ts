import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreateOrderItemDto {
  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  productId: string;
}

export class CreateOrderDto {
  @IsString()
  orderNumber: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsString()
  paymentMethod: string;

  @IsString()
  shippingMethod: string;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  total: number;

  @IsObject()
  shippingAddress: {
    fullName?: string;
    email?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  userId: string;

  @IsArray()
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  paymentCurrency?: string;

  @IsOptional()
  paymentRawData?: any; // Use any for Json type
}
