import { IsString, IsOptional, IsBoolean, IsObject, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isPush?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
