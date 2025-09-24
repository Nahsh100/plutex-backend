import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
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

    // If this is a push notification, trigger push notification service
    if (createNotificationDto.isPush) {
      await this.sendPushNotification(notification);
    }

    return notification;
  }

  async findAll(userId?: string, type?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;

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

  async findOne(id: string) {
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
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
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

  async remove(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
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

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async createOrderNotification(userId: string, orderId: string, status: string) {
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

  async createPromotionNotification(userId: string, title: string, message: string, data?: any) {
    return this.create({
      userId,
      title,
      message,
      type: 'promotion',
      data,
      isPush: true,
    });
  }

  async createSystemNotification(userId: string, title: string, message: string, data?: any) {
    return this.create({
      userId,
      title,
      message,
      type: 'system',
      data,
      isPush: false, // System notifications usually don't need push
    });
  }

  async createVendorNotification(userId: string, title: string, message: string, data?: any) {
    return this.create({
      userId,
      title,
      message,
      type: 'vendor',
      data,
      isPush: true,
    });
  }

  async sendBulkNotification(userIds: string[], title: string, message: string, type: string = 'system', data?: any) {
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

    // Send push notifications for bulk notifications
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

  private async sendPushNotification(notification: any) {
    // This would integrate with a push notification service like Firebase, OneSignal, etc.
    // For now, we'll just log it
    console.log('Sending push notification:', {
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // TODO: Implement actual push notification service integration
    // Example with Firebase:
    // await this.firebaseService.sendNotification({
    //   userId: notification.userId,
    //   title: notification.title,
    //   body: notification.message,
    //   data: notification.data,
    // });
  }

  async getNotificationStats(userId: string) {
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
}
