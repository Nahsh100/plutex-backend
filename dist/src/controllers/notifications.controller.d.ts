import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    findAll(req: any, userId?: string, type?: string, page?: string, limit?: string): Promise<{
        notifications: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            message: string;
            type: string;
            isRead: boolean;
            isPush: boolean;
            scheduledAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getMyNotifications(req: any, page?: string, limit?: string): Promise<{
        notifications: {
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            title: string;
            message: string;
            type: string;
            isRead: boolean;
            isPush: boolean;
            scheduledAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUnreadCount(req: any): Promise<number>;
    getStats(req: any): Promise<{
        total: number;
        unread: number;
        byType: {};
    }>;
    findOne(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    update(id: string, updateNotificationDto: UpdateNotificationDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    markAsRead(id: string, req: any): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    createOrderNotification(body: {
        userId: string;
        orderId: string;
        status: string;
    }, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    createPromotionNotification(body: {
        userId: string;
        title: string;
        message: string;
        data?: any;
    }, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    createSystemNotification(body: {
        userId: string;
        title: string;
        message: string;
        data?: any;
    }, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    createVendorNotification(body: {
        userId: string;
        title: string;
        message: string;
        data?: any;
    }, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
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
    sendBulkNotification(body: {
        userIds: string[];
        title: string;
        message: string;
        type?: string;
        data?: any;
    }, req: any): Promise<{
        count: number;
    }>;
}
