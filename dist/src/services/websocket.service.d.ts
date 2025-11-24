import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';
export declare class WebSocketService {
    private notificationsGateway;
    private notificationsService;
    constructor(notificationsGateway: NotificationsGateway, notificationsService: NotificationsService);
    sendOrderStatusUpdate(userId: string, orderId: string, status: string, orderData?: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        isPush: boolean;
        scheduledAt: Date | null;
    }>;
    sendNotificationToUser(userId: string, title: string, message: string, type?: string, data?: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        isPush: boolean;
        scheduledAt: Date | null;
    }>;
    sendBulkNotification(userIds: string[], title: string, message: string, type?: string, data?: any): Promise<{
        count: number;
    }>;
    sendSystemAnnouncement(title: string, message: string, data?: any): Promise<{
        message: string;
    }>;
    sendPromotionToUsers(userIds: string[], title: string, message: string, data?: any): Promise<{
        count: number;
    }>;
    sendVendorUpdate(userId: string, title: string, message: string, data?: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        isPush: boolean;
        scheduledAt: Date | null;
    }>;
    getConnectedUsersCount(): number;
    isUserConnected(userId: string): boolean;
}
