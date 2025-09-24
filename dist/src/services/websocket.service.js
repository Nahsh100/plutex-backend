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
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
const notifications_gateway_1 = require("../gateways/notifications.gateway");
const notifications_service_1 = require("./notifications.service");
let WebSocketService = class WebSocketService {
    constructor(notificationsGateway, notificationsService) {
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
    }
    async sendOrderStatusUpdate(userId, orderId, status, orderData) {
        const notification = await this.notificationsService.createOrderNotification(userId, orderId, status);
        this.notificationsGateway.sendOrderUpdateToUser(userId, {
            orderId,
            status,
            timestamp: new Date().toISOString(),
            orderData,
        });
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
    async sendNotificationToUser(userId, title, message, type = 'system', data) {
        const notification = await this.notificationsService.create({
            userId,
            title,
            message,
            type,
            data,
            isPush: true,
        });
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
    async sendBulkNotification(userIds, title, message, type = 'system', data) {
        const result = await this.notificationsService.sendBulkNotification(userIds, title, message, type, data);
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
    async sendSystemAnnouncement(title, message, data) {
        this.notificationsGateway.broadcastToAll('system_announcement', {
            title,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
        return { message: 'System announcement sent to all connected users' };
    }
    async sendPromotionToUsers(userIds, title, message, data) {
        return this.sendBulkNotification(userIds, title, message, 'promotion', data);
    }
    async sendVendorUpdate(userId, title, message, data) {
        return this.sendNotificationToUser(userId, title, message, 'vendor', data);
    }
    getConnectedUsersCount() {
        return this.notificationsGateway.getConnectedUsersCount();
    }
    isUserConnected(userId) {
        return this.notificationsGateway.isUserConnected(userId);
    }
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService])
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map