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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
let NotificationsGateway = class NotificationsGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.id;
            if (!userId) {
                client.disconnect();
                return;
            }
            this.connectedUsers.set(userId, client.id);
            client.data.userId = userId;
            await client.join(`user:${userId}`);
            console.log(`User ${userId} connected with socket ${client.id}`);
        }
        catch (error) {
            console.error('WebSocket connection error:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
        }
    }
    handleJoinRoom(client, data) {
        const userId = client.data.userId;
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        if (data.room.startsWith('user:') && data.room !== `user:${userId}`) {
            return { error: 'Unauthorized to join this room' };
        }
        client.join(data.room);
        return { success: true, room: data.room };
    }
    handleLeaveRoom(client, data) {
        client.leave(data.room);
        return { success: true, room: data.room };
    }
    sendNotificationToUser(userId, notification) {
        this.server.to(`user:${userId}`).emit('notification', notification);
    }
    sendOrderUpdateToUser(userId, orderUpdate) {
        this.server.to(`user:${userId}`).emit('order_update', orderUpdate);
    }
    broadcastToAll(event, data) {
        this.server.emit(event, data);
    }
    sendToRoom(room, event, data) {
        this.server.to(room).emit(event, data);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleLeaveRoom", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8083', 'http://localhost:19006'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map