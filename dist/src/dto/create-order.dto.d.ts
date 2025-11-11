export declare enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class CreateOrderItemDto {
    quantity: number;
    price: number;
    sku?: string;
    productId: string;
}
export declare class CreateOrderDto {
    orderNumber: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod: string;
    shippingMethod: string;
    shippingCost?: number;
    subtotal: number;
    tax: number;
    total: number;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    trackingNumber?: string;
    notes?: string;
    userId: string;
    items: CreateOrderItemDto[];
    paymentProvider?: string;
    paymentReference?: string;
    paymentCurrency?: string;
    paymentRawData?: any;
}
