"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: createNotificationDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (createNotificationDto.isPush) {
            await this.sendPushNotification(notification);
        }
        return notification;
    }
    async findAll(userId, type, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (userId)
            where.userId = userId;
        if (type)
            where.type = type;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async update(id, updateNotificationDto) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id },
            data: updateNotificationDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.delete({
            where: { id },
        });
        return { message: 'Notification deleted successfully' };
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async createOrderNotification(userId, orderId, status) {
        const statusMessages = {
            PENDING: 'Your order has been placed and is being processed',
            PROCESSING: 'Your order is being prepared for shipment',
            SHIPPED: 'Your order has been shipped and is on its way',
            DELIVERED: 'Your order has been delivered successfully',
            CANCELLED: 'Your order has been cancelled',
        };
        const message = statusMessages[status] || `Your order status has been updated to ${status}`;
        return this.create({
            userId,
            title: 'Order Update',
            message,
            type: 'order',
            data: { orderId, status },
            isPush: true,
        });
    }
    async createPromotionNotification(userId, title, message, data) {
        return this.create({
            userId,
            title,
            message,
            type: 'promotion',
            data,
            isPush: true,
        });
    }
    async createSystemNotification(userId, title, message, data) {
        return this.create({
            userId,
            title,
            message,
            type: 'system',
            data,
            isPush: false,
        });
    }
    async createVendorNotification(userId, title, message, data) {
        return this.create({
            userId,
            title,
            message,
            type: 'vendor',
            data,
            isPush: true,
        });
    }
    async sendBulkNotification(userIds, title, message, type = 'system', data) {
        const notifications = userIds.map(userId => ({
            userId,
            title,
            message,
            type,
            data,
            isPush: type !== 'system',
        }));
        const createdNotifications = await this.prisma.notification.createMany({
            data: notifications,
        });
        if (type !== 'system') {
            for (const notification of notifications) {
                await this.sendPushNotification({
                    id: '',
                    ...notification,
                    isRead: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: null,
                });
            }
        }
        return { count: createdNotifications.count };
    }
    async sendPushNotification(notification) {
        console.log('Sending push notification:', {
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
        });
    }
    async getNotificationStats(userId) {
        const [total, unread, byType] = await Promise.all([
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
            this.prisma.notification.groupBy({
                by: ['type'],
                where: { userId },
                _count: { type: true },
            }),
        ]);
        return {
            total,
            unread,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = item._count.type;
                return acc;
            }, {}),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map