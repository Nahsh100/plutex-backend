import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8083', 'http://localhost:19006'],
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
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

      // Store user connection
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user to their personal room
      await client.join(`user:${userId}`);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Users can only join their own rooms or public rooms
    if (data.room.startsWith('user:') && data.room !== `user:${userId}`) {
      return { error: 'Unauthorized to join this room' };
    }

    client.join(data.room);
    return { success: true, room: data.room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.leave(data.room);
    return { success: true, room: data.room };
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Method to send order update to specific user
  sendOrderUpdateToUser(userId: string, orderUpdate: any) {
    this.server.to(`user:${userId}`).emit('order_update', orderUpdate);
  }

  // Method to broadcast to all connected users (for system-wide notifications)
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method to send to specific room
  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
