import { Order, OrderItem, User } from '@prisma/client';
interface OrderWithDetails extends Order {
    items?: (OrderItem & {
        product?: {
            name: string;
            price: number;
            images?: string[];
        };
    })[];
    user?: User;
}
export declare class EmailService {
    private resend;
    private fromEmail;
    constructor();
    generateOrderReceipt(order: OrderWithDetails): Promise<Buffer>;
    sendCustomerOrderConfirmation(order: OrderWithDetails, customerEmail: string): Promise<void>;
    sendVendorOrderNotification(order: OrderWithDetails, vendorEmail: string, vendorItems: (OrderItem & {
        product?: {
            name: string;
            price: number;
            images?: string[];
        };
    })[]): Promise<void>;
    sendEmailVerification(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendOrderStatusUpdate(order: OrderWithDetails, customerEmail: string, oldStatus: string, newStatus: string): Promise<void>;
}
export {};
