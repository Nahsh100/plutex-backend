import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createNotificationDto: CreateNotificationDto): Promise<{
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
    findAll(userId?: string, type?: string, page?: number, limit?: number): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
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
    markAsRead(id: string, userId: string): Promise<{
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
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
    createOrderNotification(userId: string, orderId: string, status: string): Promise<{
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
    createPromotionNotification(userId: string, title: string, message: string, data?: any): Promise<{
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
    createSystemNotification(userId: string, title: string, message: string, data?: any): Promise<{
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
    createVendorNotification(userId: string, title: string, message: string, data?: any): Promise<{
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
    sendBulkNotification(userIds: string[], title: string, message: string, type?: string, data?: any): Promise<{
        count: number;
    }>;
    private sendPushNotification;
    getNotificationStats(userId: string): Promise<{
        total: number;
        unread: number;
        byType: {};
    }>;
}
