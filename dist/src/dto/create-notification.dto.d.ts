export declare class CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: string;
    data?: any;
    isRead?: boolean;
    isPush?: boolean;
    scheduledAt?: string;
}
