import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
