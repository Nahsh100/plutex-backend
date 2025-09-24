import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        room: string;
    }): {
        error: string;
        success?: undefined;
        room?: undefined;
    } | {
        success: boolean;
        room: string;
        error?: undefined;
    };
    handleLeaveRoom(client: Socket, data: {
        room: string;
    }): {
        success: boolean;
        room: string;
    };
    sendNotificationToUser(userId: string, notification: any): void;
    sendOrderUpdateToUser(userId: string, orderUpdate: any): void;
    broadcastToAll(event: string, data: any): void;
    sendToRoom(room: string, event: string, data: any): void;
    getConnectedUsersCount(): number;
    isUserConnected(userId: string): boolean;
}
