import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    // Only admins can create notifications for other users
    if (createNotificationDto.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: You can only create notifications for yourself');
    }
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Users can only see their own notifications unless they're admin
    const targetUserId = req.user.role === 'ADMIN' ? userId : req.user.id;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.findAll(targetUserId, type, pageNum, limitNum);
  }

  @Get('my-notifications')
  @UseGuards(JwtAuthGuard)
  getMyNotifications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getUserNotifications(req.user.id, pageNum, limitNum);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req) {
    return this.notificationsService.getNotificationStats(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    // Only admins can update notifications for other users
    if (updateNotificationDto.userId && updateNotificationDto.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: You can only update your own notifications');
    }
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(id);
  }

  // Special endpoints for creating specific types of notifications
  @Post('order')
  @UseGuards(JwtAuthGuard)
  createOrderNotification(
    @Body() body: { userId: string; orderId: string; status: string },
    @Request() req,
  ) {
    // Only admins can create order notifications
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.notificationsService.createOrderNotification(body.userId, body.orderId, body.status);
  }

  @Post('promotion')
  @UseGuards(JwtAuthGuard)
  createPromotionNotification(
    @Body() body: { userId: string; title: string; message: string; data?: any },
    @Request() req,
  ) {
    // Only admins can create promotion notifications
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.notificationsService.createPromotionNotification(body.userId, body.title, body.message, body.data);
  }

  @Post('system')
  @UseGuards(JwtAuthGuard)
  createSystemNotification(
    @Body() body: { userId: string; title: string; message: string; data?: any },
    @Request() req,
  ) {
    // Only admins can create system notifications
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.notificationsService.createSystemNotification(body.userId, body.title, body.message, body.data);
  }

  @Post('vendor')
  @UseGuards(JwtAuthGuard)
  createVendorNotification(
    @Body() body: { userId: string; title: string; message: string; data?: any },
    @Request() req,
  ) {
    // Only admins can create vendor notifications
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.notificationsService.createVendorNotification(body.userId, body.title, body.message, body.data);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  sendBulkNotification(
    @Body() body: { userIds: string[]; title: string; message: string; type?: string; data?: any },
    @Request() req,
  ) {
    // Only admins can send bulk notifications
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.notificationsService.sendBulkNotification(body.userIds, body.title, body.message, body.type, body.data);
  }
}
