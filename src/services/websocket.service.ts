import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';

@Injectable()
export class WebSocketService {
  constructor(
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
  ) {}

  async sendOrderStatusUpdate(userId: string, orderId: string, status: string, orderData?: any) {
    // Create notification in database
    const notification = await this.notificationsService.createOrderNotification(userId, orderId, status);

    // Send real-time update via WebSocket
    this.notificationsGateway.sendOrderUpdateToUser(userId, {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      orderData,
    });

    // Also send as notification
    this.notificationsGateway.sendNotificationToUser(userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async sendNotificationToUser(userId: string, title: string, message: string, type: string = 'system', data?: any) {
    // Create notification in database
    const notification = await this.notificationsService.create({
      userId,
      title,
      message,
      type,
      data,
      isPush: true,
    });

    // Send real-time notification
    this.notificationsGateway.sendNotificationToUser(userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async sendBulkNotification(userIds: string[], title: string, message: string, type: string = 'system', data?: any) {
    // Create notifications in database
    const result = await this.notificationsService.sendBulkNotification(userIds, title, message, type, data);

    // Send real-time notifications to connected users
    const connectedUserIds = userIds.filter(userId => this.notificationsGateway.isUserConnected(userId));
    
    for (const userId of connectedUserIds) {
      this.notificationsGateway.sendNotificationToUser(userId, {
        title,
        message,
        type,
        data,
        createdAt: new Date().toISOString(),
      });
    }

    return result;
  }

  async sendSystemAnnouncement(title: string, message: string, data?: any) {
    // Broadcast to all connected users
    this.notificationsGateway.broadcastToAll('system_announcement', {
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
    });

    return { message: 'System announcement sent to all connected users' };
  }

  async sendPromotionToUsers(userIds: string[], title: string, message: string, data?: any) {
    return this.sendBulkNotification(userIds, title, message, 'promotion', data);
  }

  async sendVendorUpdate(userId: string, title: string, message: string, data?: any) {
    return this.sendNotificationToUser(userId, title, message, 'vendor', data);
  }

  getConnectedUsersCount(): number {
    return this.notificationsGateway.getConnectedUsersCount();
  }

  isUserConnected(userId: string): boolean {
    return this.notificationsGateway.isUserConnected(userId);
  }
}
